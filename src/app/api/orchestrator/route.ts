import { NextResponse } from 'next/server';
import { recordUsage, refundCredits, reserveCredits, type QuotaReservation } from '@/lib/ai-quota';
import {
  evaluateSafetyBoundary,
  mapLaneOutputToSimplifyResponse,
  type FocusCoreOutput,
  type LensOutput,
  type PlayCardOutput,
  type PrismLane,
  type StructuredPrismLane,
} from '@/lib/server/prism-contracts';
import {
  classifyComplexity,
  isFourTierEnabled,
  LOCAL_FALLBACK_LABEL,
  LOCAL_FALLBACK_MODEL,
  routeFourTier,
} from '@/lib/server/prism-router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function computeLocalMetrics(content: string) {
  const trimmed = (content || '').trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const sentenceCount = Math.max(1, trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 1);
  return {
    wordCount,
    readabilityEstimate: wordCount / sentenceCount > 20 ? 'High' : 'Moderate',
    keywords: words.slice(0, 5),
    model: LOCAL_FALLBACK_MODEL,
    label: LOCAL_FALLBACK_LABEL,
  };
}

export async function POST(req: Request) {
  let reservation: QuotaReservation | null = null;
  let guestUses: number | null = null;
  try {
    const body = await req.json();
    const rawText = typeof body?.content === 'string'
      ? body.content
      : typeof body?.text === 'string'
        ? body.text
        : '';

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const absoluteMaxChars = 150_000;
    if (rawText.length > absoluteMaxChars) {
      return NextResponse.json(
        {
          error:
            'Neural Link Overload: Document exceeds maximum document limit (150k chars). Please split your noise into smaller volumes.',
        },
        { status: 413 },
      );
    }

    const quota = await reserveCredits(req);
    if (!quota.ok) {
      return NextResponse.json({ error: quota.error, code: quota.code }, { status: quota.status });
    }
    reservation = quota.reservation;
    guestUses = quota.reservation.guestUses ?? null;

    const respond = (payload: unknown, init?: ResponseInit) => {
      const response = NextResponse.json(payload, init);
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
      body?.lane === 'play' || body?.lane === 'lens' || body?.lane === 'chat'
        ? body.lane
        : 'focus';

    const safety = evaluateSafetyBoundary({
      text: rawText,
      missionGoal: typeof body?.missionGoal === 'string' ? body.missionGoal : undefined,
    });

    const routed = await routeFourTier({
      lane,
      text: rawText,
      missionGoal: typeof body?.missionGoal === 'string' ? body.missionGoal : undefined,
      cognitiveMode: typeof body?.cognitiveMode === 'string' ? body.cognitiveMode : 'adhd',
      simplicityLevel: typeof body?.simplicityLevel === 'string' ? body.simplicityLevel : 'standard',
    });

    if (routed.isLocalFallback || routed.shouldRefundCredits || !safety.safe) {
      await refundCredits(reservation);
    } else {
      await recordUsage(reservation, routed.usage);
    }

    const complexity = classifyComplexity(rawText);
    const tierName =
      routed.tier === 'tier1'
        ? 'Scout'
        : routed.tier === 'tier2'
          ? 'Focus'
          : routed.tier === 'tier3'
            ? 'Analyst'
            : LOCAL_FALLBACK_LABEL;

    const structuredLane: StructuredPrismLane =
      lane === 'play' || lane === 'lens' ? lane : 'focus';
    const mapped =
      lane === 'chat'
        ? null
        : mapLaneOutputToSimplifyResponse({
            lane: structuredLane,
            data: routed.data as FocusCoreOutput | PlayCardOutput | LensOutput,
            originalText: rawText,
            usage: routed.usage,
            isLocalFallback: routed.isLocalFallback,
            routeMeta: {
              tier: routed.tier,
              label: routed.label,
              lane: structuredLane,
              fourTierEnabled: isFourTierEnabled(),
              isLocalFallback: routed.isLocalFallback,
              failureClass: routed.failureClass,
              safetySignal: routed.safety.safetySignal,
            },
          });

    const responseText =
      lane === 'chat'
        ? (routed.data as { text: string }).text
        : mapped?.chunks?.[0]?.summary || JSON.stringify(routed.data);

    return respond({
      tier: tierName,
      tierId: routed.tier,
      label: routed.label,
      lane,
      complexity: complexity.level,
      fourTierEnabled: isFourTierEnabled(),
      isLocalFallback: routed.isLocalFallback,
      whyCare: routed.whyCare,
      response: responseText,
      choices: [
        {
          message: {
            content: responseText,
          },
        },
      ],
      resolvedModel: routed.model,
      usage: routed.usage,
      data: routed.data,
      ...(mapped ? { refraction: mapped } : {}),
      metrics: computeLocalMetrics(rawText),
    });
  } catch (error) {
    await refundCredits(reservation);
    console.error('[Orchestrator] request_failed:', error);
    return NextResponse.json(
      {
        ...computeLocalMetrics(''),
        tier: LOCAL_FALLBACK_LABEL,
        tierId: 'tier4',
        resolvedModel: LOCAL_FALLBACK_MODEL,
        isLocalFallback: true,
        whyCare: 'Local structural refraction fallback; verify key points and next steps against the original source.',
        error: 'API unavailable, showing local structural metrics.',
      },
      { status: 200 },
    );
  }
}
