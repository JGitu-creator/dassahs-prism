import { NextResponse } from 'next/server';
import {
  answerScriptureQuestion,
  sanitizeReferenceOnlyInput,
} from '@/features/scripture/studyEngine';
import { requirePrismWordAuth } from '@/features/scripture/serverAuth';
import type { AskDjChatTurn } from '@/features/scripture/types';

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
            'Reference-only payload required: licensed scripture body text must not be sent to Ask DJ.',
        },
        { status: 400 },
      );
    }

    const primaryReference = String(sanitized.primaryReference || '').trim();
    const clickedReference = sanitized.clickedReference
      ? String(sanitized.clickedReference).trim()
      : undefined;
    const focusWord = sanitized.focusWord
      ? String(sanitized.focusWord).trim().slice(0, 60)
      : undefined;
    const previousInteractionId =
      typeof sanitized.previousInteractionId === 'string' && sanitized.previousInteractionId.trim()
        ? sanitized.previousInteractionId.trim()
        : undefined;
    const question = String(sanitized.question || '').trim();
    const rawHistory = Array.isArray(sanitized.history) ? sanitized.history : [];
    const history: AskDjChatTurn[] = rawHistory
      .filter((item): item is { role: string; text: string } =>
        Boolean(item && typeof item === 'object' && 'text' in item),
      )
      .slice(-8)
      .map((item) => ({
        role: item.role === 'user' ? 'user' : 'assistant',
        text: String(item.text || '').slice(0, 1200),
      }));

    if (!primaryReference) {
      return NextResponse.json(
        { error: 'primaryReference is required.' },
        { status: 400 },
      );
    }

    const result = await answerScriptureQuestion({
      primaryReference,
      clickedReference,
      focusWord,
      previousInteractionId,
      question,
      history,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[PrismWord] /api/scripture/ask-dj error:', error);
    return NextResponse.json(
      { error: 'Ask DJ could not answer right now.' },
      { status: 500 },
    );
  }
}
