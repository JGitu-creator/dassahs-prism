'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, Sparkles, Zap } from 'lucide-react';

type SampleCase = {
  id: string;
  label: string;
  tag: string;
  rawNoise: string;
  wordCount: number;
  tldrSignal: string;
  vividMetaphor: string;
  nextStep: string;
  bandwidthReclaimed: number;
};

const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'lecture',
    label: 'Messy Lecture Notes',
    tag: 'Academic',
    wordCount: 142,
    bandwidthReclaimed: 84,
    rawNoise:
      'Cognitive Load Theory (Sweller, 1988) distinguishes intrinsic load (inherent complexity of the material itself), extraneous load (how the material is presented, including poor formatting, dense walls of text, redundant clauses, and unclear instructions that tax working memory), and germane load (the mental effort devoted to constructing permanent schemas). When total working memory capacity is exceeded by extraneous friction, executive function stalls completely and retention collapses. Implementing bionic visual anchoring, progressive disclosure, and concrete action checklists measurably reduces extraneous load so neurodivergent learners can allocate bandwidth directly to conceptual meaning and immediate execution.',
    tldrSignal:
      'Your brain freezes not because the topic is too hard, but because messy formatting clogs working memory. Strip the clutter to unlock instant comprehension.',
    vividMetaphor:
      'Working memory is a narrow doorway: cramming ten boxes through at once jams the frame, while passing one labeled box at a time clears the room effortlessly.',
    nextStep:
      'Break your study page into three single-idea cards and circle just one concrete action before reading further.',
  },
  {
    id: 'error',
    label: 'Cryptic IT Error',
    tag: 'Engineering',
    wordCount: 118,
    bandwidthReclaimed: 88,
    rawNoise:
      'Build failed during edge worker bundling: Uncaught ReferenceError: WorkerGlobalScope is not defined when resolving pdfjs-dist legacy build inside Server-Side Rendering context. Static module evaluation attempts to bind browser Web Worker globals before hydration completes on Node.js runtime. Ensure client-only dynamic import is strictly deferred inside interactive event handlers, disable SSR pre-evaluation for the PDF parser module, and verify that GlobalWorkerOptions.workerSrc points to a same-origin static asset matching the exact installed package version in node_modules.',
    tldrSignal:
      'The server tried to run browser-only PDF worker code before the page reached the browser. Defer that import until the user clicks upload.',
    vividMetaphor:
      'It is like trying to start a boat engine while the boat is still inside the delivery truck. Wait until it touches the water.',
    nextStep:
      'Move the PDF library import inside your upload click handler and point workerSrc to your public folder.',
  },
  {
    id: 'policy',
    label: 'Dense Work Policy',
    tag: 'Workplace',
    wordCount: 126,
    bandwidthReclaimed: 81,
    rawNoise:
      'Pursuant to Section 4.2 of the Annual Information Security and Acceptable Use Directive, all full-time, part-time, and hybrid personnel across regional divisions must complete the mandatory compliance attestation inside the governance portal no later than Friday at 17:00 UTC. Prior to submitting the electronic signature, personnel are required to rotate any personal access tokens older than ninety calendar days, cross-verify assigned hardware asset tags against the central inventory ledger, and attach a signed telework ergonomics acknowledgment to the HR Services queue.',
    tldrSignal:
      'You have three quick tasks to finish before Friday at 5 PM UTC: rotate old tokens, confirm your laptop tag, and sign the portal form.',
    vividMetaphor:
      'Think of it like a pre-flight safety walkaround: check three switches on the dashboard before clearing the runway for Friday.',
    nextStep:
      'Open your token settings right now, rotate any key older than 90 days, then check off the portal attestation.',
  },
];

