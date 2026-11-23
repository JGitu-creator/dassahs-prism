import { after, NextResponse } from 'next/server';
import { emptyUsage, mergeUsage, type AiUsage } from '@/lib/ai-usage';
import { recordUsage, refundCredits, reserveCredits, type QuotaReservation } from '@/lib/ai-quota';
import { logShadowTelemetry, runShadowProbe } from '@/lib/server/shadow-mode';
import { createInstantLocalPrism } from '@/lib/canvas-parser';
import {
  callPrismCompletion,
  createLocalChatReply,
  type ImageInput,
} from '@/lib/server/prism-ai-cascade';
import {
  computeReadingTime,
  evaluateOutputSafety,
  evaluateSafetyBoundary,
  LOCAL_FALLBACK_CONFIDENCE_NOTE,
  mapLaneOutputToSimplifyResponse,
  type FocusCoreOutput,
  type FocusPlusOutput,
  type LensOutput,
  type PlayCardOutput,
  type PrismLane,
  type StructuredPrismLane,
} from '@/lib/server/prism-contracts';
import {
  isFourTierEnabled,
  LOCAL_FALLBACK_LABEL,
  LOCAL_FALLBACK_MODEL,
  routeFourTier,
} from '@/lib/server/prism-router';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let reservation: QuotaReservation | null = null;
  let guestUses: number | null = null;
  try {
    const {
      text = '',
      mode,
      lane: rawLane,
      question,
      context,
      isScenic,
      cognitiveMode,
      missionGoal,
      isStory,
      simplicityLevel,
      preferredProvider = 'auto',
      imageData,
      imageMimeType,
    } = await req.json();

    const absoluteMaxChars = 150_000;
    const chunkSize = 25_000;

    if (typeof text === 'string' && text.length > absoluteMaxChars) {
      return NextResponse.json(
        {
          error:
            'Neural Link Overload: Document exceeds maximum document limit (150k chars). Please split your noise into smaller volumes.',
        },
        { status: 413 },
      );
    }

    if (typeof imageData === 'string' && imageData.length > 14_000_000) {
      return NextResponse.json(
        { error: 'Image payload exceeds 14MB base64 limit.' },
        { status: 413 },
      );
    }

    // Strip optional "data:image/<mime>;base64," prefix from base64 image payloads
    const image =
      typeof imageData === 'string'
      && imageData.length > 0
      && imageData.length <= 14_000_000
      && typeof imageMimeType === 'string'
      && /^image\/(png|jpeg|jpg|webp|gif)$/i.test(imageMimeType)
        ? ({
            data: imageData.replace(/^data:image\/[^;]+;base64,/, ''),
            mimeType: imageMimeType,
          } satisfies ImageInput)
        : undefined;

    if (!String(text || '').trim() && !image && mode !== 'chat') {
      return NextResponse.json({ error: 'Valid text or image input is required.' }, { status: 400 });
    }

    const quota = await reserveCredits(req);
    if (!quota.ok) {
      return NextResponse.json({ error: quota.error, code: quota.code }, { status: quota.status });
    }
    reservation = quota.reservation;
    guestUses = quota.reservation.guestUses ?? null;

    const respond = (body: unknown, init?: ResponseInit) => {
      const response = NextResponse.json(body, init);
      if (guestUses !== null) {
        response.cookies.set('prism-guest-uses', String(guestUses), {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      }
      return response;
    };

    const lane: PrismLane =
      mode === 'chat' || rawLane === 'chat'
        ? 'chat'
        : rawLane === 'play' || rawLane === 'lens'
          ? rawLane
          : image && !rawLane
            ? 'lens'
            : 'focus';

    // Pre-flight safety boundary guard (runs even when PRISM_FOUR_TIER_ENABLED=false)
    const preflightSafety = evaluateSafetyBoundary({
      text: String(text || ''),
      context: typeof context === 'string' ? context : undefined,
      question: typeof question === 'string' ? question : undefined,
      missionGoal: typeof missionGoal === 'string' ? missionGoal : undefined,
    });

    if (!preflightSafety.safe) {
      await refundCredits(reservation);
      if (lane === 'chat') {
        const localUsage = emptyUsage('local', LOCAL_FALLBACK_MODEL, {
          tier: 'tier4',
          label: LOCAL_FALLBACK_LABEL,
        });
        return respond({
          answer:
            'Local Structural Refraction: This request triggered the safety boundary (untrusted instruction or secret request detected). Review the source passage directly.',
          usage: localUsage,
          mode: 'local',
        });
      }
      const localFallback = createLocalRefraction(
        String(text || ''),
        simplicityLevel,
        cognitiveMode,
        lane as StructuredPrismLane,
        'unsafe_boundary',
        true,
      );
      return respond(localFallback, { status: 200 });
    }

    if (lane === 'chat') {
      if (isFourTierEnabled()) {
        const routed = await routeFourTier({
          lane: 'chat',
          text: String(question || text || ''),
          context: typeof context === 'string' ? context : JSON.stringify(context ?? ''),
          question: String(question || ''),
          preferredProvider,
          image,
        });
        if (routed.isLocalFallback || routed.shouldRefundCredits) {
          await refundCredits(reservation);
          const chatText =
            typeof (routed.data as { text?: string })?.text === 'string'
              ? (routed.data as { text: string }).text
              : createLocalChatReply(String(question || ''), context);
          return respond({
            answer: chatText,
            usage: routed.usage,
            mode: 'local',
            routeMeta: {
              tier: routed.tier,
              label: routed.label,
              lane: 'chat',
              fourTierEnabled: true,
              isLocalFallback: true,
              failureClass: routed.failureClass,
            },
          });
        }
        await recordUsage(reservation, routed.usage);
        return respond({
          answer: (routed.data as { text: string }).text,
          usage: routed.usage,
          routeMeta: {
            tier: routed.tier,
            label: routed.label,
            lane: 'chat',
            fourTierEnabled: true,
            isLocalFallback: false,
          },
        });
      }

      const chatPrompt = `You are "Ask DJ," a Focus Guide. Answer the following question based on the context provided.\n\nContext: ${context}\n\nQuestion: ${question}`;
      const result = await callPrismCompletion(chatPrompt, preferredProvider, image);
      if (!result.text || !evaluateOutputSafety(result.text).safe) {
        await refundCredits(reservation);
        return respond({
          answer: createLocalChatReply(String(question || ''), context),
          usage: emptyUsage('local', LOCAL_FALLBACK_MODEL, {
            tier: 'tier4',
            label: LOCAL_FALLBACK_LABEL,
          }),
          mode: 'local',
        });
      }
      await recordUsage(reservation, result.usage);
      return respond({ answer: result.text, usage: result.usage });
    }

    // 4-Tier Capability-Matrix Routing Path (when PRISM_FOUR_TIER_ENABLED === 'true')
    if (isFourTierEnabled()) {
      const structuredLane: StructuredPrismLane =
        lane === 'focus_plus' || lane === 'play' || lane === 'lens' ? lane : 'focus';
      const routed = await routeFourTier({
        lane: structuredLane,
        text: String(text || ''),
        context: typeof context === 'string' ? context : undefined,
        missionGoal: typeof missionGoal === 'string' ? missionGoal : undefined,
        cognitiveMode,
        simplicityLevel,
        isScenic,
        isStory,
        preferredProvider,
        image,
      });

      if (routed.isLocalFallback || routed.shouldRefundCredits) {
        await refundCredits(reservation);
      } else {
        await recordUsage(reservation, routed.usage);
      }

      const payload = mapLaneOutputToSimplifyResponse({
        lane: structuredLane,
        data: routed.data as FocusCoreOutput | FocusPlusOutput | PlayCardOutput | LensOutput,
        originalText: String(text || ''),
        usage: routed.usage,
        isLocalFallback: routed.isLocalFallback,
        routeMeta: {
          tier: routed.tier,
          label: routed.label,
          lane: structuredLane,
          fourTierEnabled: true,
          isLocalFallback: routed.isLocalFallback,
          failureClass: routed.failureClass,
          safetySignal: routed.safety.safetySignal,
          attemptsSummary: routed.attempts.map(
            (a) => `${a.tier}:${a.provider}:${a.status ?? 'err'}:${a.failureClass}`,
          ),
        },
      });

      try {
        after(async () => {
          const shadowTelemetry = await runShadowProbe({
            userId: reservation?.userId,
            text: String(text || ''),
            goal: missionGoal,
            cognitiveMode,
            simplicityLevel,
            baselineUsage: routed.usage,
            syntheticToken: req.headers.get('x-prism-shadow-fixture'),
          });
          logShadowTelemetry(shadowTelemetry);
        });
      } catch {
        // Shadow scheduling is strictly best-effort and must never affect the baseline response.
      }

      return respond(payload, { status: 200 });
    }

    // Legacy Baseline Cascade (when PRISM_FOUR_TIER_ENABLED !== 'true')
    const chunksOfText: string[] = [];
    if (image) chunksOfText.push(text || 'Image input');
    else {
      for (let i = 0; i < text.length; i += chunkSize) {
        chunksOfText.push(text.substring(i, i + chunkSize));
      }
    }
    let nextChunkIndex = 0;
    const processChunk = async () => {
      const results: PromiseSettledResult<{ data: any; usage: AiUsage }>[] = [];
      while (true) {
        const chunkIndex = nextChunkIndex++;
        if (chunkIndex >= chunksOfText.length) return results;
        const chunkText = chunksOfText[chunkIndex];
        try {
          const generationPrompt = `
        You are "Ask DJ," a Focus Guide. Your mission is to perform a Deep Neural Refraction on the provided Noise.
        GOAL: ${missionGoal || 'Discovery'}
        TARGET COGNITIVE MODE: ${cognitiveMode}
        SIMPLICITY LEVEL: ${simplicityLevel || 'Standard'}
        ${isScenic ? 'Use a vivid, memorable metaphor where helpful.' : ''}
        ${isStory ? 'Preserve the narrative arc while keeping the facts clear.' : ''}

        Perform a silent analysis to identify Signal vs Noise, Logic Roots, Dopamine Hooks, and Structural Anchors.
        Output ONLY a valid JSON object with this structure:
        {
          "tldr": ["string"], "whyCare": "string", "readingTime": "string",
          "chunks": [{"heading":"string","content":"string","summary":"string","keyTerms":["string"],"metaphor":"string","dopamineHook":"string","logicRoot":"string","citations":"string"}],
          "actions": [{"task":"string","priority":"high"|"medium"|"low","estimatedMinutes":2}], "chartData": null
        }
        INPUT NOISE:\n${chunkText}
      `;
          const result = await callPrismCompletion(generationPrompt, preferredProvider, image, true);
          if (!result.text || !evaluateOutputSafety(result.text).safe) {
            throw new Error('No safe response from providers');
          }
          results.push({
            status: 'fulfilled',
            value: { data: extractJSON(result.text), usage: result.usage },
          });
        } catch (reason) {
          results.push({ status: 'rejected', reason });
        }
      }
    };
    const workerCount = Math.min(3, chunksOfText.length);
    const workerResults = await Promise.all(Array.from({ length: workerCount }, () => processChunk()));
    const settledResults = workerResults.flat();

    const refractionResults = settledResults
      .filter((res): res is PromiseFulfilledResult<{ data: any; usage: AiUsage }> => res.status === 'fulfilled')
      .map((res) => res.value);
    const usage = mergeUsage(refractionResults.map((result) => result.usage));
    if (refractionResults.length === 0) {
      const local = createLocalRefraction(
        String(text || ''),
        simplicityLevel,
        cognitiveMode,
        lane as StructuredPrismLane,
      );
      await refundCredits(reservation);
      return respond(local, { status: 200 });
    }

    const mergedData = {
      tldr: [] as string[],
      whyCare: refractionResults[0]?.data?.whyCare || LOCAL_FALLBACK_CONFIDENCE_NOTE,
      readingTime: computeReadingTime(String(text || '')),
      chunks: [] as any[],
      actions: [] as any[],
      chartData: null as any,
    };
    refractionResults.forEach(({ data: result }) => {
      if (Array.isArray(result.tldr)) mergedData.tldr.push(...result.tldr);
      if (Array.isArray(result.chunks)) mergedData.chunks.push(...result.chunks);
      if (Array.isArray(result.actions)) mergedData.actions.push(...result.actions);
      if (result.chartData) mergedData.chartData = result.chartData;
    });
    mergedData.tldr = [...new Set(mergedData.tldr)].slice(0, 6);
    mergedData.actions = Array.from(
      new Map(
        mergedData.actions.map((action) => [
          action.task || 'Review key takeaway',
          {
            task: String(action.task || 'Review key takeaway'),
            priority: ['low', 'medium', 'high'].includes(action.priority) ? action.priority : 'medium',
            estimatedMinutes: Math.max(1, Math.min(120, Math.round(Number(action.estimatedMinutes) || 2))),
          },
        ]),
      ).values(),
    );
    if (mergedData.actions.length === 0) {
      mergedData.actions.push({
        task: 'Verify the key points against your original source and pick one next step.',
        priority: 'medium',
        estimatedMinutes: 2,
      });
    }
    await recordUsage(reservation, usage);
    try {
      after(async () => {
        const shadowTelemetry = await runShadowProbe({
          userId: reservation?.userId,
          text: String(text || ''),
          goal: missionGoal,
          cognitiveMode,
          simplicityLevel,
          baselineUsage: usage,
          syntheticToken: req.headers.get('x-prism-shadow-fixture'),
        });
        logShadowTelemetry(shadowTelemetry);
      });
    } catch {
      // Shadow scheduling is strictly best-effort and must never affect the baseline response.
    }
    return respond({
      tldr: mergedData.tldr.length ? mergedData.tldr : ['No summary generated'],
      whyCare: mergedData.whyCare,
      readingTime: mergedData.readingTime,
      chunks: mergedData.chunks.map((chunk) => ({
        heading: chunk.heading || 'Neural Fragment',
        content: chunk.content || '',
        summary: chunk.summary || 'Segment analyzed.',
        keyTerms: Array.isArray(chunk.keyTerms) ? chunk.keyTerms : [],
        metaphor: chunk.metaphor || '',
        dopamineHook: chunk.dopamineHook || '',
        logicRoot: chunk.logicRoot || 'Foundational principle established.',
        citations: chunk.citations || 'Contextual anchor secured.',
      })),
      actions: mergedData.actions,
      chartData: mergedData.chartData,
      usage,
      routeMeta: {
        tier: usage.tier || 'legacy',
        label: usage.label || usage.provider || 'Auto',
        lane,
        fourTierEnabled: false,
        isLocalFallback: false,
      },
    });
  } catch (error: any) {
    await refundCredits(reservation);
    return NextResponse.json({ error: error.message || 'The Neural Engine is unavailable.' }, { status: 500 });
  }
}

const extractJSON = (text: string) => {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('The Neural Engine produced a malformed refraction. Please try again.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
};

const createLocalRefraction = (
  text: string,
  level = 'standard',
  cognitiveMode = 'adhd',
  lane: StructuredPrismLane = 'focus',
  failureClass = 'all_remote_tiers_unavailable',
  safetySignal = false,
) => {
  const localPrism = createInstantLocalPrism(text);
  const detail =
    level === 'concise'
      ? localPrism.tinyIdea
      : level === 'detailed'
        ? `${localPrism.tinyIdea} ${localPrism.oneSmallMove}`
        : localPrism.tinyIdea;
  const usage = emptyUsage('local', 'local-fallback', {
    tier: 'tier4',
    label: 'Local Structural Refraction',
  });
  const whyCare = `Local Structural Refraction: This ${
    cognitiveMode === 'ceo' ? 'decision or document' : 'topic'
  } is summarized locally from your supplied text; verify against the original source.`;

  return {
    mode: 'local' as const,
    model: 'local-fallback',
    label: 'Local Structural Refraction',
    tldr: [localPrism.tinyIdea],
    whyCare,
    readingTime: computeReadingTime(text),
    chunks: [
      {
        heading: 'Local Structural Refraction',
        content: (text || '').slice(0, 1200) || 'Source passage',
        summary: detail,
        keyTerms: localPrism.keyTerms,
        metaphor: lane === 'play' ? localPrism.metaphor : '',
        dopamineHook: lane === 'play' ? localPrism.dopamineBoost : '',
        logicRoot: localPrism.tinyIdea,
        citations: 'Local structural fallback — citations were not generated.',
      },
    ],
    actions: [{ task: localPrism.oneSmallMove, priority: 'high' as const, estimatedMinutes: 2 }],
    chartData: null,
    usage,
    routeMeta: {
      tier: 'tier4',
      label: 'Local Structural Refraction',
      lane,
      fourTierEnabled: isFourTierEnabled(),
      isLocalFallback: true,
      failureClass,
      safetySignal,
    },
  };
};
