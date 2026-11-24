'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  FileText,
  Gamepad2,
  Moon,
  Pause,
  Play,
  Radio,
  Sparkles,
  Sun,
  Users,
  Wind,
  X,
  Zap,
} from 'lucide-react';

type SensoryAtmosphere = 'calm' | 'vibrant' | 'contrast';
type TourSection = 'hero' | 'active' | 'orbit' | 'core';

type TourChapter = {
  id: string;
  section: TourSection;
  title: string;
  caption: string;
  activeModule?: 'focus' | 'play' | 'word';
  orbitModule?: 'forge' | 'echo' | 'guild';
};

const TOUR_CHAPTERS: TourChapter[] = [
  {
    id: 'vision',
    section: 'hero',
    title: 'The Vision',
    caption: 'Designed for ADHD and neurodivergent clarity. Zero clutter, calm pacing, instant signal.',
  },
  {
    id: 'pf',
    section: 'active',
    activeModule: 'focus',
    title: 'PF · Prism Focus',
    caption: 'Strips 80% of textbook or policy noise into a 2-second TLDR, vivid metaphor, and one clear next step.',
  },
  {
    id: 'pp',
    section: 'active',
    activeModule: 'play',
    title: 'PP · Prism Play',
    caption: 'Turns overwhelming study decks into 1-card-at-a-time interactive quests with real XP momentum.',
  },
  {
    id: 'pw',
    section: 'active',
    activeModule: 'word',
    title: 'PW · Prism Word',
    caption: 'Anchors every word with Bionic Shield and plain prose so dense paragraphs never stall your eyes.',
  },
  {
    id: 'orbit',
    section: 'orbit',
    orbitModule: 'forge',
    title: 'In Orbit · Prism Forge',
    caption: 'Watch dormant roadmap capsules ignite from closed prototypes into live features inside Prism Focus.',
  },
  {
    id: 'core',
    section: 'core',
    title: 'Autonomous Self-Healing Core',
    caption: 'If one AI provider slows down or hits a limit, the engine quietly heals itself in milliseconds.',
  },
];

type ActiveModule = {
  id: 'focus' | 'play' | 'word';
  code: string;
  name: string;
  role: string;
  tagline: string;
  href: string;
  cta: string;
  accentHex: string;
  glowRgba: string;
  pills: string[];
  icon: React.ReactNode;
};

type OrbitModule = {
  id: 'forge' | 'echo' | 'guild';
  name: string;
  parent: string;
  status: 'LIVE IN FOCUS' | 'R&D';
  summary: string;
  accentHex: string;
  glowRgba: string;
  effectLabel: string;
  href?: string;
  icon: React.ReactNode;
};

const ACTIVE_MODULES: ActiveModule[] = [
  {
    id: 'focus',
    code: 'PF',
    name: 'Prism Focus',
    role: 'Document & Noise Workspace',
    tagline: 'Strip 80% of textbook and policy clutter into 2-second TLDRs, vivid metaphors, and one clear next step.',
    href: '/',
    cta: 'Launch Prism Focus',
    accentHex: '#38bdf8',
    glowRgba: 'rgba(56, 189, 248, 0.28)',
    pills: ['Executive TLDR', 'Vivid Metaphors', 'Prism Lens Vision', 'Ask DJ Memory'],
    icon: <FileText size={20} />,
  },
  {
    id: 'play',
    code: 'PP',
    name: 'Prism Play',
    role: 'Gamified Study Workspace',
    tagline: 'Turn overwhelming study decks into 1-card-at-a-time interactive quests with real momentum.',
    href: '/canvas',
    cta: 'Enter Prism Play',
    accentHex: '#34d399',
    glowRgba: 'rgba(52, 211, 153, 0.28)',
    pills: ['1-Card Quests', 'XP Momentum', 'Zero Dread', 'Instant Recall'],
    icon: <Gamepad2 size={20} />,
  },
  {
    id: 'word',
    code: 'PW',
    name: 'Prism Word',
    role: 'Bionic & Plain-Prose Reading',
    tagline: 'Anchor every word with Bionic Shield and Neuro-Mirror plain prose so dense paragraphs never stall your eyes.',
    href: '/',
    cta: 'Open Prism Word',
    accentHex: '#a3e635',
    glowRgba: 'rgba(163, 230, 53, 0.25)',
    pills: ['Bionic Shield', 'Plain Prose', 'Tap-to-Lens', 'Zero Symbol Clutter'],
    icon: <Sparkles size={20} />,
  },
];

