'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Code2,
  Cpu,
  Gamepad2,
  Headphones,
  Layers,
  Lock,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Swords,
  Trophy,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { PrismPromoShowcase } from '@/components/prism/PrismPromoShowcase';

const FUTURE_EXPANSIONS = [
  {
    name: 'Prism Forge',
    parentApp: 'Prism Focus',
    badge: 'Prototype in Forge',
    accent: 'cyan',
    icon: Code2,
    description: 'Translates cryptic terminal stack traces, Python/JS errors, and dense docs into visual LEGO-brick logic.',
  },
  {
    name: 'Prism Echo',
    parentApp: 'Prism Play',
    badge: 'R&D',
    accent: 'amber',
    icon: Video,
    description: 'Turns a 45-minute YouTube or Zoom recorded lecture into 5 bite-sized interactive play cards with timestamps.',
  },
  {
    name: 'Prism Guild',
    parentApp: 'The Prism Engine',
    badge: 'R&D',
    accent: 'purple',
    icon: Users,
    description: 'Silent virtual body-doubling rooms with shared focus timers and group dopamine streaks without camera exhaustion.',
  },
];

const FOCUS_REFRACTION_STAGES = [
  {
    tag: '1 · TL;DR Signal',
    color: 'from-sky-400 to-blue-500',
    text: 'Strip out 80% of textbook padding into 1 executive takeaway in 2 seconds.',
  },
  {
    tag: '2 · Vivid Metaphor',
    color: 'from-blue-400 to-indigo-500',
    text: 'Anchor abstract formulas to real-world visual analogies your brain never forgets.',
  },
  {
    tag: '3 · Prism Lens & Action',
    color: 'from-indigo-400 to-violet-500',
    text: 'Tap any hard word or diagram for instant clarity + one concrete next step.',
  },
];

const MINI_PLAY_QUEST_DECK = [
  {
    cardNo: 'Card 1 of 3 · Tiny Idea',
    xp: '+25 XP',
    title: 'How Prism Play Beats Overwhelm',
    body: 'Instead of a 40-page syllabus wall, The Prism Engine deals you one calm, high-dopamine card at a time.',
    boost: 'Dopamine Boost: You already unlocked Card 1 just by clicking!',
  },
  {
    cardNo: 'Card 2 of 3 · Vivid Metaphor',
    xp: '+50 XP',
    title: 'Boss Fights & Soundscape Studio',
    body: 'Like turning a scary dungeon into co-op checkpoints with brown noise, focus sprints, and instant rewards.',
    boost: 'Streak Combo: 2x Focus Multiplier Activated!',
  },
  {
    cardNo: 'Card 3 of 3 · Boss Cleared!',
    xp: '+100 XP · Quest Complete',
    title: 'Ready for Your Real Coursework?',
    body: 'Paste any Canvas module or class notes into Prism Play and turn dread into your easiest win today.',
    boost: 'Victory Unlocked: Focus Architect Rank Progress +1!',
  },
];

