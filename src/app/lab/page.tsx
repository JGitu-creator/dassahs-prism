'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Beaker, Compass, Moon, Sparkles, Sun, Wind } from 'lucide-react';
import { DopamineSparksLab } from '@/components/prism/DopamineSparksLab';

export default function PrismLabPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const pageBg = darkMode ? 'bg-[#040712] text-slate-100' : 'bg-[#f4f0e7] text-[#172133]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const cardSurface = darkMode
    ? 'border-white/12 bg-[#0b1224]/75 text-slate-100'
    : 'border-[#d6ccb9] bg-[#faf7f0]/95 text-[#172133]';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${pageBg}`}>
      {/* Subtle Ambient Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: darkMode
            ? 'radial-gradient(circle at 20% 15%, rgba(56,189,248,0.14), transparent 45%), radial-gradient(circle at 80% 75%, rgba(168,85,247,0.14), transparent 48%)'
            : 'radial-gradient(circle at 20% 15%, rgba(37,99,235,0.09), transparent 45%), radial-gradient(circle at 80% 75%, rgba(168,85,247,0.08), transparent 48%)',
        }}
      />

      {/* Top Bar */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/engine"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
              darkMode
                ? 'border-white/15 bg-white/5 text-slate-200 hover:border-blue-400/50'
                : 'border-[#d6ccb9] bg-white text-[#172133] hover:border-blue-500/50'
            }`}
          >
            <ArrowLeft size={14} /> Back to Engine
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            <Beaker size={12} /> Prism Lab · Sandboxed Preview
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDarkMode((d) => !d)}
          aria-label="Toggle Light or Dark Mode"
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
            darkMode
              ? 'border-white/15 bg-white/5 text-slate-200 hover:border-cyan-400/50'
              : 'border-[#d6ccb9] bg-white text-[#172133] hover:border-blue-500/50'
          }`}
        >
          {darkMode ? <Sun size={14} className="text-amber-300" /> : <Moon size={14} className="text-blue-600" />}
          <span>{darkMode ? 'Light' : 'Dark'}</span>
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-10 px-5 pb-20 sm:px-8">
        {/* Lab Intro */}
        <section className="space-y-3 pt-2">
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Prism Lab{' '}
            <span className="bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Idea 2 Sandbox
            </span>
          </h1>
          <p className={`max-w-2xl text-sm leading-relaxed sm:text-base ${muted}`}>
            Testing Dopamine Sparks, Momentum Bursts, and tactile Glass Chime feedback in isolation before promoting anything to the main workspace.
          </p>
        </section>

        {/* Idea 2: Dopamine Sparks & Momentum */}
        <DopamineSparksLab darkMode={darkMode} reducedMotion={reducedMotion} />

        {/* Queued Next Experiments */}
        <section aria-label="Upcoming Lab Experiments" className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className={`rounded-3xl border p-6 backdrop-blur-xl ${cardSurface}`}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
              <Wind size={12} /> Idea 3 · Next Up
            </div>
            <h3 className="text-lg font-black">Breathing Living Aurora</h3>
            <p className={`mt-2 text-xs leading-relaxed ${muted}`}>
              Calm, Vibrant, and High Contrast background atmospheres that gently breathe with your reading rhythm.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 backdrop-blur-xl ${cardSurface}`}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-400">
              <Compass size={12} /> Idea 4 · Queued
            </div>
            <h3 className="text-lg font-black">30 Second Guided Tour</h3>
            <p className={`mt-2 text-xs leading-relaxed ${muted}`}>
              One click storyline pill on the Engine gateway that smoothly illuminates Prism Focus, Prism Play, and the Infinity Core.
            </p>
          </div>
        </section>

        <div className="flex items-center justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-blue-500 transition-colors"
          >
            <Sparkles size={14} /> Open Main Prism Focus Workspace
          </Link>
        </div>
      </main>
    </div>
  );
}