const ORBIT_MODULES: OrbitModule[] = [
  {
    id: 'forge',
    name: 'Prism Forge',
    parent: 'PRISM FOCUS',
    status: 'LIVE IN FOCUS',
    summary: 'Translates cryptic terminal stack traces and dense code docs into visual LEGO brick logic.',
    accentHex: '#22d3ee',
    glowRgba: 'rgba(34, 211, 238, 0.26)',
    effectLabel: 'Closed -> Functional Ignition',
    href: '/',
    icon: <Code2 size={18} />,
  },
  {
    id: 'echo',
    name: 'Prism Echo',
    parent: 'PRISM PLAY',
    status: 'R&D',
    summary: 'Turns a 45-minute recorded lecture into 5 bite-sized interactive play cards with timestamps.',
    accentHex: '#fbbf24',
    glowRgba: 'rgba(251, 191, 36, 0.24)',
    effectLabel: 'Waveform Pulse Preview',
    icon: <Radio size={18} />,
  },
  {
    id: 'guild',
    name: 'Prism Guild',
    parent: 'THE PRISM ENGINE',
    status: 'R&D',
    summary: 'Silent virtual body-doubling rooms with shared focus timers and group dopamine streaks.',
    accentHex: '#c084fc',
    glowRgba: 'rgba(192, 132, 252, 0.24)',
    effectLabel: 'Orbital Sync Preview',
    icon: <Users size={18} />,
  },
];

