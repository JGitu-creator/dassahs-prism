'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Blocks,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Flame,
  Hammer,
  Loader2,
  Lock,
  MessageSquare,
  Moon,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  Trophy,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  buildLocalForgeRefraction,
  FORGE_PRESET_EXAMPLES,
  type ForgeLegoBlock,
  type ForgeMode,
  type ForgeRefractionOutput,
  type LegoBlockColor,
} from '@/features/forge/forgeEngine';

interface SavedForgeBlueprint {
  id: string;
  savedAt: string;
  mode: ForgeMode;
  headline: string;
  languageOrTool: string;
  tldrSignal: string;
  vividMetaphor: string;
  fixedCodeOrCommand: string;
  blockCount: number;
}

interface AskDjTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const FORGE_VAULT_STORAGE_KEY = 'prism_forge_vault_v1';
const FORGE_XP_STORAGE_KEY = 'prism_forge_xp_v1';
const FORGE_THEME_STORAGE_KEY = 'prism_forge_theme_v1';

const MODE_TABS: ReadonlyArray<{
  id: ForgeMode;
  label: string;
  shortTag: string;
  icon: typeof Code2;
  description: string;
}> = [
  {
    id: 'stack_trace',
    label: 'Stack Trace & Error Refractor',
    shortTag: 'Error → Root-Cause LEGOs',
    icon: AlertTriangle,
    description: 'Isolate the crashing frame, snap together the failure chain, and get a 1-click defensive fix.',
  },
  {
    id: 'code_lego',
    label: 'Code & Docs to LEGO Logic',
    shortTag: 'Dense Code → Visual Bricks',
    icon: Blocks,
    description: 'Translate dense functions, async loops, and algorithms into snap-together visual data-flow blocks.',
  },
  {
    id: 'terminal_cli',
    label: 'Terminal & Sandbox CLI Builder',
    shortTag: 'CLI Flags → Safe Pipeline',
    icon: Terminal,
    description: 'Inspect every binary, flag, and pipe with colour-coded safety shields before you press Enter.',
  },
];

function getRankTitle(xp: number): string {
  if (xp >= 450) return 'Focus Architect';
  if (xp >= 280) return 'Forge Master';
  if (xp >= 150) return 'Circuit Builder';
  return 'Novice Observer';
}

function getLegoColorClasses(color: LegoBlockColor, darkMode: boolean): {
  border: string;
  bg: string;
  studBg: string;
  badge: string;
  accentText: string;
} {
  switch (color) {
    case 'rose':
      return {
        border: darkMode ? 'border-rose-400/45' : 'border-rose-300',
        bg: darkMode ? 'bg-gradient-to-br from-rose-950/60 via-[#180a12]/90 to-[#0c070b]/95' : 'bg-rose-50/90',
        studBg: darkMode ? 'bg-rose-500/35 border-rose-300/50' : 'bg-rose-200 border-rose-300',
        badge: darkMode ? 'bg-rose-500/20 text-rose-200 border-rose-400/40' : 'bg-rose-100 text-rose-800 border-rose-300',
        accentText: darkMode ? 'text-rose-300' : 'text-rose-700',
      };
    case 'amber':
      return {
        border: darkMode ? 'border-amber-400/45' : 'border-amber-300',
        bg: darkMode ? 'bg-gradient-to-br from-amber-950/55 via-[#171107]/90 to-[#0c0905]/95' : 'bg-amber-50/90',
        studBg: darkMode ? 'bg-amber-500/35 border-amber-300/50' : 'bg-amber-200 border-amber-300',
        badge: darkMode ? 'bg-amber-500/20 text-amber-200 border-amber-400/40' : 'bg-amber-100 text-amber-800 border-amber-300',
        accentText: darkMode ? 'text-amber-300' : 'text-amber-700',
      };
    case 'emerald':
      return {
        border: darkMode ? 'border-emerald-400/45' : 'border-emerald-300',
        bg: darkMode ? 'bg-gradient-to-br from-emerald-950/55 via-[#071814]/90 to-[#050d0c]/95' : 'bg-emerald-50/90',
        studBg: darkMode ? 'bg-emerald-500/35 border-emerald-300/50' : 'bg-emerald-200 border-emerald-300',
        badge: darkMode ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300',
        accentText: darkMode ? 'text-emerald-300' : 'text-emerald-700',
      };
    case 'blue':
    case 'teal':
    case 'cyan':
    default:
      return {
        border: darkMode ? 'border-cyan-400/45' : 'border-cyan-300',
        bg: darkMode ? 'bg-gradient-to-br from-cyan-950/55 via-[#071521]/90 to-[#050b14]/95' : 'bg-cyan-50/90',
        studBg: darkMode ? 'bg-cyan-500/35 border-cyan-300/50' : 'bg-cyan-200 border-cyan-300',
        badge: darkMode ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40' : 'bg-cyan-100 text-cyan-800 border-cyan-300',
        accentText: darkMode ? 'text-cyan-300' : 'text-cyan-700',
      };
  }
}

