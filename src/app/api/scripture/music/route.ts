import { NextResponse } from 'next/server';
import { searchWorshipTrack } from '@/features/scripture/musicLookup';
import { requirePrismWordAuth } from '@/features/scripture/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requirePrismWordAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();
    if (!query) {
      return NextResponse.json({ error: 'Search query "q" is required.' }, { status: 400 });
    }
    const result = await searchWorshipTrack(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PrismWord] /api/scripture/music error:', error);
    return NextResponse.json(
      { error: 'Unable to look up worship track.' },
      { status: 500 },
    );
  }
}