export default function PrismLabKineticPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [atmosphere, setAtmosphere] = useState<SensoryAtmosphere>('calm');
  const [activeId, setActiveId] = useState<'focus' | 'play' | 'word'>('focus');
  const [orbitId, setOrbitId] = useState<'forge' | 'echo' | 'guild' | null>('forge');
  const [pointer, setPointer] = useState({ x: 50, y: 30 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [tourAutoPlay, setTourAutoPlay] = useState(true);

  const heroRef = useRef<HTMLElement | null>(null);
  const activeRef = useRef<HTMLElement | null>(null);
  const orbitRef = useRef<HTMLElement | null>(null);
  const coreRef = useRef<HTMLElement | null>(null);

  const currentChapter = tourActive ? TOUR_CHAPTERS[tourIndex] : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Sync active module & scroll smoothly to spotlighted section during Full Tour
  useEffect(() => {
    if (!tourActive) return;
    const chapter = TOUR_CHAPTERS[tourIndex];
    if (!chapter) return;

    if (chapter.activeModule) setActiveId(chapter.activeModule);
    if (chapter.orbitModule) setOrbitId(chapter.orbitModule);

    const targetMap: Record<TourSection, HTMLElement | null> = {
      hero: heroRef.current,
      active: activeRef.current,
      orbit: orbitRef.current,
      core: coreRef.current,
    };
    const el = targetMap[chapter.section];
    if (el) {
      el.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  }, [tourActive, tourIndex, reducedMotion]);

  // Auto-advance Full Tour chapters when playing
  useEffect(() => {
    if (!tourActive || !tourAutoPlay) return;
    const timer = setInterval(() => {
      setTourIndex((prev) => {
        if (prev >= TOUR_CHAPTERS.length - 1) {
          setTourAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3400);
    return () => clearInterval(timer);
  }, [tourActive, tourAutoPlay]);

  const startFullTour = () => {
    setTourIndex(0);
    setTourAutoPlay(true);
    setTourActive(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    setPointer({ x, y });
  };

  const auroraGradient =
    atmosphere === 'calm'
      ? darkMode
        ? 'radial-gradient(650px circle at 50% 25%, rgba(56,189,248,0.18), rgba(16,185,129,0.10) 45%, transparent 72%)'
        : 'radial-gradient(650px circle at 50% 25%, rgba(37,99,235,0.12), rgba(16,185,129,0.08) 45%, transparent 72%)'
      : atmosphere === 'vibrant'
        ? darkMode
          ? 'radial-gradient(700px circle at 50% 25%, rgba(244,114,182,0.22), rgba(168,85,247,0.18) 42%, rgba(251,191,36,0.10) 64%, transparent 78%)'
          : 'radial-gradient(700px circle at 50% 25%, rgba(236,72,153,0.14), rgba(168,85,247,0.12) 45%, transparent 76%)'
        : darkMode
          ? 'radial-gradient(600px circle at 50% 25%, rgba(59,130,246,0.24), transparent 65%)'
          : 'radial-gradient(600px circle at 50% 25%, rgba(37,99,235,0.16), transparent 65%)';

  const pageBg =
    atmosphere === 'contrast'
      ? darkMode
        ? 'bg-[#000000] text-white'
        : 'bg-[#ffffff] text-[#0b1224]'
      : darkMode
        ? 'bg-[#03050c] text-slate-100'
        : 'bg-[#f6f3ec] text-[#141c2b]';

  const hairline = darkMode ? 'border-white/10' : 'border-[#d8d0c2]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`relative min-h-screen overflow-hidden transition-colors duration-700 ${pageBg}`}
    >
      {/* Architectural Hairline Grid (GitHub / Mistral vibe) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Breathing Living Aurora (Idea 3) */}
      <motion.div
        aria-hidden="true"
        animate={
          reducedMotion
            ? undefined
            : {
                scale: [1, 1.08, 0.96, 1],
                opacity: [0.75, 1, 0.8, 0.75],
              }
        }
        transition={{
          duration: atmosphere === 'vibrant' ? 6 : 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none fixed inset-0"
        style={{ background: auroraGradient }}
      />

      {/* Cursor Magnetic Spotlight (Antigravity vibe) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 transition-opacity duration-300"
        style={{
          background: darkMode
            ? `radial-gradient(480px circle at ${pointer.x}% ${pointer.y}%, rgba(56,189,248,0.14), rgba(168,85,247,0.08) 40%, transparent 70%)`
            : `radial-gradient(480px circle at ${pointer.x}% ${pointer.y}%, rgba(37,99,235,0.10), rgba(168,85,247,0.06) 40%, transparent 70%)`,
        }}
      />

      {/* Top Minimalist Bar */}
      <header className="relative z-20 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl border font-serif text-lg font-black italic ${hairline} bg-white/[0.04] backdrop-blur-xl`}>
            D
          </div>
          <span className="text-xs font-black uppercase tracking-[0.24em]">
            Dassah&apos;s Prism
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
            Kinetic Preview
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sensory Atmosphere Switcher */}
          <div className={`flex items-center gap-1 rounded-full border p-1 ${hairline} bg-current/[0.03] backdrop-blur-xl`}>
            {(['calm', 'vibrant', 'contrast'] as SensoryAtmosphere[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAtmosphere(mode)}
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                  atmosphere === mode
                    ? 'bg-blue-600 text-white shadow-sm'
                    : `${muted} hover:text-current`
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => (tourActive ? setTourActive(false) : startFullTour())}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
              tourActive
                ? 'border-lime-400 bg-lime-400/20 text-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.28)]'
                : `${hairline} bg-current/[0.04] hover:border-lime-400/50`
            }`}
          >
            <Compass size={13} className="text-lime-400" />
            <span>{tourActive ? 'Tour Active' : 'Take the 30-Second Tour'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle Light or Dark Mode"
            className={`rounded-full border p-2 transition-colors ${hairline} bg-current/[0.04] hover:border-blue-400/50`}
          >
            {darkMode ? <Sun size={14} className="text-amber-300" /> : <Moon size={14} className="text-blue-600" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-16 px-5 pb-32 pt-8 sm:px-8">
        {/* Editorial Hero (Weightless Antigravity x Mistral Precision) */}
        <section
          ref={heroRef}
          className={`mx-auto max-w-4xl space-y-6 text-center transition-all duration-500 rounded-3xl p-4 ${
            currentChapter && currentChapter.section !== 'hero' ? 'opacity-35 scale-[0.98]' : 'opacity-100'
          }`}
        >
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold tracking-wide ${hairline} bg-current/[0.03] backdrop-blur-xl`}>
            <Wind size={13} className="text-cyan-400" />
            <span>Built for ADHD & neurodivergent clarity</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight sm:text-7xl md:text-8xl leading-[0.95]">
            <span className="block font-serif font-normal italic tracking-normal opacity-90">
              Dassah&apos;s
            </span>
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Prism Engine
            </span>
          </h1>

          {/* Kinetic Faint Lime Horizontal Pulse */}
          <div className="relative mx-auto h-[2px] w-64 overflow-hidden rounded-full bg-lime-400/15 sm:w-96">
            {!reducedMotion && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-lime-400/75 to-transparent shadow-[0_0_12px_rgba(163,230,53,0.45)]"
              />
            )}
          </div>

          <p className={`mx-auto max-w-xl text-base leading-relaxed sm:text-lg ${muted}`}>
            One autonomous engine. Tap any module icon below to illuminate it from dormant glass into live action.
          </p>
        </section>

        {/* Active Product Monoliths: Compact Icon+Name -> Kinetic Expanded Tile */}
        <section
          ref={activeRef}
          aria-label="Active Prism Ecosystem"
          className={`space-y-6 transition-all duration-500 ${
            currentChapter && currentChapter.section !== 'active' ? 'opacity-35 scale-[0.99]' : 'opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-[0.24em] ${muted}`}>
              Active Modules · Tap or Hover to Illuminate
            </span>
            <span className="text-[11px] font-bold text-lime-400/90">
              PF · PP · PW
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {ACTIVE_MODULES.map((mod) => {
              const isOpen = activeId === mod.id;
              return (
                <motion.div
                  key={mod.id}
                  layout={!reducedMotion}
                  onMouseEnter={() => setActiveId(mod.id)}
                  onClick={() => setActiveId(mod.id)}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  className={`group relative cursor-pointer overflow-hidden rounded-3xl border p-6 backdrop-blur-2xl transition-colors ${hairline} ${
                    isOpen
                      ? 'lg:col-span-6 bg-current/[0.05]'
                      : 'lg:col-span-3 bg-current/[0.02] hover:bg-current/[0.04]'
                  }`}
                  style={{
                    boxShadow: isOpen ? `0 0 60px -12px ${mod.glowRgba}` : undefined,
                    borderColor: isOpen ? `${mod.accentHex}66` : undefined,
                  }}
                >
                  {/* Top Illumination Beam when active */}
                  {isOpen && (
                    <motion.div
                      layoutId={reducedMotion ? undefined : 'activeTopLaser'}
                      className="absolute inset-x-0 top-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${mod.accentHex}, transparent)`,
                      }}
                    />
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105"
                        style={{
                          borderColor: `${mod.accentHex}55`,
                          backgroundColor: `${mod.accentHex}18`,
                          color: mod.accentHex,
                        }}
                      >
                        {mod.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: mod.accentHex }}
                          >
                            {mod.code}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight">{mod.name}</h2>
                      </div>
                    </div>

                    {!isOpen && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>
                        Open
                      </span>
                    )}
                  </div>

                  {/* Expanded Kinetic Content */}
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="mt-5 space-y-5"
                      >
                        <p className={`text-sm leading-relaxed ${muted}`}>
                          {mod.tagline}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {mod.pills.map((pill) => (
                            <span
                              key={pill}
                              className={`rounded-full border px-3 py-1 text-[11px] font-bold ${hairline} bg-current/[0.04]`}
                            >
                              {pill}
                            </span>
                          ))}
                        </div>

                        <div className="pt-1">
                          <Link
                            href={mod.href}
                            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition-transform hover:scale-[1.02]"
                            style={{ backgroundColor: mod.accentHex }}
                          >
                            <span>{mod.cta}</span>
                            <ArrowUpRight size={15} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* In Orbit: Closed Icon Capsules -> Illuminated Functional Tiles */}
        <section
          ref={orbitRef}
          aria-label="In Orbit Roadmap"
          className={`space-y-5 transition-all duration-500 ${
            currentChapter && currentChapter.section !== 'orbit' ? 'opacity-35 scale-[0.99]' : 'opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-[0.24em] ${muted}`}>
              In Orbit · Dormant Icon to Illuminated Tile
            </span>
            <span className="text-[11px] font-bold text-emerald-400">
              Tap any capsule to unfold
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ORBIT_MODULES.map((item) => {
              const expanded = orbitId === item.id;
              return (
                <motion.div
                  key={item.id}
                  layout={!reducedMotion}
                  onMouseEnter={() => setOrbitId(item.id)}
                  onClick={() => setOrbitId(expanded ? null : item.id)}
                  className={`cursor-pointer overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-colors ${hairline} ${
                    expanded ? 'bg-current/[0.05]' : 'bg-current/[0.02] hover:bg-current/[0.04]'
                  }`}
                  style={{
                    boxShadow: expanded ? `0 0 48px -12px ${item.glowRgba}` : undefined,
                    borderColor: expanded ? `${item.accentHex}66` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={
                          expanded && !reducedMotion
                            ? { rotate: [0, -6, 6, 0], scale: [1, 1.1, 1] }
                            : undefined
                        }
                        transition={{ duration: 0.6 }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border"
                        style={{
                          borderColor: `${item.accentHex}55`,
                          backgroundColor: `${item.accentHex}18`,
                          color: item.accentHex,
                        }}
                      >
                        {item.icon}
                      </motion.div>
                      <div>
                        <h3 className="text-base font-black tracking-tight">{item.name}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>
                          {item.parent}
                        </p>
                      </div>
                    </div>

                    <span
                      className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: `${item.accentHex}20`,
                        color: item.accentHex,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3 border-t border-current/10 pt-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: item.accentHex }}>
                            <Zap size={12} /> {item.effectLabel}
                          </div>
                          <p className={`text-xs leading-relaxed ${muted}`}>
                            {item.summary}
                          </p>
                          {item.href && (
                            <Link
                              href={item.href}
                              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider hover:underline"
                              style={{ color: item.accentHex }}
                            >
                              <span>Try in Prism Focus</span>
                              <ArrowUpRight size={14} />
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Bottom Kinetic Infinity Core Chamber */}
        <section
          ref={coreRef}
          className={`relative overflow-hidden rounded-[2rem] border p-8 text-center backdrop-blur-2xl transition-all duration-500 ${hairline} bg-current/[0.02] ${
            currentChapter && currentChapter.section !== 'core' ? 'opacity-35 scale-[0.99]' : 'opacity-100'
          }`}
          style={{
            boxShadow:
              currentChapter?.section === 'core' ? '0 0 60px -10px rgba(56,189,248,0.35)' : undefined,
            borderColor: currentChapter?.section === 'core' ? 'rgba(56,189,248,0.5)' : undefined,
          }}
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center space-y-4">
            <motion.div
              animate={reducedMotion ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.28)]"
            >
              <Sparkles size={24} />
            </motion.div>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">
              Autonomous Self-Healing Intelligence
            </h2>
            <p className={`text-sm leading-relaxed ${muted}`}>
              If one model slows down or hits a limit, the engine quietly heals itself in milliseconds so your study flow never breaks.
            </p>
          </div>
        </section>
      </main>

      {/* Floating 30-Second Guided Tour HUD */}
      <AnimatePresence>
        {tourActive && currentChapter && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-0 bottom-5 z-50 mx-auto w-[calc(100%-2rem)] max-w-2xl px-2"
          >
            <div className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-2xl ${hairline} ${darkMode ? 'bg-[#070b18]/92 text-slate-100' : 'bg-[#faf7f0]/95 text-[#141c2b]'}`}>
              {/* Progress Hairline */}
              <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-current/10">
                <motion.div
                  animate={{ width: `${((tourIndex + 1) / TOUR_CHAPTERS.length) * 100}%` }}
                  transition={{ duration: 0.35 }}
                  className="h-full rounded-full bg-gradient-to-r from-lime-400 via-cyan-400 to-violet-400"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
                      Step {tourIndex + 1} / {TOUR_CHAPTERS.length}
                    </span>
                    <span className="text-xs font-black tracking-tight">
                      {currentChapter.title}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${muted}`}>
                    {currentChapter.caption}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTourAutoPlay((p) => !p)}
                    aria-label={tourAutoPlay ? 'Pause Tour' : 'Resume Tour'}
                    className={`rounded-full border p-2 transition-colors ${hairline} hover:border-lime-400/50`}
                  >
                    {tourAutoPlay ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button
                    type="button"
                    disabled={tourIndex === 0}
                    onClick={() => {
                      setTourAutoPlay(false);
                      setTourIndex((i) => Math.max(0, i - 1));
                    }}
                    aria-label="Previous Step"
                    className={`rounded-full border p-2 transition-colors disabled:opacity-30 ${hairline} hover:border-cyan-400/50`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTourAutoPlay(false);
                      if (tourIndex >= TOUR_CHAPTERS.length - 1) {
                        setTourActive(false);
                      } else {
                        setTourIndex((i) => i + 1);
                      }
                    }}
                    aria-label="Next Step"
                    className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-950 hover:bg-lime-300 transition-colors"
                  >
                    <span>{tourIndex >= TOUR_CHAPTERS.length - 1 ? 'Done' : 'Next'}</span>
                    <ChevronRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTourActive(false)}
                    aria-label="Close Tour"
                    className={`rounded-full border p-2 transition-colors ${hairline} hover:border-rose-400/50`}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