export default function PrismForgePage() {
  const defaultPreset = FORGE_PRESET_EXAMPLES[0];
  const [darkMode, setDarkMode] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mode, setMode] = useState<ForgeMode>(defaultPreset.mode);
  const [inputText, setInputText] = useState<string>(defaultPreset.input);
  const [refraction, setRefraction] = useState<ForgeRefractionOutput>(() =>
    buildLocalForgeRefraction(defaultPreset.input, defaultPreset.mode),
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string>('lego-1');
  const [isRefracting, setIsRefracting] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);

  // Gamification & Guided Debugging Quest state
  const [xp, setXp] = useState(50);
  const [completedQuestSteps, setCompletedQuestSteps] = useState<Record<string, boolean>>({});
  const [savedBlueprints, setSavedBlueprints] = useState<SavedForgeBlueprint[]>([]);
  const [vaultBanner, setVaultBanner] = useState<string | null>(null);

  // Ask DJ Pair Programmer state
  const [askDjInput, setAskDjInput] = useState('');
  const [askDjTurns, setAskDjTurns] = useState<AskDjTurn[]>([
    {
      id: 'welcome-turn',
      role: 'assistant',
      text: 'Welcome to Prism Forge. Click any LEGO brick on the workbench to inspect its connections, or ask me how to test and harden this fix.',
    },
  ]);
  const [askDjLoading, setAskDjLoading] = useState(false);
  const [previousInteractionId, setPreviousInteractionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreferences = () => {
      setReducedMotion(mq.matches);
      try {
        const savedTheme = window.localStorage.getItem(FORGE_THEME_STORAGE_KEY);
        if (savedTheme === 'light') setDarkMode(false);

        const savedXp = Number(window.localStorage.getItem(FORGE_XP_STORAGE_KEY));
        if (Number.isFinite(savedXp) && savedXp >= 50) {
          setXp(savedXp);
        }

        const rawVault = window.localStorage.getItem(FORGE_VAULT_STORAGE_KEY);
        if (rawVault) {
          const parsed = JSON.parse(rawVault);
          if (Array.isArray(parsed)) {
            setSavedBlueprints(parsed.slice(0, 20));
          }
        }
      } catch {
        // Ignore storage errors in private browsing
      }
    };
    syncPreferences();
    mq.addEventListener('change', syncPreferences);
    return () => mq.removeEventListener('change', syncPreferences);
  }, []);

  const awardXp = (amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      try {
        window.localStorage.setItem(FORGE_XP_STORAGE_KEY, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(FORGE_THEME_STORAGE_KEY, next ? 'dark' : 'light');
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const selectedBlock: ForgeLegoBlock | undefined = useMemo(() => {
    return (
      refraction.legoBlocks.find((b) => b.id === selectedBlockId)
      || refraction.legoBlocks[0]
    );
  }, [refraction.legoBlocks, selectedBlockId]);

  const handleSelectPreset = (presetId: string) => {
    const found = FORGE_PRESET_EXAMPLES.find((p) => p.id === presetId);
    if (!found) return;
    setMode(found.mode);
    setInputText(found.input);
    const localPreview = buildLocalForgeRefraction(found.input, found.mode);
    setRefraction(localPreview);
    setSelectedBlockId(localPreview.legoBlocks[0]?.id || 'lego-1');
    setCompletedQuestSteps({});
  };

  const handleSwitchMode = (nextMode: ForgeMode) => {
    setMode(nextMode);
    if (inputText.trim()) {
      const localPreview = buildLocalForgeRefraction(inputText, nextMode);
      setRefraction(localPreview);
      setSelectedBlockId(localPreview.legoBlocks[0]?.id || 'lego-1');
    }
  };

  const handleRunForgeRefraction = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isRefracting) return;

    setIsRefracting(true);
    setCompletedQuestSteps({});
    try {
      const response = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refract',
          text: trimmed,
          mode,
        }),
      });
      if (!response.ok) {
        const localFallback = buildLocalForgeRefraction(trimmed, mode);
        setRefraction(localFallback);
        setSelectedBlockId(localFallback.legoBlocks[0]?.id || 'lego-1');
      } else {
        const data = (await response.json()) as ForgeRefractionOutput;
        setRefraction(data);
        setSelectedBlockId(data.legoBlocks?.[0]?.id || 'lego-1');
        awardXp(25);
      }
    } catch {
      const localFallback = buildLocalForgeRefraction(trimmed, mode);
      setRefraction(localFallback);
      setSelectedBlockId(localFallback.legoBlocks[0]?.id || 'lego-1');
    } finally {
      setIsRefracting(false);
    }
  };

  const handleToggleQuestStep = (stepId: string, xpReward: number) => {
    setCompletedQuestSteps((prev) => {
      const alreadyDone = Boolean(prev[stepId]);
      if (!alreadyDone) {
        awardXp(xpReward);
      }
      return { ...prev, [stepId]: !alreadyDone };
    });
  };

  const handleCopyFix = async () => {
    try {
      await navigator.clipboard.writeText(refraction.fixedCodeOrCommand);
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 1800);
    } catch {
      // Fallback
    }
  };

  const handleSaveToVault = () => {
    const newEntry: SavedForgeBlueprint = {
      id: `blueprint-${Date.now()}`,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: refraction.mode,
      headline: refraction.headline,
      languageOrTool: refraction.languageOrTool,
      tldrSignal: refraction.tldrSignal,
      vividMetaphor: refraction.vividMetaphor,
      fixedCodeOrCommand: refraction.fixedCodeOrCommand,
      blockCount: refraction.legoBlocks.length,
    };

    setSavedBlueprints((prev) => {
      const updated = [newEntry, ...prev].slice(0, 20);
      try {
        window.localStorage.setItem(FORGE_VAULT_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
    awardXp(15);
    setVaultBanner('Saved LEGO Blueprint to Private Local Browser Vault (+15 XP)');
    setTimeout(() => setVaultBanner(null), 3000);
  };

  const handleDeleteBlueprint = (id: string) => {
    setSavedBlueprints((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        window.localStorage.setItem(FORGE_VAULT_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleAskDjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = askDjInput.trim();
    if (!question || askDjLoading) return;

    const userTurn: AskDjTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
    };
    setAskDjTurns((prev) => [...prev, userTurn]);
    setAskDjInput('');
    setAskDjLoading(true);

    const forgeContext = [
      `Mode: ${refraction.mode} (${refraction.languageOrTool})`,
      `Headline: ${refraction.headline}`,
      `TLDR: ${refraction.tldrSignal}`,
      `Root Cause: ${refraction.rootCause}`,
      `Selected Brick: ${selectedBlock ? `${selectedBlock.title} - ${selectedBlock.plainMeaning}` : 'None'}`,
      `Fixed Output:\n${refraction.fixedCodeOrCommand}`,
    ].join('\n');

    try {
      const response = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask_dj',
          question,
          forgeContext,
          history: askDjTurns.slice(-6).map((t) => ({ role: t.role, text: t.text })),
          previousInteractionId,
        }),
      });
      const data = await response.json();
      if (typeof data?.interactionId === 'string') {
        setPreviousInteractionId(data.interactionId);
      }
      const replyText =
        typeof data?.reply === 'string' && data.reply.trim()
          ? data.reply
          : 'Local Structural Refraction: Inspect the red Fault Brick and green Snap-In Fix Brick first, then verify types at the entry frame.';
      setAskDjTurns((prev) => [
        ...prev,
        {
          id: `dj-${Date.now()}`,
          role: 'assistant',
          text: replyText,
        },
      ]);
      awardXp(10);
    } catch {
      setAskDjTurns((prev) => [
        ...prev,
        {
          id: `dj-fallback-${Date.now()}`,
          role: 'assistant',
          text: 'Local Structural Refraction: Check Step 1 of your Guided Debugging Quest and verify the guard clause around your crashing variable.',
        },
      ]);
    } finally {
      setAskDjLoading(false);
    }
  };

  const pageBg = darkMode
    ? 'bg-[#040814] text-slate-100'
    : 'bg-[#f4f0e6] text-[#172133]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const cardSurface = darkMode
    ? 'bg-[#091224]/85 border-cyan-400/20 shadow-[0_28px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]'
    : 'bg-[#faf7f0]/95 border-[#d5cbb8] shadow-[0_20px_60px_rgba(23,33,51,0.08)]';
  const pillSurface = darkMode
    ? 'bg-white/[0.06] border-white/12 text-slate-200'
    : 'bg-[#ebe4d6] border-[#d5cbb8] text-[#1e293b]';

  const completedQuestCount = refraction.debuggingQuest.filter(
    (s) => completedQuestSteps[s.id],
  ).length;

  return (
    <div className={`relative min-h-screen overflow-x-hidden transition-colors duration-500 ${pageBg}`}>
      {/* Ambient Liquid-Glass Cyan/Teal Workbench Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? 'radial-gradient(820px circle at 20% 15%, rgba(34,211,238,0.18), rgba(16,185,129,0.10) 42%, transparent 72%)'
              : 'radial-gradient(760px circle at 20% 15%, rgba(8,145,178,0.12), rgba(16,185,129,0.08) 42%, transparent 72%)',
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/engine"
            id="forge-back-to-engine"
            className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black transition-all hover:border-cyan-400/60 ${pillSurface}`}
          >
            <ArrowLeft size={14} className="text-cyan-400" />
            <span>Prism Engine</span>
          </Link>

          <Link
            href="/"
            id="forge-to-focus-link"
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition-all hover:border-blue-400/50 ${pillSurface}`}
          >
            <span>Prism Focus</span>
          </Link>

          <Link
            href="/canvas"
            id="forge-to-play-link"
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition-all hover:border-emerald-400/50 ${pillSurface}`}
          >
            <span>Prism Play</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Route Telemetry Pill */}
          <span
            id="forge-engine-status-pill"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider ${
              refraction.routeMeta.isLocalFallback
                ? darkMode
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                  : 'bg-amber-100 border-amber-300 text-amber-900'
                : darkMode
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                  : 'bg-cyan-100 border-cyan-300 text-cyan-900'
            }`}
          >
            <Cpu size={12} />
            <span>
              {refraction.routeMeta.isLocalFallback
                ? 'Local Structural Refraction'
                : `PRISM ENGINE · ${refraction.routeMeta.label}`}
            </span>
          </span>

          {/* Ascension Rank & XP Counter */}
          <span
            id="forge-xp-badge"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-black ${
              darkMode
                ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
                : 'bg-emerald-100 border-emerald-300 text-emerald-900'
            }`}
          >
            <Trophy size={12} className="text-amber-400" />
            <span>{xp} XP · {getRankTitle(xp)}</span>
          </span>

          <button
            type="button"
            id="forge-theme-toggle"
            onClick={toggleTheme}
            aria-label={darkMode ? 'Switch to Soft Paper Light Mode' : 'Switch to Dark Mode'}
            className={`rounded-2xl border p-2.5 transition-colors cursor-pointer ${pillSurface}`}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Prism Forge Workbench */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-2 pb-20 sm:px-8 space-y-8">
        {/* Hero Header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">
              <Hammer size={12} /> Dassah&apos;s Prism Engine · Dastastic Engineering Workbench
            </div>
            <h1 className="prism-brand text-4xl sm:text-6xl font-black italic tracking-tight leading-none">
              Prism{' '}
              <span
                className={`inline-block pr-2 bg-clip-text text-transparent ${
                  darkMode
                    ? 'bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 drop-shadow-[0_0_26px_rgba(34,211,238,0.45)]'
                    : 'bg-gradient-to-r from-cyan-700 via-teal-700 to-emerald-700'
                }`}
              >
                Forge
              </span>
            </h1>
            <p className={`text-sm sm:text-base font-medium leading-relaxed ${muted}`}>
              <strong className={darkMode ? 'text-white' : 'text-slate-900'}>
                Turning Cryptic Stack Traces &amp; Dense Code into Visual LEGO Brick Logic.
              </strong>{' '}
              Paste any runtime error, source function, or shell pipeline and watch{' '}
              <strong className={darkMode ? 'text-cyan-300' : 'text-cyan-700'}>The Prism Engine ∞</strong>{' '}
              snap it into root-cause bricks, real-world analogies, and a guided debugging quest.
            </p>
          </div>

          {/* Preset Quick-Load Blueprints */}
          <div className="space-y-2">
            <p className={`text-[11px] font-black uppercase tracking-wider ${muted}`}>
              Instant Sample Blueprints
            </p>
            <div className="flex flex-wrap gap-2">
              {FORGE_PRESET_EXAMPLES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  id={`forge-preset-${preset.id}`}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    inputText === preset.input
                      ? darkMode
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
                        : 'bg-cyan-100 border-cyan-500 text-cyan-900'
                      : pillSurface
                  }`}
                >
                  <Sparkles size={11} className="text-cyan-400" />
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Mode Selector Bar */}
        <section aria-label="Prism Forge Modes" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODE_TABS.map((tab) => {
            const active = mode === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                id={`forge-mode-${tab.id}`}
                onClick={() => handleSwitchMode(tab.id)}
                className={`text-left rounded-3xl border p-5 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  active
                    ? darkMode
                      ? 'bg-gradient-to-br from-cyan-950/80 via-[#0b192e]/90 to-[#07101f]/95 border-cyan-400/70 shadow-[0_18px_50px_rgba(34,211,238,0.22)]'
                      : 'bg-white border-cyan-600 shadow-md'
                    : cardSurface
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${
                      active
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-cyan-400'
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      active
                        ? darkMode
                          ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200'
                          : 'bg-cyan-100 border-cyan-300 text-cyan-900'
                        : pillSurface
                    }`}
                  >
                    {tab.shortTag}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">{tab.label}</h2>
                  <p className={`text-xs mt-1 leading-relaxed ${muted}`}>{tab.description}</p>
                </div>
              </button>
            );
          })}
        </section>

        {vaultBanner && (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-xs font-black text-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              {vaultBanner}
            </span>
          </div>
        )}

        {/* Two-Column Split: Left Input & Fixed Code Chamber | Right Visual LEGO Brick Assembly Stage */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* LEFT COLUMN (5 cols): Raw Input Chamber + Snap-In Fixed Code / Command Output */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`rounded-[2rem] border p-6 backdrop-blur-2xl space-y-4 ${cardSurface}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code2 size={18} className="text-cyan-400" />
                  <h2 className="text-sm font-black uppercase tracking-wider">
                    Raw Input Chamber
                  </h2>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${pillSurface}`}>
                  {refraction.languageOrTool}
                </span>
              </div>

              <textarea
                id="forge-raw-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={9}
                placeholder="Paste a stack trace, error log, dense function, or terminal command pipeline..."
                className={`w-full rounded-2xl border p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${
                  darkMode
                    ? 'bg-[#040915]/90 border-white/15 text-cyan-100 placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  id="forge-refract-submit"
                  onClick={handleRunForgeRefraction}
                  disabled={isRefracting || !inputText.trim()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 px-5 py-3.5 text-xs sm:text-sm font-black text-white shadow-[0_14px_35px_rgba(34,211,238,0.32)] transition-all hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                >
                  {isRefracting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Forging Visual LEGO Bricks...</span>
                    </>
                  ) : (
                    <>
                      <Blocks size={16} />
                      <span>Refract into LEGO Bricks</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="forge-save-vault-btn"
                  onClick={handleSaveToVault}
                  className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-3.5 text-xs font-black transition-all cursor-pointer hover:border-cyan-400/50 ${pillSurface}`}
                >
                  <BookmarkCheck size={15} className="text-emerald-400" />
                  <span>Save to Vault</span>
                </button>
              </div>
            </div>

            {/* Snap-In Fixed Code / Safe Command Output Card */}
            <div className={`rounded-[2rem] border p-6 backdrop-blur-2xl space-y-4 ${cardSurface}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wrench size={17} className="text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    {mode === 'terminal_cli' ? 'Verified CLI Pipeline' : 'Snap-In Defensive Fix'}
                  </h3>
                </div>
                <button
                  type="button"
                  id="forge-copy-fix-btn"
                  onClick={handleCopyFix}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${pillSurface}`}
                >
                  {copiedFix ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-cyan-400" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                className={`overflow-x-auto rounded-2xl border p-4 font-mono text-xs leading-relaxed ${
                  darkMode
                    ? 'bg-[#041118]/90 border-emerald-400/30 text-emerald-200'
                    : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                }`}
              >
                <code>{refraction.fixedCodeOrCommand}</code>
              </pre>

              <p className={`text-xs leading-relaxed ${muted}`}>
                <strong className={darkMode ? 'text-emerald-300' : 'text-emerald-800'}>
                  Why this locks flush:
                </strong>{' '}
                {refraction.fixExplanation}
              </p>
            </div>

            {/* Terminal Token Safety Inspector (always populated, highlighted in terminal_cli mode) */}
            {refraction.commandTokens.length > 0 && (
              <div className={`rounded-[2rem] border p-6 backdrop-blur-2xl space-y-4 ${cardSurface}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={17} className="text-cyan-400" />
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Token &amp; Flag Safety Inspector
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400">
                    {refraction.commandTokens.length} tokens parsed
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {refraction.commandTokens.map((tok, idx) => (
                    <div
                      key={`${tok.token}-${idx}`}
                      className={`rounded-2xl border p-3 flex flex-col gap-1 ${
                        tok.safetyLevel === 'destructive'
                          ? darkMode
                            ? 'border-rose-400/40 bg-rose-950/35'
                            : 'border-rose-300 bg-rose-50'
                          : tok.safetyLevel === 'caution'
                            ? darkMode
                              ? 'border-amber-400/40 bg-amber-950/35'
                              : 'border-amber-300 bg-amber-50'
                            : darkMode
                              ? 'border-white/10 bg-white/[0.03]'
                              : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <code className="font-mono text-xs font-black text-cyan-400">
                          {tok.token}
                        </code>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase">
                            {tok.role}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                              tok.safetyLevel === 'destructive'
                                ? 'bg-rose-500/25 text-rose-300'
                                : tok.safetyLevel === 'caution'
                                  ? 'bg-amber-500/25 text-amber-300'
                                  : 'bg-emerald-500/25 text-emerald-300'
                            }`}
                          >
                            {tok.safetyLevel}
                          </span>
                        </div>
                      </div>
                      <p className={`text-xs ${muted}`}>{tok.plainMeaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (7 cols): Executive Signal + Visual LEGO Brick Assembly Workbench + Quest + Ask DJ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Executive Signal + Vivid LEGO Analogy Banner */}
            <div className={`rounded-[2rem] border p-6 sm:p-7 backdrop-blur-2xl space-y-5 ${cardSurface}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-cyan-300">
                  <Zap size={12} className="text-amber-400" /> 1 · Executive Signal &amp; Root Cause
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {refraction.keyTerms.map((term) => (
                    <span
                      key={term}
                      className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${pillSurface}`}
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {refraction.headline}
                </h2>
                <p className={`text-sm leading-relaxed ${muted}`}>{refraction.tldrSignal}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  className={`rounded-2xl border p-4 space-y-1.5 ${
                    darkMode
                      ? 'border-cyan-400/30 bg-cyan-950/35'
                      : 'border-cyan-200 bg-cyan-50/70'
                  }`}
                >
                  <p className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                    2 · Vivid Real-World LEGO Analogy
                  </p>
                  <p className="text-xs sm:text-sm font-bold leading-relaxed">
                    {refraction.vividMetaphor}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-4 space-y-1.5 ${
                    darkMode
                      ? 'border-emerald-400/30 bg-emerald-950/35'
                      : 'border-emerald-200 bg-emerald-50/70'
                  }`}
                >
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    3 · Momentum Spark
                  </p>
                  <p className="text-xs sm:text-sm font-bold leading-relaxed">
                    {refraction.dopamineHook}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Visual LEGO Brick Logic Workbench */}
            <div className={`rounded-[2rem] border p-6 sm:p-7 backdrop-blur-2xl space-y-5 ${cardSurface}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <Blocks size={19} className="text-cyan-400" />
                    <span>Visual LEGO Brick Logic Assembly</span>
                  </h3>
                  <p className={`text-xs ${muted}`}>
                    Tap any brick to inspect its real-world analogy and data-flow studs.
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${pillSurface}`}>
                  {refraction.legoBlocks.length} Snap-Together Bricks
                </span>
              </div>

              {/* LEGO Brick Stack */}
              <div className="space-y-4">
                {refraction.legoBlocks.map((brick, index) => {
                  const palette = getLegoColorClasses(brick.color, darkMode);
                  const isSelected = selectedBlock?.id === brick.id;
                  return (
                    <motion.div
                      key={brick.id}
                      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.06 }}
                      onClick={() => setSelectedBlockId(brick.id)}
                      className="relative cursor-pointer"
                    >
                      {/* Top Physical LEGO Studs Row */}
                      <div className="flex items-center gap-2.5 pl-6 -mb-1.5 relative z-10">
                        {[0, 1, 2, 3].map((stud) => (
                          <span
                            key={stud}
                            className={`h-2.5 w-6 rounded-t-md border-t border-x transition-transform ${palette.studBg} ${
                              isSelected ? 'scale-105' : ''
                            }`}
                          />
                        ))}
                      </div>

                      {/* LEGO Brick Body */}
                      <div
                        className={`rounded-2xl border-2 p-5 transition-all ${palette.border} ${palette.bg} ${
                          isSelected
                            ? 'ring-2 ring-cyan-400/70 shadow-[0_14px_40px_rgba(34,211,238,0.20)]'
                            : 'opacity-95 hover:opacity-100'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-black uppercase ${palette.badge}`}>
                              Brick {brick.stepNumber} · {brick.category}
                            </span>
                            <h4 className="text-sm sm:text-base font-black">{brick.title}</h4>
                          </div>
                          {brick.connectsTo && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${palette.accentText}`}>
                              <span>Snaps into</span>
                              <ArrowRight size={12} />
                              <span>{brick.connectsTo}</span>
                            </span>
                          )}
                        </div>

                        <div
                          className={`rounded-xl border px-3.5 py-2 font-mono text-xs mb-3 overflow-x-auto ${
                            darkMode
                              ? 'bg-black/45 border-white/10 text-slate-200'
                              : 'bg-white/90 border-slate-200 text-slate-900'
                          }`}
                        >
                          <code>{brick.codeFragment}</code>
                        </div>

                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                          {brick.plainMeaning}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                          <span className={`font-bold ${palette.accentText}`}>
                            Analogy: {brick.realWorldAnalogy}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Guided Debugging Quest Checklist (+XP Rewards) */}
            <div className={`rounded-[2rem] border p-6 sm:p-7 backdrop-blur-2xl space-y-4 ${cardSurface}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Flame size={19} className="text-amber-400" />
                  <h3 className="text-base font-black tracking-tight">
                    Guided Debugging Quest
                  </h3>
                </div>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">
                  {completedQuestCount} / {refraction.debuggingQuest.length} Steps Cleared
                </span>
              </div>

              <div className="space-y-3">
                {refraction.debuggingQuest.map((step) => {
                  const done = Boolean(completedQuestSteps[step.id]);
                  return (
                    <div
                      key={step.id}
                      onClick={() => handleToggleQuestStep(step.id, step.xpReward)}
                      className={`rounded-2xl border p-4 transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        done
                          ? darkMode
                            ? 'border-emerald-400/50 bg-emerald-950/40'
                            : 'border-emerald-400 bg-emerald-50'
                          : darkMode
                            ? 'border-white/10 bg-white/[0.03] hover:border-cyan-400/40'
                            : 'border-slate-200 bg-white hover:border-cyan-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${
                            done
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : 'border-cyan-400/40 text-cyan-400'
                          }`}
                        >
                          {done ? <Check size={14} /> : step.stepNumber}
                        </span>
                        <div className="space-y-1">
                          <p className={`text-sm font-black ${done ? 'line-through opacity-75' : ''}`}>
                            {step.title}
                          </p>
                          <p className={`text-xs leading-relaxed ${muted}`}>{step.action}</p>
                          <p className="text-[11px] font-bold text-cyan-400">
                            Verify: {step.verification}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-black text-amber-300">
                        +{step.xpReward} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ask DJ Pair-Programmer Interactive Console */}
            <div className={`rounded-[2rem] border p-6 sm:p-7 backdrop-blur-2xl space-y-4 ${cardSurface}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-cyan-400" />
                  <h3 className="text-base font-black tracking-tight">
                    Ask DJ · Pair-Programmer Console
                  </h3>
                </div>
                <span className={`text-[11px] font-bold ${muted}`}>
                  Stateful Context Locked to Brick #{selectedBlock?.stepNumber || 1}
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {askDjTurns.map((turn) => (
                  <div
                    key={turn.id}
                    className={`rounded-2xl border p-3.5 text-xs leading-relaxed ${
                      turn.role === 'user'
                        ? darkMode
                          ? 'ml-8 border-cyan-400/35 bg-cyan-950/40 text-cyan-100'
                          : 'ml-8 border-cyan-300 bg-cyan-50 text-cyan-950'
                        : darkMode
                          ? 'mr-4 border-white/10 bg-white/[0.04] text-slate-200'
                          : 'mr-4 border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1 text-cyan-400">
                      {turn.role === 'user' ? 'You' : 'Ask DJ · Forge Pair Programmer'}
                    </p>
                    <p>{turn.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAskDjSubmit} className="flex items-center gap-2">
                <input
                  id="forge-ask-dj-input"
                  type="text"
                  value={askDjInput}
                  onChange={(e) => setAskDjInput(e.target.value)}
                  placeholder="Ask DJ why this brick failed or how to write a unit test for it..."
                  className={`flex-1 rounded-2xl border px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${
                    darkMode
                      ? 'bg-[#040915]/90 border-white/15 text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  id="forge-ask-dj-submit"
                  disabled={askDjLoading || !askDjInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-3 text-xs font-black text-white transition-all cursor-pointer"
                >
                  {askDjLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Ask DJ</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Private Local Browser Vault of Saved LEGO Blueprints */}
        <section className={`rounded-[2rem] border p-6 sm:p-7 backdrop-blur-2xl space-y-4 ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock size={17} className="text-emerald-400" />
              <h3 className="text-base font-black tracking-tight">
                Vault of Artifacts · Saved LEGO Blueprints
              </h3>
            </div>
            <span className={`text-xs font-bold ${muted}`}>
              100% Browser-Private Local Storage · {savedBlueprints.length} saved
            </span>
          </div>

          {savedBlueprints.length === 0 ? (
            <p className={`text-xs ${muted}`}>
              No blueprints saved yet. Click &ldquo;Save to Vault&rdquo; on any refraction to bookmark the root-cause LEGO recipe and defensive fix.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedBlueprints.map((bp) => (
                <div
                  key={bp.id}
                  className={`rounded-2xl border p-4 space-y-2.5 flex flex-col justify-between ${
                    darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-cyan-400">
                      <span>{bp.languageOrTool} · {bp.blockCount} Bricks</span>
                      <span>{bp.savedAt}</span>
                    </div>
                    <h4 className="text-sm font-black">{bp.headline}</h4>
                    <p className={`text-xs line-clamp-2 ${muted}`}>{bp.tldrSignal}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setMode(bp.mode);
                        setInputText(bp.fixedCodeOrCommand);
                        setRefraction(buildLocalForgeRefraction(bp.fixedCodeOrCommand, bp.mode));
                      }}
                      className="text-xs font-black text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      Load onto Workbench →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlueprint(bp.id)}
                      aria-label="Delete saved blueprint"
                      className="text-slate-400 hover:text-rose-400 cursor-pointer p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer Dedication & Security Badge */}
        <footer className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className={muted}>
            <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Prism Forge</strong> · Built with Christian founder purpose &amp; dedicated to DChan · Powered by{' '}
            <strong className="text-cyan-400">The Prism Engine ∞</strong>
          </p>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-black ${pillSurface}`}>
            <ShieldCheck size={13} className="text-emerald-400" /> Zero Secret Leaks · 4-Tier Self-Healing
          </span>
        </footer>
      </main>
    </div>
  );
}
