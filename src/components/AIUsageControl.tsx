'use client';

import { Coins } from 'lucide-react';
import type { ProviderPreference } from '@/lib/ai-usage';
import { PrismSwitcherPopover } from '@/components/prism/PrismSwitcherPopover';

type Usage = {
  totalTokens: number;
  provider: string;
  model: string;
  tier?: string;
  label?: string;
};

export function AIUsageControl({
  usage,
}: {
  preference?: ProviderPreference;
  onPreferenceChange?: (value: ProviderPreference) => void;
  usage: Usage;
}) {
  const isLocalFallback =
    usage.provider === 'local'
    || usage.model === 'local-fallback'
    || usage.tier === 'tier4';

  const lowerModel = (usage.model || '').toLowerCase();
  const providerLabel =
    usage.label
      ? usage.label
      : isLocalFallback
        ? 'Local Fallback'
        : usage.tier === 'tier1' || lowerModel.includes('gpt-oss-20b')
          ? 'Groq · Tier 1'
          : usage.tier === 'tier2' || lowerModel.includes('gpt-oss-120b')
            ? 'Groq · Tier 2'
            : usage.provider === 'groq'
              ? 'Groq · Tier 1'
              : usage.provider === 'gemini' || usage.tier === 'tier3'
                ? 'Gemini 3.5'
                : usage.provider === 'mistral'
                  ? 'Mistral AI'
                  : usage.provider === 'openrouter' || usage.tier === 'pool'
                    ? 'OpenRouter · Free'
                    : 'Auto ∞';

  const badgeClass = isLocalFallback
    ? 'bg-emerald-500/20 text-emerald-300'
    : usage.provider === 'groq'
      ? 'bg-cyan-500/20 text-cyan-300'
      : usage.provider === 'mistral'
        ? 'bg-amber-500/20 text-amber-300'
        : usage.provider === 'openrouter'
          ? 'bg-violet-500/20 text-violet-300'
          : 'bg-blue-500/15 text-blue-300';

  return (
    <div
      data-tour="focus-engine-switcher"
      className="flex min-w-0 shrink-0 items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)] px-2.5 py-1.5 text-[var(--fg)] shadow-lg backdrop-blur-xl"
    >
      <PrismSwitcherPopover
        current="focus"
        compact
        badgeNode={
          <span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${badgeClass}`}>
            {providerLabel}
          </span>
        }
      />
      <div
        className="flex min-w-0 items-center gap-1 border-l border-[var(--color-border)] pl-2"
        title={
          isLocalFallback
            ? 'The Prism Engine · Local Structural Refraction active (0 tokens spent)'
            : `The Prism Engine · Infinite-Loop Autonomous Orchestrator ∞ (${usage.totalTokens.toLocaleString()} session tokens)`
        }
      >
        <Coins size={12} className="text-amber-400 shrink-0" />
        <span className="text-[8px] font-black uppercase tracking-wider text-amber-300 sm:text-[9px]">
          Unlimited
        </span>
      </div>
    </div>
  );
}