export function PrismBeamSimulator({
  darkMode = true,
  reducedMotion = false,
}: {
  darkMode?: boolean;
  reducedMotion?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_CASES[0].id);
  const [intensity, setIntensity] = useState<number>(85);

  const activeCase = SAMPLE_CASES.find((c) => c.id === selectedId) ?? SAMPLE_CASES[0];
  const progress = intensity / 100;
  const reclaimed = Math.round(activeCase.bandwidthReclaimed * progress);

  const panelClass = darkMode
    ? 'border-white/12 bg-[#0b1224]/80 text-slate-100'
    : 'border-[#d6ccb9] bg-[#faf7f0]/95 text-[#172133]';

  const subTextClass = darkMode ? 'text-slate-400' : 'text-[#526071]';

  const cardBg = darkMode
    ? 'border-white/12 bg-white/[0.04]'
    : 'border-[#d6ccb9] bg-white/85';

  return (
    <section
      aria-label="Noise to Clarity Prism Beam Simulator"
      className={`relative overflow-hidden rounded-[2rem] border p-5 sm:p-8 shadow-2xl backdrop-blur-2xl transition-colors ${panelClass}`}
    >
      {/* Ambient Beam Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: 0.25 + progress * 0.65,
          background: darkMode
            ? 'radial-gradient(circle at 50% 45%, rgba(56,189,248,0.18), rgba(168,85,247,0.12) 45%, transparent 72%)'
            : 'radial-gradient(circle at 50% 45%, rgba(37,99,235,0.12), rgba(168,85,247,0.08) 45%, transparent 72%)',
        }}
      />

      {/* Top Controls Bar */}
      <div className="relative z-10 flex flex-col gap-4 border-b border-current/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
            <Sparkles size={12} /> Idea 1 · Live Refraction Simulator
          </div>
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">
            Watch Chaos Refract Into Pure Signal
          </h2>
        </div>

        {/* Sample Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_CASES.map((item) => {
            const active = item.id === activeCase.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : darkMode
                      ? 'border-white/15 bg-white/5 text-slate-300 hover:border-blue-400/50'
                      : 'border-[#d6ccb9] bg-white text-[#243040] hover:border-blue-500/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Refraction Slider Control */}
      <div className="relative z-10 mt-6 flex flex-col gap-3 rounded-2xl border border-current/10 bg-current/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIntensity(intensity < 90 ? 100 : 15)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-blue-500 transition-colors"
          >
            <Zap size={14} />
            {intensity < 90 ? 'Ignite Refraction' : 'Reset to Raw Noise'}
          </button>
          <span className={`text-xs font-semibold ${subTextClass}`}>
            Drag slider to control refraction clarity
          </span>
        </div>

        <div className="flex flex-1 items-center gap-4 sm:max-w-sm">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
            Noise
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            aria-label="Refraction Clarity Intensity"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-slate-500 via-blue-500 to-emerald-400 accent-cyan-400"
          />
          <span className="min-w-[3.5rem] text-right text-xs font-black tabular-nums text-emerald-400">
            {intensity}%
          </span>
        </div>
      </div>

      {/* 3-Column Interactive Prism Chamber */}
      <div className="relative z-10 mt-6 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        {/* Left: Raw Chaos Wall */}
        <div className={`lg:col-span-4 rounded-2xl border p-5 transition-all duration-300 ${cardBg}`}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
              Raw Input · {activeCase.wordCount} Words
            </span>
            <span className={`text-[10px] font-bold ${subTextClass}`}>
              {activeCase.tag}
            </span>
          </div>
          <p
            className="text-xs leading-relaxed transition-all duration-300 sm:text-sm"
            style={{
              opacity: 1 - progress * 0.58,
              filter: reducedMotion ? 'none' : `blur(${(progress * 1.4).toFixed(2)}px)`,
            }}
          >
            {activeCase.rawNoise}
          </p>
        </div>

        {/* Center: Faceted Liquid Glass Prism */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            {/* Incoming White Beam */}
            <div
              aria-hidden="true"
              className="hidden lg:block h-1.5 w-16 rounded-full bg-gradient-to-r from-slate-400/30 to-white/90 transition-opacity duration-300"
              style={{ opacity: 0.25 + progress * 0.75 }}
            />

            {/* Central Faceted Prism */}
            <motion.div
              animate={
                reducedMotion
                  ? undefined
                  : {
                      rotate: [0, 2, -2, 0],
                      scale: 0.96 + progress * 0.08,
                    }
              }
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-white/25 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/25 shadow-[0_0_50px_rgba(56,189,248,0.28)] backdrop-blur-xl"
            >
              <svg
                viewBox="0 0 100 100"
                className="h-16 w-16 drop-shadow-[0_0_16px_rgba(56,189,248,0.65)]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="prismFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <polygon
                  points="50,12 88,82 12,82"
                  fill="url(#prismFacet)"
                  fillOpacity="0.28"
                  stroke="url(#prismFacet)"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <line x1="50" y1="12" x2="50" y2="82" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" />
              </svg>
            </motion.div>

            {/* Outgoing Spectral Beam */}
            <div
              aria-hidden="true"
              className="hidden lg:block h-2 w-16 rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 transition-opacity duration-300"
              style={{ opacity: 0.15 + progress * 0.85 }}
            />
          </div>

          {/* Live Bandwidth Reclaimed Counter */}
          <div className="mt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
              Bandwidth Reclaimed
            </p>
            <p className="text-2xl font-black tabular-nums text-emerald-400">
              {reclaimed}%
            </p>
          </div>
        </div>

        {/* Right: 3 Refracted Clarity Cards */}
        <div className="lg:col-span-5 space-y-3">
          {/* Card 1: TLDR Signal */}
          <motion.div
            animate={{
              opacity: 0.35 + progress * 0.65,
              y: reducedMotion ? 0 : (1 - progress) * 8,
            }}
            className={`rounded-2xl border p-4 transition-colors ${cardBg}`}
          >
            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
              <Zap size={13} /> 1 · TLDR Signal
            </div>
            <p className="text-xs font-semibold leading-relaxed sm:text-sm">
              {activeCase.tldrSignal}
            </p>
          </motion.div>

          {/* Card 2: Vivid Metaphor */}
          <motion.div
            animate={{
              opacity: 0.25 + progress * 0.75,
              y: reducedMotion ? 0 : (1 - progress) * 12,
            }}
            className={`rounded-2xl border p-4 transition-colors ${cardBg}`}
          >
            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-400">
              <Eye size={13} /> 2 · Vivid Metaphor
            </div>
            <p className="text-xs font-semibold leading-relaxed sm:text-sm">
              {activeCase.vividMetaphor}
            </p>
          </motion.div>

          {/* Card 3: Immediate Next Step */}
          <motion.div
            animate={{
              opacity: 0.2 + progress * 0.8,
              y: reducedMotion ? 0 : (1 - progress) * 16,
            }}
            className={`rounded-2xl border p-4 transition-colors ${cardBg}`}
          >
            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
              <CheckCircle2 size={13} /> 3 · Immediate Next Step
            </div>
            <p className="flex items-start gap-2 text-xs font-semibold leading-relaxed sm:text-sm">
              <ArrowRight size={15} className="mt-0.5 shrink-0 text-emerald-400" />
              <span>{activeCase.nextStep}</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
