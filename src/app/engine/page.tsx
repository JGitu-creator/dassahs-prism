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
  Gamepad2,
  Headphones,
  Layers,
  Lock,
  Moon,
  Music,
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

const FUTURE_EXPANSIONS = [
  {
    name: 'Prism Forge',
    parentApp: 'Prism Focus',
    badge: 'Live on /forge',
    href: '/forge',
    accent: 'cyan',
    icon: Code2,
    description: 'Translates cryptic terminal stack traces and dense code documentation into visual LEGO brick logic.',
  },
  {
    name: 'Prism Echo',
    parentApp: 'Prism Play',
    badge: 'R&D',
    accent: 'amber',
    icon: Video,
    description: 'Turns a 45 minute recorded lecture into 5 bite sized interactive play cards with timestamps.',
  },
  {
    name: 'Prism Guild',
    parentApp: 'The Prism Engine',
    badge: 'R&D',
    accent: 'purple',
    icon: Users,
    description: 'Silent virtual body doubling rooms with shared focus timers and group dopamine streaks without camera exhaustion.',
  },
];

const FOCUS_REFRACTION_STAGES = [
  {
    tag: '1 · TLDR Signal',
    color: 'from-sky-400 to-blue-500',
    text: 'Strip out 80% of textbook padding into 1 executive takeaway in 2 seconds.',
  },
  {
    tag: '2 · Vivid Metaphor',
    color: 'from-blue-400 to-indigo-500',
    text: 'Anchor abstract formulas to real world visual analogies your brain never forgets.',
  },
  {
    tag: '3 · Prism Lens & Action',
    color: 'from-indigo-400 to-violet-500',
    text: 'Tap any hard word or diagram for instant clarity plus one concrete next step.',
  },
];

const MINI_PLAY_QUEST_DECK = [
  {
    cardNo: 'Card 1 of 3 · Tiny Idea',
    xp: '+25 XP',
    title: 'How Prism Play Beats Overwhelm',
    body: 'Instead of a 40 page syllabus wall, The Prism Engine deals you one calm high dopamine card at a time.',
    boost: 'Dopamine Boost Unlocked on Card 1',
  },
  {
    cardNo: 'Card 2 of 3 · Vivid Metaphor',
    xp: '+50 XP',
    title: 'Boss Fights & Soundscape Studio',
    body: 'Like turning a tough chapter into co op checkpoints with brown noise, focus sprints, and instant rewards.',
    boost: '2x Focus Multiplier Activated',
  },
  {
    cardNo: 'Card 3 of 3 · Boss Cleared',
    xp: '+100 XP · Quest Complete',
    title: 'Ready for Your Real Coursework?',
    body: 'Paste any Canvas module or class notes into Prism Play and turn dread into your easiest win today.',
    boost: 'Focus Architect Rank Progress +1',
  },
];

const MINI_WORD_LENS_STAGES = [
  {
    stage: 'Stage 1 of 3 · Read',
    badge: '7 Translations',
    title: 'Side by Side Scripture',
    body: 'Compare ESV, NIV, NLT, Amplified, NASB, The Message, and KJV together in calm, readable typography.',
    highlight: 'Psalm 23:1 · The Lord is my shepherd',
  },
  {
    stage: 'Stage 2 of 3 · Study',
    badge: 'Hebrew & Greek',
    title: 'Deep Exegesis & Ask DJ',
    body: 'Uncover original language roots, historical context, and tap any word for instant cross reference clarity.',
    highlight: 'Ra’ah · Present, watchful shepherd',
  },
  {
    stage: 'Stage 3 of 3 · Live',
    badge: 'Worship & Puzzles',
    title: 'Worship Studio & Obedience',
    body: 'Turn each passage into original worship tracks, strategy Scripture puzzles, and weekly Sunday check ins.',
    highlight: 'From study notes to lived faith',
  },
];

