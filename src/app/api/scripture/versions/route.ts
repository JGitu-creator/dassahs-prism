import { NextResponse } from 'next/server';
import { getAvailableBibleVersions } from '@/features/scripture/providers/bibleProvider';
import { requirePrismWordAuth } from '@/features/scripture/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requirePrismWordAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const data = await getAvailableBibleVersions();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PrismWord] /api/scripture/versions error:', error);
    return NextResponse.json(
      { error: 'Unable to load available Bible versions.' },
      { status: 500 },
    );
  }
}
