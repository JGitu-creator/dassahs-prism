import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'dassahs-prism',
    status: 'ok',
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || 'unknown',
    timestamp: new Date().toISOString(),
  });
}
