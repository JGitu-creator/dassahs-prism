'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Copy,
  Crown,
  Eye,
  Flame,
  Headphones,
  Heart,
  Layers,
  Loader2,
  MessageCircle,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Timer,
  Trash2,
  Upload,
  Wand2,
  Wind,
  Wrench,
  X,
} from 'lucide-react';
import {
  FORGE_PRESET_EXAMPLES,
  suggestForgeSnippetName,
  type ForgeMode,
  type ForgeRefractionOutput,
} from '@/features/forge/forgeEngine';
import { BionicText } from '@/components/prism/BionicText';
import { ReadAloud } from '@/components/prism/ReadAloud';
import { PrismFooter } from '@/components/prism/PrismFooter';
import { PrismSwitcherPopover } from '@/components/prism/PrismSwitcherPopover';
import { PrismTourOverlay, type TourStep } from '@/components/prism/PrismTourOverlay';
import { useEngageShortcut } from '@/components/prism/useEngageShortcut';
import { SensorySoundscapeBar } from '@/components/canvas/SensoryAndTools';

type ForgeThemeId = 'ember' | 'copper' | 'midnight' | 'obsidian';

interface ForgeTheme {
  id: ForgeThemeId;
  label: string;
  swatch: string;
  darkBg: string;
  darkCard: string;
  darkInner: string;
  lightBg: string;
  lightCard: string;
  lightInner: string;
  lightMuted: string;
  accentBtn: string;
  accentText: string;
}

const FORGE_THEMES: Record<ForgeThemeId, ForgeTheme> = {
  ember: {
    id: 'ember',
    label: 'Molten Amber',
    swatch: '#d97706',
    darkBg: 'bg-[#140c05] text-amber-50',
    darkCard: 'bg-[#1e1309]/90 border-amber-500/20 shadow-[0_24px_80px_rgba(0,0,0,0.55)]',
    darkInner: 'bg-[#150d06]/90 border-amber-500/15 text-amber-50',
    lightBg: 'bg-[#eae2d3] text-[#1c1711]',
    lightCard: 'bg-[#f3ede0]/95 border-[#c9bda8] shadow-[0_18px_50px_rgba(28,23,17,0.08)]',
    lightInner: 'bg-[#e5dccb] border-[#cfc3ae] text-[#1c1711]',
    lightMuted: 'text-[#574c3f]',
    accentBtn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
    accentText: 'text-amber-500',
  },
  copper: {
    id: 'copper',
    label: 'Ember Rose',
    swatch: '#e11d48',
    darkBg: 'bg-[#1a080d] text-rose-50',
    darkCard: 'bg-[#2a0f18]/92 border-rose-500/30 shadow-[0_24px_80px_rgba(225,29,72,0.22)]',
    darkInner: 'bg-[#1d0a10]/90 border-rose-500/20 text-rose-50',
    lightBg: 'bg-[#f0e2e4] text-[#33131d]',
    lightCard: 'bg-[#f8eff0]/95 border-[#dcbec4] shadow-[0_18px_50px_rgba(51,19,29,0.08)]',
    lightInner: 'bg-[#ebd9dc] border-[#d4b3ba] text-[#33131d]',
    lightMuted: 'text-[#663947]',
    accentBtn: 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500',
    accentText: 'text-rose-400',
  },
  midnight: {
    id: 'midnight',
    label: 'Night Forge',
    swatch: '#2563eb',
    darkBg: 'bg-[#070d1d] text-slate-100',
    darkCard: 'bg-[#0f172a]/92 border-blue-400/25 shadow-[0_24px_80px_rgba(37,99,235,0.2)]',
    darkInner: 'bg-[#080f21]/90 border-blue-400/15 text-slate-100',
    lightBg: 'bg-[#e3e7ee] text-[#141c2b]',
    lightCard: 'bg-[#eef1f6]/95 border-[#c0c9d8] shadow-[0_18px_50px_rgba(20,28,43,0.08)]',
    lightInner: 'bg-[#dce2ec] border-[#b7c2d4] text-[#141c2b]',
    lightMuted: 'text-[#425066]',
    accentBtn: 'bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500',
    accentText: 'text-blue-400',
  },
  obsidian: {
    id: 'obsidian',
    label: 'Quiet Slate',
    swatch: '#78716c',
    darkBg: 'bg-[#111110] text-stone-100',
    darkCard: 'bg-[#1c1b19]/92 border-stone-500/25 shadow-[0_24px_80px_rgba(0,0,0,0.55)]',
    darkInner: 'bg-[#151412]/90 border-stone-500/15 text-stone-100',
    lightBg: 'bg-[#e8e4dc] text-[#1f1c18]',
    lightCard: 'bg-[#f2efe9]/95 border-[#c9c2b6] shadow-[0_18px_50px_rgba(31,28,24,0.08)]',
    lightInner: 'bg-[#e2ddd3] border-[#c2bbae] text-[#1f1c18]',
    lightMuted: 'text-[#575046]',
    accentBtn: 'bg-gradient-to-r from-stone-700 to-amber-700 hover:from-stone-600 hover:to-amber-600',
    accentText: 'text-stone-400',
  },
};

interface SavedForgeSnippet {
  id: string;
  name: string;
  mode: ForgeMode;
  language: string;
  originalInput: string;
  headline: string;
  tldrSignal: string;
  fixedCodeOrCommand: string;
  savedAt: string;
}

interface ForgeVaultState {
  xp: number;
  snippets: SavedForgeSnippet[];
  stackNames: Record<number, string>;
}

const FORGE_VAULT_KEY = 'prism_forge_vault_v2';
const FORGE_PREFS_KEY = 'prism_forge_prefs_v2';

const ASCENSION_RANKS = [
  { minXp: 0, title: 'Novice Observer' },
  { minXp: 100, title: 'Calm Translator' },
  { minXp: 250, title: 'Pattern Builder' },
  { minXp: 500, title: 'Clarity Smith' },
  { minXp: 900, title: 'Focus Architect' },
] as const;

