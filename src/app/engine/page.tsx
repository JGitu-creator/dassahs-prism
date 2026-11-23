'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  Headphones,
  Layers,
  Lock,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Swords,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { PrismPromoShowcase } from '@/components/prism/PrismPromoShowcase';

/**
 * Geometric D-Prism Brand Mark with role-specific accents:
 * - 'prism': Warm Gold stem (#D97706) + Electric Blue upper facet (#2563EB) + Violet lower facet (#7C3AED)
 * - 'engine': D-Prism mark enclosed inside a precision technical reticle frame
 * - 'play': D-Prism mark with the signature Emerald Play Triangle (#10B981) at the focal tip
 */
function DPrismRoleMark({
  role = 'prism',
  size = 44,
}: {
  role?: 'prism' | 'engine' | 'play';
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {role === 'engine' && (
        <>
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="14"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          <line x1="32" y1="1" x2="32" y2="7" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="32" y1="57" x2="32" y2="63" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="1" y1="32" x2="7" y2="32" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="57" y1="32" x2="63" y2="32" stroke="#38BDF8" strokeWidth="1.5" />
        </>
      )}
      {/* Gold Vertical Stem of the D */}
      <rect x="13" y="12" width="10" height="40" rx="2.5" fill="#D97706" />
      {/* Royal Blue Upper Facet */}
      <path d="M26 12H37L51 32H39L29 21H26V12Z" fill="#2563EB" />
      {/* Violet Lower Facet */}
      <path d="M26 52H37L51 32H39L29 43H26V52Z" fill="#7C3AED" />
      {/* Emerald Play Focal Triangle for Prism Play */}
      {role === 'play' && (
        <path
          d="M52 25.5L61 32L52 38.5V25.5Z"
          fill="#10B981"
        />
      )}
    </svg>
  );
}

