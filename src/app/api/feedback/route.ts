import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Feedback is not configured.' }, { status: 503 });
    }

    const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const rateKey = forwardedFor || req.headers.get('x-real-ip') || 'anonymous';
    const now = Date.now();
    const current = requestCounts.get(rateKey);
    if (!current || current.resetAt <= now) {
      requestCounts.set(rateKey, { count: 1, resetAt: now + RATE_WINDOW_MS });
    } else if (current.count >= RATE_LIMIT) {
      return NextResponse.json({ error: 'Feedback limit reached. Please try again later.' }, { status: 429 });
    } else {
      current.count += 1;
    }

    const body = await req.json();
    const { feedback, type } = body ?? {};
    if (type !== undefined && type !== 'feedback') {
      return NextResponse.json({ error: 'Only product feedback belongs in this endpoint.' }, { status: 400 });
    }
    if (typeof feedback !== 'string' || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback text is required.' }, { status: 400 });
    }
    const content = feedback.trim().slice(0, 5000);

    // Anonymous tester feedback is allowed. If a session is present, only its
    // verified subject is persisted; client-supplied IDs are ignored.
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
      || req.headers.get('cookie')?.match(/(?:^|;\s*)sb-access-token=([^;]+)/)?.[1];
    let verifiedUserId: string | null = null;
    if (token) {
      const { data } = await supabase.auth.getUser(decodeURIComponent(token));
      verifiedUserId = data.user?.id ?? null;
    }

    const { error } = await supabase
      .from('feedback_vault')
      .insert([{ user_id: verifiedUserId, content, type: 'feedback' }]);

    if (error) {
      console.error('Supabase feedback insert failed:', error.message);
      return NextResponse.json({ error: 'Feedback could not be saved. Please try again.' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Feedback API Error:', error);
    return NextResponse.json({ error: 'Failed to vault feedback.' }, { status: 500 });
  }
}
