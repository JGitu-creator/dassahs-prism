import {
  CORE_TRANSLATIONS,
  type BiblePassageResult,
  type BibleVersionMeta,
  type ScriptureVerse,
} from '../types.ts';
import { parseBibleReference, type ParsedBibleReference } from '../usfm.ts';
import { lookupOfflineKjvFallback } from '../offlineFallback.ts';

const ESV_API_BASE = 'https://api.esv.org/v3/passage/text/';
const YOUVERSION_API_BASE = 'https://api.youversion.com/v1';
const API_BIBLE_BASE = 'https://rest.api.bible/v1';
const BIBLE_API_PUBLIC_BASE = 'https://bible-api.com';

export const ESV_COPYRIGHT_NOTICE =
  'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.';

const CORE_VERSION_NAMES: Record<
  string,
  { name: string; defaultYouversionId?: number; titleKeywords: string[] }
> = {
  ESV: {
    name: 'English Standard Version',
    defaultYouversionId: 59,
    titleKeywords: ['english standard version'],
  },
  NLT: {
    name: 'New Living Translation',
    defaultYouversionId: 116,
    titleKeywords: ['new living translation'],
  },
  AMP: {
    name: 'Amplified Bible',
    defaultYouversionId: 1588,
    titleKeywords: ['amplified bible'],
  },
  NIV: {
    name: 'New International Version',
    defaultYouversionId: 111,
    titleKeywords: ['new international version'],
  },
  NASB: {
    name: 'New American Standard Bible',
    defaultYouversionId: 2692,
    titleKeywords: ['new american standard bible'],
  },
  KJV: {
    name: 'King James Version',
    defaultYouversionId: 1,
    titleKeywords: ['king james (authorized) version', 'king james version'],
  },
  MSG: {
    name: 'The Message',
    defaultYouversionId: 97,
    titleKeywords: ['the message'],
  },
};

export interface ProviderDeps {
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}

interface YouVersionBibleEntry {
  id: number;
  abbreviation: string;
  title: string;
  copyright?: string;
}

interface ApiBibleEntry {
  id: string;
  abbreviation: string;
  name: string;
}

const yvpCache: {
  key?: string;
  expiresAt: number;
  bibles: YouVersionBibleEntry[];
  copyrightById: Map<number, string>;
} = {
  expiresAt: 0,
  bibles: [],
  copyrightById: new Map(),
};

const apiBibleCache: {
  key?: string;
  expiresAt: number;
  bibles: ApiBibleEntry[];
} = {
  expiresAt: 0,
  bibles: [],
};

/**
 * Splits numbered verse strings like "[1] The LORD is my shepherd... [2] He makes..."
 * into structured verse objects while keeping verbatim text intact elsewhere.
 */
