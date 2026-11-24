import { NextResponse } from 'next/server';
import { isAllowedPrismWordEmail, normalizePrismWordEmail } from '@/features/scripture/accessControl';
import {
  isSupabaseAuthConfigured,
  LOCAL_SESSION_COOKIE_NAME,
  signLocalSession,
  verifyPrismWordSession,
} from '@/features/scripture/serverAuth';

export const dynamic = 'force-dynamic';
const isProductionRuntime = String(process.env.NODE_ENV) === 'production';

export async function GET(req: Request) {
  const session = await verifyPrismWordSession(req);
  return NextResponse.json({
    authorized: session.authorized,
    email: session.authorized ? session.email : undefined,
    rejectedEmail: !session.authorized && session.statusCode === 403 ? session.email : undefined,
    supabaseConfigured: isSupabaseAuthConfigured(),
    localUnlockAvailable: !isProductionRuntime && !isSupabaseAuthConfigured(),
    mode: session.mode,
    allowedHint: 'Private sanctuary access only',
    reason: session.reason,
  });
}

export async function POST(req: Request) {
  try {
    // Typing an allowlisted email is not proof of mailbox ownership. In
    // production, require the verified Supabase/Google path instead.
    if (isProductionRuntime || isSupabaseAuthConfigured()) {
      return NextResponse.json(
        { error: 'Verified Google sign-in is required for private Prism Word access.' },
        { status: 403 },
      );
    }
    const body = (await req.json()) as { email?: unknown };
    const email = normalizePrismWordEmail(body?.email);

    if (!isAllowedPrismWordEmail(email)) {
      return NextResponse.json(
        {
          error:
            'Access denied. Only authorised family email addresses can open this private sanctuary.',
        },
        { status: 403 },
      );
    }

    const token = signLocalSession(email);
    const res = NextResponse.json({ authorized: true, email });
    res.cookies.set(LOCAL_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProductionRuntime,
      path: '/',
      maxAge: 14 * 24 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid sign in request.' }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authorized: false });
  res.cookies.set(LOCAL_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProductionRuntime,
    path: '/',
    maxAge: 0,
  });
  return res;
}
