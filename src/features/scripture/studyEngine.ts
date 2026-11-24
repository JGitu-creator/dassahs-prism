import { callPrismChat, callPrismCompletion } from '@/lib/server/prism-ai-cascade';
import {
  cleanPlainProse,
  evaluateOutputSafety,
  evaluateSafetyBoundary,
  parseStrictJsonObject,
} from '@/lib/server/prism-contracts';
import type {
  AskDjChatTurn,
  AskDjScriptureResponse,
  GeneratedWorshipSong,
  StudyBreakdown,
  WorshipGenre,
  WorshipPairingItem,
} from './types.ts';
import { parseBibleReference } from './usfm.ts';
import {
  buildLocalStudyFallback,
  buildLocalWorshipSongFallback,
  capWorshipPairings,
} from './offlineStudyCatalog.ts';
import { sanitizeReferenceOnlyInput } from './complianceGuard.ts';
import { normalizeChordProgression } from './chordUtils.ts';

export { sanitizeReferenceOnlyInput, capWorshipPairings };

const MISTRAL_CASCADE_MODELS = [
  'mistral-small-latest',
  'mistral-large-latest',
  'ministral-14b-2512',
] as const;

async function callMistralPool(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  jsonMode = false,
  preferLarge = false,
): Promise<{ text: string; model: string } | null> {
  const mistralKey = process.env.MISTRAL_API_KEY?.trim();
  if (!mistralKey) return null;

  const configured = process.env.MISTRAL_MODEL?.trim();
  const models = Array.from(
    new Set([
      ...(preferLarge ? ['mistral-large-latest'] : []),
      ...(configured ? [configured] : []),
      ...MISTRAL_CASCADE_MODELS,
    ]),
  );

  for (const model of models) {
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(22_000),
        headers: {
          Authorization: `Bearer ${mistralKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: jsonMode ? 0.25 : 0.45,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
      });

      if (!res.ok) continue;
      const data = (await res.json()) as {
        model?: string;
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = String(data?.choices?.[0]?.message?.content || '').trim();
      if (text) return { text, model: data?.model || model };
    } catch {
      // Try next model in Mistral pool
    }
  }
  return null;
}

/**
 * Follows Prism Engine's explicit execution cascade order:
 * 1. Mistral -> 2. Gemini -> 3. OpenRouter Free Pool -> 4. Groq (last)
 */
async function runPrismOrderedJsonCascade(
  prompt: string,
  preferCreativeMistral = false,
): Promise<{ text: string; providerLabel: string } | null> {
  // Tier 1: Mistral
  const mistral = await callMistralPool([{ role: 'user', content: prompt }], true, preferCreativeMistral);
  if (mistral?.text && evaluateOutputSafety(mistral.text).safe) {
    return { text: mistral.text, providerLabel: `Mistral ${mistral.model}` };
  }

  // Tier 2: Gemini
  try {
    const gemini = await callPrismCompletion(prompt, 'gemini', undefined, true);
    if (gemini.text && evaluateOutputSafety(gemini.text).safe) {
      return { text: gemini.text, providerLabel: gemini.usage.label || 'Gemini' };
    }
  } catch {
    // Fall through
  }

  // Tier 3: OpenRouter Free Pool
  try {
    const openrouter = await callPrismCompletion(prompt, 'openrouter', undefined, true);
    if (openrouter.text && evaluateOutputSafety(openrouter.text).safe) {
      return { text: openrouter.text, providerLabel: openrouter.usage.label || 'OpenRouter Free' };
    }
  } catch {
    // Fall through
  }

  // Tier 4: Groq (last remote resort)
  try {
    const groq = await callPrismCompletion(prompt, 'groq', undefined, true);
    if (groq.text && evaluateOutputSafety(groq.text).safe) {
      return { text: groq.text, providerLabel: groq.usage.label || 'Groq' };
    }
  } catch {
    // Fall through to local algorithm
  }

  return null;
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const direct = parseStrictJsonObject(raw);
  if (direct.ok) return direct.value;

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end > start) {
    const sliced = parseStrictJsonObject(raw.slice(start, end + 1));
    if (sliced.ok) return sliced.value;
  }
  return null;
}

function mergeWorshipList(
  aiList: unknown,
  fallbackList: StudyBreakdown['worship']['hymns'],
  maxCount = 14,
): StudyBreakdown['worship']['hymns'] {
  const validAi: StudyBreakdown['worship']['hymns'] = Array.isArray(aiList)
    ? aiList
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => ({
          title: String(item.title || '').trim(),
          artistOrAuthor: String(item.artistOrAuthor || '').trim() || 'Traditional / Worship',
          lyricHighlight: String(item.lyricHighlight || '').trim(),
          whyItFits: String(item.whyItFits || '').trim(),
          searchQuery: String(item.searchQuery || `${item.title || ''} worship`).trim(),
        }))
        .filter((item) => item.title.length > 0)
    : [];

  const combined: WorshipPairingItem[] = [];
  const seenTitles = new Set<string>();

  for (const item of [...validAi, ...fallbackList]) {
    if (combined.length >= maxCount) break;
    const key = item.title.toLowerCase();
    if (!seenTitles.has(key)) {
      combined.push(item);
      seenTitles.add(key);
    }
  }

  return combined;
}

function mergeAiStudyWithFallback(
  raw: Record<string, unknown>,
  fallback: StudyBreakdown,
  providerLabel: string,
): StudyBreakdown | null {
  const ov = (raw.overview && typeof raw.overview === 'object' ? raw.overview : {}) as Record<string, unknown>;
  const dh = (raw.dopamineHook && typeof raw.dopamineHook === 'object' ? raw.dopamineHook : {}) as Record<string, unknown>;
  const ma = (raw.memoryAnchor && typeof raw.memoryAnchor === 'object' ? raw.memoryAnchor : {}) as Record<string, unknown>;
  const qs = (raw.questions && typeof raw.questions === 'object' ? raw.questions : {}) as Record<string, unknown>;
  const wr = (raw.worship && typeof raw.worship === 'object' ? raw.worship : {}) as Record<string, unknown>;

  const hasCoreContent =
    typeof ov.historicalContext === 'string' ||
    (Array.isArray(raw.verseExegesis) && raw.verseExegesis.length > 0) ||
    (Array.isArray(raw.wordStudies) && raw.wordStudies.length > 0);

  if (!hasCoreContent) return null;

  return {
    reference: fallback.reference,
    overview: {
      author: typeof ov.author === 'string' && ov.author.trim() ? ov.author : fallback.overview.author,
      audience: typeof ov.audience === 'string' && ov.audience.trim() ? ov.audience : fallback.overview.audience,
      genre: typeof ov.genre === 'string' && ov.genre.trim() ? ov.genre : fallback.overview.genre,
      historicalContext:
        typeof ov.historicalContext === 'string' && ov.historicalContext.trim()
          ? ov.historicalContext
          : fallback.overview.historicalContext,
      originalHearers:
        typeof ov.originalHearers === 'string' && ov.originalHearers.trim()
          ? ov.originalHearers
          : fallback.overview.originalHearers,
      redemptivePlacement:
        typeof ov.redemptivePlacement === 'string' && ov.redemptivePlacement.trim()
          ? ov.redemptivePlacement
          : fallback.overview.redemptivePlacement,
      literaryStructure:
        typeof ov.literaryStructure === 'string' && ov.literaryStructure.trim()
          ? ov.literaryStructure
          : fallback.overview.literaryStructure,
    },
    dopamineHook: {
      title: typeof dh.title === 'string' && dh.title.trim() ? dh.title : fallback.dopamineHook.title,
      fact: typeof dh.fact === 'string' && dh.fact.trim() ? dh.fact : fallback.dopamineHook.fact,
    },
    memoryAnchor: {
      metaphor: typeof ma.metaphor === 'string' && ma.metaphor.trim() ? ma.metaphor : fallback.memoryAnchor.metaphor,
      acronymWord:
        typeof ma.acronymWord === 'string' && ma.acronymWord.trim()
          ? ma.acronymWord
          : fallback.memoryAnchor.acronymWord,
      acronymLines:
        Array.isArray(ma.acronymLines) && ma.acronymLines.length > 0
          ? ma.acronymLines.map(String)
          : fallback.memoryAnchor.acronymLines,
    },
    verseExegesis:
      Array.isArray(raw.verseExegesis) && raw.verseExegesis.length > 0
        ? (raw.verseExegesis as StudyBreakdown['verseExegesis'])
        : fallback.verseExegesis,
    wordStudies:
      Array.isArray(raw.wordStudies) && raw.wordStudies.length > 0
        ? (raw.wordStudies as StudyBreakdown['wordStudies'])
        : fallback.wordStudies,
    notMeaning:
      Array.isArray(raw.notMeaning) && raw.notMeaning.length > 0
        ? raw.notMeaning.map(String)
        : fallback.notMeaning,
    christThread:
      typeof raw.christThread === 'string' && raw.christThread.trim()
        ? raw.christThread
        : fallback.christThread,
    crossReferences:
      Array.isArray(raw.crossReferences) && raw.crossReferences.length > 0
        ? (raw.crossReferences as StudyBreakdown['crossReferences'])
        : fallback.crossReferences,
    lessons:
      Array.isArray(raw.lessons) && raw.lessons.length > 0
        ? raw.lessons.map(String)
        : fallback.lessons,
    questions: {
      textualDiscovery:
        Array.isArray(qs.textualDiscovery) && qs.textualDiscovery.length > 0
          ? qs.textualDiscovery.map(String)
          : fallback.questions.textualDiscovery,
      theologicalAnchor:
        Array.isArray(qs.theologicalAnchor) && qs.theologicalAnchor.length > 0
          ? qs.theologicalAnchor.map(String)
          : fallback.questions.theologicalAnchor,
      couplesHeart:
        Array.isArray(qs.couplesHeart) && qs.couplesHeart.length > 0
          ? qs.couplesHeart.map(String)
          : fallback.questions.couplesHeart,
      obedienceStep:
        Array.isArray(qs.obedienceStep) && qs.obedienceStep.length > 0
          ? qs.obedienceStep.map(String)
          : fallback.questions.obedienceStep,
    },
    guidedPrayer:
      typeof raw.guidedPrayer === 'string' && raw.guidedPrayer.trim()
        ? raw.guidedPrayer
        : fallback.guidedPrayer,
    worship: capWorshipPairings(
      mergeWorshipList(wr.hymns, fallback.worship.hymns, 14),
      mergeWorshipList(wr.modernSongs, fallback.worship.modernSongs, 14),
      14,
    ),
    source: 'prism-ai',
    providerLabel,
  };
}

function isValidSongShape(
  obj: unknown,
): obj is Omit<GeneratedWorshipSong, 'reference' | 'genre' | 'source' | 'providerLabel'> {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return Boolean(
    typeof c.title === 'string' &&
      typeof c.key === 'string' &&
      typeof c.bpm === 'number' &&
      typeof c.meter === 'string' &&
      Array.isArray(c.chordProgression) &&
      Array.isArray(c.sections) &&
      c.sections.length > 0 &&
      typeof c.sunoPrompt === 'string',
  );
}

export async function generateScriptureStudy(params: {
  reference: string;
  translationName?: string;
}): Promise<StudyBreakdown> {
  const parsed = parseBibleReference(params.reference);
  const canonicalRef = parsed?.normalized ?? params.reference.trim();
  const translationLabel = String(params.translationName || 'ESV').trim();

  const fallback = buildLocalStudyFallback(canonicalRef);
  const safety = evaluateSafetyBoundary({ text: canonicalRef });
  if (!safety.safe) {
    return fallback;
  }

  const prompt = `You are the Infinite Prism Bible Study Engine inside "Prism Word".
Generate a deep, seminary-faithful, warm inductive Bible study guide for the Bible reference "${canonicalRef}" (reader compares translations centered on ${translationLabel}).

CRITICAL RULES:
- Do not reproduce long blocks of copyrighted Bible translations; focus on historical and covenant context, Greek and Hebrew word studies, one intriguing verified historical or linguistic gem ("dopamineHook"), a vivid everyday metaphor and memorable acronym ("memoryAnchor"), misreading guardrails, the Gospel connection, focused study questions, guided prayer, and worship pairings.
- Write in clear, natural British English (for example, colour, honour, memorise, Saviour, practise, centre). Avoid unnecessary hyphens, slashes, middots, or decorative symbols.
- Cite supporting Scriptures inside square brackets like [John 10:11] or [Isaiah 43:2] so the reader can tap them in Ask DJ.
- Keep everything warm, faithful, and practical for a husband and wife (DJ and Dassah) studying seriously together.
- Do not use the words "sovereign" or "divine" as labels.
- Respond ONLY with valid JSON matching this exact schema (no markdown code fences):
{
  "overview": {
    "author": "string",
    "audience": "string",
    "genre": "string",
    "historicalContext": "2-4 sentences",
    "originalHearers": "2 sentences on what the first hearers needed/experienced",
    "redemptivePlacement": "1-2 sentences on where this sits in the grand story of Scripture",
    "literaryStructure": "1-3 sentences"
  },
  "dopamineHook": {
    "title": "short intriguing title for a surprising historical/linguistic detail few people know",
    "fact": "2-3 vivid sentences sharing a verified historical, archaeological, or original-language insight about this passage"
  },
  "memoryAnchor": {
    "metaphor": "1 vivid everyday-life analogy that makes the chapter's heart unforgettable",
    "acronymWord": "short memorable acronym like R·E·S·T or F·R·E·E",
    "acronymLines": ["1 line per letter linking the passage to daily obedience"]
  },
  "verseExegesis": [
    { "verseRange": "vv. 1-3", "heading": "short movement title", "explanation": "deep verse-by-verse exegesis with [Cross References]" }
  ],
  "wordStudies": [
    {
      "original": "Hebrew/Greek script",
      "language": "Hebrew" | "Greek" | "Aramaic",
      "transliteration": "string",
      "meaning": "lexical nuance & tense",
      "prismInsight": "why it changes our reading, citing a [Cross Reference]"
    }
  ],
  "notMeaning": ["2-3 clarifying 'What This Passage Does NOT Mean' guardrails"],
  "christThread": "2-3 sentences showing how this passage points to God's grace and Christ",
  "crossReferences": [
    { "ref": "Book Chapter:Verse", "connection": "1-2 sentences" }
  ],
  "lessons": ["3 deep takeaways"],
  "questions": {
    "textualDiscovery": ["2 observation/textual discovery questions"],
    "theologicalAnchor": ["2 doctrinal/Gospel anchor questions"],
    "couplesHeart": ["2 honest heart-check questions for DJ & Dassah"],
    "obedienceStep": ["1 concrete prayer/obedience practice this week"]
  },
  "guidedPrayer": "A warm 2-3 sentence prayer rooted directly in this passage",
  "worship": {
    "hymns": [
      { "title": "0 to 7 classic hymns genuinely connected to this specific passage (return [] if none fit cleanly)", "artistOrAuthor": "string", "lyricHighlight": "1 brief line", "whyItFits": "1 sentence explaining the passage connection", "searchQuery": "clean search query for Apple Music/Spotify/YouTube" }
    ],
    "modernSongs": [
      { "title": "0 to 7 modern or Afro-gospel worship songs genuinely connected to this specific passage (return [] if none fit cleanly; 14 total songs maximum across both arrays)", "artistOrAuthor": "string", "lyricHighlight": "1 brief line", "whyItFits": "1 sentence explaining the passage connection", "searchQuery": "clean search query for Apple Music/Spotify/YouTube" }
    ]
  }
}`;

  try {
    const res = await runPrismOrderedJsonCascade(prompt, false);
    if (res) {
      const parsedJson = extractJsonObject(res.text);
      if (parsedJson) {
        const merged = mergeAiStudyWithFallback(
          parsedJson,
          fallback,
          `Infinite Prism (${res.providerLabel})`,
        );
        if (merged) return merged;
      }
    }
  } catch (error) {
    console.warn('[PrismWord] study AI fallback triggered:', error instanceof Error ? error.message : error);
  }

  return fallback;
}

export async function generateWorshipSong(params: {
  reference: string;
  genre: WorshipGenre;
}): Promise<GeneratedWorshipSong> {
  const parsed = parseBibleReference(params.reference);
  const canonicalRef = parsed?.normalized ?? params.reference.trim();
  const genre = params.genre || 'amapiano';
  const fallbackSong = buildLocalWorshipSongFallback(canonicalRef, genre);

  const safety = evaluateSafetyBoundary({ text: `${canonicalRef} ${genre}` });
  if (!safety.safe) {
    return fallbackSong;
  }

  const genreStyleNote: Record<WorshipGenre, string> = {
    amapiano: 'South African Amapiano gospel praise (112 BPM, warm log-drum bounce, uplifting chorus)',
    'afro-gospel': 'Joyful Afro-Gospel praise (106 BPM, vibrant syncopated groove, bright chantable hook)',
    hymns: 'Reverent timeless Christian Hymn (72 BPM, Common Meter 8.6.8.6, rich poetic theology)',
    lofi: 'Calm Lo-Fi Chill Devotional (74 BPM, intimate cozy verses, restful meditative refrain)',
    rnb: 'Warm Neo-Soul R&B Worship (82 BPM, soulful smooth vocal phrasing, heartfelt chords)',
  };

  const prompt = `You are a gifted Christian songwriter and music producer composing an original, singable worship song inspired by Bible reference "${canonicalRef}" in the style: ${genreStyleNote[genre]}.

RULES:
- Do not copy copyrighted song lyrics or reproduce long copyrighted Bible translations; craft fresh, poetic, deeply scriptural lyrics in natural British English (honour, Saviour, colour, grace) without decorative symbols.
- Choose rich chord progressions fitting the genre (major seventh and minor ninth chords for R&B, Lo Fi, and Amapiano; classic four part harmonies for Hymns).
- IMPORTANT: "chordProgression" MUST be a flat array of 4 to 8 chord strings like ["Cm9", "Abmaj7", "Fm9", "G7"] (never nested arrays or section objects).
- Respond ONLY with valid JSON (no markdown fences):
{
  "title": "poetic original song title",
  "key": "e.g. F# Minor or G Major",
  "bpm": 112,
  "meter": "e.g. 4/4 Amapiano Gospel",
  "chordProgression": ["Cm9", "Abmaj7", "Fm9", "G7"],
  "sections": [
    { "label": "Verse 1", "lyrics": "4 crisp lines separated by \\n" },
    { "label": "Chorus", "lyrics": "4 memorable singable lines separated by \\n" },
    { "label": "Verse 2", "lyrics": "4 crisp lines separated by \\n" },
    { "label": "Bridge", "lyrics": "2-4 uplifting climax lines separated by \\n" }
  ],
  "sunoPrompt": "1-sentence production prompt ready for Suno.com / Udio.com with vocal style, instruments, key, and BPM"
}`;

  try {
    const res = await runPrismOrderedJsonCascade(prompt, true);
    if (res) {
      const parsedJson = extractJsonObject(res.text);
      if (parsedJson && isValidSongShape(parsedJson)) {
        const cleanSections = parsedJson.sections
          .map((s) => ({
            label: String((s as { label?: unknown })?.label || 'Verse').trim() || 'Verse',
            lyrics: String((s as { lyrics?: unknown })?.lyrics || '').trim(),
          }))
          .filter((s) => s.lyrics.length > 0);
        const safeBpm = Number.isFinite(parsedJson.bpm)
          ? Math.max(60, Math.min(130, Math.round(parsedJson.bpm)))
          : fallbackSong.bpm;

        return {
          title: String(parsedJson.title || fallbackSong.title).trim() || fallbackSong.title,
          key: String(parsedJson.key || fallbackSong.key).trim() || fallbackSong.key,
          bpm: safeBpm,
          meter: String(parsedJson.meter || fallbackSong.meter).trim() || fallbackSong.meter,
          chordProgression: normalizeChordProgression(
            parsedJson.chordProgression,
            fallbackSong.chordProgression,
          ),
          sections: cleanSections.length > 0 ? cleanSections : fallbackSong.sections,
          sunoPrompt: String(parsedJson.sunoPrompt || fallbackSong.sunoPrompt).trim() || fallbackSong.sunoPrompt,
          reference: canonicalRef,
          genre,
          source: 'prism-ai',
          providerLabel: `Prism Worship Studio (${res.providerLabel})`,
        };
      }
    }
  } catch (error) {
    console.warn('[PrismWord] song AI fallback triggered:', error instanceof Error ? error.message : error);
  }

  return fallbackSong;
}

/**
 * Ask DJ defaults to Gemini Interactions SDK (using previousInteractionId for
 * built-in memory & lower token usage), cascading Mistral -> OpenRouter -> Groq -> Local if needed.
 */
export async function answerScriptureQuestion(params: {
  primaryReference: string;
  clickedReference?: string;
  focusWord?: string;
  question: string;
  history?: AskDjChatTurn[];
  previousInteractionId?: string;
}): Promise<AskDjScriptureResponse> {
  const primaryRef = parseBibleReference(params.primaryReference)?.normalized ?? params.primaryReference.trim();
  const clickedRef = params.clickedReference
    ? (parseBibleReference(params.clickedReference)?.normalized ?? params.clickedReference.trim())
    : undefined;
  const focusWord = params.focusWord ? params.focusWord.trim().slice(0, 60) : undefined;
  const questionText = String(params.question || '').trim();

  const safety = evaluateSafetyBoundary({
    text: questionText,
    context: `${primaryRef} ${clickedRef ?? ''} ${focusWord ?? ''}`,
    question: questionText,
  });

  if (!safety.safe) {
    return {
      reply: 'Ask DJ Safety Boundary: Please ask a question focused on understanding Scripture, historical background, word meanings, or personal application.',
      primaryReference: primaryRef,
      clickedReference: clickedRef,
      focusWord,
      source: 'local-study-fallback',
      providerLabel: 'Safety Guard',
    };
  }

  const systemInstruction = `You are "Ask DJ", a warm, seminary grounded Bible study companion inside Prism Word for DJ and Dassah.
The user is studying "${primaryRef}"${clickedRef ? ` and opened cross reference "${clickedRef}"` : ''}${focusWord ? ` and tapped the word "${focusWord}" to understand its deeper biblical and original Greek or Hebrew meaning` : ''}.
Help them understand the connection, original language nuance, or daily application clearly without losing reading flow.
RULES:
- Write in plain, warm British English (honour, Saviour, memorise, practise, colour).
- Reference supporting Scriptures in square brackets like [Romans 8:28] or [John 10:11] so they become clickable links.
- Write in clean plain paragraphs or numbered points. Never use markdown asterisks, hashes, middots, em dashes, or backticks.
- Do not reproduce long copyrighted Bible blocks verbatim; focus on explanation and synthesis.
- Keep responses focused (3 to 6 sentences unless asked for deep detail).`;

  const effectiveQuestion =
    questionText ||
    (focusWord
      ? `What does the word "${focusWord}" mean in the context of ${primaryRef} (and what is the original Greek or Hebrew nuance)?`
      : clickedRef
        ? `How does ${clickedRef} connect to and illuminate ${primaryRef}?`
        : `Help me understand the heart and context of ${primaryRef}.`);

  const history = params.history ?? [];

  // 1. Default to Gemini Interactions SDK (remembers conversation cleanly)
  try {
    const geminiChat = await callPrismChat(
      effectiveQuestion,
      history,
      systemInstruction,
      'gemini',
      params.previousInteractionId,
    );
    if (geminiChat.text && evaluateOutputSafety(geminiChat.text).safe) {
      return {
        reply: cleanPlainProse(geminiChat.text),
        primaryReference: primaryRef,
        clickedReference: clickedRef,
        focusWord,
        interactionId: geminiChat.interactionId,
        source: 'prism-ai',
        providerLabel: `Ask DJ (${geminiChat.usage.label || 'Gemini Interactions'})`,
      };
    }
  } catch (error) {
    console.warn('[PrismWord] Ask DJ Gemini fallback:', error instanceof Error ? error.message : error);
  }

  // 2. Mistral Pool fallback
  try {
    const mistral = await callMistralPool([
      { role: 'system', content: systemInstruction },
      ...history.map((h) => ({
        role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: h.text,
      })),
      { role: 'user', content: effectiveQuestion },
    ]);
    if (mistral?.text && evaluateOutputSafety(mistral.text).safe) {
      return {
        reply: cleanPlainProse(mistral.text),
        primaryReference: primaryRef,
        clickedReference: clickedRef,
        focusWord,
        source: 'prism-ai',
        providerLabel: `Ask DJ (Mistral ${mistral.model})`,
      };
    }
  } catch {
    // Fall through
  }

  // 3. OpenRouter -> Groq fallback
  for (const provider of ['openrouter', 'groq'] as const) {
    try {
      const res = await callPrismChat(effectiveQuestion, history, systemInstruction, provider);
      if (res.text && evaluateOutputSafety(res.text).safe) {
        return {
          reply: cleanPlainProse(res.text),
          primaryReference: primaryRef,
          clickedReference: clickedRef,
          focusWord,
          source: 'prism-ai',
          providerLabel: `Ask DJ (${res.usage.label || res.usage.provider})`,
        };
      }
    } catch {
      // Try next
    }
  }

  const fallbackReply = focusWord
    ? `In ${primaryRef}, the word "${focusWord}" carries weight beyond a quick dictionary glance. Look at how the surrounding sentence uses "${focusWord}"—compare it in ESV against Amplified (AMP) or NLT, and ask what covenant promise or action it anchors.`
    : clickedRef
      ? `${clickedRef} complements ${primaryRef} by showing how Scripture interprets Scripture across testaments. Look closely at the shared promise or theme between ${primaryRef} and [${clickedRef}], and compare them in ESV alongside Amplified or NLT to catch every nuance.`
      : `When studying ${primaryRef}, walk through four anchors: 1. What did this mean to the original hearers? 2. What does it reveal about God and point to in Christ? 3. What common misreading does the context rule out? 4. How does it reshape our home this week? Try opening [Psalm 23:1-4] or [Romans 8:28] in Ask DJ.`;

  return {
    reply: fallbackReply,
    primaryReference: primaryRef,
    clickedReference: clickedRef,
    focusWord,
    source: 'local-study-fallback',
    providerLabel: 'Ask DJ Offline Guide',
  };
}
