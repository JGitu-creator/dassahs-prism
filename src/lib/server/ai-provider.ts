import {
  DEFAULT_GROQ_TIER1_MODEL,
  DEFAULT_GROQ_TIER2_MODEL,
  DEFAULT_TIER3_GEMINI_MODEL,
  LOCAL_FALLBACK_MODEL,
} from '@/lib/server/prism-router';

export type Provider = 'groq' | 'gemini' | 'openrouter' | 'local';

export function getModelForProvider(provider: Provider): string {
  if (provider === 'groq') return DEFAULT_GROQ_TIER1_MODEL;
  if (provider === 'gemini') return DEFAULT_TIER3_GEMINI_MODEL;
  if (provider === 'local') return LOCAL_FALLBACK_MODEL;
  return DEFAULT_GROQ_TIER2_MODEL;
}
