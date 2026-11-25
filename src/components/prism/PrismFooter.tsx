'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { LivingIchthysFooter } from '@/components/prism/LivingIchthysFooter';

export type PrismFooterAccent = 'blue' | 'emerald' | 'purple' | 'amber';

export function PrismFooter({
  focusMode = 'dastastic',
  accent = 'blue',
  onOpenNeuralGuide,
}: {
  focusMode?: string;
  accent?: PrismFooterAccent;
  onOpenNeuralGuide?: () => void;
}) {
  const pillClasses =
    accent === 'emerald'
      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:text-[var(--fg)]'
      : accent === 'purple'
        ? 'bg-purple-500/10 border-purple-500/25 text-purple-400 hover:text-[var(--fg)]'
        : accent === 'amber'
          ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 hover:text-[var(--fg)]'
          : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:text-[var(--fg)]';

  return (
    <footer className="w-full py-12 px-4 border-t border-black/5 dark:border-white/5 z-10 flex flex-col items-center gap-4 text-center opacity-80 hover:opacity-100 transition-opacity">
      <LivingIchthysFooter focusMode={focusMode} />
      <p className="max-w-xl text-[10px] leading-relaxed text-[var(--fg)]/70">
        Privacy first: remove passwords, API keys, identity numbers, and private medical or financial details before sending material for AI refraction.
      </p>
      {onOpenNeuralGuide && (
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onOpenNeuralGuide}
            className={`mt-2 px-6 py-2 border rounded-full text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${pillClasses}`}
          >
            <Sparkles size={10} /> Neural Guide
          </button>
        </div>
      )}
    </footer>
  );
}
