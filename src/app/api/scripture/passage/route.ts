import { NextResponse } from 'next/server';
import { fetchBiblePassage } from '@/features/scripture/providers/bibleProvider';
import { requirePrismWordAuth } from '@/features/scripture/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requirePrismWordAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const ref = (searchParams.get('ref') || 'Psalm 23:1-6').trim();
    const translation = (searchParams.get('translation') || 'ESV').trim();

    if (!ref) {
      return NextResponse.json({ error: 'Passage reference "ref" is required.' }, { status: 400 });
    }

    const passage = await fetchBiblePassage(ref, translation);
    return NextResponse.json(passage);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch Bible passage.';
    const status = message.startsWith('Invalid Bible reference') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
