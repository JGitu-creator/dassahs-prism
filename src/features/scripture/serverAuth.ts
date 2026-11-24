import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAllowedPrismWordEmail, normalizePrismWordEmail } from './accessControl.ts';

export const LOCAL_SESSION_COOKIE_NAME = 'prism_word_local_session';
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export function isSupabaseAuthConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
  return Boolean(
    url &&
      anon &&
      !url.includes('placeholder') &&
      anon !== 'placeholder-key' &&
      url.startsWith('http'),
  );
}

function getLocalSigningSecret(): string {
  const configured = process.env.PRISM_WORD_SESSION_SECRET?.trim() || '';
  if (!configured) return '';
  return crypto.createHash('sha256').update(configured).digest('hex');
}

export function signLocalSession(email: string): string {
  if (!getLocalSigningSecret()) throw new Error('PRISM_WORD_SESSION_SECRET is not configured');
  const normalized = normalizePrismWordEmail(email);
  const exp = Date.now() + SESSION_MAX_AGE_MS;
  const payload = Buffer.from(JSON.stringify({ email: normalized, exp }), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getLocalSigningSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyLocalSessionToken(token: string | undefined): string | null {
  if (!getLocalSigningSecret()) return null;
  if (!token || !token.includes('.')) return null;
  const [payload, providedSig] = token.split('.', 2);
  if (!payload || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getLocalSigningSecret())
    .update(payload)
    .digest('base64url');

  const a = Buffer.from(providedSig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: string;
      exp?: number;
    };
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    if (!isAllowedPrismWordEmail(parsed.email)) return null;
    return normalizePrismWordEmail(parsed.email);
  } catch {
    return null;
  }
}

export function parseCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) {
      const rawVal = part.slice(idx + 1).trim();
      try {
        return decodeURIComponent(rawVal);
      } catch {
        return rawVal;
      }
    }
  }
  return undefined;
}

export async function verifyPrismWordSession(req: Request): Promise<{
  authorized: boolean;
  email?: string;
  mode: 'supabase' | 'local-session';
  statusCode: 200 | 401 | 403;
  reason?: string;
}> {
  const cookieHeader = req.headers.get('cookie');
  const supabaseConfigured = isSupabaseAuthConfigured();

  // Path 1: Signed HttpOnly sanctuary session cookie (works seamlessly on both localhost and Vercel)
  const localToken = parseCookieValue(cookieHeader, LOCAL_SESSION_COOKIE_NAME);
  const localEmail = verifyLocalSessionToken(localToken);
  if (localEmail) {
    return {
      authorized: true,
      email: localEmail,
      mode: 'local-session',
      statusCode: 200,
    };
  }

  // Path 2: Supabase JWT authentication (Google OAuth / bearer token)
  if (supabaseConfigured) {
    const authHeader = req.headers.get('authorization');
    const bearer = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : undefined;
    const sbToken = bearer || parseCookieValue(cookieHeader, 'sb-access-token');

    if (!sbToken) {
      return {
        authorized: false,
        mode: 'supabase',
        statusCode: 401,
        reason: 'Please sign in with an authorised account to access Prism Word.',
      };
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
        { auth: { persistSession: false } },
      );
      const { data, error } = await supabase.auth.getUser(sbToken);
      if (error || !data?.user?.email) {
        return {
          authorized: false,
          mode: 'supabase',
          statusCode: 401,
          reason: 'Your session has expired. Please sign in again.',
        };
      }
      if (!isAllowedPrismWordEmail(data.user.email)) {
        return {
          authorized: false,
          email: normalizePrismWordEmail(data.user.email),
          mode: 'supabase',
          statusCode: 403,
          reason: 'This private sanctuary is restricted to authorised family accounts only.',
        };
      }
      return {
        authorized: true,
        email: normalizePrismWordEmail(data.user.email),
        mode: 'supabase',
        statusCode: 200,
      };
    } catch {
      return {
        authorized: false,
        mode: 'supabase',
        statusCode: 401,
        reason: 'Unable to verify sign in session right now. Please try again.',
      };
    }
  }

  return {
    authorized: false,
    mode: 'local-session',
    statusCode: 401,
    reason: 'Private sanctuary locked. Sign in with an authorised family email.',
  };
}

export async function requirePrismWordAuth(
  req: Request,
): Promise<
  | { authorized: true; email: string }
  | { authorized: false; response: NextResponse }
> {
  const session = await verifyPrismWordSession(req);
  if (session.authorized && session.email) {
    return { authorized: true, email: session.email };
  }
  return {
    authorized: false,
    response: NextResponse.json(
      {
        error:
          session.reason ||
          'Private sanctuary access is restricted to authorised family accounts.',
      },
      { status: session.statusCode },
    ),
  };
}
