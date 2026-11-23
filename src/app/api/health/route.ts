import { NextResponse } from 'next/server';
import { getFourTierHealthMetadata } from '@/lib/server/prism-router';

export async function GET() {
  const fourTier = getFourTierHealthMetadata();
  return NextResponse.json({
    ok: true,
    service: 'dassahs-prism',
    shadowMode: process.env.PRISM_SHADOW_MODE === 'true',
    fourTierEnabled: fourTier.fourTierEnabled,
    groqModels: fourTier.groqModels,
    tier3Model: fourTier.tier3Model,
    multimodalLane: fourTier.multimodalLane,
    groqVisionDeferred: fourTier.groqVisionDeferred,
    providers: fourTier.providers,
    timestamp: new Date().toISOString(),
  });
}