export default function PrismEnginePortalPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [mouse, setMouse] = useState({ x: 50, y: 35 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revealedPrototype, setRevealedPrototype] = useState<string | null>(null);

  // Unique Choreography States for Prism Focus (Refraction Flip) & Prism Play (Playable Quest Deck)
  const [focusFlipped, setFocusFlipped] = useState(false);
  const [focusBeamKey, setFocusBeamKey] = useState(0);
  const [playCardIndex, setPlayCardIndex] = useState(0);
  const [playXpEarned, setPlayXpEarned] = useState(25);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Auto-trigger initial entrance refraction after mount so user sees the prism split right away
  useEffect(() => {
    if (reducedMotion) return;
    const timer = setTimeout(() => {
      setFocusBeamKey((k) => k + 1);
    }, 500);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    setMouse({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    setHasInteracted(true);
  };

  const triggerFocusRefraction = () => {
    setFocusFlipped((f) => !f);
    setFocusBeamKey((k) => k + 1);
  };

  const advancePlayQuestCard = () => {
    setPlayCardIndex((prev) => {
      const next = (prev + 1) % MINI_PLAY_QUEST_DECK.length;
      setPlayXpEarned(next === 0 ? 25 : next === 1 ? 75 : 175);
      return next;
    });
  };

  const pageBg = darkMode
    ? 'bg-[#040712] text-slate-100'
    : 'bg-[#f4f0e7] text-[#172133]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const cardSurface = darkMode
    ? 'bg-[#0b1224]/75 border-white/12 hover:border-blue-400/50 shadow-[0_30px_90px_rgba(0,0,0,0.55)]'
    : 'bg-[#faf7f0]/90 border-[#d6ccb9] hover:border-blue-500/60 shadow-[0_24px_70px_rgba(23,33,51,0.09)]';
  const pillSurface = darkMode
    ? 'bg-white/[0.06] border-white/12 text-slate-200'
    : 'bg-[#ece5d8] border-[#d6ccb9] text-[#243040]';

  const activePlayCard = MINI_PLAY_QUEST_DECK[playCardIndex];

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${pageBg}`}
    >
      {/* Background: Lightweight & Fast on Mobile, Full Living Kinetic Prism Universe on Desktop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="md:hidden absolute inset-0"
          style={{
            background: darkMode
              ? 'radial-gradient(circle at 50% 15%, rgba(56,189,248,0.16), rgba(168,85,247,0.08) 42%, transparent 72%)'
              : 'radial-gradient(circle at 50% 15%, rgba(37,99,235,0.10), rgba(16,185,129,0.06) 45%, transparent 72%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <div className="hidden md:block absolute inset-0">
          <motion.div
            animate={
              reducedMotion
                ? undefined
                : {
                    x: [0, 60, -50, 40, 0],
                    y: [0, -40, 50, -30, 0],
                    scale: [1, 1.18, 0.94, 1.12, 1],
                  }
            }
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'radial-gradient(760px circle at 50% 36%, rgba(56,189,248,0.26), rgba(168,85,247,0.18) 36%, rgba(16,185,129,0.12) 58%, transparent 74%)'
                : 'radial-gradient(700px circle at 50% 36%, rgba(37,99,235,0.18), rgba(168,85,247,0.12) 36%, rgba(16,185,129,0.09) 58%, transparent 74%)',
            }}
          />

          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: darkMode
                ? `radial-gradient(560px circle at ${mouse.x}% ${mouse.y}%, rgba(56,189,248,0.36), rgba(168,85,247,0.22) 32%, rgba(16,185,129,0.10) 55%, transparent 72%)`
                : `radial-gradient(540px circle at ${mouse.x}% ${mouse.y}%, rgba(37,99,235,0.24), rgba(168,85,247,0.15) 34%, rgba(16,185,129,0.08) 55%, transparent 72%)`,
              opacity: hasInteracted ? 1 : 0.65,
            }}
          />

          {!reducedMotion && (
            <>
              <motion.div
                animate={{ x: ['-100vw', '100vw'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                className="absolute -top-1/4 h-[150%] w-96 rotate-[24deg] blur-3xl opacity-90 pointer-events-none"
                style={{
                  background: darkMode
                    ? 'linear-gradient(90deg, transparent, rgba(56,189,248,0.35), rgba(168,85,247,0.40), rgba(16,185,129,0.28), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(37,99,235,0.24), rgba(168,85,247,0.26), rgba(16,185,129,0.20), transparent)',
                }}
              />
              <motion.div
                animate={{ x: ['100vw', '-100vw'] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3, repeatDelay: 1.5 }}
                className="absolute -top-1/4 h-[150%] w-80 -rotate-[20deg] blur-3xl opacity-80 pointer-events-none"
                style={{
                  background: darkMode
                    ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.24), rgba(236,72,153,0.30), rgba(59,130,246,0.25), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(245,158,11,0.16), rgba(236,72,153,0.20), rgba(59,130,246,0.18), transparent)',
                }}
              />

              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
                className={`absolute top-20 right-12 h-56 w-56 rounded-[3.25rem] border ${
                  darkMode ? 'border-cyan-400/35 bg-cyan-400/[0.05] shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'border-blue-500/30 bg-blue-500/[0.05]'
                }`}
              />
              <motion.div
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                className={`absolute bottom-20 left-12 h-48 w-48 rounded-full border ${
                  darkMode ? 'border-purple-400/35 bg-purple-400/[0.05] shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-emerald-500/30 bg-emerald-500/[0.05]'
                }`}
              />
            </>
          )}
        </div>
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-slate-950 shadow-lg shadow-blue-500/30">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-sm font-black tracking-tight">Dassah&apos;s Prism Engine</p>
            <p className={`text-[11px] font-semibold ${muted}`}>Powered by The Prism Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold ${pillSurface}`}>
            <Lock size={12} className="text-emerald-500" /> 100% Browser-Private Notes
          </span>
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? 'Switch to Soft Paper Light Mode' : 'Switch to Dark Mode'}
            className={`rounded-2xl border p-2.5 transition-colors ${pillSurface}`}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Hero & Dual Choreographed Portal Stage */}
      <main className="relative z-10 mx-auto max-w-6xl px-5 pt-4 pb-20 sm:px-8 sm:pt-8 space-y-10">
        {/* Refractive Hero Centerpiece (Style 2 + Style 3 Fusion) */}
        <section className="mx-auto max-w-4xl text-center space-y-5">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/35 bg-blue-500/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.25)]"
          >
            <Zap size={13} className="text-amber-400" /> Built for How Your Brain Actually Works
          </motion.div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="prism-brand text-4xl sm:text-6xl md:text-7xl lg:text-[5.6rem] font-black italic tracking-tight leading-[1.08]"
          >
            <span className="inline-block whitespace-nowrap">
              <span className={darkMode ? 'text-white/95 drop-shadow-[0_0_18px_rgba(255,255,255,0.2)]' : 'text-slate-900'}>
                Dassah&apos;s{' '}
              </span>
              <span
                className={`pr-2 bg-clip-text text-transparent ${
                  darkMode
                    ? 'bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 drop-shadow-[0_0_32px_rgba(59,130,246,0.55)]'
                    : 'bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600'
                }`}
              >
                Prism
              </span>
            </span>{' '}
            <span className="inline-block prism-text">
              Engine
            </span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className={`mx-auto max-w-2xl text-base sm:text-xl leading-relaxed font-medium ${muted}`}
          >
            <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Refract the Noise. Unlock Your Mind.</strong>{' '}
            Powered by <strong className={darkMode ? 'text-cyan-300' : 'text-blue-700'}>The Prism Engine</strong> —
            deep document refraction in{' '}
            <strong className={darkMode ? 'text-sky-300' : 'text-blue-700'}>Prism Focus</strong> and
            dopamine-driven study quests in{' '}
            <strong className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>Prism Play</strong>.
          </motion.p>
        </section>

        {/* 15% Soft Background Instrumental Studio Bar */}
        <PrismPromoShowcase darkMode={darkMode} />

        {/* Dual Unique Choreographed Portal Cards */}
        <section aria-label="Prism Engine workspaces" className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-9">
          {/* PORTAL 1: PRISM FOCUS — 3D Flip Entrance + Live Spectral Refraction Reveal */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, rotateY: -22, y: 24 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            whileHover={reducedMotion ? undefined : { y: -8, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            style={{ transformPerspective: 1200 }}
            className={`group relative overflow-hidden rounded-[2.5rem] border p-8 sm:p-10 backdrop-blur-3xl transition-all duration-300 flex flex-col justify-between gap-7 ${
              darkMode
                ? 'bg-gradient-to-br from-[#0e1936]/90 via-[#0a1228]/85 to-[#070d1f]/90 border-blue-400/25 hover:border-blue-400/60 shadow-[0_30px_90px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_36px_110px_rgba(37,99,235,0.28),inset_0_1px_0_rgba(147,197,253,0.3)]'
                : 'bg-gradient-to-br from-white/95 via-[#f6f9ff]/95 to-[#edf3ff]/90 border-blue-300/60 hover:border-blue-500/70 shadow-[0_24px_70px_rgba(37,99,235,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {/* Animated Spectral Laser Sweep Across Prism Focus */}
            {!reducedMotion && (
              <motion.div
                key={`beam-${focusBeamKey}`}
                initial={{ x: '-120%', opacity: 0.95 }}
                animate={{ x: '220%', opacity: 0 }}
                transition={{ duration: 1.35, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent z-20"
              />
            )}

            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
            <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 opacity-70" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-500/20 text-blue-400 border border-blue-400/35 shadow-[0_0_24px_rgba(59,130,246,0.25)]">
                  <Brain size={25} />
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerFocusRefraction}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      darkMode
                        ? 'bg-sky-500/20 border-sky-400/40 text-sky-200 hover:bg-sky-500/30'
                        : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    <Sparkles size={11} />
                    <span>{focusFlipped ? 'Show Overview' : 'Refract Capability Spectrum'}</span>
                  </button>
                </div>
              </div>

              {/* Title + Staggered Prism Word-by-Word Refraction */}
              <div className="space-y-2.5">
                <div>
                  <h2 className="prism-brand text-4xl sm:text-5xl font-black tracking-tight italic leading-[1.1]">
                    Prism{' '}
                    <span
                      className={`inline-block pr-2 bg-clip-text text-transparent ${
                        darkMode
                          ? 'bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.45)]'
                          : 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600'
                      }`}
                    >
                      Focus
                    </span>
                  </h2>
                  <div className="mt-2 h-[3px] w-28 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500" />
                </div>

                {/* Slowly refracting capability words emerging like light splitting through a crystal */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1" key={`words-${focusBeamKey}`}>
                  {['Dense PDFs', '→', 'Executive TL;DR', '→', 'Vivid Metaphor', '→', 'Prism Lens', '→', 'Ask DJ'].map(
                    (word, idx) => (
                      <motion.span
                        key={`${word}-${idx}`}
                        initial={reducedMotion ? false : { opacity: 0, y: 6, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        className={
                          word === '→'
                            ? 'text-xs font-black text-sky-400/70 px-0.5'
                            : `rounded-lg border px-2 py-0.5 text-[11px] font-black ${
                                darkMode
                                  ? 'border-sky-400/25 bg-sky-500/10 text-sky-200'
                                  : 'border-blue-200 bg-blue-50 text-blue-800'
                              }`
                        }
                      >
                        {word}
                      </motion.span>
                    ),
                  )}
                </div>
              </div>

              {/* Flip Stage: Overview vs Live 3-Beam Prism Spectrum Breakdown */}
              <AnimatePresence mode="wait">
                {!focusFlipped ? (
                  <motion.div
                    key="focus-overview"
                    initial={reducedMotion ? false : { opacity: 0, rotateX: -12 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: 12 }}
                    transition={{ duration: 0.28 }}
                    className="space-y-4"
                  >
                    <p className={`text-sm sm:text-base font-bold italic ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>
                      &ldquo;Turn overwhelming noise into clear focus in seconds.&rdquo;
                    </p>
                    <p className={`text-sm leading-relaxed ${muted}`}>
                      Paste articles, upload PDFs or lecture slides, and watch <strong className={darkMode ? 'text-white' : 'text-slate-900'}>The Prism Engine</strong> refract walls of text into executive summaries, metaphors, visual diagrams, and Ask DJ insights.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { icon: BookOpen, label: 'PDF & Doc Upload' },
                        { icon: Layers, label: 'Deep Refractions' },
                        { icon: Sparkles, label: 'Prism Lens & Ask DJ' },
                      ].map((tag) => (
                        <span
                          key={tag.label}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                            darkMode
                              ? 'bg-blue-500/[0.08] border-blue-400/20 text-slate-200 group-hover:border-blue-400/35'
                              : 'bg-white/80 border-blue-200/80 text-slate-700'
                          }`}
                        >
                          <tag.icon size={13} className="text-blue-400" /> {tag.label}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="focus-spectrum"
                    initial={reducedMotion ? false : { opacity: 0, rotateX: 14 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: -14 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2.5"
                  >
                    {FOCUS_REFRACTION_STAGES.map((beam, i) => (
                      <motion.div
                        key={beam.tag}
                        initial={reducedMotion ? false : { opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`rounded-2xl border p-3.5 ${
                          darkMode
                            ? 'border-blue-400/25 bg-blue-950/40'
                            : 'border-blue-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${beam.color}`} />
                          <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>
                            {beam.tag}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 font-medium ${muted}`}>{beam.text}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(37,99,235,0.38),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all hover:from-blue-500 hover:via-sky-500 hover:to-indigo-500 active:scale-[0.98]"
            >
              <span>Launch Prism Focus</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>

          {/* PORTAL 2: PRISM PLAY — Enters in True "Play Mode" with Interactive Mini Quest Deck & XP Bar! */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, rotateY: 22, y: 24 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            whileHover={reducedMotion ? undefined : { y: -8, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.08 }}
            style={{ transformPerspective: 1200 }}
            className={`group relative overflow-hidden rounded-[2.5rem] border p-8 sm:p-10 backdrop-blur-3xl transition-all duration-300 flex flex-col justify-between gap-7 ${
              darkMode
                ? 'bg-gradient-to-br from-[#082221]/90 via-[#07181d]/85 to-[#061119]/90 border-emerald-400/25 hover:border-emerald-400/60 shadow-[0_30px_90px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_36px_110px_rgba(16,185,129,0.26),inset_0_1px_0_rgba(110,231,183,0.3)]'
                : 'bg-gradient-to-br from-white/95 via-[#f2fcf8]/95 to-[#e8f8f2]/90 border-emerald-300/60 hover:border-emerald-500/70 shadow-[0_24px_70px_rgba(16,185,129,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
            <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 opacity-70" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/20 text-emerald-400 border border-emerald-400/35 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                  <Gamepad2 size={25} />
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                      darkMode
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                        : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    }`}
                  >
                    <Trophy size={12} className="text-amber-400" />
                    <span>Live Play Mode · {playXpEarned} XP</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="prism-brand text-4xl sm:text-5xl font-black tracking-tight italic leading-[1.1]">
                    Prism{' '}
                    <span
                      className={`inline-block pr-2 bg-clip-text text-transparent ${
                        darkMode
                          ? 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.45)]'
                          : 'bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600'
                      }`}
                    >
                      Play
                    </span>
                  </h2>
                  <span className={`text-xs font-black italic ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    &ldquo;Turning Dread into Play.&rdquo;
                  </span>
                </div>

                {/* Live Mini XP Progress Bar inside the Prism Play tile */}
                <div className="w-full h-1.5 rounded-full bg-emerald-950/60 overflow-hidden border border-emerald-400/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300"
                    initial={{ width: '33%' }}
                    animate={{ width: `${((playCardIndex + 1) / MINI_PLAY_QUEST_DECK.length) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  />
                </div>
              </div>

              {/* Interactive Playable Study Card Deck right inside the tile */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlayCard.cardNo}
                  initial={reducedMotion ? false : { opacity: 0, rotateY: 25, scale: 0.96 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -25, scale: 0.96 }}
                  transition={{ duration: 0.28 }}
                  className={`rounded-2xl border p-4 space-y-2.5 ${
                    darkMode
                      ? 'border-emerald-400/30 bg-[#051517]/80 shadow-inner'
                      : 'border-emerald-300 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>
                      {activePlayCard.cardNo}
                    </span>
                    <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-amber-300">
                      {activePlayCard.xp}
                    </span>
                  </div>
                  <p className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {activePlayCard.title}
                  </p>
                  <p className={`text-xs leading-relaxed ${muted}`}>
                    {activePlayCard.body}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[11px] font-bold ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                      ✨ {activePlayCard.boost}
                    </span>
                    <button
                      type="button"
                      onClick={advancePlayQuestCard}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 px-3 py-1.5 text-[11px] font-black text-emerald-200 transition-all cursor-pointer active:scale-95"
                    >
                      {playCardIndex < MINI_PLAY_QUEST_DECK.length - 1 ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Claim Win &amp; Flip Card</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw size={12} />
                          <span>Replay Mini Quest</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Headphones, label: 'Soundscape Studio' },
                  { icon: Swords, label: 'Boss Fights & XP' },
                  { icon: Zap, label: 'ADHD Superpowers' },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                      darkMode
                        ? 'bg-emerald-500/[0.08] border-emerald-400/20 text-slate-200 group-hover:border-emerald-400/35'
                        : 'bg-white/80 border-emerald-200/80 text-slate-700'
                    }`}
                  >
                    <tag.icon size={13} className="text-emerald-400" /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/canvas"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 active:scale-[0.98]"
            >
              <span>Launch Prism Play</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>
        </section>

        {/* In Orbit · The Prism Roadmap (Classified Prototype Constellation) */}
        <section aria-label="In Orbit · The Prism Roadmap" className="space-y-5 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">
                  In Orbit · The Prism Roadmap
                </h3>
              </div>
              <p className={`text-xs ${muted} mt-1`}>
                Classified prototypes in our lab — hover (or tap) any tile to decrypt the upcoming expansion.
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[10px] font-black uppercase tracking-wider ${pillSurface}`}>
              <Sparkles size={11} className="text-cyan-400" /> Roadmap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FUTURE_EXPANSIONS.map((item) => {
              const isRevealed = revealedPrototype === item.name;
              const edgeGlow =
                item.accent === 'cyan'
                  ? 'via-cyan-400/75'
                  : item.accent === 'amber'
                  ? 'via-amber-400/75'
                  : 'via-purple-400/75';
              const hoverBorder =
                item.accent === 'cyan'
                  ? 'hover:border-cyan-400/50'
                  : item.accent === 'amber'
                  ? 'hover:border-amber-400/50'
                  : 'hover:border-purple-400/50';
              const neonText =
                item.accent === 'cyan'
                  ? darkMode
                    ? 'text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.65)]'
                    : 'text-cyan-700'
                  : item.accent === 'amber'
                  ? darkMode
                    ? 'text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.65)]'
                    : 'text-amber-700'
                  : darkMode
                  ? 'text-purple-300 drop-shadow-[0_0_14px_rgba(192,132,252,0.65)]'
                  : 'text-purple-700';

              const hoverNeonClass =
                item.accent === 'cyan'
                  ? darkMode
                    ? 'group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.65)]'
                    : 'group-hover:text-cyan-700'
                  : item.accent === 'amber'
                  ? darkMode
                    ? 'group-hover:text-amber-300 group-hover:drop-shadow-[0_0_14px_rgba(251,191,36,0.65)]'
                    : 'group-hover:text-amber-700'
                  : darkMode
                  ? 'group-hover:text-purple-300 group-hover:drop-shadow-[0_0_14px_rgba(192,132,252,0.65)]'
                  : 'group-hover:text-purple-700';

              return (
                <motion.button
                  key={item.name}
                  type="button"
                  onClick={() => setRevealedPrototype((prev) => (prev === item.name ? null : item.name))}
                  whileHover={reducedMotion ? undefined : { y: -5, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className={`group relative text-left overflow-hidden rounded-[2rem] border p-6 backdrop-blur-3xl transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer ${hoverBorder} ${
                    darkMode
                      ? 'bg-[#050914]/85 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.10)]'
                      : 'bg-white/85 border-slate-200/90 shadow-[0_14px_40px_rgba(0,0,0,0.05)]'
                  }`}
                >
                  <div className={`pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent ${edgeGlow} to-transparent opacity-60 group-hover:opacity-100 transition-opacity`} />

                  <div
                    className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl transition-opacity duration-500 ${
                      isRevealed ? 'opacity-100' : 'opacity-25 group-hover:opacity-100'
                    } ${
                      item.accent === 'cyan'
                        ? 'bg-cyan-500/25'
                        : item.accent === 'amber'
                        ? 'bg-amber-500/25'
                        : 'bg-purple-500/25'
                    }`}
                  />

                  <div className="space-y-4 relative z-10 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${
                          item.accent === 'cyan'
                            ? 'bg-cyan-500/15 border-cyan-400/35 text-cyan-400'
                            : item.accent === 'amber'
                            ? 'bg-amber-500/15 border-amber-400/35 text-amber-400'
                            : 'bg-purple-500/15 border-purple-400/35 text-purple-400'
                        }`}
                      >
                        <item.icon size={19} />
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-300">
                        <Lock size={9} /> {item.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="prism-brand text-2xl font-black italic tracking-tight flex flex-wrap items-baseline gap-2">
                        <span
                          className={`transition-all duration-500 ${
                            isRevealed
                              ? `blur-0 opacity-100 ${neonText}`
                              : `blur-[5px] opacity-75 group-hover:blur-0 group-hover:opacity-100 ${hoverNeonClass}`
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider not-italic ${muted}`}>
                          · {item.parentApp}
                        </span>
                      </h4>

                      <p
                        className={`text-xs mt-2 leading-relaxed transition-all duration-500 ${muted} ${
                          isRevealed
                            ? 'blur-0 opacity-100'
                            : 'blur-[4px] opacity-35 group-hover:blur-0 group-hover:opacity-100'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 w-full pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-bold">
                    <span className="uppercase tracking-[0.18em] text-slate-400">
                      {isRevealed ? 'Decrypted' : 'Classified Prototype'}
                    </span>
                    <span className="text-cyan-400/80 group-hover:text-cyan-300 transition-colors">
                      {isRevealed ? 'Tap to veil' : 'Hover / Tap to reveal'}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Live Engine Reliability Strip */}
        <section
          aria-label="Prism Engine 4-tier resilience"
          className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4 ${cardSurface}`}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 shrink-0">
              <Cpu size={20} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                The Prism Engine · Self-Healing Capability Cascade
              </p>
              <p className={`text-xs sm:text-sm ${muted}`}>
                <strong>Tier 1:</strong> Groq <code>openai/gpt-oss-20b</code> → <strong>Tier 2:</strong> Groq <code>openai/gpt-oss-120b</code> → <strong>Tier 3:</strong> Gemini 2.0 Flash → <strong>Pool:</strong> Verified OpenRouter Free Models → <strong>Tier 4:</strong> Honest <strong>Local Structural Refraction</strong>.
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold ${pillSurface}`}>
            <ShieldCheck size={14} className="text-emerald-500" /> Zero Secret Leaks · Free Forever
          </span>
        </section>
      </main>
    </div>
  );
}
