'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Flame,
  Gamepad2,
  Sparkles,
  X,
} from 'lucide-react';

export interface TourStep {
  selector: string;
  title: string;
  description: string;
}

export type TourPrismAccent = 'blue' | 'emerald' | 'purple' | 'amber';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const ACCENT_STYLES: Record<
  TourPrismAccent,
  {
    ring: string;
    border: string;
    btn: string;
    badge: string;
    arrowStroke: string;
    glow: string;
    Icon: typeof Brain;
  }
> = {
  blue: {
    ring: 'border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.55)]',
    border: 'border-blue-400/45',
    btn: 'bg-blue-600 hover:bg-blue-500 text-white',
    badge: 'text-blue-400 bg-blue-500/15 border-blue-400/30',
    arrowStroke: '#60a5fa',
    glow: 'from-blue-500/25 via-indigo-500/15 to-transparent',
    Icon: Brain,
  },
  emerald: {
    ring: 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.55)]',
    border: 'border-emerald-400/45',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/30',
    arrowStroke: '#34d399',
    glow: 'from-emerald-500/25 via-teal-500/15 to-transparent',
    Icon: Gamepad2,
  },
  purple: {
    ring: 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.55)]',
    border: 'border-purple-400/45',
    btn: 'bg-purple-600 hover:bg-purple-500 text-white',
    badge: 'text-purple-300 bg-purple-500/15 border-purple-400/30',
    arrowStroke: '#c084fc',
    glow: 'from-purple-500/25 via-violet-500/15 to-transparent',
    Icon: BookOpen,
  },
  amber: {
    ring: 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.55)]',
    border: 'border-amber-400/45',
    btn: 'bg-amber-600 hover:bg-amber-500 text-white',
    badge: 'text-amber-400 bg-amber-500/15 border-amber-400/30',
    arrowStroke: '#fbbf24',
    glow: 'from-amber-500/25 via-orange-500/15 to-transparent',
    Icon: Flame,
  },
};