function getAscensionRank(xp: number): string {
  let rank: string = ASCENSION_RANKS[0].title;
  for (const r of ASCENSION_RANKS) {
    if (xp >= r.minXp) rank = r.title;
  }
  return rank;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const MODE_OPTIONS: ReadonlyArray<{
  id: ForgeMode;
  label: string;
  helper: string;
  aiFocus: string;
  placeholder: string;
  icon: typeof Wrench;
}> = [
  {
    id: 'stack_trace',
    label: 'Fix a Scary Error or Formula',
    helper: 'Excel #REF!, red website errors, or crash messages',
    aiFocus: 'AI will translate why it broke into plain English and give you a 1-click fixed formula or code.',
    placeholder: 'Paste your broken Excel/Sheets formula (#REF!, VLOOKUP) or angry red error message here...',
    icon: ShieldAlert,
  },
  {
    id: 'code_lego',
    label: 'Explain Code Step-by-Step',
    helper: 'Homework loops, scripts, or confusing functions',
    aiFocus: 'AI will break each line into plain-English building blocks with real-life analogies.',
    placeholder: 'Paste a confusing homework loop, script, or function you want explained in plain English...',
    icon: Layers,
  },
  {
    id: 'terminal_cli',
    label: 'Check a Command Safely',
    helper: 'Know what a computer command does before running it',
    aiFocus: 'AI will inspect every single word of the command and label whether it is Safe, Caution, or Destructive.',
    placeholder: 'Paste a terminal / Git / Docker command here to check if it is safe before pressing Enter...',
    icon: Terminal,
  },
];

const FORGE_POINTER_TOUR_STEPS: readonly TourStep[] = [
  {
    selector: '[data-tour="forge-engine-switcher"]',
    title: 'Switch Prisms Anytime',
    description: 'Tap Prism Engine here to jump neatly between Forge, Focus, Play, Word, or the main Engine Hub.',
  },
  {
    selector: '[data-tour="forge-neural-command"]',
    title: 'Neural Command',
    description: 'Preview distinct Forge colour vibes live and choose between Before & After Split Card or Single Calm Card.',
  },
  {
    selector: '[data-tour="forge-neural-identity"]',
    title: 'Neural Identity',
    description: 'Turn on Bionic Word Anchors, Easy-Read Lexend font, or Warm Sandstone Light Mode for your eyes.',
  },
  {
    selector: '[data-tour="forge-mode-tabs"]',
    title: 'Tell the AI What You Need',
    description: 'Pick whether the AI should fix an error/formula, explain code step-by-step, or check a command for safety.',
  },
  {
    selector: '[data-tour="forge-unstick-btn"]',
    title: 'Unstick Me (Calm Reset)',
    description: 'Feeling overwhelmed by red errors? Tap Unstick Me for a gentle 4-4-4 breathing pause — nothing is ruined.',
  },
  {
    selector: '[data-tour="forge-melt-btn"]',
    title: 'Melt the Jargon',
    description: 'Press this button to let the AI translate your pasted text into plain English, snap-blocks, and a 1-click fix.',
  },
  {
    selector: '[data-tour="forge-bottom-dock"]',
    title: 'ADHD Support Dock & Ask DJ',
    description: 'Brown Noise / Rain soundscapes, gentle Focus Sprints, Bionic toggle, and Ask DJ (your patient friend) live tucked right here.',
  },
  {
    selector: '[data-tour="forge-vault-section"]',
    title: '5-Stack Window-Tile Vault',
    description: 'Your personal recollection of solved problems + fixes. Every 5 saves bundle into a stack that fans open on hover — click any tile to view the problem & solution!',
  },
];

export default function PrismForgePage() {
  // Visual & ADHD Reading Comfort
  const [darkMode, setDarkMode] = useState(true);
  const [themeId, setThemeId] = useState<ForgeThemeId>('ember');
  const [bionicOn, setBionicOn] = useState(false);
  const [easyReadOn, setEasyReadOn] = useState(true);
  const [singleCardLayout, setSingleCardLayout] = useState(false); // false = Option 2 (Before & After Split Card), true = Option 1 (Single Calm Card)
  const [beforeCollapsed, setBeforeCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Core Forge State
  const [mode, setMode] = useState<ForgeMode>('stack_trace');
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ForgeRefractionOutput | null>(null);
  const [completedQuestSteps, setCompletedQuestSteps] = useState<Record<string, boolean>>({});
  const [copiedFix, setCopiedFix] = useState(false);

  // Save Snippet Name Prompt
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [draftSnippetName, setDraftSnippetName] = useState('');

  // Vault (Progressive 5-Stack Window Tiles)
  const [xp, setXp] = useState(0);
  const [snippets, setSnippets] = useState<SavedForgeSnippet[]>([]);
  const [stackNames, setStackNames] = useState<Record<number, string>>({});
  const [vaultSearch, setVaultSearch] = useState('');
  const [showArchivedStacks, setShowArchivedStacks] = useState(false);
  const [editingStackIdx, setEditingStackIdx] = useState<number | null>(null);
  const [editingStackDraft, setEditingStackDraft] = useState('');
  const [activeHoverStack, setActiveHoverStack] = useState<number | null>(null);
  const [viewingSnippet, setViewingSnippet] = useState<SavedForgeSnippet | null>(null);
  const [copiedVaultFix, setCopiedVaultFix] = useState(false);

  // ADHD Support Modals & Docks
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showUnstickBreath, setShowUnstickBreath] = useState(false);
  const [soundStudioOpen, setSoundStudioOpen] = useState(false);
  const [sprintOpen, setSprintOpen] = useState(false);
  const [sprintSecsLeft, setSprintSecsLeft] = useState(0);
  const [sprintTotalSecs, setSprintTotalSecs] = useState(0);
  const [sprintRunning, setSprintRunning] = useState(false);
  const [tourTrigger, setTourTrigger] = useState(0);

  // Ask DJ Friend Helper
  const [askDjOpen, setAskDjOpen] = useState(false);
  const [askDjInput, setAskDjInput] = useState('');
  const [askDjHistory, setAskDjHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [askDjLoading, setAskDjLoading] = useState(false);
  const [djInteractionId, setDjInteractionId] = useState<string | undefined>(undefined);

  const afterSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEngageShortcut(showCommandModal, () => setShowCommandModal(false));
  useEngageShortcut(showIdentityModal, () => setShowIdentityModal(false));

  // Hydrate saved vault, preferences, and Chrome Extension smart handoff
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawVault = localStorage.getItem(FORGE_VAULT_KEY);
      if (rawVault) {
        const parsed = JSON.parse(rawVault) as Partial<ForgeVaultState>;
        if (typeof parsed.xp === 'number') setXp(parsed.xp);
        if (Array.isArray(parsed.snippets)) setSnippets(parsed.snippets);
        if (parsed.stackNames && typeof parsed.stackNames === 'object') setStackNames(parsed.stackNames);
      }
      const rawPrefs = localStorage.getItem(FORGE_PREFS_KEY);
      if (rawPrefs) {
        const p = JSON.parse(rawPrefs) as {
          darkMode?: boolean;
          themeId?: ForgeThemeId;
          bionicOn?: boolean;
          easyReadOn?: boolean;
          singleCardLayout?: boolean;
        };
        if (typeof p.darkMode === 'boolean') setDarkMode(p.darkMode);
        if (p.themeId && p.themeId in FORGE_THEMES) setThemeId(p.themeId);
        if (typeof p.bionicOn === 'boolean') setBionicOn(p.bionicOn);
        if (typeof p.easyReadOn === 'boolean') setEasyReadOn(p.easyReadOn);
        if (typeof p.singleCardLayout === 'boolean') setSingleCardLayout(p.singleCardLayout);
      }
    } catch {
      // Ignore malformed localStorage
    }

    const consumeForgeHandoff = () => {
      try {
        const raw = sessionStorage.getItem('prism_forge_handoff');
        if (!raw) return;
        sessionStorage.removeItem('prism_forge_handoff');
        const payload = JSON.parse(raw) as { text?: string; mode?: ForgeMode };
        if (payload?.text?.trim()) {
          if (payload.mode && ['stack_trace', 'code_lego', 'terminal_cli'].includes(payload.mode)) {
            setMode(payload.mode);
          }
          setRawInput(payload.text.trim());
          setBeforeCollapsed(false);
        }
      } catch {
        // Ignore malformed handoff
      }
    };
    consumeForgeHandoff();
    window.addEventListener('prism:forge-handoff', consumeForgeHandoff);
    setHydrated(true);
    return () => window.removeEventListener('prism:forge-handoff', consumeForgeHandoff);
  }, []);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (!file) return;
    setErrorMsg(null);
    setUploadingFile(true);
    try {
      if (file.size > 8 * 1024 * 1024) {
        throw new Error('File is over 8 MB. Try a smaller file or paste the tricky section directly.');
      }
      const lower = file.name.toLowerCase();
      const isPlainCodeOrLog = /\.(txt|csv|log|md|json|js|jsx|ts|tsx|py|sql|html|css|xml|yaml|yml|sh|bash|env\.example|ini|toml)$/.test(lower)
        || file.type.startsWith('text/');
      if (isPlainCodeOrLog) {
        const text = await file.text();
        if (!text.trim()) throw new Error('That file appears to be empty.');
        setRawInput(text.slice(0, 12000));
        setBeforeCollapsed(false);
      } else if (lower.endsWith('.pdf')) {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
        }
        if (!fullText.trim()) throw new Error('No selectable text was found in this PDF.');
        setRawInput(fullText.slice(0, 12000));
        setBeforeCollapsed(false);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/parse', { method: 'POST', body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.text) {
          throw new Error(data.error || 'Could not read that file. Try .txt, .csv, .log, .docx, .pdf, or code files.');
        }
        setRawInput(String(data.text).slice(0, 12000));
        setBeforeCollapsed(false);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not load that file.');
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(FORGE_VAULT_KEY, JSON.stringify({ xp, snippets, stackNames }));
    } catch {
      // Ignore quota errors
    }
  }, [hydrated, xp, snippets, stackNames]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        FORGE_PREFS_KEY,
        JSON.stringify({ darkMode, themeId, bionicOn, easyReadOn, singleCardLayout }),
      );
    } catch {
      // Ignore quota errors
    }
  }, [hydrated, darkMode, themeId, bionicOn, easyReadOn, singleCardLayout]);

  // Gentle Focus Sprint countdown
  useEffect(() => {
    if (!sprintRunning || sprintSecsLeft <= 0) return;
    const id = setInterval(() => {
      setSprintSecsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setSprintRunning(false);
          setXp((curr) => curr + 20);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [sprintRunning, sprintSecsLeft]);

  const theme = FORGE_THEMES[themeId];
  const surfaceBg = darkMode ? theme.darkBg : theme.lightBg;
  const cardSurface = darkMode ? theme.darkCard : theme.lightCard;
  const innerSurface = darkMode ? theme.darkInner : theme.lightInner;
  const mutedText = darkMode ? 'text-amber-100/65' : theme.lightMuted;
  const subtlePill = darkMode
    ? 'bg-amber-500/10 border-amber-500/20 text-amber-100'
    : 'bg-[#e6ddcd] border-[#c8bca6] text-[#1c1711]';

  const rankTitle = getAscensionRank(xp);

  const handleMeltJargon = async (overrideInput?: string, overrideMode?: ForgeMode) => {
    const textToProcess = (overrideInput ?? rawInput).trim();
    const targetMode = overrideMode ?? mode;
    if (!textToProcess) return;

    setLoading(true);
    setErrorMsg(null);
    setCompletedQuestSteps({});
    setCopiedFix(false);
    setShowSaveBar(false);
    setDjInteractionId(undefined);

    try {
      const res = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refract',
          mode: targetMode,
          text: textToProcess,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Could not translate that right now. Take a breath and try again.');
      }
      const nextResult = data as ForgeRefractionOutput;
      setResult(nextResult);
      setBeforeCollapsed(true);
      setDraftSnippetName(suggestForgeSnippetName(textToProcess, nextResult.languageOrTool));
      setXp((curr) => curr + 20);
      setTimeout(() => {
        afterSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something got tangled. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: (typeof FORGE_PRESET_EXAMPLES)[number]) => {
    setMode(preset.mode);
    setRawInput(preset.input);
    setBeforeCollapsed(false);
    void handleMeltJargon(preset.input, preset.mode);
  };

  const handleCopyFix = async () => {
    if (!result?.fixedCodeOrCommand) return;
    try {
      await navigator.clipboard.writeText(result.fixedCodeOrCommand);
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleToggleQuestStep = (stepId: string, xpReward: number) => {
    setCompletedQuestSteps((prev) => {
      const wasDone = Boolean(prev[stepId]);
      if (!wasDone) setXp((curr) => curr + xpReward);
      return { ...prev, [stepId]: !wasDone };
    });
  };

  const handleSaveToVault = () => {
    if (!result) return;
    const finalName = draftSnippetName.trim() || suggestForgeSnippetName(rawInput, result.languageOrTool);
    const entry: SavedForgeSnippet = {
      id: `forge-${Date.now()}`,
      name: finalName,
      mode: result.mode,
      language: result.languageOrTool,
      originalInput: rawInput,
      headline: result.headline,
      tldrSignal: result.tldrSignal,
      fixedCodeOrCommand: result.fixedCodeOrCommand,
      savedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    };
    setSnippets((prev) => [entry, ...prev]);
    setShowSaveBar(false);
    setXp((curr) => curr + 15);
  };

  const handleDeleteSnippet = (id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  };

  const handleLoadSnippet = (item: SavedForgeSnippet) => {
    setMode(item.mode);
    setRawInput(item.originalInput);
    setBeforeCollapsed(false);
    void handleMeltJargon(item.originalInput, item.mode);
  };

  const handleAskDjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = askDjInput.trim();
    if (!q || askDjLoading) return;
    setAskDjHistory((prev) => [...prev, { role: 'user', text: q }]);
    setAskDjInput('');
    setAskDjLoading(true);
    try {
      const res = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask_dj',
          mode,
          message: q,
          codeContext: rawInput,
          refractionSummary: result ? `${result.headline} — ${result.tldrSignal}` : undefined,
          history: askDjHistory,
          previousInteractionId: djInteractionId,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (typeof payload.interactionId === 'string' && payload.interactionId) {
        setDjInteractionId(payload.interactionId);
      }
      setAskDjHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: payload.text || 'Take a breath — nothing is broken beyond fixing. Try pasting one line at a time and we will walk through it together.',
        },
      ]);
    } catch {
      setAskDjHistory((prev) => [
        ...prev,
        { role: 'ai', text: 'Connection hiccup — your work is safe. Ask again in a moment.' },
      ]);
    } finally {
      setAskDjLoading(false);
    }
  };

  // Progressive 5-Stack Window-Tile Grouping Logic:
  // Items 0..(rem-1) are recent standalone medium cards (0..4 items).
  // Every completed group of 5 older items bundles into a named Window-Tile Stack that fans open on hover.
  const normalizedSearch = vaultSearch.trim().toLowerCase();
  const filteredSnippets = useMemo(() => {
    if (!normalizedSearch) return snippets;
    return snippets.filter(
      (s) =>
        s.name.toLowerCase().includes(normalizedSearch)
        || s.headline.toLowerCase().includes(normalizedSearch)
        || s.language.toLowerCase().includes(normalizedSearch)
        || s.tldrSignal.toLowerCase().includes(normalizedSearch),
    );
  }, [snippets, normalizedSearch]);

  const { recentItems, stacks } = useMemo(() => {
    if (normalizedSearch) {
      return { recentItems: filteredSnippets, stacks: [] as Array<{ stackNumber: number; items: SavedForgeSnippet[] }> };
    }
    const rem = snippets.length % 5;
    const recentCount = snippets.length < 5 ? snippets.length : rem;
    const recent = snippets.slice(0, recentCount);
    const stackedPool = snippets.slice(recentCount);
    const grouped: Array<{ stackNumber: number; items: SavedForgeSnippet[] }> = [];
    const totalStacks = Math.floor(stackedPool.length / 5);
    for (let i = 0; i < totalStacks; i++) {
      grouped.push({
        stackNumber: totalStacks - i,
        items: stackedPool.slice(i * 5, i * 5 + 5),
      });
    }
    return { recentItems: recent, stacks: grouped };
  }, [snippets, filteredSnippets, normalizedSearch]);

  const visibleStacks = showArchivedStacks ? stacks : stacks.slice(0, 3);
  const archivedStackCount = Math.max(0, stacks.length - 3);

  const renderReadableText = (text: string) =>
    bionicOn ? <BionicText text={text} /> : text;

  const fontStyle = {
    fontFamily: easyReadOn ? 'var(--font-reading), Lexend, sans-serif' : 'var(--font-sans), Inter, sans-serif',
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${surfaceBg}`}
      style={fontStyle}
    >
      {/* Subtle Warm Molten Amber Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className={`absolute -top-32 left-1/4 h-[26rem] w-[26rem] rounded-full blur-3xl ${
            darkMode ? 'bg-amber-600/15' : 'bg-amber-400/15'
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full blur-3xl ${
            darkMode ? 'bg-orange-600/10' : 'bg-orange-300/15'
          }`}
        />
      </div>

      {/* Uncluttered Top Header Bar */}
      <header className="relative z-20 w-full border-b border-black/5 dark:border-amber-500/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
          {/* Left: Calm XP & Ascension Rank Pill */}
          <div className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-xs font-bold ${subtlePill}`}>
            <Flame size={14} className="text-amber-500" />
            <span>{rankTitle}</span>
            <span className="opacity-35">·</span>
            <span className="text-amber-500 font-black">{xp} XP</span>
          </div>

          {/* Right: Prism Switcher · Neural Command · Neural Identity · Light/Dark */}
          <div className="flex flex-wrap items-center gap-2">
            <div data-tour="forge-engine-switcher">
              <PrismSwitcherPopover current="forge" darkMode={darkMode} />
            </div>

            <button
              data-tour="forge-neural-command"
              type="button"
              onClick={() => setShowCommandModal(true)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black transition-all hover:border-amber-500/50 ${subtlePill}`}
            >
              <Compass size={15} className={theme.accentText} />
              <span>Neural Command</span>
            </button>

            <button
              data-tour="forge-neural-identity"
              type="button"
              onClick={() => setShowIdentityModal(true)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black transition-all hover:border-amber-400/60 ${subtlePill}`}
            >
              <Crown size={15} className="text-amber-400" />
              <span>Neural Identity</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label={darkMode ? 'Switch to Warm Sandstone Light Mode' : 'Switch to Dark Mode'}
              title={darkMode ? 'Switch to Warm Sandstone Light Mode' : 'Switch to Dark Mode'}
              className={`rounded-2xl border p-2.5 transition-colors ${subtlePill}`}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Spacious Single-Column Main Workspace */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 pt-8 pb-36 sm:px-6 space-y-7">
        {/* Hero Pill Badge & Molten Amber Title */}
        <section className="text-center space-y-3">
          <Link
            href="/engine"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/15 hover:bg-amber-500/25 px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-amber-500 dark:text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.18)] transition-all"
          >
            <Sparkles size={12} className="text-amber-400" /> Dassah&apos;s Prism Engine · Powered by The Prism Engine
          </Link>

          <h1 className="prism-brand text-4xl sm:text-6xl font-black tracking-tight italic leading-[1.15]">
            Prism{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
              Forge
            </span>
          </h1>

          <p className="text-base sm:text-xl font-bold italic tracking-tight text-amber-500">
            &ldquo;Turning Tech Fear into Calm Clarity.&rdquo;
          </p>

          <p className={`mx-auto max-w-xl text-sm sm:text-base font-medium leading-relaxed ${mutedText}`}>
            Take a breath — nothing is ruined. Paste a broken Excel formula, scary red error, coding homework, or computer command and get calm English in seconds.
          </p>
        </section>

        {/* Full-Screen Fade-to-Black "Unstick Me" Calming 4-4-4 Breathing Overlay */}
        <AnimatePresence>
          {showUnstickBreath && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              onClick={() => setShowUnstickBreath(false)}
              className="fixed inset-0 z-[520] bg-black/88 backdrop-blur-2xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-[2.5rem] border border-amber-500/35 bg-[#160e07]/95 p-8 sm:p-10 text-center text-amber-50 shadow-[0_0_90px_rgba(245,158,11,0.22)] flex flex-col items-center gap-6"
              >
                <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                  Unstick Me · Calm Reset
                </span>

                <motion.div
                  animate={{ scale: [0.92, 1.24, 1.24, 0.92] }}
                  transition={{ duration: 12, times: [0, 0.33, 0.66, 1], repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-amber-400/70 bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent shadow-[0_0_50px_rgba(245,158,11,0.35)]"
                >
                  <Wind size={34} className="text-amber-400" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Inhale 4s · Hold 4s · Exhale 4s
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed text-amber-100/75">
                    Take a breath — nothing is ruined. Errors look loud on purpose, not because you broke anything. You only need one tiny piece at a time.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUnstickBreath(false)}
                  className={`rounded-full px-8 py-3 text-xs font-black uppercase tracking-[0.25em] text-white shadow-xl transition-transform hover:scale-105 ${theme.accentBtn}`}
                >
                  I&apos;m Ready to Continue
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout Switcher (Option 2: Before & After Split Card vs Option 1: Single Calm Card) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>
            {singleCardLayout ? 'View: Single Calm Card' : 'View: Before & After Split Card'}
          </span>
          <button
            type="button"
            onClick={() => setSingleCardLayout((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition-colors hover:border-amber-500/50 ${subtlePill}`}
          >
            <Eye size={12} className="text-amber-500" />
            {singleCardLayout ? 'Switch to Before & After' : 'Switch to Single Focus Card'}
          </button>
        </div>

        {/* BEFORE CARD: Paste What's Confusing You */}
        {(!singleCardLayout || !result) && (
          <section className={`rounded-[2rem] border p-5 sm:p-7 backdrop-blur-2xl space-y-5 transition-all ${cardSurface}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-black text-amber-500">
                  1
                </span>
                <h2 className="text-sm sm:text-base font-black tracking-tight">
                  Before: Paste What&apos;s Confusing You
                </h2>
              </div>
              {result && (
                <button
                  type="button"
                  onClick={() => setBeforeCollapsed((c) => !c)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${subtlePill}`}
                >
                  {beforeCollapsed ? (
                    <>
                      Show What I Pasted <ChevronDown size={13} />
                    </>
                  ) : (
                    <>
                      Hide Input <ChevronUp size={13} />
                    </>
                  )}
                </button>
              )}
            </div>

            {beforeCollapsed && result ? (
              <div
                onClick={() => setBeforeCollapsed(false)}
                className={`cursor-pointer rounded-2xl border px-4 py-3 text-xs font-mono truncate opacity-80 hover:opacity-100 transition-opacity ${innerSurface}`}
                title="Click to show what you pasted"
              >
                {rawInput.split('\n')[0] || 'Original pasted text'}
              </div>
            ) : (
              <>
                {/* 3 Friendly Mode Tabs (Tell the AI how to translate) */}
                <div data-tour="forge-mode-tabs" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {MODE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = mode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMode(opt.id)}
                        className={`rounded-2xl border p-3.5 text-left transition-all ${
                          active
                            ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_24px_rgba(245,158,11,0.18)]'
                            : `${innerSurface} opacity-80 hover:opacity-100 hover:border-amber-500/40`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={15} className={active ? 'text-amber-500' : mutedText} />
                          <span className="text-xs font-black leading-snug">{opt.label}</span>
                        </div>
                        <p className={`mt-1 text-[11px] leading-snug ${mutedText}`}>{opt.helper}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Clear AI Focus Strip so the user always knows what the selected mode tells the AI to do */}
                <div className={`rounded-xl border px-3.5 py-2 text-xs font-semibold flex items-center gap-2 ${subtlePill}`}>
                  <Sparkles size={13} className="text-amber-500 shrink-0" />
                  <span>{MODE_OPTIONS.find((m) => m.id === mode)?.aiFocus}</span>
                </div>

                {/* Plain Input Textarea */}
                <textarea
                  rows={5}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder={MODE_OPTIONS.find((m) => m.id === mode)?.placeholder}
                  className={`w-full rounded-2xl border p-4 text-sm sm:text-base font-mono leading-relaxed outline-none focus:border-amber-500 transition-colors ${innerSurface}`}
                />

                {/* 1-Click Friendly Samples */}
                <div data-tour="forge-sample-buttons" className="space-y-2">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${mutedText}`}>
                    Try a 1-click everyday example:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FORGE_PRESET_EXAMPLES.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all hover:border-amber-500/60 ${subtlePill}`}
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-400">
                    {errorMsg}
                  </div>
                )}

                {/* Primary Amber Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      data-tour="forge-unstick-btn"
                      type="button"
                      onClick={() => setShowUnstickBreath(true)}
                      className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-colors hover:border-amber-500/50 ${subtlePill}`}
                    >
                      <Wind size={14} className="text-amber-500" /> Unstick Me
                    </button>

                    <button
                      type="button"
                      disabled={uploadingFile}
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload a code file, error log, CSV, PDF, or Word doc"
                      className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-colors hover:border-amber-500/50 disabled:opacity-50 ${subtlePill}`}
                    >
                      {uploadingFile ? <Loader2 size={14} className="animate-spin text-amber-500" /> : <Upload size={14} className="text-amber-500" />}
                      {uploadingFile ? 'Reading File...' : 'Upload File'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".txt,.csv,.log,.md,.json,.js,.jsx,.ts,.tsx,.py,.sql,.html,.css,.xml,.yaml,.yml,.sh,.docx,.pdf"
                      onChange={handleUploadFile}
                    />
                  </div>

                  <button
                    data-tour="forge-melt-btn"
                    type="button"
                    disabled={loading || !rawInput.trim()}
                    onClick={() => void handleMeltJargon()}
                    className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-white shadow-xl transition-all active:scale-95 disabled:opacity-45 ${theme.accentBtn}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Melting the jargon...
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} /> Melt the Jargon →
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* AFTER CARD: Plain-English Translation, Snap-Blocks & 1-Click Fix */}
        <div ref={afterSectionRef}>
          <AnimatePresence mode="wait">
            {result && (
              <motion.section
                key={result.headline}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className={`rounded-[2rem] border p-5 sm:p-8 backdrop-blur-2xl space-y-6 ${cardSurface}`}
              >
                {/* In Single Calm Card mode, keep a neat 1-line glimpse of the problem you pasted */}
                {singleCardLayout && rawInput.trim() && (
                  <div className={`rounded-2xl border px-4 py-2.5 flex items-center justify-between gap-3 text-xs ${innerSurface}`}>
                    <span className="truncate font-mono opacity-85">
                      <strong className="font-sans text-amber-500 mr-1.5">Problem:</strong>
                      {rawInput.split('\n')[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        setBeforeCollapsed(false);
                      }}
                      className="shrink-0 text-[11px] font-black text-amber-500 hover:underline"
                    >
                      Edit / Melt New
                    </button>
                  </div>
                )}

                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/10 dark:border-amber-500/15 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-black text-amber-500">
                        2
                      </span>
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-500">
                        {result.languageOrTool}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>
                        {result.routeMeta.isLocalFallback
                          ? 'Local Structural Refraction · 0 Tokens'
                          : result.routeMeta.label}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                      {renderReadableText(result.headline)}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {singleCardLayout && (
                      <button
                        type="button"
                        onClick={() => {
                          setResult(null);
                          setBeforeCollapsed(false);
                        }}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${subtlePill}`}
                      >
                        ← Paste &amp; Melt Another
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowSaveBar((s) => !s)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 text-xs font-black text-amber-500 hover:bg-amber-500/30 transition-colors"
                    >
                      <Bookmark size={14} /> Save to Vault
                    </button>
                  </div>
                </div>

                {/* Inline Smart-Name Save Bar */}
                <AnimatePresence>
                  {showSaveBar && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`overflow-hidden rounded-2xl border p-4 space-y-2.5 ${innerSurface}`}
                    >
                      <p className="text-xs font-bold">
                        Name this saved fix (we suggested one for you if you&apos;re tired!):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={draftSnippetName}
                          onChange={(e) => setDraftSnippetName(e.target.value)}
                          placeholder="e.g. VLOOKUP Sheet Formula Fix"
                          className={`flex-1 min-w-[200px] rounded-xl border px-3 py-2 text-xs font-semibold outline-none focus:border-amber-500 ${innerSurface}`}
                        />
                        <button
                          type="button"
                          onClick={handleSaveToVault}
                          className={`rounded-xl px-4 py-2 text-xs font-black text-white ${theme.accentBtn}`}
                        >
                          Save Note (+15 XP)
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Read Aloud Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ReadAloud
                    text={`${result.headline}. ${result.tldrSignal}. ${result.vividMetaphor}. ${result.fixExplanation}`}
                    darkMode={darkMode}
                  />
                  <button
                    type="button"
                    onClick={() => setAskDjOpen(true)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-black transition-all hover:border-amber-500/60 ${subtlePill}`}
                  >
                    <MessageCircle size={14} className="text-amber-500" /> Ask DJ (Plain English)
                  </button>
                </div>

                {/* Plain-English Summary */}
                <div className={`rounded-2xl border p-5 space-y-2 ${innerSurface}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                    What Actually Happened (Plain English)
                  </p>
                  <p className="text-sm sm:text-base font-semibold leading-relaxed">
                    {renderReadableText(result.tldrSignal)}
                  </p>
                </div>

                {/* Real-Life Metaphor & Calm Reassurance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`rounded-2xl border p-4 space-y-1.5 ${innerSurface}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                      Real-Life Picture
                    </p>
                    <p className="text-sm leading-relaxed italic">
                      &ldquo;{renderReadableText(result.vividMetaphor)}&rdquo;
                    </p>
                  </div>
                  <div className={`rounded-2xl border p-4 space-y-1.5 ${innerSurface}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                      Calm Boost
                    </p>
                    <p className="text-sm leading-relaxed font-semibold">
                      {renderReadableText(result.dopamineHook)}
                    </p>
                  </div>
                </div>

                {/* Terminal Command Safety Breakdown (when commandTokens exist) */}
                {result.commandTokens.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                      Command Safety Check (Word by Word)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.commandTokens.map((tok, i) => {
                        const badgeColor =
                          tok.safetyLevel === 'destructive'
                            ? 'border-rose-500/50 bg-rose-500/15 text-rose-400'
                            : tok.safetyLevel === 'caution'
                              ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500';
                        return (
                          <div
                            key={`${tok.token}-${i}`}
                            className={`rounded-2xl border px-3.5 py-2 space-y-0.5 ${badgeColor}`}
                          >
                            <div className="flex items-center gap-1.5 font-mono text-xs font-black">
                              <span>{tok.token}</span>
                              <span className="text-[9px] uppercase opacity-75">· {tok.safetyLevel}</span>
                            </div>
                            <p className="text-[11px] opacity-90">{tok.plainMeaning}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visual Snap-Blocks */}
                {result.legoBlocks.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                      Piece-by-Piece Breakdown
                    </p>
                    <div className="space-y-3">
                      {result.legoBlocks.map((block) => (
                        <div
                          key={block.id}
                          className={`rounded-2xl border p-4 space-y-2 ${innerSurface}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-black flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20 text-[10px] text-amber-500">
                                {block.stepNumber}
                              </span>
                              {block.title}
                            </span>
                            <code className="rounded-lg bg-black/20 px-2 py-0.5 text-[11px] font-mono text-amber-500 max-w-full truncate">
                              {block.codeFragment}
                            </code>
                          </div>
                          <p className="text-sm leading-relaxed">{renderReadableText(block.plainMeaning)}</p>
                          <p className={`text-xs italic ${mutedText}`}>
                            Like: {block.realWorldAnalogy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-Click Fix Card */}
                <div className={`rounded-2xl border border-amber-500/35 p-5 space-y-3 ${innerSurface}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <ShieldCheck size={15} /> Ready-to-Use Fix
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleCopyFix()}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black text-white transition-all ${theme.accentBtn}`}
                    >
                      {copiedFix ? <Check size={14} /> : <Copy size={14} />}
                      {copiedFix ? 'Copied!' : 'Copy Fix'}
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-black/30 p-3.5 text-xs sm:text-sm font-mono text-amber-200 leading-relaxed whitespace-pre-wrap break-words">
                    {result.fixedCodeOrCommand}
                  </pre>
                  <p className={`text-xs leading-relaxed ${mutedText}`}>{result.fixExplanation}</p>
                </div>

                {/* Guided Debugging Quest (Tiny Checkable Steps) */}
                {result.debuggingQuest.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                      Guided Debugging Quest (1 Tiny Step at a Time)
                    </p>
                    <div className="space-y-2.5">
                      {result.debuggingQuest.map((step) => {
                        const done = Boolean(completedQuestSteps[step.id]);
                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => handleToggleQuestStep(step.id, step.xpReward)}
                            className={`w-full rounded-2xl border p-4 text-left transition-all flex items-start gap-3 ${
                              done
                                ? 'border-amber-500/60 bg-amber-500/15 opacity-75'
                                : `${innerSurface} hover:border-amber-500/50`
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                                done ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-amber-500/40'
                              }`}
                            >
                              {done && <Check size={12} strokeWidth={3} />}
                            </span>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs sm:text-sm font-black ${done ? 'line-through' : ''}`}>
                                  {step.stepNumber}. {step.title}
                                </span>
                                <span className="text-[10px] font-black text-amber-500 shrink-0">
                                  +{step.xpReward} XP
                                </span>
                              </div>
                              <p className={`text-xs leading-relaxed ${mutedText}`}>{step.action}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* PROGRESSIVE 5-STACK WINDOW-TILE VAULT */}
        <section
          data-tour="forge-vault-section"
          className={`rounded-[2rem] border p-5 sm:p-7 backdrop-blur-2xl space-y-5 ${cardSurface}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <Bookmark size={17} className="text-amber-500" /> Saved Fixes Vault
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-black text-amber-500">
                  {snippets.length}
                </span>
              </h2>
              <p className={`text-xs ${mutedText}`}>
                Saved notes stay private in your browser. Every 5 items bundle into a named window stack that fans open when you hover.
              </p>
            </div>

            {snippets.length > 0 && (
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`} />
                <input
                  type="text"
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  placeholder="Search saved notes..."
                  className={`w-full rounded-full border pl-8 pr-3 py-1.5 text-xs outline-none focus:border-amber-500 ${innerSurface}`}
                />
              </div>
            )}
          </div>

          {snippets.length === 0 ? (
            <div className={`rounded-2xl border border-dashed p-6 text-center space-y-1 ${innerSurface}`}>
              <p className="text-xs font-bold">No saved fixes yet.</p>
              <p className={`text-xs ${mutedText}`}>
                Translate an error or formula above and tap <strong>Save to Vault</strong> to start your searchable deck.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recent Standalone Cards (1–4 items before forming the next 5-stack) */}
              {recentItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className={`group rounded-2xl border p-4 space-y-2 transition-all hover:border-amber-500/50 ${innerSurface}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCopiedVaultFix(false);
                            setViewingSnippet(item);
                          }}
                          className="text-left min-w-0 flex-1"
                        >
                          <p className="text-xs font-black text-amber-500 truncate">{item.name}</p>
                          <p className="text-xs font-semibold line-clamp-2 mt-0.5">{item.headline}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSnippet(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="opacity-50 hover:opacity-100 hover:text-rose-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] opacity-65">
                        <span>{item.language}</span>
                        <span>Tap to view solution · {item.savedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Named 5-Stack Window Tiles (Fan open smoothly on hover or tap) */}
              {visibleStacks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleStacks.map((stack) => {
                    const isFanned = activeHoverStack === stack.stackNumber;
                    const stackTitle =
                      stackNames[stack.stackNumber]
                      || `${stack.items[0]?.language || 'Forge'} Stack #${stack.stackNumber}`;
                    return (
                      <div
                        key={stack.stackNumber}
                        onMouseEnter={() => setActiveHoverStack(stack.stackNumber)}
                        onMouseLeave={() => setActiveHoverStack((curr) => (curr === stack.stackNumber ? null : curr))}
                        onClick={() => setActiveHoverStack((curr) => (curr === stack.stackNumber ? null : stack.stackNumber))}
                        className={`relative rounded-2xl border p-4 transition-all cursor-pointer ${
                          isFanned ? 'border-amber-500 shadow-[0_12px_40px_rgba(245,158,11,0.2)]' : ''
                        } ${innerSurface}`}
                      >
                        {/* Layered Window-Tile Edge Illusion */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-1.5 left-3 right-3 h-2 rounded-t-xl border-x border-t border-amber-500/25 bg-amber-500/10"
                        />
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {editingStackIdx === stack.stackNumber ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                setStackNames((prev) => ({
                                  ...prev,
                                  [stack.stackNumber]: editingStackDraft.trim() || stackTitle,
                                }));
                                setEditingStackIdx(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 flex-1"
                            >
                              <input
                                type="text"
                                autoFocus
                                value={editingStackDraft}
                                onChange={(e) => setEditingStackDraft(e.target.value)}
                                className="w-full rounded-lg border border-amber-500/50 bg-black/20 px-2 py-1 text-xs font-bold outline-none"
                              />
                              <button type="submit" className="rounded-lg bg-amber-600 px-2 py-1 text-[10px] font-black text-white">
                                Save
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingStackIdx(stack.stackNumber);
                                setEditingStackDraft(stackTitle);
                              }}
                              title="Click to rename this 5-item stack"
                              className="text-left text-xs font-black text-amber-500 hover:underline truncate"
                            >
                              {stackTitle}
                            </button>
                          )}
                          <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-500">
                            5 tiles
                          </span>
                        </div>

                        {!isFanned ? (
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold truncate">{stack.items[0]?.name}</p>
                            <p className={`text-[11px] ${mutedText}`}>
                              Hover or tap to fan open all 5 saved fixes
                            </p>
                          </div>
                        ) : (
                          <motion.ul
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5 pt-1"
                          >
                            {stack.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-[11px]"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCopiedVaultFix(false);
                                    setViewingSnippet(item);
                                  }}
                                  className="truncate text-left font-bold hover:text-amber-500 flex-1"
                                >
                                  {item.name}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSnippet(item.id);
                                  }}
                                  aria-label={`Delete ${item.name}`}
                                  className="opacity-60 hover:opacity-100 hover:text-rose-400"
                                >
                                  <X size={12} />
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {archivedStackCount > 0 && !normalizedSearch && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowArchivedStacks((v) => !v)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-bold ${subtlePill}`}
                  >
                    {showArchivedStacks
                      ? 'Hide Older Stacks'
                      : `Show ${archivedStackCount} Older ${archivedStackCount === 1 ? 'Stack' : 'Stacks'} (Searchable)`}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Saved Recollection Modal (Shows Original Problem + Plain-English Explanation + Copyable Solution) */}
      <AnimatePresence>
        {viewingSnippet && (
          <div
            className="fixed inset-0 z-[490] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={() => setViewingSnippet(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-[2rem] border p-6 sm:p-8 space-y-5 shadow-2xl ${cardSurface}`}
            >
              <div className="flex items-start justify-between gap-3 border-b border-black/10 dark:border-amber-500/15 pb-4">
                <div>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-500">
                    {viewingSnippet.language} · Saved {viewingSnippet.savedAt}
                  </span>
                  <h3 className="mt-2 text-lg sm:text-xl font-black">{viewingSnippet.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingSnippet(null)}
                  aria-label="Close saved fix"
                  className={`rounded-xl border p-2 ${subtlePill}`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className={`rounded-2xl border p-4 space-y-1.5 ${innerSurface}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                  1. The Problem You Had
                </p>
                <pre className="overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre-wrap break-words opacity-90">
                  {viewingSnippet.originalInput}
                </pre>
              </div>

              <div className={`rounded-2xl border p-4 space-y-1.5 ${innerSurface}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                  2. What It Meant (Plain English)
                </p>
                <p className="text-sm font-bold">{viewingSnippet.headline}</p>
                <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>{viewingSnippet.tldrSignal}</p>
              </div>

              <div className={`rounded-2xl border border-amber-500/40 p-4 space-y-2.5 ${innerSurface}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                    3. Your Saved Solution
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(viewingSnippet.fixedCodeOrCommand);
                      setCopiedVaultFix(true);
                      setTimeout(() => setCopiedVaultFix(false), 1800);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black text-white ${theme.accentBtn}`}
                  >
                    {copiedVaultFix ? <Check size={13} /> : <Copy size={13} />}
                    {copiedVaultFix ? 'Copied!' : 'Copy Solution'}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-xl bg-black/30 p-3 text-xs font-mono text-amber-200 whitespace-pre-wrap break-words">
                  {viewingSnippet.fixedCodeOrCommand}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingSnippet;
                    setViewingSnippet(null);
                    handleLoadSnippet(target);
                  }}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold ${subtlePill}`}
                >
                  Re-open Full Breakdown in Forge
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSnippet(null)}
                  className={`rounded-full px-7 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-white ${theme.accentBtn}`}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bottom ADHD Support Studio Dock */}
      <div data-tour="forge-bottom-dock" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[260] w-[calc(100%-1.5rem)] max-w-xl flex flex-col items-center gap-3 pointer-events-none">
        {/* Soundscape Studio Popover (kept mounted so Brown Noise/Rain keeps playing) */}
        <div className={`w-full pointer-events-auto ${soundStudioOpen ? 'block' : 'hidden'}`}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSoundStudioOpen(false)}
              aria-label="Hide Soundscape Studio"
              className={`absolute right-3 top-3 z-10 rounded-xl border p-1.5 ${subtlePill}`}
            >
              <X size={14} />
            </button>
            <SensorySoundscapeBar
              darkMode={darkMode}
              showSoundtrackPin={true}
              showGamma40={true}
              glassCard={cardSurface}
              subtlePill={subtlePill}
              mutedText={mutedText}
            />
          </div>
        </div>

        {/* Gentle Focus Sprint Popover */}
        <AnimatePresence>
          {sprintOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={`w-full pointer-events-auto rounded-3xl border p-4 backdrop-blur-2xl shadow-2xl space-y-3 ${cardSurface}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black flex items-center gap-2">
                  <Timer size={14} className="text-amber-500" /> Gentle Focus Sprint (Zero Pressure)
                </p>
                <button
                  type="button"
                  onClick={() => setSprintOpen(false)}
                  aria-label="Close sprint timer"
                  className={`rounded-xl border p-1 ${subtlePill}`}
                >
                  <X size={13} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {sprintTotalSecs === 0 ? (
                  [5, 10, 20].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSprintTotalSecs(m * 60);
                        setSprintSecsLeft(m * 60);
                        setSprintRunning(true);
                      }}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold hover:border-amber-500/60 ${subtlePill}`}
                    >
                      {m}m calm sprint
                    </button>
                  ))
                ) : (
                  <>
                    <span className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-black ${subtlePill}`}>
                      {formatTimer(sprintSecsLeft)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSprintRunning((r) => !r)}
                      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold ${subtlePill}`}
                    >
                      {sprintRunning ? <Pause size={12} /> : <Play size={12} />}
                      {sprintRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSprintRunning(false);
                        setSprintTotalSecs(0);
                        setSprintSecsLeft(0);
                      }}
                      aria-label="Reset sprint"
                      className={`rounded-xl border p-1.5 ${subtlePill}`}
                    >
                      <RotateCcw size={13} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Bottom Pill Bar */}
        <nav
          aria-label="Prism Forge support tools"
          className={`pointer-events-auto inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border px-3 py-2 backdrop-blur-2xl shadow-2xl ${cardSurface}`}
        >
          <button
            type="button"
            onClick={() => {
              setSprintOpen(false);
              setSoundStudioOpen((o) => !o);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              soundStudioOpen ? `${theme.accentBtn} border-transparent text-white` : subtlePill
            }`}
          >
            <Headphones size={13} /> Sound
          </button>
          <button
            type="button"
            onClick={() => {
              setSoundStudioOpen(false);
              setSprintOpen((o) => !o);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              sprintOpen || sprintRunning ? `${theme.accentBtn} border-transparent text-white` : subtlePill
            }`}
          >
            <Timer size={13} /> {sprintSecsLeft > 0 ? formatTimer(sprintSecsLeft) : 'Sprint'}
          </button>
          <button
            type="button"
            onClick={() => setBionicOn((b) => !b)}
            aria-pressed={bionicOn}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              bionicOn ? 'border-amber-500 bg-amber-500/20 text-amber-500' : subtlePill
            }`}
          >
            Bionic
          </button>
          <button
            type="button"
            onClick={() => setAskDjOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:border-amber-500/60 ${subtlePill}`}
          >
            <MessageCircle size={13} className="text-amber-500" /> Ask DJ
          </button>
        </nav>
      </div>

      {/* Ask DJ Friend Console Modal */}
      <AnimatePresence>
        {askDjOpen && (
          <div className="fixed inset-0 z-[480] flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className={`w-full max-w-lg rounded-[2rem] border p-5 sm:p-6 shadow-2xl space-y-4 ${cardSurface}`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-black/10 dark:border-amber-500/15 pb-3">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-amber-500" />
                  <h2 className="text-sm font-black">Ask DJ · Patient Friend Helper</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAskDjOpen(false)}
                  aria-label="Close Ask DJ"
                  className={`rounded-xl border p-1.5 ${subtlePill}`}
                >
                  <X size={15} />
                </button>
              </div>

              <div className={`h-64 overflow-y-auto rounded-2xl border p-3.5 space-y-3 ${innerSurface}`}>
                {askDjHistory.length === 0 ? (
                  <p className={`text-xs leading-relaxed text-center py-10 ${mutedText}`}>
                    Ask anything in plain English — like &ldquo;Why did my spreadsheet say #REF!?&rdquo; or &ldquo;Explain line 2 like I&apos;m tired.&rdquo;
                  </p>
                ) : (
                  askDjHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-amber-600 text-white font-semibold'
                            : darkMode
                              ? 'bg-white/10 text-amber-50'
                              : 'bg-[#dfd6c5] text-[#1c1711]'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
                {askDjLoading && (
                  <div className="text-xs font-bold text-amber-500 animate-pulse">DJ is thinking calmly...</div>
                )}
              </div>

              <form onSubmit={handleAskDjSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={askDjInput}
                  onChange={(e) => setAskDjInput(e.target.value)}
                  placeholder="Ask DJ in plain English..."
                  className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-500 ${innerSurface}`}
                />
                <button
                  type="submit"
                  disabled={askDjLoading || !askDjInput.trim()}
                  aria-label="Send message to Ask DJ"
                  className={`rounded-xl px-4 py-2.5 text-white disabled:opacity-40 ${theme.accentBtn}`}
                >
                  <Send size={15} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Neural Command Modal (Live Theme Preview + Engage Button) */}
      <AnimatePresence>
        {showCommandModal && (
          <div className="fixed inset-0 z-[450] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.25rem] border p-6 sm:p-8 space-y-6 shadow-2xl transition-colors duration-300 ${cardSurface}`}
              style={{ boxShadow: `0 25px 80px -15px ${theme.swatch}45` }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full blur-3xl opacity-35 transition-colors duration-300"
                style={{ backgroundColor: theme.swatch }}
              />
              <div className="relative flex items-start justify-between gap-4 border-b border-black/10 dark:border-amber-500/15 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black italic flex items-center gap-2.5">
                    <Compass size={20} className={theme.accentText} /> Neural Command
                  </h2>
                  <p className={`text-xs ${mutedText}`}>
                    Preview Forge colour vibes live and choose your workspace layout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCommandModal(false)}
                  aria-label="Close Neural Command"
                  className={`rounded-2xl border p-2 ${subtlePill}`}
                >
                  <X size={16} />
                </button>
              </div>

              <section className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">Live Forge Vibe</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${subtlePill}`}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.swatch }} />
                    Live: {theme.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.values(FORGE_THEMES) as ForgeTheme[]).map((t) => {
                    const active = t.id === themeId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThemeId(t.id)}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all ${
                          active
                            ? 'border-amber-500 bg-amber-500/20 shadow-sm'
                            : `${subtlePill} opacity-80 hover:opacity-100`
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.swatch }} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="relative space-y-2.5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">Card Flow Style</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSingleCardLayout(false)}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      !singleCardLayout ? 'border-amber-500 bg-amber-500/15' : innerSurface
                    }`}
                  >
                    <p className="text-xs font-black">Before &amp; After Split Card</p>
                    <p className={`mt-1 text-[11px] ${mutedText}`}>Original on top (collapsible), calm fix underneath.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleCardLayout(true)}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      singleCardLayout ? 'border-amber-500 bg-amber-500/15' : innerSurface
                    }`}
                  >
                    <p className="text-xs font-black">Single Calm Card</p>
                    <p className={`mt-1 text-[11px] ${mutedText}`}>Shows only one step at a time with zero extra clutter.</p>
                  </button>
                </div>
              </section>

              <div className="relative flex flex-col items-center gap-2 pt-3 border-t border-black/10 dark:border-amber-500/15">
                <button
                  type="button"
                  onClick={() => setShowCommandModal(false)}
                  className={`rounded-full px-10 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white shadow-lg transition-all hover:scale-105 ${theme.accentBtn}`}
                >
                  Engage
                </button>
                <span className={`text-[10px] font-semibold ${mutedText}`}>
                  Click Engage, press Esc, or type &ldquo;engage&rdquo; anywhere to jump back in.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Neural Identity Modal (ADHD Comfort Settings + Engage Button) */}
      <AnimatePresence>
        {showIdentityModal && (
          <div className="fixed inset-0 z-[450] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.25rem] border p-6 sm:p-8 space-y-6 shadow-2xl ${cardSurface}`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-black/10 dark:border-amber-500/15 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black italic flex items-center gap-2.5">
                    <Crown size={20} className="text-amber-400" /> Neural Identity
                  </h2>
                  <p className={`text-xs ${mutedText}`}>
                    Tailor Prism Forge for how your eyes and brain feel today.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIdentityModal(false)}
                  aria-label="Close Neural Identity"
                  className={`rounded-2xl border p-2 ${subtlePill}`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: 'Bionic Word Anchors',
                    desc: 'Gently bolds word starts so your eyes glide without losing your place.',
                    value: bionicOn,
                    toggle: () => setBionicOn((v) => !v),
                  },
                  {
                    label: 'Easy-Read Font (Lexend)',
                    desc: 'Uses wider letter spacing designed for ADHD & dyslexia comfort.',
                    value: easyReadOn,
                    toggle: () => setEasyReadOn((v) => !v),
                  },
                  {
                    label: 'Warm Sandstone Light Mode',
                    desc: 'Soft paper sandstone surface with zero harsh white glare.',
                    value: !darkMode,
                    toggle: () => setDarkMode((d) => !d),
                  },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    role="switch"
                    aria-checked={opt.value}
                    onClick={opt.toggle}
                    className={`w-full rounded-2xl border p-4 text-left flex items-center justify-between gap-4 transition-all hover:border-amber-500/40 ${innerSurface}`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-black">{opt.label}</p>
                      <p className={`text-xs ${mutedText}`}>{opt.desc}</p>
                    </div>
                    <span
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        opt.value ? 'bg-amber-500' : darkMode ? 'bg-white/15' : 'bg-stone-400/50'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          opt.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center gap-2 pt-3 border-t border-black/10 dark:border-amber-500/15">
                <button
                  type="button"
                  onClick={() => setShowIdentityModal(false)}
                  className={`rounded-full px-10 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white shadow-lg transition-all hover:scale-105 ${theme.accentBtn}`}
                >
                  Engage
                </button>
                <span className={`text-[10px] font-semibold ${mutedText}`}>
                  Click Engage, press Esc, or type &ldquo;engage&rdquo; anywhere to return.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Identical Prism Footer + Interactive Pointer Tour */}
      <div className="relative z-10 pb-24">
        <PrismFooter
          accent="amber"
          onOpenNeuralGuide={() => setTourTrigger((c) => c + 1)}
        />
      </div>
      <PrismTourOverlay
        storageKey="prism_forge_tour_v1"
        prismName="Prism Forge"
        welcomeMessage="Turning tech fear into calm clarity — nothing is ruined."
        accent="amber"
        steps={FORGE_POINTER_TOUR_STEPS}
        darkMode={darkMode}
        manualTriggerCount={tourTrigger}
      />
    </div>
  );
}
