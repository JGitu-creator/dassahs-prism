import { NextResponse } from 'next/server';
import {
  generateScriptureStudy,
  sanitizeReferenceOnlyInput,
} from '@/features/scripture/studyEngine';
import { requirePrismWordAuth } from '@/features/scripture/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const auth = await requirePrismWordAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const rawBody = (await req.json()) as Record<string, unknown>;
    const { hadForbiddenText, sanitized } = sanitizeReferenceOnlyInput(rawBody);

    if (hadForbiddenText) {
      return NextResponse.json(
        {
          error:
            'Reference-only payload required: licensed scripture body text must not be sent to AI routes.',
        },
        { status: 400 },
      );
    }

    const reference = String(sanitized.reference || '').trim();
    const translationName = String(sanitized.translationName || 'ESV').trim();

    if (!reference) {
      return NextResponse.json(
        { error: 'A Bible reference (e.g. "Psalm 23:1-6") is required.' },
        { status: 400 },
      );
    }

    const study = await generateScriptureStudy({ reference, translationName });
    return NextResponse.json(study);
  } catch (error) {
    console.error('[PrismWord] /api/scripture/study error:', error);
    return NextResponse.json(
      { error: 'Unable to generate study breakdown right now.' },
      { status: 500 },
    );
  }
}
