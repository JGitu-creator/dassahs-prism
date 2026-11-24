'use client';

import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Flame, RotateCcw, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react';

type SparkParticle = {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
};

type ActionItem = {
  id: string;
  title: string;
  detail: string;
  bandwidth: number;
};

const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: 'a1',
    title: 'Rotate tokens older than 90 days',
    detail: 'Open security settings and refresh expired keys in one pass.',
    bandwidth: 28,
  },
  {
    id: 'a2',
    title: 'Confirm laptop asset tag',
    detail: 'Match the sticker on the base with the central inventory sheet.',
    bandwidth: 26,
  },
  {
    id: 'a3',
    title: 'Sign the Friday compliance card',
    detail: 'One click attestation to clear your weekend headspace.',
    bandwidth: 30,
  },
];

const SPARK_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6'];

export function DopamineSparksLab({
  darkMode = true,
  reducedMotion = false,
}: {
  darkMode?: boolean;
  reducedMotion?: boolean;
}) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [particles, setParticles] = useState<SparkParticle[]>([]);
  const [toastText, setToastText] = useState<string | null>(null);
  const particleIdRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const totalBandwidth = completedIds.reduce((sum, id) => {
    const found = INITIAL_ACTIONS.find((a) => a.id === id);
    return sum + (found ? found.bandwidth : 0);
  }, 0);

  const playGlassChime = useCallback(
    (isGrandWin: boolean) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const notes = isGrandWin ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + idx * 0.06 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.06 + 0.36);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.06);
          osc.stop(ctx.currentTime + idx * 0.06 + 0.38);
        });
      } catch {
        // Ignore WebAudio autoplay restrictions cleanly
      }
    },
    [soundEnabled]
  );

  const triggerSparks = useCallback(
    (count: number) => {
      if (reducedMotion) return;
      const next: SparkParticle[] = Array.from({ length: count }, (_, i) => {
        particleIdRef.current += 1;
        return {
          id: particleIdRef.current,
          angle: (360 / count) * i + (Math.random() * 18 - 9),
          distance: 54 + Math.random() * 68,
          color: SPARK_COLORS[i % SPARK_COLORS.length],
          size: 5 + Math.random() * 5,
        };
      });
      setParticles(next);
      setTimeout(() => setParticles([]), 750);
    },
    [reducedMotion]
  );

  const handleCompleteAction = (item: ActionItem) => {
    if (completedIds.includes(item.id)) return;
    const nextCompleted = [...completedIds, item.id];
    const allDone = nextCompleted.length === INITIAL_ACTIONS.length;
    setCompletedIds(nextCompleted);
    setStreak((s) => s + 1);
    setXp((prev) => prev + (allDone ? 75 : 25));
    triggerSparks(allDone ? 22 : 14);
    playGlassChime(allDone);
    setToastText(
      allDone
        ? `All clear. ${totalBandwidth + item.bandwidth}% noise eliminated and Momentum Streak +1`
        : `Bandwidth Reclaimed +${item.bandwidth}% · Momentum +25 XP`
    );
  };

  const handleInstantRefractWin = () => {
    setStreak((s) => s + 1);
    setXp((prev) => prev + 40);
    triggerSparks(18);
    playGlassChime(true);
    setToastText('Refraction Complete · 84% noise cleared · +40 XP');
  };

  const handleReset = () => {
    setCompletedIds([]);
    setToastText(null);
  };

  const panelClass = darkMode
    ? 'border-white/12 bg-[#0b1224]/80 text-slate-100'
    : 'border-[#d6ccb9] bg-[#faf7f0]/95 text-[#172133]';

  const cardBg = darkMode
    ? 'border-white/12 bg-white/[0.04]'
    : 'border-[#d6ccb9] bg-white/90';

  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const progressPct = Math.round((completedIds.length / INITIAL_ACTIONS.length) * 100);

  return (
    <section
      aria-label="Dopamine Sparks and Momentum Bursts Lab"
      className={`relative overflow-hidden rounded-[2rem] border p-5 sm:p-8 shadow-2xl backdrop-blur-2xl transition-colors ${panelClass}`}
    >
      {/* Header & Sound Toggle */}
      <div className="flex flex-col gap-4 border-b border-current/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            <Zap size={12} /> Idea 2 · Dopamine Sparks & Momentum
          </div>
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">
            Tactile Wins That Reward Every Step
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
              darkMode
                ? 'border-white/15 bg-white/5 text-slate-200 hover:border-amber-400/50'
                : 'border-[#d6ccb9] bg-white text-[#172133] hover:border-amber-500/50'
            }`}
          >
            {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className={muted} />}
            <span>{soundEnabled ? 'Glass Chime On' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
              darkMode
                ? 'border-white/15 bg-white/5 text-slate-300 hover:border-blue-400/50'
                : 'border-[#d6ccb9] bg-white text-[#243040] hover:border-blue-500/50'
            }`}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Main Split: Reactive Core + Action Checklist */}
      <div className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* Left: Reactive Neural Core & Momentum Stats */}
        <div className={`lg:col-span-5 flex flex-col items-center justify-center rounded-3xl border p-6 text-center ${cardBg}`}>
          <div className="relative flex h-40 w-40 items-center justify-center">
            {/* Burst Particles */}
            <AnimatePresence>
              {particles.map((p) => {
                const rad = (p.angle * Math.PI) / 180;
                const tx = Math.cos(rad) * p.distance;
                const ty = Math.sin(rad) * p.distance;
                return (
                  <motion.span
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{ x: tx, y: ty, scale: 0.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color,
                      boxShadow: `0 0 12px ${p.color}`,
                    }}
                  />
                );
              })}
            </AnimatePresence>

            {/* Core Orb */}
            <motion.button
              type="button"
              onClick={handleInstantRefractWin}
              whileTap={reducedMotion ? undefined : { scale: 0.93 }}
              whileHover={reducedMotion ? undefined : { scale: 1.05 }}
              className="relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-full border border-white/25 bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-emerald-500/30 shadow-[0_0_45px_rgba(56,189,248,0.35)] backdrop-blur-xl transition-all"
              title="Tap to trigger a Refraction Victory Burst"
            >
              <Sparkles size={26} className="text-cyan-300" />
              <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-white">
                Tap Win
              </span>
            </motion.button>
          </div>

          {/* Live Stats Row */}
          <div className="mt-4 grid w-full grid-cols-3 gap-2">
            <div className="rounded-2xl border border-current/10 bg-current/[0.03] p-2.5">
              <p className={`text-[9px] font-black uppercase tracking-wider ${muted}`}>Streak</p>
              <p className="mt-0.5 flex items-center justify-center gap-1 text-lg font-black text-amber-400 tabular-nums">
                <Flame size={15} /> {streak}
              </p>
            </div>
            <div className="rounded-2xl border border-current/10 bg-current/[0.03] p-2.5">
              <p className={`text-[9px] font-black uppercase tracking-wider ${muted}`}>Bandwidth</p>
              <p className="mt-0.5 text-lg font-black text-emerald-400 tabular-nums">
                {totalBandwidth}%
              </p>
            </div>
            <div className="rounded-2xl border border-current/10 bg-current/[0.03] p-2.5">
              <p className={`text-[9px] font-black uppercase tracking-wider ${muted}`}>XP</p>
              <p className="mt-0.5 text-lg font-black text-cyan-400 tabular-nums">
                {xp}
              </p>
            </div>
          </div>

          {/* Floating Momentum Toast */}
          <AnimatePresence mode="wait">
            {toastText && (
              <motion.div
                key={toastText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 w-full rounded-2xl border border-emerald-500/35 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-400"
              >
                {toastText}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Tactile Action Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-[0.18em] ${muted}`}>
              Tap each step to claim momentum
            </span>
            <span className="text-xs font-black text-emerald-400 tabular-nums">
              {progressPct}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-current/10">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400"
            />
          </div>

          <div className="space-y-3 pt-1">
            {INITIAL_ACTIONS.map((item) => {
              const done = completedIds.includes(item.id);
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleCompleteAction(item)}
                  whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                    done
                      ? 'border-emerald-500/45 bg-emerald-500/10'
                      : `${cardBg} hover:border-blue-400/50 cursor-pointer`
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      done
                        ? 'border-emerald-400 bg-emerald-500 text-white'
                        : 'border-current/30 bg-transparent'
                    }`}
                  >
                    {done && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-black ${done ? 'line-through opacity-75' : ''}`}>
                        {item.title}
                      </p>
                      <span className="shrink-0 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-black text-blue-400">
                        +{item.bandwidth}% clarity
                      </span>
                    </div>
                    <p className={`mt-1 text-xs leading-relaxed ${muted}`}>
                      {item.detail}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
