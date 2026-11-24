import { NextResponse } from 'next/server';
import {
  readVaultState,
  saveAskDjInsightToVault,
  saveCommitmentsToVault,
  savePassageNoteToVault,
  saveSundayReflectionToVault,
  type VaultCommitmentItem,
} from '@/features/scripture/localVault';
import { requirePrismWordAuth } from '@/features/scripture/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requirePrismWordAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const passageId = (searchParams.get('passageId') || 'PSA.23.1-6').trim();
    const weekKey = (searchParams.get('weekKey') || 'current').trim();
    const state = readVaultState(passageId, weekKey);
    return NextResponse.json({
      diskVaultActive: state.diskVaultActive,
      vaultLocationLabel: state.diskVaultActive
        ? "DJ's Notes (separate private folders)"
        : 'Private signed in browser storage',
      note: state.note,
      commitments: state.commitments,
      graceReflection: state.graceReflection,
    });
  } catch (error) {
    console.error('[PrismWord] /api/scripture/notes GET error:', error);
    return NextResponse.json({ error: 'Unable to read private vault notes.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requirePrismWordAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const type = String(body.type || '').trim();

    if (type === 'passage-note') {
      const passageId = String(body.passageId || 'PSA.23.1-6');
      const reference = String(body.reference || passageId);
      const content = String(body.content || '');
      const result = savePassageNoteToVault(passageId, reference, content, auth.email);
      return NextResponse.json(result);
    }

    if (type === 'commitments') {
      const items = Array.isArray(body.commitments)
        ? (body.commitments as VaultCommitmentItem[])
        : [];
      const result = saveCommitmentsToVault(items);
      return NextResponse.json(result);
    }

    if (type === 'sunday-reflection') {
      const weekKey = String(body.weekKey || 'current');
      const reflection = String(body.reflection || '');
      const result = saveSundayReflectionToVault(weekKey, reflection, auth.email);
      return NextResponse.json(result);
    }

    if (type === 'ask-dj-insight') {
      const passageId = String(body.passageId || 'general');
      const reference = String(body.reference || passageId);
      const question = String(body.question || '');
      const reply = String(body.reply || '');
      if (!reply.trim()) {
        return NextResponse.json({ error: 'Reply text is required.' }, { status: 400 });
      }
      const result = saveAskDjInsightToVault(passageId, reference, question, reply, auth.email);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown private vault entry type.' }, { status: 400 });
  } catch (error) {
    console.error('[PrismWord] /api/scripture/notes POST error:', error);
    return NextResponse.json({ error: 'Unable to save to private notes folder.' }, { status: 500 });
  }
}