const FUTURE_EXPANSIONS = [
  {
    name: 'Prism Forge',
    parentApp: "Dassah's Prism",
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

export default function PrismEnginePortalPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [mouse, setMouse] = useState({ x: 50, y: 32 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revealedPrototype, setRevealedPrototype] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    setMouse({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    setHasInteracted(true);
  };

  const pageBg = darkMode
    ? 'bg-[#060a17] text-slate-100'
    : 'bg-[#faf7f0] text-[#172133]';
  const muted = darkMode ? 'text-slate-300' : 'text-[#394658]';
  const cardSurface = darkMode
    ? 'bg-[#0b1224]/85 border-white/15 hover:border-blue-400/50 shadow-[0_30px_90px_rgba(0,0,0,0.6)]'
    : 'bg-[#faf7f0] border-[#d6ccb9] hover:border-blue-600/60 shadow-[0_24px_70px_rgba(23,33,51,0.10)]';
  const pillSurface = darkMode
    ? 'bg-white/[0.07] border-white/15 text-slate-200'
    : 'bg-[#ece5d8] border-[#d6ccb9] text-[#172133]';

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${pageBg}`}
    >
      {/* Background: Restrained Prism Ribbon & Paper-Light Refraction */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? 'radial-gradient(900px circle at 72% 24%, rgba(37,99,235,0.22), rgba(124,58,237,0.14) 38%, rgba(217,119,6,0.08) 60%, transparent 78%)'
              : 'radial-gradient(900px circle at 72% 24%, rgba(37,99,235,0.10), rgba(124,58,237,0.07) 38%, rgba(217,119,6,0.06) 60%, transparent 78%)',
          }}
        />
        <div
          className="hidden md:block absolute inset-0 transition-opacity duration-500"
          style={{
            background: darkMode
              ? `radial-gradient(560px circle at ${mouse.x}% ${mouse.y}%, rgba(56,189,248,0.22), rgba(124,58,237,0.14) 38%, transparent 70%)`
              : `radial-gradient(560px circle at ${mouse.x}% ${mouse.y}%, rgba(37,99,235,0.12), rgba(124,58,237,0.08) 38%, transparent 70%)`,
            opacity: hasInteracted ? 1 : 0.6,
          }}
        />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <DPrismRoleMark role="engine" size={42} />
          <div>
            <p className="text-sm sm:text-base font-black tracking-tight">
              Dassah&apos;s Prism Engine
            </p>
            <p className={`text-[11px] font-semibold ${muted}`}>
              Light for your next step · Shared Product Gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold ${pillSurface}`}>
            <Lock size={12} className="text-emerald-500" /> Browser-Private Notes
          </span>
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? 'Switch to Paper & Light Mode' : 'Switch to Prism Ribbon Dark Mode'}
            className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black transition-colors ${pillSurface}`}
          >
            {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-blue-700" />}
            <span className="hidden sm:inline">{darkMode ? '04 / Paper & Light' : '03 / Prism Ribbon'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-5 pt-4 pb-20 sm:px-8 space-y-12">
        {/* Hero Centerpiece: 03 / Prism Ribbon + 04 / Paper & Light Hybrid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] ${
                darkMode
                  ? 'border-amber-400/35 bg-amber-500/10 text-amber-300'
                  : 'border-[#92400E]/30 bg-amber-500/10 text-[#92400E]'
              }`}
            >
              <Zap size={13} /> Choose Your Cognitive Mode · Light for your next step
            </motion.div>

            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="prism-brand text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06]"
            >
              <span className={darkMode ? 'text-white' : 'text-[#172133]'}>
                The{' '}
              </span>
              <span
                className={`bg-clip-text text-transparent ${
                  darkMode
                    ? 'bg-gradient-to-r from-amber-300 via-sky-300 to-violet-400'
                    : 'bg-gradient-to-r from-[#92400E] via-blue-700 to-violet-700'
                }`}
              >
                Prism
              </span>{' '}
              <span className="prism-text">Engine</span>
            </motion.h1>

            <p className={`max-w-2xl text-base sm:text-xl leading-relaxed font-medium ${muted}`}>
              Turn overwhelming information into understanding, learning, and a clear next step.
              Decode dense material in{' '}
              <strong className={darkMode ? 'text-sky-300' : 'text-blue-700'}>
                Dassah&apos;s Prism
              </strong>{' '}
              or build momentum one calm card at a time in{' '}
              <strong className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>
                Prism Play
              </strong>
              .
            </p>

            {/* Role Mark Trio Strip (Prism · Engine · Play from 03/04 Brand Boards) */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {[
                { role: 'prism' as const, title: "Dassah's Prism", sub: 'Understand it' },
                { role: 'engine' as const, title: 'Prism Engine', sub: 'Shared Gateway' },
                { role: 'play' as const, title: 'Prism Play', sub: 'Start small' },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 ${
                    darkMode
                      ? 'border-white/12 bg-white/[0.04]'
                      : 'border-[#d6ccb9] bg-white/90'
                  }`}
                >
                  <DPrismRoleMark role={badge.role} size={28} />
                  <div>
                    <p className="text-xs font-black leading-tight">{badge.title}</p>
                    <p className={`text-[10px] font-semibold ${muted}`}>{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#prism-promo-showcase"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_14px_35px_rgba(37,99,235,0.35)] transition hover:from-blue-500 hover:to-violet-500"
              >
                <Play size={16} />
                <span>Watch 75-Second Preview</span>
              </a>
              <Link
                href="/"
                className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-black transition ${pillSurface}`}
              >
                <span>Open Dassah&apos;s Prism</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/canvas"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-emerald-500"
              >
                <span>Open Prism Play</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Sculptural D-Prism Ribbon + Paper & Light Visual Showcase Card */}
          <div className="lg:col-span-5">
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className={`relative overflow-hidden rounded-[2rem] border p-3 ${
                darkMode
                  ? 'border-white/15 bg-gradient-to-br from-[#0e1834] via-[#091024] to-[#130f2e] shadow-[0_30px_90px_rgba(0,0,0,0.65)]'
                  : 'border-[#d6ccb9] bg-white shadow-[0_24px_70px_rgba(23,33,51,0.12)]'
              }`}
            >
              <img
                src={darkMode ? '/brand/03-prism-ribbon.png' : '/brand/04-paper-and-light.png'}
                alt={
                  darkMode
                    ? "Dassah's Prism 03 Prism Ribbon sculptural D-mark on midnight navy"
                    : "Dassah's Prism 04 Paper and Light faceted D-mark on warm ivory paper"
                }
                className="w-full aspect-video object-cover rounded-2xl"
              />
              <div className="flex items-center justify-between px-3 pt-3 pb-1">
                <span className={`text-xs font-black tracking-wide ${darkMode ? 'text-amber-300' : 'text-[#92400E]'}`}>
                  {darkMode ? '03 / Prism Ribbon Aesthetic' : '04 / Paper & Light Aesthetic'}
                </span>
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  className={`text-xs font-bold underline ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}
                >
                  Preview {darkMode ? 'Paper & Light' : 'Prism Ribbon'}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 75-Second Promo Video Showcase + 15% Low-Background Ambient Instrumental */}
        <PrismPromoShowcase darkMode={darkMode} />

        {/* Interactive Dual Portal Cards (Dassah's Prism & Prism Play) */}
        <section aria-label="Prism Engine workspaces" className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-9">
          {/* Portal 1: Dassah's Prism */}
          <motion.div
            whileHover={reducedMotion ? undefined : { y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={`group relative overflow-hidden rounded-[2.25rem] border p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between gap-8 ${
              darkMode
                ? 'bg-gradient-to-br from-[#0e1936]/95 via-[#0a1228]/90 to-[#070d1f]/95 border-blue-400/30 hover:border-blue-400/65 shadow-[0_30px_90px_rgba(0,0,0,0.6)]'
                : 'bg-[#faf7f0] border-[#d6ccb9] hover:border-blue-600 shadow-[0_24px_70px_rgba(23,33,51,0.09)]'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-3">
                  <DPrismRoleMark role="prism" size={46} />
                  <div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>
                      Live Workspace · Focus Role
                    </span>
                    <p className={`text-xs font-semibold ${muted}`}>Understand dense documents</p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${
                    darkMode
                      ? 'bg-blue-500/15 border-blue-400/30 text-blue-200'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  Document Studio
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="prism-brand text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
                  Dassah&apos;s{' '}
                  <span
                    className={`bg-clip-text text-transparent ${
                      darkMode
                        ? 'bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400'
                        : 'bg-gradient-to-r from-blue-700 via-blue-600 to-violet-700'
                    }`}
                  >
                    Prism
                  </span>
                </h2>
                <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-sky-300' : 'text-blue-800'}`}>
                  &ldquo;Turn overwhelming noise into clear focus in seconds.&rdquo;
                </p>
                <p className={`text-sm leading-relaxed ${muted}`}>
                  Paste articles, upload PDFs or lecture slides, and refract dense walls of text into executive summaries, vivid metaphors, visual diagrams, and Ask DJ insights.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: BookOpen, label: 'PDF & Doc Upload' },
                  { icon: Layers, label: 'Deep Refractions' },
                  { icon: Sparkles, label: 'Prism Lens & Ask DJ' },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                      darkMode
                        ? 'bg-blue-500/[0.10] border-blue-400/25 text-slate-100'
                        : 'bg-white border-[#d6ccb9] text-[#172133]'
                    }`}
                  >
                    <tag.icon size={13} className={darkMode ? 'text-sky-400' : 'text-blue-700'} /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(37,99,235,0.35)] transition-all hover:from-blue-500 hover:to-violet-500"
            >
              <span>Launch Dassah&apos;s Prism</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>

          {/* Portal 2: Prism Play */}
          <motion.div
            whileHover={reducedMotion ? undefined : { y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={`group relative overflow-hidden rounded-[2.25rem] border p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between gap-8 ${
              darkMode
                ? 'bg-gradient-to-br from-[#082221]/95 via-[#07181d]/90 to-[#061119]/95 border-emerald-400/30 hover:border-emerald-400/65 shadow-[0_30px_90px_rgba(0,0,0,0.6)]'
                : 'bg-[#faf7f0] border-[#d6ccb9] hover:border-emerald-600 shadow-[0_24px_70px_rgba(23,33,51,0.09)]'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-3">
                  <DPrismRoleMark role="play" size={46} />
                  <div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                      Live Workspace · Play Role
                    </span>
                    <p className={`text-xs font-semibold ${muted}`}>One calm card at a time</p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${
                    darkMode
                      ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  Canvas &amp; Study Quests
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="prism-brand text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
                  Prism{' '}
                  <span
                    className={`bg-clip-text text-transparent ${
                      darkMode
                        ? 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300'
                        : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700'
                    }`}
                  >
                    Play
                  </span>
                </h2>
                <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                  &ldquo;Turning Dread into Play.&rdquo;
                </p>
                <p className={`text-sm leading-relaxed ${muted}`}>
                  Connect your Canvas LMS course or paste class notes. Read one manageable card at a time with Soundscapes, Kinetic Glow, Focus Sprints, Boss Fights, and your Neural Identity.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: Headphones, label: 'Soundscape Studio' },
                  { icon: Swords, label: 'Boss Fights & XP' },
                  { icon: Zap, label: 'ADHD Superpowers' },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                      darkMode
                        ? 'bg-emerald-500/[0.10] border-emerald-400/25 text-slate-100'
                        : 'bg-white border-[#d6ccb9] text-[#172133]'
                    }`}
                  >
                    <tag.icon size={13} className={darkMode ? 'text-emerald-400' : 'text-emerald-700'} /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/canvas"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(16,185,129,0.35)] transition-all hover:from-emerald-500 hover:to-teal-400"
            >
              <span>Launch Prism Play</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>
        </section>

        {/* Paper & Light High-Contrast Story Section (15.73:1 Contrast Card) */}
        <section
          aria-label="Paper and Light refraction sample"
          className="rounded-[2.25rem] border border-[#d6ccb9] bg-[#faf7f0] p-7 sm:p-9 text-[#172133] shadow-[0_24px_70px_rgba(23,33,51,0.14)] space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <DPrismRoleMark role="prism" size={36} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#92400E]">
                  04 / Paper &amp; Light Clarity · 15.73:1 WCAG AAA Contrast
                </p>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#172133]">
                  Understand it. Start small. Move forward.
                </h3>
              </div>
            </div>
            <span className="rounded-full border border-[#d6ccb9] bg-[#ece5d8] px-3.5 py-1 text-xs font-black text-[#243040]">
              Illustrative example — not live AI output
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#d6ccb9] bg-white p-5 space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                1. Clear Summary
              </p>
              <p className="text-sm font-semibold leading-relaxed text-[#172133]">
                Working memory overloads when dense formatting and unclear instructions pile up at once. Strip away extraneous friction first.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d6ccb9] bg-white p-5 space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-violet-700">
                2. Useful Metaphor
              </p>
              <p className="text-sm font-semibold leading-relaxed text-[#172133]">
                Like sorting a tangled backpack onto three clean trays before starting your homework: keep only the tool you need for the next 5 minutes.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d6ccb9] bg-white p-5 space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                3. One Next Action
              </p>
              <p className="text-sm font-semibold leading-relaxed text-[#172133]">
                Open Card 1 in Prism Play or paste your paragraph into Dassah&apos;s Prism and complete the first 2-minute check.
              </p>
            </div>
          </div>
        </section>

        {/* In Orbit · The Prism Roadmap */}
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
                    ? 'text-cyan-300'
                    : 'text-cyan-700'
                  : item.accent === 'amber'
                  ? darkMode
                    ? 'text-amber-300'
                    : 'text-[#92400E]'
                  : darkMode
                  ? 'text-purple-300'
                  : 'text-purple-700';

              return (
                <motion.button
                  key={item.name}
                  type="button"
                  onClick={() => setRevealedPrototype((prev) => (prev === item.name ? null : item.name))}
                  whileHover={reducedMotion ? undefined : { y: -4 }}
                  className={`group relative text-left overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer ${hoverBorder} ${
                    darkMode
                      ? 'bg-[#070c1b]/90 border-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.65)]'
                      : 'bg-white border-[#d6ccb9] shadow-[0_14px_40px_rgba(23,33,51,0.06)]'
                  }`}
                >
                  <div className={`pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent ${edgeGlow} to-transparent opacity-60 group-hover:opacity-100 transition-opacity`} />

                  <div className="space-y-4 relative z-10 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${
                          item.accent === 'cyan'
                            ? 'bg-cyan-500/15 border-cyan-400/35 text-cyan-400'
                            : item.accent === 'amber'
                            ? 'bg-amber-500/15 border-amber-400/35 text-amber-400'
                            : 'bg-purple-500/15 border-purple-400/35 text-purple-400'
                        }`}
                      >
                        <item.icon size={19} />
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${pillSurface}`}>
                        <Lock size={9} /> {item.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="prism-brand text-2xl font-black italic tracking-tight flex flex-wrap items-baseline gap-2">
                        <span
                          className={`transition-all duration-500 ${
                            isRevealed
                              ? `blur-0 opacity-100 ${neonText}`
                              : `blur-[5px] opacity-75 group-hover:blur-0 group-hover:opacity-100 ${neonText}`
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

                  <div className="relative z-10 w-full pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-bold">
                    <span className={`uppercase tracking-[0.18em] ${muted}`}>
                      {isRevealed ? 'Decrypted' : 'Classified Prototype'}
                    </span>
                    <span className={darkMode ? 'text-cyan-300' : 'text-blue-700'}>
                      {isRevealed ? 'Tap to veil' : 'Hover / Tap to reveal'}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Self-Healing Infinite-Tier Capability Matrix Strip */}
        <section
          aria-label="Prism Engine self-healing resilience"
          className={`rounded-3xl border p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 ${cardSurface}`}
        >
          <div className="flex items-center gap-3.5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 shrink-0">
              <Cpu size={22} />
            </span>
            <div>
              <p className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-amber-300' : 'text-[#92400E]'}`}>
                Self-Healing Capability-Matrix Orchestrator · 4-Tier + OpenRouter Free Pool
              </p>
              <p className={`text-xs sm:text-sm ${muted}`}>
                <strong>Tier 1:</strong> Groq <code>openai/gpt-oss-20b</code> → <strong>Tier 2:</strong> Groq <code>openai/gpt-oss-120b</code> → <strong>Tier 3:</strong> Gemini 2.0 Flash → <strong>Pool:</strong> Verified OpenRouter Free Models → <strong>Tier 4:</strong> Honest <strong>Local Structural Refraction</strong>.
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold ${pillSurface}`}>
            <ShieldCheck size={14} className="text-emerald-500" /> Zero Secret Leaks · Dedicated to DChan
          </span>
        </section>
      </main>
    </div>
  );
}