export function extractNumberedVerses(verbatimText: string, fallbackStartVerse = 1): ScriptureVerse[] {
  const cleaned = verbatimText.replace(/\s*\(ESV\)\s*$/i, '').trim();
  if (!cleaned) return [];

  const bracketMatches = [...cleaned.matchAll(/\[(\d+)\]\s*/g)];
  if (bracketMatches.length > 0) {
    const verses: ScriptureVerse[] = [];
    for (let i = 0; i < bracketMatches.length; i++) {
      const current = bracketMatches[i];
      const next = bracketMatches[i + 1];
      const start = (current.index ?? 0) + current[0].length;
      const end = next?.index ?? cleaned.length;
      const text = cleaned.slice(start, end).trim();
      if (text) {
        verses.push({
          number: Number.parseInt(current[1], 10),
          text,
        });
      }
    }
    if (verses.length > 0) return verses;
  }

  // Also handle inline plain leading verse numbers like "1 The LORD... 2 He makes..."
  const leadingMatches = [...cleaned.matchAll(/(?:^|\s)(\d{1,3})\s+(?=[A-Z“"‘'])/g)];
  if (leadingMatches.length >= 2) {
    const verses: ScriptureVerse[] = [];
    for (let i = 0; i < leadingMatches.length; i++) {
      const current = leadingMatches[i];
      const next = leadingMatches[i + 1];
      const start = (current.index ?? 0) + current[0].length;
      const end = next?.index ?? cleaned.length;
      const text = cleaned.slice(start, end).trim();
      if (text) {
        verses.push({
          number: Number.parseInt(current[1], 10),
          text,
        });
      }
    }
    if (verses.length > 0) return verses;
  }

  return [{ number: fallbackStartVerse, text: cleaned }];
}

export function formatApiBiblePassageId(parsed: ParsedBibleReference): string {
  if (parsed.verseStart !== undefined && parsed.verseEnd !== undefined) {
    return `${parsed.book.usfm}.${parsed.chapter}.${parsed.verseStart}-${parsed.book.usfm}.${parsed.chapter}.${parsed.verseEnd}`;
  }
  if (parsed.verseStart !== undefined) {
    return `${parsed.book.usfm}.${parsed.chapter}.${parsed.verseStart}`;
  }
  return `${parsed.book.usfm}.${parsed.chapter}`;
}

function getEnv(deps?: ProviderDeps): Record<string, string | undefined> {
  return deps?.env ?? (process.env as Record<string, string | undefined>);
}

function getFetch(deps?: ProviderDeps): typeof fetch {
  return deps?.fetchImpl ?? fetch;
}

async function fetchYouVersionBibles(
  yvpKey: string,
  fetchImpl: typeof fetch,
  bypassCache = false,
): Promise<YouVersionBibleEntry[]> {
  const now = Date.now();
  if (!bypassCache && yvpCache.key === yvpKey && yvpCache.expiresAt > now && yvpCache.bibles.length > 0) {
    return yvpCache.bibles;
  }

  const response = await fetchImpl(
    `${YOUVERSION_API_BASE}/bibles?language_ranges%5B%5D=en`,
    {
      headers: {
        'X-YVP-App-Key': yvpKey,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!response.ok) {
    throw new Error(`YouVersion /bibles returned ${response.status}`);
  }

  const payload = await response.json();
  const rawList: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.bibles)
        ? payload.bibles
        : [];

  const parsed: YouVersionBibleEntry[] = [];
  for (const entry of rawList) {
    if (!entry || typeof entry !== 'object') continue;
    const obj = entry as Record<string, unknown>;
    const id = Number(obj.id);
    const abbr = String(obj.abbreviation || obj.localized_abbreviation || '').trim();
    const title = String(obj.title || obj.localized_title || abbr).trim();
    const copyright = typeof obj.copyright === 'string' ? obj.copyright.trim() : undefined;
    if (Number.isFinite(id) && id > 0 && abbr) {
      parsed.push({ id, abbreviation: abbr.toUpperCase(), title, copyright });
      if (copyright) yvpCache.copyrightById.set(id, copyright);
    }
  }

  yvpCache.key = yvpKey;
  yvpCache.expiresAt = now + 10 * 60 * 1000;
  yvpCache.bibles = parsed;
  return parsed;
}

async function fetchYouVersionCopyright(
  bibleId: number,
  yvpKey: string,
  fetchImpl: typeof fetch,
): Promise<string> {
  const cached = yvpCache.copyrightById.get(bibleId);
  if (cached) return cached;

  try {
    const response = await fetchImpl(`${YOUVERSION_API_BASE}/bibles/${bibleId}`, {
      headers: {
        'X-YVP-App-Key': yvpKey,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) {
      const data = (await response.json()) as Record<string, unknown>;
      const raw =
        typeof data?.copyright === 'string'
          ? data.copyright
          : typeof (data?.data as Record<string, unknown> | undefined)?.copyright === 'string'
            ? String((data.data as Record<string, unknown>).copyright)
            : '';
      const trimmed = raw.trim();
      if (trimmed) {
        yvpCache.copyrightById.set(bibleId, trimmed);
        return trimmed;
      }
    }
  } catch {
    // Non-fatal
  }

  return 'Provided via YouVersion Platform API. All rights reserved by the respective Bible publisher.';
}

async function fetchApiBibleList(
  apiBibleKey: string,
  fetchImpl: typeof fetch,
  bypassCache = false,
): Promise<ApiBibleEntry[]> {
  const now = Date.now();
  if (
    !bypassCache &&
    apiBibleCache.key === apiBibleKey &&
    apiBibleCache.expiresAt > now &&
    apiBibleCache.bibles.length > 0
  ) {
    return apiBibleCache.bibles;
  }

  const response = await fetchImpl(`${API_BIBLE_BASE}/bibles?language=eng`, {
    headers: {
      'api-key': apiBibleKey,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`API.Bible /bibles returned ${response.status}`);
  }

  const payload = (await response.json()) as { data?: unknown[] };
  const rawList = Array.isArray(payload?.data) ? payload.data : [];
  const entries: ApiBibleEntry[] = [];

  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const id = String(obj.id || '').trim();
    const abbr = String(obj.abbreviationLocal || obj.abbreviation || '').trim().toUpperCase();
    const name = String(obj.name || obj.nameLocal || abbr).trim();
    if (id && abbr) {
      entries.push({ id, abbreviation: abbr, name });
    }
  }

  apiBibleCache.key = apiBibleKey;
  apiBibleCache.expiresAt = now + 10 * 60 * 1000;
  apiBibleCache.bibles = entries;
  return entries;
}

function matchYouVersionEntry(
  yvpBibles: YouVersionBibleEntry[],
  code: string,
): YouVersionBibleEntry | undefined {
  const upper = code.toUpperCase();
  const exact = yvpBibles.find((b) => b.abbreviation === upper);
  if (exact) return exact;

  if (upper === 'AMP') {
    return yvpBibles.find((b) => b.abbreviation === 'AMPC');
  }
  if (upper === 'NIV') {
    return yvpBibles.find((b) => b.abbreviation === 'NIV11' || b.abbreviation === 'NIVUK11');
  }
  if (upper === 'NASB') {
    return yvpBibles.find((b) => b.abbreviation === 'NASB2020' || b.abbreviation === 'NASB1995');
  }
  return undefined;
}

function matchApiBibleEntry(entries: ApiBibleEntry[], code: string): ApiBibleEntry | undefined {
  const upper = code.toUpperCase();
  const exact = entries.find((e) => e.abbreviation === upper);
  if (exact) return exact;

  if (upper === 'AMP') {
    const ampc = entries.find((e) => e.abbreviation === 'AMPC' || e.abbreviation === 'AMP');
    if (ampc) return ampc;
  }

  const keywords = CORE_VERSION_NAMES[upper]?.titleKeywords ?? [];
  if (keywords.length > 0) {
    return entries.find((e) => {
      const lowerName = e.name.toLowerCase();
      return keywords.some((kw) => lowerName.includes(kw));
    });
  }

  return entries.find((e) => e.id === code);
}

async function fetchFromEsvApi(
  parsed: ParsedBibleReference,
  esvKey: string,
  fetchImpl: typeof fetch,
): Promise<BiblePassageResult> {
  const url = new URL(ESV_API_BASE);
  url.searchParams.set('q', parsed.normalized);
  url.searchParams.set('include-passage-references', 'false');
  url.searchParams.set('include-verse-numbers', 'true');
  url.searchParams.set('include-first-verse-numbers', 'true');
  url.searchParams.set('include-footnotes', 'false');
  url.searchParams.set('include-headings', 'false');
  url.searchParams.set('include-short-copyright', 'true');

  const response = await fetchImpl(url.toString(), {
    headers: {
      Authorization: `Token ${esvKey}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`ESV API returned ${response.status}`);
  }

  const data = (await response.json()) as {
    canonical?: string;
    passages?: string[];
  };

  const verbatimText = String(data?.passages?.[0] ?? '').trim();
  if (!verbatimText) {
    throw new Error('ESV API returned empty passage');
  }

  return {
    reference: data.canonical || parsed.normalized,
    usfm: parsed.usfm,
    requestedTranslation: 'ESV',
    activeTranslation: 'ESV',
    verses: extractNumberedVerses(verbatimText, parsed.verseStart ?? 1),
    verbatimText,
    copyright: ESV_COPYRIGHT_NOTICE,
    source: 'esv-api',
  };
}

async function fetchFromYouVersion(
  parsed: ParsedBibleReference,
  requestedCode: string,
  bibleId: number,
  yvpKey: string,
  fetchImpl: typeof fetch,
): Promise<BiblePassageResult> {
  const url = `${YOUVERSION_API_BASE}/bibles/${bibleId}/passages/${encodeURIComponent(parsed.usfm)}?format=text`;
  const response = await fetchImpl(url, {
    headers: {
      'X-YVP-App-Key': yvpKey,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`YouVersion passage endpoint returned ${response.status}`);
  }

  const data = (await response.json()) as {
    id?: string;
    content?: string;
    reference?: string;
  };

  const verbatimText = String(data?.content ?? '').trim();
  if (!verbatimText) {
    throw new Error('YouVersion returned empty passage content');
  }

  const copyright = await fetchYouVersionCopyright(bibleId, yvpKey, fetchImpl);

  return {
    reference: data.reference || parsed.normalized,
    usfm: data.id || parsed.usfm,
    requestedTranslation: requestedCode,
    activeTranslation: requestedCode,
    verses: extractNumberedVerses(verbatimText, parsed.verseStart ?? 1),
    verbatimText,
    copyright,
    source: 'youversion',
  };
}

async function fetchFromApiBible(
  parsed: ParsedBibleReference,
  requestedCode: string,
  apiBibleId: string,
  apiBibleKey: string,
  fetchImpl: typeof fetch,
): Promise<BiblePassageResult> {
  const passageId = formatApiBiblePassageId(parsed);
  const url = new URL(`${API_BIBLE_BASE}/bibles/${encodeURIComponent(apiBibleId)}/passages/${encodeURIComponent(passageId)}`);
  url.searchParams.set('content-type', 'text');
  url.searchParams.set('include-notes', 'false');
  url.searchParams.set('include-titles', 'false');
  url.searchParams.set('include-chapter-numbers', 'false');
  url.searchParams.set('include-verse-numbers', 'true');

  const response = await fetchImpl(url.toString(), {
    headers: {
      'api-key': apiBibleKey,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`API.Bible passage endpoint returned ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: {
      id?: string;
      reference?: string;
      content?: string;
      copyright?: string;
    };
  };

  const verbatimText = String(payload?.data?.content ?? '').trim();
  if (!verbatimText) {
    throw new Error('API.Bible returned empty passage content');
  }

  return {
    reference: payload?.data?.reference || parsed.normalized,
    usfm: parsed.usfm,
    requestedTranslation: requestedCode,
    activeTranslation: requestedCode,
    verses: extractNumberedVerses(verbatimText, parsed.verseStart ?? 1),
    verbatimText,
    copyright:
      String(payload?.data?.copyright || '').trim() ||
      'Provided via API.Bible. All rights reserved by the respective Bible publisher.',
    source: 'api-bible',
  };
}

async function fetchFromSandboxFallback(
  parsed: ParsedBibleReference,
  requestedTranslation: string,
  fetchImpl: typeof fetch,
): Promise<BiblePassageResult> {
  const fallbackNotice =
    requestedTranslation === 'KJV'
      ? 'Public domain KJV.'
      : `Showing public domain KJV while ${requestedTranslation} approval is pending. Switch to NIV, NLT, Amplified, The Message, or More versions anytime.`;

  try {
    const response = await fetchImpl(
      `${BIBLE_API_PUBLIC_BASE}/${encodeURIComponent(parsed.normalized)}?translation=kjv`,
      { signal: AbortSignal.timeout(6000) },
    );

    if (response.ok) {
      const data = (await response.json()) as {
        reference?: string;
        text?: string;
        verses?: Array<{ verse: number; text: string }>;
      };

      const verses: ScriptureVerse[] = Array.isArray(data.verses) && data.verses.length > 0
        ? data.verses.map((v) => ({
            number: Number(v.verse),
            text: String(v.text || '').replace(/\s+/g, ' ').trim(),
          }))
        : extractNumberedVerses(String(data.text || ''), parsed.verseStart ?? 1);

      const verbatimText =
        String(data.text || '').trim() ||
        verses.map((v) => `[${v.number}] ${v.text}`).join(' ');

      if (verses.length > 0) {
        return {
          reference: data.reference || parsed.normalized,
          usfm: parsed.usfm,
          requestedTranslation,
          activeTranslation: 'KJV',
          verses,
          verbatimText,
          copyright: 'King James Version (KJV) — Public Domain.',
          source: 'sandbox-fallback',
          notice: fallbackNotice,
        };
      }
    }
  } catch {
    // Fall through to embedded offline KJV fallback
  }

  const offlineVerses = lookupOfflineKjvFallback(
    parsed.book.usfm,
    parsed.chapter,
    parsed.verseStart,
    parsed.verseEnd,
  );

  if (offlineVerses && offlineVerses.length > 0) {
    return {
      reference: parsed.normalized,
      usfm: parsed.usfm,
      requestedTranslation,
      activeTranslation: 'KJV',
      verses: offlineVerses,
      verbatimText: offlineVerses.map((v) => `[${v.number}] ${v.text}`).join(' '),
      copyright: 'King James Version (KJV) — Public Domain (Offline Sandbox Preview).',
      source: 'sandbox-fallback',
      notice: fallbackNotice,
    };
  }

  return {
    reference: parsed.normalized,
    usfm: parsed.usfm,
    requestedTranslation,
    activeTranslation: 'KJV',
    verses: [
      {
        number: parsed.verseStart ?? 1,
        text: `Offline fallback does not include ${parsed.normalized} locally yet. Try another licensed translation under "More…" or another passage.`,
      },
    ],
    verbatimText: '',
    copyright: 'Sandbox Offline Fallback',
    source: 'sandbox-fallback',
    notice: fallbackNotice,
  };
}

export async function getAvailableBibleVersions(deps?: ProviderDeps): Promise<{
  versions: BibleVersionMeta[];
  extraYouVersionVersions: BibleVersionMeta[];
  hasEsvKey: boolean;
  hasYouVersionKey: boolean;
  hasApiBibleKey: boolean;
}> {
  const env = getEnv(deps);
  const fetchImpl = getFetch(deps);
  const esvKey = env.ESV_API_KEY?.trim();
  const yvpKey = env.YVP_APP_KEY?.trim();
  const apiBibleKey = env.API_BIBLE_KEY?.trim();
  const bypassCache = Boolean(deps?.fetchImpl);

  let yvpBibles: YouVersionBibleEntry[] = [];
  if (yvpKey) {
    try {
      yvpBibles = await fetchYouVersionBibles(yvpKey, fetchImpl, bypassCache);
    } catch {
      yvpBibles = [];
    }
  }

  let apiBibles: ApiBibleEntry[] = [];
  if (apiBibleKey) {
    try {
      apiBibles = await fetchApiBibleList(apiBibleKey, fetchImpl, bypassCache);
    } catch {
      apiBibles = [];
    }
  }

  const versions: BibleVersionMeta[] = CORE_TRANSLATIONS.map((code) => {
    const info = CORE_VERSION_NAMES[code];
    const matchedYvp = matchYouVersionEntry(yvpBibles, code);
    const matchedApiBible = matchApiBibleEntry(apiBibles, code);
    const envYvpOverride = env[`YVP_VERSION_ID_${code}`]?.trim();
    const resolvedYvpId = envYvpOverride
      ? Number.parseInt(envYvpOverride, 10)
      : matchedYvp?.id;

    if (code === 'ESV' && esvKey && !matchedYvp && !matchedApiBible) {
      return {
        code,
        name: info.name,
        shortLabel: 'ESV',
        isDefault: true,
        available: true,
        provider: 'esv-api',
        copyright: ESV_COPYRIGHT_NOTICE,
      };
    }

    if (yvpKey && resolvedYvpId) {
      return {
        code,
        name: matchedYvp?.title || info.name,
        shortLabel: code,
        isDefault: code === 'ESV',
        available: true,
        provider: 'youversion',
        youversionId: resolvedYvpId,
        copyright: matchedYvp?.copyright,
      };
    }

    if (apiBibleKey && matchedApiBible) {
      return {
        code,
        name: matchedApiBible.name || info.name,
        shortLabel: code,
        isDefault: code === 'ESV',
        available: true,
        provider: 'api-bible',
        apiBibleId: matchedApiBible.id,
      };
    }

    return {
      code,
      name: info.name,
      shortLabel: code,
      isDefault: code === 'ESV',
      available: code === 'KJV',
      provider: 'sandbox-fallback',
    };
  });

  const coreSet = new Set<string>(CORE_TRANSLATIONS);
  const seenExtras = new Set<string>();
  const extraVersions: BibleVersionMeta[] = [];

  for (const b of yvpBibles) {
    if (coreSet.has(b.abbreviation) || seenExtras.has(b.abbreviation)) continue;
    seenExtras.add(b.abbreviation);
    extraVersions.push({
      code: b.abbreviation,
      name: b.title,
      shortLabel: b.abbreviation,
      available: true,
      provider: 'youversion',
      youversionId: b.id,
      copyright: b.copyright,
    });
  }

  for (const ab of apiBibles) {
    if (coreSet.has(ab.abbreviation) || seenExtras.has(ab.abbreviation)) continue;
    seenExtras.add(ab.abbreviation);
    extraVersions.push({
      code: ab.abbreviation,
      name: `${ab.name} (API.Bible)`,
      shortLabel: ab.abbreviation,
      available: true,
      provider: 'api-bible',
      apiBibleId: ab.id,
    });
  }

  return {
    versions,
    extraYouVersionVersions: extraVersions.slice(0, 60),
    hasEsvKey: Boolean(esvKey),
    hasYouVersionKey: Boolean(yvpKey),
    hasApiBibleKey: Boolean(apiBibleKey),
  };
}

export async function fetchBiblePassage(
  rawReference: string,
  rawTranslation = 'ESV',
  deps?: ProviderDeps,
): Promise<BiblePassageResult> {
  const parsed = parseBibleReference(rawReference);
  if (!parsed) {
    throw new Error(`Invalid Bible reference: "${rawReference}"`);
  }

  const env = getEnv(deps);
  const fetchImpl = getFetch(deps);
  const bypassCache = Boolean(deps?.fetchImpl);
  const translation = String(rawTranslation || 'ESV').trim().toUpperCase();
  const esvKey = env.ESV_API_KEY?.trim();
  const yvpKey = env.YVP_APP_KEY?.trim();
  const apiBibleKey = env.API_BIBLE_KEY?.trim();

  // 1. Crossway ESV API for ESV
  if (translation === 'ESV' && esvKey) {
    try {
      return await fetchFromEsvApi(parsed, esvKey, fetchImpl);
    } catch (error) {
      console.warn('[PrismWord] ESV API failed, trying YouVersion / API.Bible:', error instanceof Error ? error.message : error);
    }
  }

  // 2. YouVersion Platform API
  if (yvpKey) {
    try {
      let yvpId: number | undefined;
      const envOverride = env[`YVP_VERSION_ID_${translation}`]?.trim();
      if (envOverride && /^\d+$/.test(envOverride)) {
        yvpId = Number.parseInt(envOverride, 10);
      } else if (/^\d+$/.test(translation)) {
        yvpId = Number.parseInt(translation, 10);
      } else {
        const yvpBibles = await fetchYouVersionBibles(yvpKey, fetchImpl, bypassCache);
        const match = matchYouVersionEntry(yvpBibles, translation);
        yvpId = match?.id ?? CORE_VERSION_NAMES[translation]?.defaultYouversionId;
      }

      if (yvpId) {
        return await fetchFromYouVersion(parsed, translation, yvpId, yvpKey, fetchImpl);
      }
    } catch (error) {
      console.warn('[PrismWord] YouVersion API failed, checking API.Bible:', error instanceof Error ? error.message : error);
    }
  }

  // 3. API.Bible
  if (apiBibleKey) {
    try {
      const apiBibles = await fetchApiBibleList(apiBibleKey, fetchImpl, bypassCache);
      const match = matchApiBibleEntry(apiBibles, translation);
      if (match) {
        return await fetchFromApiBible(parsed, translation, match.id, apiBibleKey, fetchImpl);
      }
    } catch (error) {
      console.warn('[PrismWord] API.Bible failed, falling back:', error instanceof Error ? error.message : error);
    }
  }

  // 4. Sandbox-ready public-domain fallback
  return fetchFromSandboxFallback(parsed, translation, fetchImpl);
}