const MINI_FORGE_LEGO_STAGES = [
  {
    stage: 'Brick 1 of 3 · Fault Trace',
    badge: 'Stack Trace → LEGOs',
    title: 'Isolate the Crashing Frame',
    body: 'Paste any red terminal stack trace or TypeError to snap the failure chain into colour-coded root-cause bricks.',
    highlight: 'TypeError · Guard Clause Brick Identified',
  },
  {
    stage: 'Brick 2 of 3 · Visual Logic',
    badge: 'Code → Data Flow',
    title: 'Snap-Together Code Architecture',
    body: 'Deconstruct dense async functions, loops, and docs into physical LEGO analogies with 1-click defensive fixes.',
    highlight: '4 Snap-Together Bricks + Real-World Analogy',
  },
  {
    stage: 'Brick 3 of 3 · Sandbox CLI',
    badge: 'Terminal & Ask DJ',
    title: 'CLI Safety Shield & Pair Quest',
    body: 'Inspect every shell flag for destructive risk, clear guided debugging quests for XP, and pair-program with Ask DJ.',
    highlight: 'Token Safety Shield + Local Blueprint Vault',
  },
];

const INFINITY_PATH_D =
  'M24 10C15 10 9 15.2 9 22C9 28.8 15 34 24 34C33 34 39 22 44 22C49 22 55 10 64 10C73 10 79 15.2 79 22C79 28.8 73 34 64 34C55 34 49 22 44 22C39 22 33 10 24 10Z';

