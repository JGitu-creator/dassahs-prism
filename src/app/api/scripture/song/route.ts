import { NextResponse } from 'next/server';
import {
  generateWorshipSong,
  sanitizeReferenceOnlyInput,
} from '@/features/scripture/studyEngine';
import { requirePrismWordAuth } from '@/features/scripture/serverAuth';
import type { WorshipGenre } from '@/features/scripture/types';

export const dynamic = 'force-dynamic';

const VALID_GENRES: readonly WorshipGenre[] = [
  'amapiano',
  'afro-gospel',
  'hymns',
  'lofi',
  'rnb',
];

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
            'Reference-only payload required: licensed scripture body text must not be sent to song generation.',
        },
        { status: 400 },
      );
    }

    const reference = String(sanitized.reference || '').trim();
    const rawGenre = String(sanitized.genre || 'amapiano').trim() as WorshipGenre;
    const genre = VALID_GENRES.includes(rawGenre) ? rawGenre : 'amapiano';

    if (!reference) {
      return NextResponse.json(
        { error: 'Bible passage reference is required.' },
        { status: 400 },
      );
    }

    const song = await generateWorshipSong({ reference, genre });
    return NextResponse.json(song);
  } catch (error) {
    console.error('[PrismWord] /api/scripture/song error:', error);
    return NextResponse.json(
      { error: 'Unable to compose worship song right now.' },
      { status: 500 },
    );
  }
}
