import { NextResponse } from 'next/server';
import { recordUsage, refundCredits, reserveCredits, type QuotaReservation } from '@/lib/ai-quota';
import {
  askDjForgePairProgrammer,
  refractWithPrismForge,
  type ForgeMode,
} from '@/features/forge/forgeEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let reservation: QuotaReservation | null = null;
  let guestUses: number | null = null;
  try {
    const body = await req.json();
    const action = typeof body.action === 'string' ? body.action : 'refract';

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

    if (action === 'ask_dj') {
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      if (!question) {
        return NextResponse.json({ error: 'A question is required for Ask DJ.' }, { status: 400 });
      }
      if (question.length > 10_000) {
        return NextResponse.json({ error: 'Question exceeds 10,000 character limit.' }, { status: 413 });
      }

      const quota = await reserveCredits(req);
      if (!quota.ok) {
        return NextResponse.json({ error: quota.error, code: quota.code }, { status: quota.status });
      }
      reservation = quota.reservation;
      guestUses = quota.reservation.guestUses ?? null;

      const replyResult = await askDjForgePairProgrammer({
        question,
        forgeContext: typeof body.forgeContext === 'string' ? body.forgeContext : '',
        history: Array.isArray(body.history) ? body.history : [],
        previousInteractionId:
          typeof body.previousInteractionId === 'string' ? body.previousInteractionId : undefined,
      });

      if (replyResult.isLocalFallback) {
        await refundCredits(reservation);
      } else {
        await recordUsage(reservation, replyResult.usage);
      }

      return respond(replyResult);
    }

    const rawText = typeof body.text === 'string' ? body.text : '';
    if (!rawText.trim()) {
      return NextResponse.json(
        { error: 'Valid stack trace, code snippet, or terminal command is required.' },
        { status: 400 },
      );
    }
    if (rawText.length > 150_000) {
      return NextResponse.json(
        { error: 'Forge Overload: Input exceeds maximum 150,000 character limit.' },
        { status: 413 },
      );
    }

    const quota = await reserveCredits(req);
    if (!quota.ok) {
      return NextResponse.json({ error: quota.error, code: quota.code }, { status: quota.status });
    }
    reservation = quota.reservation;
    guestUses = quota.reservation.guestUses ?? null;

    const mode: ForgeMode =
      body.mode === 'code_lego' || body.mode === 'terminal_cli' || body.mode === 'stack_trace'
        ? body.mode
        : 'stack_trace';

    const result = await refractWithPrismForge({
      text: rawText,
      mode,
    });

    if (result.routeMeta.isLocalFallback) {
      await refundCredits(reservation);
    } else {
      await recordUsage(reservation, result.usage);
    }

    return respond(result);
  } catch {
    await refundCredits(reservation);
    return NextResponse.json(
      { error: 'Prism Forge could not process the request.' },
      { status: 500 },
    );
  }
}