export default function PrismEnginePortalPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [mouse, setMouse] = useState({ x: 50, y: 35 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activePrototype, setActivePrototype] = useState<string | null>(null);

  // Unique Choreography States for Prism Focus (Refraction Flip), Prism Play (Playable Quest Deck), Prism Word (Sanctuary Lens) & Prism Forge (LEGO Workbench)
  const [focusFlipped, setFocusFlipped] = useState(false);
  const [focusBeamKey, setFocusBeamKey] = useState(0);
  const [playCardIndex, setPlayCardIndex] = useState(0);
  const [playXpEarned, setPlayXpEarned] = useState(25);
  const [wordStageIndex, setWordStageIndex] = useState(0);
  const [wordLightKey, setWordLightKey] = useState(0);
  const [forgeStageIndex, setForgeStageIndex] = useState(0);
  const [forgePulseKey, setForgePulseKey] = useState(0);

  // Under-the-Hood Engine Ignition State (waits until scrolled into view, and re-runs on hover/click)
  const [engineIgnited, setEngineIgnited] = useState(false);
  const [engineCycleKey, setEngineCycleKey] = useState(0);

  const igniteEngineSequence = () => {
    setEngineIgnited(true);
    setEngineCycleKey((k) => k + 1);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) setEngineIgnited(true);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

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

  const advanceWordStage = () => {
    setWordStageIndex((prev) => (prev + 1) % MINI_WORD_LENS_STAGES.length);
    setWordLightKey((k) => k + 1);
  };

  const advanceForgeStage = () => {
    setForgeStageIndex((prev) => (prev + 1) % MINI_FORGE_LEGO_STAGES.length);
    setForgePulseKey((k) => k + 1);
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
  const activeWordStage = MINI_WORD_LENS_STAGES[wordStageIndex];
  const activeForgeStage = MINI_FORGE_LEGO_STAGES[forgeStageIndex];

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
            </>
          )}
        </div>
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/40 bg-[#070d1f] shadow-[0_0_24px_rgba(34,211,238,0.25)]">
            <svg width="26" height="26" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="dpe-monogram-grad" x1="16" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="55%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path
                d="M18 14H33C43.5 14 50 21.2 50 32C50 42.8 43.5 50 33 50H18V14Z"
                fill="rgba(56,189,248,0.18)"
                stroke="url(#dpe-monogram-grad)"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M26 22H32.5C38.6 22 42 26 42 32C42 38 38.6 42 32.5 42H26V22Z"
                fill="#070D1F"
                stroke="#38BDF8"
                strokeOpacity="0.75"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-black tracking-tight">Dassah&apos;s Prism Engine</p>
            <p className={`text-[11px] font-semibold ${muted}`}>Powered by The Prism Engine ∞</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold ${pillSurface}`}>
            <Lock size={12} className="text-emerald-500" /> 100% Browser Private Notes
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
      <main className="relative z-10 mx-auto max-w-6xl px-5 pt-4 pb-20 sm:px-8 sm:pt-8 space-y-12">
        {/* Stacked Two-Line Hero Centerpiece: Line 1 "Dassah's" (Signature Serif) + Line 2 "Prism Engine" */}
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
            className="flex flex-col items-center justify-center leading-none"
          >
            {/* Line 1: Dassah's in Signature High-Craft Editorial Italic Serif */}
            <span
              style={{ fontFamily: 'var(--font-serif-signature), Georgia, serif' }}
              className={`block text-5xl sm:text-7xl md:text-8xl font-bold italic tracking-wide pb-1 sm:pb-2 ${
                darkMode
                  ? 'bg-gradient-to-r from-amber-200 via-white to-sky-200 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(251,191,36,0.32)]'
                  : 'bg-gradient-to-r from-[#92400E] via-[#172133] to-blue-800 bg-clip-text text-transparent'
              }`}
            >
              Dassah&apos;s
            </span>

            {/* Line 2: Prism Engine */}
            <span className="prism-brand block text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black italic tracking-tight leading-[1.06]">
              <span
                className={`pr-2 bg-clip-text text-transparent ${
                  darkMode
                    ? 'bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 drop-shadow-[0_0_32px_rgba(59,130,246,0.55)]'
                    : 'bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600'
                }`}
              >
                Prism
              </span>{' '}
              <span className="prism-text">Engine</span>
            </span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className={`mx-auto max-w-2xl text-base sm:text-xl leading-relaxed font-medium ${muted}`}
          >
            <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Refract the Noise. Unlock Your Mind.</strong>{' '}
            Powered by <strong className={darkMode ? 'text-cyan-300' : 'text-blue-700'}>The Prism Engine</strong> for
            clear document focus in{' '}
            <strong className={darkMode ? 'text-sky-300' : 'text-blue-700'}>Prism Focus</strong>,{' '}
            coursework quests in{' '}
            <strong className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>Prism Play</strong>,{' '}
            Scripture study in{' '}
            <strong className={darkMode ? 'text-purple-300' : 'text-purple-700'}>Prism Word</strong>, and{' '}
            LEGO code logic in{' '}
            <strong className={darkMode ? 'text-cyan-300' : 'text-cyan-700'}>Prism Forge</strong>.
          </motion.p>
        </section>

        {/* Quad Workspace Portal Stage */}
        <section aria-label="Prism Engine workspaces" className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
          {/* PORTAL 1: PRISM FOCUS — 3D Flip Entrance + Crisp Staggered Prism Word Reveal */}
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

              {/* Title + Staggered Prism Word-by-Word Refraction (100% Crystal Clear, Zero Blur) */}
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

                <div className="flex flex-wrap items-center gap-1.5 pt-1" key={`words-${focusBeamKey}`}>
                  {['Dense PDFs', '→', 'Executive TLDR', '→', 'Vivid Metaphor', '→', 'Prism Lens', '→', 'Ask DJ'].map(
                    (word, idx) => (
                      <motion.span
                        key={`${word}-${idx}`}
                        initial={reducedMotion ? false : { opacity: 0, y: 6, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        className={
                          word === '→'
                            ? 'text-xs font-black text-sky-400/80 px-0.5'
                            : `rounded-lg border px-2 py-0.5 text-[11px] font-black ${
                                darkMode
                                  ? 'border-sky-400/30 bg-sky-500/15 text-sky-200'
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
                      Turn overwhelming noise into clear focus in seconds.
                    </p>
                    <p className={`text-sm leading-relaxed ${muted}`}>
                      Paste articles or upload PDFs and lecture slides so <strong className={darkMode ? 'text-white' : 'text-slate-900'}>The Prism Engine</strong> can refract walls of text into executive summaries, metaphors, visual diagrams, and Ask DJ insights.
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

          {/* PORTAL 2: PRISM PLAY — Enters in True Play Mode with Interactive Mini Quest Deck & XP Bar */}
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
                    Turning Dread into Play.
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

          {/* PORTAL 3: PRISM WORD — Minimalist Sanctuary Bible Study, Worship & Strategy */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, rotateY: 22, y: 24 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            whileHover={reducedMotion ? undefined : { y: -8, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.12 }}
            style={{ transformPerspective: 1200 }}
            className={`group relative overflow-hidden rounded-[2.5rem] border p-8 sm:p-10 backdrop-blur-3xl transition-all duration-300 flex flex-col justify-between gap-7 ${
              darkMode
                ? 'bg-gradient-to-br from-[#160e36]/90 via-[#0d0a24]/90 to-[#06060d]/95 border-purple-400/25 hover:border-purple-400/60 shadow-[0_30px_90px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_36px_110px_rgba(147,51,234,0.28),inset_0_1px_0_rgba(192,132,252,0.3)]'
                : 'bg-gradient-to-br from-white/95 via-[#f7f4ff]/95 to-[#f0ebff]/90 border-purple-300/60 hover:border-purple-500/70 shadow-[0_24px_70px_rgba(147,51,234,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {/* Unique Sanctuary Light Sweep Across Prism Word */}
            {!reducedMotion && (
              <motion.div
                key={`word-light-${wordLightKey}`}
                initial={{ y: '110%', opacity: 0.85 }}
                animate={{ y: '-120%', opacity: 0 }}
                transition={{ duration: 1.25, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-x-0 h-1/2 -skew-y-6 bg-gradient-to-t from-transparent via-purple-400/25 to-amber-300/20 z-20"
              />
            )}

            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent" />
            <motion.div
              animate={
                reducedMotion
                  ? undefined
                  : { scale: [1, 1.14, 1], opacity: [0.55, 0.9, 0.55] }
              }
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl transition-transform duration-500 group-hover:scale-125"
            />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/25 to-blue-500/20 text-purple-300 border border-purple-400/35 shadow-[0_0_24px_rgba(168,85,247,0.25)]">
                  <BookOpen size={25} />
                </span>
                <button
                  type="button"
                  onClick={advanceWordStage}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-purple-500/20 border-purple-400/40 text-purple-200 hover:bg-purple-500/30'
                      : 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  <Sparkles size={11} />
                  <span>Illuminate Lens</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h2 className="prism-brand text-4xl sm:text-5xl font-black tracking-tight italic leading-[1.1]">
                    Prism{' '}
                    <span
                      className={`inline-block pr-2 bg-clip-text text-transparent ${
                        darkMode
                          ? 'bg-gradient-to-r from-blue-300 via-purple-300 to-violet-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.45)]'
                          : 'bg-gradient-to-r from-blue-700 via-purple-700 to-violet-700'
                      }`}
                    >
                      Word
                    </span>
                  </h2>
                  <span className={`text-xs font-black italic ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                    Turning Reading into Living.
                  </span>
                </div>

                {/* Illuminated 3-Stage Bible Study Progress Bar */}
                <div className="grid grid-cols-3 gap-1.5 w-full pt-0.5">
                  {MINI_WORD_LENS_STAGES.map((item, idx) => (
                    <div
                      key={item.stage}
                      className={`h-1.5 rounded-full overflow-hidden border ${
                        darkMode ? 'bg-purple-950/60 border-purple-400/20' : 'bg-purple-100 border-purple-200'
                      }`}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-amber-300"
                        initial={false}
                        animate={{
                          width: idx <= wordStageIndex ? '100%' : '0%',
                          opacity: idx <= wordStageIndex ? 1 : 0.25,
                        }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Sanctuary Lens Card right inside the Prism Word tile */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeWordStage.stage}
                  initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.98 }}
                  transition={{ duration: 0.28 }}
                  className={`rounded-2xl border p-4 space-y-2.5 ${
                    darkMode
                      ? 'border-purple-400/30 bg-[#0c0820]/85 shadow-inner'
                      : 'border-purple-200 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className={darkMode ? 'text-purple-300' : 'text-purple-700'}>
                      {activeWordStage.stage}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 ${
                        darkMode
                          ? 'bg-amber-500/15 border-amber-400/35 text-amber-200'
                          : 'bg-amber-50 border-amber-300 text-amber-800'
                      }`}
                    >
                      {activeWordStage.badge}
                    </span>
                  </div>
                  <p className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {activeWordStage.title}
                  </p>
                  <p className={`text-xs leading-relaxed ${muted}`}>
                    {activeWordStage.body}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className={`text-[11px] font-bold ${darkMode ? 'text-amber-200' : 'text-purple-700'}`}>
                      {activeWordStage.highlight}
                    </span>
                    <button
                      type="button"
                      onClick={advanceWordStage}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black transition-all cursor-pointer active:scale-95 ${
                        darkMode
                          ? 'bg-purple-500/20 hover:bg-purple-500/35 border-purple-400/40 text-purple-200'
                          : 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800'
                      }`}
                    >
                      {wordStageIndex < MINI_WORD_LENS_STAGES.length - 1 ? (
                        <>
                          <Sparkles size={12} />
                          <span>Next Lens</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw size={12} />
                          <span>Replay Lens</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: BookOpen, label: 'Multi Version Bible' },
                  { icon: Music, label: 'Worship Deck and Studio' },
                  { icon: Gamepad2, label: 'Strategy Puzzles' },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                      darkMode
                        ? 'bg-purple-500/[0.08] border-purple-400/20 text-slate-200 group-hover:border-purple-400/35'
                        : 'bg-white/80 border-purple-200/80 text-slate-700'
                    }`}
                  >
                    <tag.icon size={13} className="text-purple-400" /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/scripture"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(147,51,234,0.35),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all hover:from-blue-500 hover:via-purple-500 hover:to-violet-500 active:scale-[0.98]"
            >
              <span>Launch Prism Word</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>

          {/* PORTAL 4: PRISM FORGE — Visual LEGO Brick Code & Stack Trace Refractor */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, rotateY: 22, y: 24 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            whileHover={reducedMotion ? undefined : { y: -8, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.16 }}
            style={{ transformPerspective: 1200 }}
            className={`group relative overflow-hidden rounded-[2.5rem] border p-8 sm:p-10 backdrop-blur-3xl transition-all duration-300 flex flex-col justify-between gap-7 ${
              darkMode
                ? 'bg-gradient-to-br from-[#071f2c]/90 via-[#061522]/90 to-[#040c16]/95 border-cyan-400/25 hover:border-cyan-400/60 shadow-[0_30px_90px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_36px_110px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(103,232,249,0.3)]'
                : 'bg-gradient-to-br from-white/95 via-[#f2fbff]/95 to-[#e6f7fd]/90 border-cyan-300/60 hover:border-cyan-500/70 shadow-[0_24px_70px_rgba(8,145,178,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {!reducedMotion && (
              <motion.div
                key={`forge-pulse-${forgePulseKey}`}
                initial={{ x: '-115%', opacity: 0.9 }}
                animate={{ x: '220%', opacity: 0 }}
                transition={{ duration: 1.25, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent z-20"
              />
            )}

            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
            <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-cyan-500/25 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 opacity-70" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 to-teal-500/20 text-cyan-300 border border-cyan-400/35 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
                  <Code2 size={25} />
                </span>
                <button
                  type="button"
                  onClick={advanceForgeStage}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30'
                      : 'bg-cyan-100 border-cyan-300 text-cyan-800 hover:bg-cyan-200'
                  }`}
                >
                  <Sparkles size={11} />
                  <span>Snap Next LEGO Brick</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h2 className="prism-brand text-4xl sm:text-5xl font-black tracking-tight italic leading-[1.1]">
                    Prism{' '}
                    <span
                      className={`inline-block pr-2 bg-clip-text text-transparent ${
                        darkMode
                          ? 'bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.45)]'
                          : 'bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600'
                      }`}
                    >
                      Forge
                    </span>
                  </h2>
                  <span className={`text-xs font-black italic ${darkMode ? 'text-cyan-200' : 'text-cyan-700'}`}>
                    Turning Errors into LEGOs.
                  </span>
                </div>

                {/* 3-Brick Assembly Progress Bar */}
                <div className="grid grid-cols-3 gap-1.5 w-full pt-0.5">
                  {MINI_FORGE_LEGO_STAGES.map((item, idx) => (
                    <div
                      key={item.stage}
                      className={`h-1.5 rounded-full overflow-hidden border ${
                        darkMode ? 'bg-cyan-950/60 border-cyan-400/20' : 'bg-cyan-100 border-cyan-200'
                      }`}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300"
                        initial={false}
                        animate={{
                          width: idx <= forgeStageIndex ? '100%' : '0%',
                          opacity: idx <= forgeStageIndex ? 1 : 0.25,
                        }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Mini LEGO Workbench Preview Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeForgeStage.stage}
                  initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.98 }}
                  transition={{ duration: 0.28 }}
                  className={`rounded-2xl border p-4 space-y-2.5 ${
                    darkMode
                      ? 'border-cyan-400/30 bg-[#04121b]/85 shadow-inner'
                      : 'border-cyan-200 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className={darkMode ? 'text-cyan-300' : 'text-cyan-700'}>
                      {activeForgeStage.stage}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 ${
                        darkMode
                          ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      }`}
                    >
                      {activeForgeStage.badge}
                    </span>
                  </div>
                  <p className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {activeForgeStage.title}
                  </p>
                  <p className={`text-xs leading-relaxed ${muted}`}>
                    {activeForgeStage.body}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className={`text-[11px] font-bold ${darkMode ? 'text-cyan-200' : 'text-cyan-700'}`}>
                      {activeForgeStage.highlight}
                    </span>
                    <button
                      type="button"
                      onClick={advanceForgeStage}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black transition-all cursor-pointer active:scale-95 ${
                        darkMode
                          ? 'bg-cyan-500/20 hover:bg-cyan-500/35 border-cyan-400/40 text-cyan-200'
                          : 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-800'
                      }`}
                    >
                      {forgeStageIndex < MINI_FORGE_LEGO_STAGES.length - 1 ? (
                        <>
                          <Sparkles size={12} />
                          <span>Next Brick</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw size={12} />
                          <span>Replay Bricks</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Code2, label: 'Stack Trace → LEGOs' },
                  { icon: Layers, label: 'CLI Token Shield' },
                  { icon: Sparkles, label: 'Ask DJ Pair Quest' },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                      darkMode
                        ? 'bg-cyan-500/[0.08] border-cyan-400/20 text-slate-200 group-hover:border-cyan-400/35'
                        : 'bg-white/80 border-cyan-200/80 text-slate-700'
                    }`}
                  >
                    <tag.icon size={13} className="text-cyan-400" /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/forge"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(34,211,238,0.35),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all hover:from-cyan-500 hover:via-teal-400 hover:to-emerald-500 active:scale-[0.98]"
            >
              <span>Launch Prism Forge</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>
        </section>

        {/* In Orbit · The Prism Roadmap (Classified Prototype Constellation — Blurred Until Hovered/Tapped!) */}
        <section aria-label="In Orbit · The Prism Roadmap" className="space-y-5 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">
                  In Orbit · The Prism Roadmap
                </h3>
              </div>
              <p className={`text-xs ${muted} mt-1`}>
                Classified prototypes in our lab. Hover or tap any tile to decrypt the upcoming expansion.
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[10px] font-black uppercase tracking-wider ${pillSurface}`}>
              <Sparkles size={11} className="text-cyan-400" /> Roadmap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FUTURE_EXPANSIONS.map((item) => {
              const isRevealed = activePrototype === item.name;
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
                  onClick={() => setActivePrototype((prev) => (prev === item.name ? null : item.name))}
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

        {/* Under-the-Hood 3-Stage Engine Ignition Chamber: The Prism Engine ∞ */}
        <motion.section
          aria-label="The Prism Engine Infinite-Loop Autonomous Orchestrator"
          data-engine-telemetry="Tier 1 · Tier 2 · Groq · Local Structural Refraction"
          onViewportEnter={() => {
            if (!engineIgnited) igniteEngineSequence();
          }}
          viewport={{ once: false, amount: 0.45 }}
          onClick={igniteEngineSequence}
          className={`group relative overflow-hidden rounded-[2.25rem] border p-6 sm:p-8 backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer transition-all ${cardSurface}`}
        >
          {/* Stage 1: Full-Chamber Engine Combustion Sweep (0s -> 1.8s) */}
          {!reducedMotion && engineIgnited && (
            <motion.div
              key={`ignition-sweep-${engineCycleKey}`}
              initial={{ x: '-115%', opacity: 0.9 }}
              animate={{ x: '220%', opacity: 0 }}
              transition={{ duration: 2.1, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent"
            />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 relative z-10">
            {/* Under-the-Hood Twin-Turbine Infinity Chamber */}
            <div className="relative inline-flex h-20 w-32 items-center justify-center rounded-2xl border border-cyan-400/45 bg-[#040917] shadow-[0_0_40px_rgba(34,211,238,0.28),inset_0_0_20px_rgba(168,85,247,0.18)] shrink-0 overflow-hidden">
              {/* Twin Under-the-Hood Rotating Turbine Rings (Left & Right Cylinders) */}
              {!reducedMotion && (
                <>
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="pointer-events-none absolute left-3.5 h-11 w-11 rounded-full border border-dashed border-sky-400/35"
                  />
                  <motion.span
                    animate={{ rotate: [360, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="pointer-events-none absolute right-3.5 h-11 w-11 rounded-full border border-dashed border-emerald-400/35"
                  />
                </>
              )}

              <svg width="96" height="46" viewBox="0 0 88 44" fill="none" aria-hidden="true" className="relative z-10">
                <defs>
                  <linearGradient id="prism-infinity-grad" x1="6" y1="22" x2="82" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <filter id="infinity-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Base cylinder track */}
                <path
                  d={INFINITY_PATH_D}
                  stroke="rgba(148,163,184,0.16)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />

                {/* Stage 2: Thinking Loop Formation (Deliberate 2.4-second figure-eight draw!) */}
                <motion.path
                  key={`loop-path-${engineCycleKey}`}
                  d={INFINITY_PATH_D}
                  stroke="url(#prism-infinity-grad)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  filter="url(#infinity-neon-glow)"
                  initial={reducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.25 }}
                  animate={
                    engineIgnited || reducedMotion
                      ? { pathLength: 1, opacity: 1 }
                      : { pathLength: 0, opacity: 0.25 }
                  }
                  transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />

                {/* Continuous High-Voltage Energy Pulse Racing Around the Infinity Loop */}
                {!reducedMotion && engineIgnited && (
                  <motion.path
                    key={`loop-runner-${engineCycleKey}`}
                    d={INFINITY_PATH_D}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="14 190"
                    initial={{ strokeDashoffset: 204, opacity: 0 }}
                    animate={{ strokeDashoffset: [204, 0], opacity: [0, 1, 1] }}
                    transition={{
                      strokeDashoffset: { duration: 2.6, repeat: Infinity, ease: 'linear', delay: 1.8 },
                      opacity: { duration: 0.6, delay: 1.8 },
                    }}
                  />
                )}
              </svg>

              {/* Central Ignition Crossover Spark */}
              {!reducedMotion && engineIgnited && (
                <motion.span
                  key={`spark-${engineCycleKey}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.9, 1.15, 1.4, 1], opacity: [0, 1, 0.85, 1, 0.9] }}
                  transition={{ duration: 2.2, times: [0, 0.25, 0.5, 0.75, 1] }}
                  className="pointer-events-none absolute h-3 w-3 rounded-full bg-white shadow-[0_0_20px_#38bdf8,0_0_35px_#10b981] z-20"
                />
              )}
            </div>

            {/* Stage 3: Staggered Telemetry Reveal After the Infinity Loop Finishes Drawing */}
            <div className="space-y-1.5">
              <motion.p
                key={`engine-title-${engineCycleKey}`}
                initial={reducedMotion ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
                animate={
                  engineIgnited || reducedMotion
                    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0, y: 10, filter: 'blur(6px)' }
                }
                transition={{ duration: 0.65, delay: 1.4 }}
                className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] bg-gradient-to-r from-sky-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent"
              >
                The Prism Engine ∞ · Autonomous Self-Healing Intelligence
              </motion.p>

              <motion.p
                key={`engine-desc-${engineCycleKey}`}
                initial={reducedMotion ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={
                  engineIgnited || reducedMotion
                    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0, y: 8, filter: 'blur(4px)' }
                }
                transition={{ duration: 0.65, delay: 1.85 }}
                className={`text-xs sm:text-sm leading-relaxed ${muted}`}
              >
                Proprietary Infinite-Loop Orchestration with guaranteed <strong>Local Structural Refraction</strong> continuity. Adapts in real time so your flow never breaks.
              </motion.p>
            </div>
          </div>

          <motion.div
            key={`engine-pill-${engineCycleKey}`}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.88, filter: 'blur(4px)' }}
            animate={
              engineIgnited || reducedMotion
                ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
                : { opacity: 0, scale: 0.88, filter: 'blur(4px)' }
            }
            transition={{ duration: 0.6, delay: 2.85 }}
            className="relative z-10 flex flex-col items-start lg:items-end gap-1.5 shrink-0"
          >
            <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-black ${pillSurface}`}>
              <ShieldCheck size={15} className="text-emerald-500" /> Zero Secret Leaks · Free Forever
            </span>
            <span className="text-[10px] font-bold text-cyan-400/80 px-1">
              Tap chamber anytime to replay engine ignition
            </span>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