export function PrismTourOverlay({
  storageKey,
  prismName,
  welcomeMessage,
  accent,
  steps,
  darkMode = true,
  manualTriggerCount = 0,
}: {
  storageKey: string;
  prismName: string;
  welcomeMessage: string;
  accent: TourPrismAccent;
  steps: readonly TourStep[];
  darkMode?: boolean;
  manualTriggerCount?: number;
}) {
  const [phase, setPhase] = useState<'idle' | 'invite' | 'touring' | 'welcome'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);

  const style = ACCENT_STYLES[accent];
  const PrismIcon = style.Icon;

  // Show subtle first-time "Begin Tour / Skip" prompt if never dismissed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = window.localStorage.getItem(storageKey);
      if (!seen) {
        const timer = setTimeout(() => setPhase('invite'), 900);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore private storage errors
    }
  }, [storageKey]);

  // Open straight into Step 0 whenever the user clicks "Neural Guide" in the footer
  useEffect(() => {
    if (manualTriggerCount > 0) {
      setStepIdx(0);
      setPhase('touring');
    }
  }, [manualTriggerCount]);

  const measureCurrentStep = useCallback(() => {
    if (phase !== 'touring' || typeof window === 'undefined') return;
    const step = steps[stepIdx];
    if (!step) return;
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.top < 16 || r.bottom > window.innerHeight - 16) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const updated = el.getBoundingClientRect();
    setRect({
      top: updated.top,
      left: updated.left,
      width: updated.width,
      height: updated.height,
    });
  }, [phase, stepIdx, steps]);

  useEffect(() => {
    if (phase !== 'touring') return;
    const t1 = setTimeout(measureCurrentStep, 80);
    const t2 = setTimeout(measureCurrentStep, 420);
    window.addEventListener('resize', measureCurrentStep);
    window.addEventListener('scroll', measureCurrentStep, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', measureCurrentStep);
      window.removeEventListener('scroll', measureCurrentStep, true);
    };
  }, [phase, stepIdx, measureCurrentStep]);

  const markSeen = () => {
    try {
      window.localStorage.setItem(storageKey, 'done');
    } catch {
      // Ignore
    }
  };

  const handleSkip = () => {
    markSeen();
    setPhase('idle');
  };

  const handleFinishTour = () => {
    markSeen();
    setPhase('welcome');
    setTimeout(() => {
      setPhase('idle');
    }, 1850);
  };

  const cardSurface = darkMode
    ? 'bg-[#0b1326]/86 text-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.65)]'
    : 'bg-[#f3ede0]/92 text-[#172133] shadow-[0_20px_55px_rgba(23,33,51,0.16)]';

  const currentStep = steps[stepIdx];

  // Calculate where the translucent pointer card should float relative to the target button
  let cardStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
  let placeAbove = false;

  if (rect && typeof window !== 'undefined') {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardWidth = Math.min(340, vw - 24);
    const centerX = rect.left + rect.width / 2;
    const clampedLeft = Math.max(12, Math.min(vw - cardWidth - 12, centerX - cardWidth / 2));

    const rectBottom = rect.top + rect.height;
    placeAbove = rectBottom + 215 > vh && rect.top > 210;
    const topPos = placeAbove ? Math.max(12, rect.top - 195) : Math.min(vh - 195, rectBottom + 26);

    cardStyle = {
      top: `${topPos}px`,
      left: `${clampedLeft}px`,
      width: `${cardWidth}px`,
    };
  }

  return (
    <AnimatePresence>
      {/* 1. Subtle "Begin Tour / Skip" Pill Toast */}
      {phase === 'invite' && (
        <motion.div
          key="tour-invite"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className={`fixed bottom-6 right-4 sm:right-6 z-[720] max-w-sm rounded-3xl border p-4 backdrop-blur-2xl ${style.border} ${cardSurface}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] flex items-center gap-1.5 opacity-80">
                <Sparkles size={11} /> {prismName} · Neural Guide
              </p>
              <p className="text-xs font-bold leading-relaxed">
                Want a quick 25-second pointer tour of what each button does?
              </p>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              aria-label="Dismiss tour prompt"
              className="opacity-60 hover:opacity-100 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-xl px-3 py-1.5 text-[11px] font-bold opacity-75 hover:opacity-100 cursor-pointer"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => {
                setStepIdx(0);
                setPhase('touring');
              }}
              className={`rounded-xl px-4 py-1.5 text-[11px] font-black shadow-md transition-all cursor-pointer ${style.btn}`}
            >
              Begin Tour →
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Interactive Pointer-Arrow Tour Step */}
      {phase === 'touring' && currentStep && (
        <motion.div
          key="tour-active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[740] pointer-events-none"
        >
          {/* Subtle dim veil that still lets you clearly see the live app underneath */}
          <div
            onClick={handleSkip}
            className="absolute inset-0 bg-black/25 pointer-events-auto"
          />

          {/* Glowing target highlight ring around the pointed key */}
          {rect && (
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
              }}
              className={`fixed rounded-2xl border-2 pointer-events-none ${style.ring}`}
            />
          )}

          {/* Translucent Pointer Direction Card + Faint Animated Arrow */}
          <motion.div
            key={`step-${stepIdx}`}
            initial={{ opacity: 0, y: placeAbove ? -8 : 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={cardStyle}
            className={`fixed rounded-3xl border p-5 backdrop-blur-2xl pointer-events-auto space-y-3 ${style.border} ${cardSurface}`}
          >
            {/* Faint Animated Pointer Arrow pointing straight toward the highlighted button */}
            {rect && (
              <motion.svg
                width="28"
                height="22"
                viewBox="0 0 28 22"
                fill="none"
                animate={{ y: placeAbove ? [0, 4, 0] : [0, -4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  marginLeft: -14,
                  ...(placeAbove ? { bottom: -20 } : { top: -20 }),
                }}
                aria-hidden="true"
              >
                {placeAbove ? (
                  <path
                    d="M14 2V19M14 19L7 12M14 19L21 12"
                    stroke={style.arrowStroke}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.8"
                  />
                ) : (
                  <path
                    d="M14 20V3M14 3L7 10M14 3L21 10"
                    stroke={style.arrowStroke}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.8"
                  />
                )}
              </motion.svg>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${style.badge}`}>
                Step {stepIdx + 1} of {steps.length}
              </span>
              <button
                type="button"
                onClick={handleSkip}
                className="text-[11px] font-bold opacity-65 hover:opacity-100 cursor-pointer"
              >
                Skip Tour
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black tracking-tight">{currentStep.title}</h3>
              <p className="text-xs leading-relaxed opacity-85">{currentStep.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                disabled={stepIdx === 0}
                onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold opacity-75 hover:opacity-100 disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft size={13} /> Back
              </button>

              {stepIdx < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStepIdx((s) => s + 1)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-black shadow transition-all cursor-pointer ${style.btn}`}
                >
                  <span>Next</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishTour}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-black shadow transition-all cursor-pointer ${style.btn}`}
                >
                  <span>Finish</span>
                  <Sparkles size={13} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 3. Translucent Prism Icon Swap & Dissolving Welcome Over Normal App Background */}
      {phase === 'welcome' && (
        <motion.div
          key="tour-welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, times: [0, 0.2, 0.65, 1], ease: 'easeInOut' }}
          className="fixed inset-0 z-[750] pointer-events-none flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.86, y: 10 }}
            animate={{ scale: [0.86, 1.03, 1.08], y: [10, 0, -8] }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className={`relative rounded-[3rem] border px-10 py-8 backdrop-blur-xl text-center space-y-3 bg-gradient-to-b ${style.glow} ${style.border} ${
              darkMode ? 'bg-[#070d1d]/65 text-white' : 'bg-[#f3ede0]/75 text-[#172133]'
            }`}
          >
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-current/25 bg-white/10 shadow-xl">
              <PrismIcon size={32} />
            </div>
            <h2 className="prism-brand text-2xl sm:text-3xl font-black italic tracking-tight">
              Welcome to {prismName}
            </h2>
            <p className="text-xs sm:text-sm font-semibold opacity-85 max-w-xs mx-auto">
              {welcomeMessage}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
