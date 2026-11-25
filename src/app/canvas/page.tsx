'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BatteryLow,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  Crown,
  Eye,
  FastForward,
  Flame,
  Headphones,
  HeartHandshake,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Moon,
  Palette,
  Pause,
  Play,
  Rocket,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  StickyNote,
  Sun,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-react';
import { BionicText } from '@/components/prism/BionicText';
import { ProgressPrism } from '@/components/prism/ProgressPrism';
import { ReadAloud } from '@/components/prism/ReadAloud';
import { NeuralMicroBreak } from '@/components/prism/NeuralMicroBreak';
import { PrismWeaver } from '@/components/prism/PrismWeaver';
import { PrismFooter } from '@/components/prism/PrismFooter';
import { PrismSwitcherPopover } from '@/components/prism/PrismSwitcherPopover';
import { PrismTourOverlay, type TourStep } from '@/components/prism/PrismTourOverlay';
import { useEngageShortcut } from '@/components/prism/useEngageShortcut';
import {
  NeuralIdentityDrawer,
  QuickBrainCheckIn,
} from '@/components/canvas/NeuralIdentityPanel';
import {
  BrainDumpDrawer,
  PrismLensPopup,
  RsvpSpeedReader,
  SensorySoundscapeBar,
  StageBossFight,
  VoiceTalkItOut,
} from '@/components/canvas/SensoryAndTools';
import {
  DEFAULT_NEURAL_PROFILE,
  NEURAL_PRESETS,
  type NeuralPresetId,
  type NeuralProfile,
  type buildProfileFromCheckIn,
} from '@/lib/neural-identity';
import {
  DEMO_QUESTS,
  createInstantLocalPrism,
  splitIntoPrismCards,
  type CanvasTopic,
  type PrismCard,
  type PrismCardRefraction,
} from '@/lib/canvas-parser';
import {
  playCardWinChime,
  playRefractPulse,
  playSprintCompleteChime,
  playStageClearFanfare,
} from '@/lib/prism-audio';

type TextSize = 'small' | 'comfortable' | 'big';
type ColorThemeId = 'midnight' | 'silk' | 'gold' | 'ocean' | 'grace';

interface ColorTheme {
  id: ColorThemeId;
  label: string;
  swatch: string;
  darkBg: string;
  darkCard: string;
  darkInner: string;
  darkGlowA: string;
  darkGlowB: string;
  lightBg: string;
  lightCard: string;
  lightInner: string;
  lightText: string;
  lightMuted: string;
  lightGlowA: string;
  lightGlowB: string;
  accentBg: string;
  accentText: string;
}

const COLOR_THEMES: Record<ColorThemeId, ColorTheme> = {
  midnight: {
    id: 'midnight',
    label: 'Starlight Study',
    swatch: '#4f46e5',
    darkBg: 'bg-[#090d22] text-indigo-50',
    darkCard: 'bg-[#12193a]/90 border-indigo-400/25 shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
    darkInner: 'bg-[#0b1029]/85 border-indigo-400/15 text-indigo-50',
    darkGlowA: 'bg-indigo-600/18',
    darkGlowB: 'bg-sky-500/12',
    lightBg: 'bg-[#e6e3ee] text-[#1c1a30]',
    lightCard: 'bg-[#f1eff7]/95 border-[#c6c1d9] shadow-[0_18px_50px_rgba(28,26,48,0.08)]',
    lightInner: 'bg-[#dedae8] border-[#bfb9d4] text-[#1c1a30]',
    lightText: 'text-[#1c1a30]',
    lightMuted: 'text-[#4c4866]',
    lightGlowA: 'bg-indigo-400/15',
    lightGlowB: 'bg-sky-400/15',
    accentBg: 'bg-indigo-600 hover:bg-indigo-500',
    accentText: 'text-indigo-400',
  },
  silk: {
    id: 'silk',
    label: 'Emerald Arcade',
    swatch: '#059669',
    darkBg: 'bg-[#041d16] text-emerald-50',
    darkCard: 'bg-[#082c22]/90 border-emerald-400/25 shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
    darkInner: 'bg-[#052119]/85 border-emerald-400/15 text-emerald-50',
    darkGlowA: 'bg-emerald-500/15',
    darkGlowB: 'bg-teal-400/10',
    lightBg: 'bg-[#e3ebe2] text-[#064e3b]',
    lightCard: 'bg-[#edf3ec]/95 border-[#bdd3c3] shadow-[0_18px_50px_rgba(20,48,37,0.08)]',
    lightInner: 'bg-[#dce7dd] border-[#b7ceb9] text-[#064e3b]',
    lightText: 'text-[#064e3b]',
    lightMuted: 'text-[#2d5444]',
    lightGlowA: 'bg-emerald-400/15',
    lightGlowB: 'bg-teal-300/15',
    accentBg: 'bg-emerald-600 hover:bg-emerald-500',
    accentText: 'text-emerald-500',
  },
  gold: {
    id: 'gold',
    label: 'Sunbeam Sprint',
    swatch: '#ca8a04',
    darkBg: 'bg-[#161206] text-yellow-50',
    darkCard: 'bg-[#231d0a]/90 border-yellow-400/25 shadow-[0_24px_80px_rgba(0,0,0,0.5)]',
    darkInner: 'bg-[#1a1507]/85 border-yellow-400/15 text-yellow-50',
    darkGlowA: 'bg-yellow-500/15',
    darkGlowB: 'bg-amber-400/10',
    lightBg: 'bg-[#eee6ce] text-[#35290d]',
    lightCard: 'bg-[#f6f0dc]/95 border-[#d8cba5] shadow-[0_18px_50px_rgba(53,41,13,0.08)]',
    lightInner: 'bg-[#e8dec0] border-[#d1c296] text-[#35290d]',
    lightText: 'text-[#35290d]',
    lightMuted: 'text-[#5e4f28]',
    lightGlowA: 'bg-yellow-400/20',
    lightGlowB: 'bg-amber-300/15',
    accentBg: 'bg-yellow-600 hover:bg-yellow-500',
    accentText: 'text-yellow-500',
  },
  ocean: {
    id: 'ocean',
    label: 'Lagoon Drift',
    swatch: '#06b6d4',
    darkBg: 'bg-[#051a22] text-cyan-50',
    darkCard: 'bg-[#0a2936]/90 border-cyan-400/25 shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
    darkInner: 'bg-[#07202a]/85 border-cyan-400/15 text-cyan-50',
    darkGlowA: 'bg-cyan-500/15',
    darkGlowB: 'bg-teal-400/12',
    lightBg: 'bg-[#e0ecef] text-[#0e323d]',
    lightCard: 'bg-[#ebf4f6]/95 border-[#b8d2d9] shadow-[0_18px_50px_rgba(14,50,61,0.08)]',
    lightInner: 'bg-[#d6e7eb] border-[#aecbd3] text-[#0e323d]',
    lightText: 'text-[#0e323d]',
    lightMuted: 'text-[#305763]',
    lightGlowA: 'bg-cyan-400/15',
    lightGlowB: 'bg-teal-300/15',
    accentBg: 'bg-cyan-600 hover:bg-cyan-500',
    accentText: 'text-cyan-400',
  },
  grace: {
    id: 'grace',
    label: 'Berry Spark',
    swatch: '#db2777',
    darkBg: 'bg-[#1a0a16] text-pink-50',
    darkCard: 'bg-[#2a1123]/90 border-pink-400/25 shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
    darkInner: 'bg-[#200d1b]/85 border-pink-400/15 text-pink-50',
    darkGlowA: 'bg-pink-500/15',
    darkGlowB: 'bg-fuchsia-400/12',
    lightBg: 'bg-[#efe1ea] text-[#3b152c]',
    lightCard: 'bg-[#f7ecf3]/95 border-[#dabcd0] shadow-[0_18px_50px_rgba(59,21,44,0.08)]',
    lightInner: 'bg-[#e8d6e2] border-[#d2b0c6] text-[#3b152c]',
    lightText: 'text-[#3b152c]',
    lightMuted: 'text-[#643552]',
    lightGlowA: 'bg-pink-400/15',
    lightGlowB: 'bg-fuchsia-300/15',
    accentBg: 'bg-pink-600 hover:bg-pink-500',
    accentText: 'text-pink-400',
  },
};

const PLAY_POINTER_TOUR_STEPS: readonly TourStep[] = [
  {
    selector: '[data-tour="play-engine-switcher"]',
    title: 'Switch Prisms Anytime',
    description: 'Tap Prism Engine here to jump neatly between Focus, Play, Forge, Word, or the main Engine Hub.',
  },
  {
    selector: '[data-tour="play-neural-command"]',
    title: 'Neural Command & Live Vibes',
    description: 'Connect Canvas or paste notes, switch quests, and test color vibes with an instant live preview.',
  },
  {
    selector: '[data-tour="play-neural-identity"]',
    title: 'Your Brain Profile',
    description: 'Toggle soundscapes, Bionic scanning, RSVP speed-reading, or Low-Battery mode so only what helps you stays visible.',
  },
  {
    selector: '[data-tour="play-refract-btn"]',
    title: 'Refract Any Study Card',
    description: 'Turn a dense paragraph into The Tiny Idea, a memorable Metaphor, a Dopamine Boost, and One Small Move.',
  },
  {
    selector: '[data-tour="play-claim-win-btn"]',
    title: 'Claim Your Win',
    description: 'Finished reading this one calm card? Tap Claim Win to earn XP and move gently to the next card.',
  },
];

const TEXT_SIZE_STYLES: Record<TextSize, string> = {
  small: 'text-base sm:text-[17px] leading-[1.75]',
  comfortable: 'text-lg sm:text-[20px] leading-[1.85]',
  big: 'text-xl sm:text-[25px] leading-[1.9]',
};

const CANVAS_TOKEN_KEY = 'prism_canvas_token';
const CANVAS_URL_KEY = 'prism_canvas_course_url';
const CANVAS_HANDOFF_KEY = 'prism_canvas_handoff';
const TEXT_SIZE_KEY = 'prism_canvas_text_size';
const DYSLEXIA_KEY = 'prism_canvas_dyslexia';
const BIONIC_KEY = 'prism_canvas_bionic';
const THEME_KEY = 'prism_canvas_theme';
const COLOR_THEME_KEY = 'prism_canvas_color_theme';
const CHIMES_KEY = 'prism_canvas_chimes';
const PROGRESS_KEY = 'prism_canvas_progress_v1';
const NEURAL_PROFILE_KEY = 'prism_canvas_neural_profile_v1';
const CHECKIN_DONE_KEY = 'prism_canvas_checkin_done_v1';

interface SavedProgress {
  xp: number;
  winsToday: number;
  streakDays: number;
  bestStreak?: number;
  daysShownUp?: number;
  lastActiveDate: string;
  completedTopics: string[];
  lastTopicId?: string;
  lastCardIdx?: number;
  customTopics?: CanvasTopic[];
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CanvasPrismPlayPage() {
  // Theme & Reading Comfort
  const [darkMode, setDarkMode] = useState(true);
  const [colorTheme, setColorTheme] = useState<ColorThemeId>('midnight');
  const [textSize, setTextSize] = useState<TextSize>('comfortable');
  const [bionicOn, setBionicOn] = useState(false);
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState(true);
  const [chimesOn, setChimesOn] = useState(true);
  const [localOnlyMode, setLocalOnlyMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Topics & Cards (100% browser-private)
  const [topics, setTopics] = useState<CanvasTopic[]>(DEMO_QUESTS);
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [cards, setCards] = useState<PrismCard[]>(DEMO_QUESTS[0].cards || []);
  const [cardIdx, setCardIdx] = useState(0);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [resumedBanner, setResumedBanner] = useState<string | null>(null);

  // Per-card Prism Refractions
  const [refractions, setRefractions] = useState<Record<string, PrismCardRefraction>>({});
  const [showPrismForCard, setShowPrismForCard] = useState<Record<string, boolean>>({});
  const [refracting, setRefracting] = useState(false);
  const [refractNotice, setRefractNotice] = useState<string | null>(null);

  // Game Loop & Cross-Session Progress
  const [winsToday, setWinsToday] = useState(0);
  const [xp, setXp] = useState(0);
  const [streakDays, setStreakDays] = useState(1);
  const [bestStreak, setBestStreak] = useState(1);
  const [daysShownUp, setDaysShownUp] = useState(1);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [showStageClear, setShowStageClear] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [breakLevel, setBreakLevel] = useState(1);
  const [winBurst, setWinBurst] = useState(false);
  const [winPulseCount, setWinPulseCount] = useState(0);
  const [starredContents, setStarredContents] = useState<string[]>([]);

  // Neural Identity & Opt-In Superpowers (A–H)
  const [profile, setProfile] = useState<NeuralProfile>(DEFAULT_NEURAL_PROFILE);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showIdentityDrawer, setShowIdentityDrawer] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [rsvpActive, setRsvpActive] = useState(false);
  const [lensWord, setLensWord] = useState<string | null>(null);

  // Gentle Focus Timer / Body-Doubling Companion + Beat-the-Clock Challenge (B)
  const [sprintTotalSecs, setSprintTotalSecs] = useState<number>(0);
  const [sprintSecsLeft, setSprintSecsLeft] = useState<number>(0);
  const [sprintRunning, setSprintRunning] = useState(false);
  const [sprintFinishedNote, setSprintFinishedNote] = useState(false);
  const [challengeSprintActive, setChallengeSprintActive] = useState(false);
  const [sprintCardsDone, setSprintCardsDone] = useState(0);
  const chimesRef = useRef(chimesOn);
  chimesRef.current = chimesOn;

  // Modals, Command Center & Bottom Studio Docks
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectTab, setConnectTab] = useState<'canvas' | 'paste'>('canvas');
  const [showQuestDrawer, setShowQuestDrawer] = useState(false);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [tourTrigger, setTourTrigger] = useState(0);
  useEngageShortcut(showCommandModal, () => setShowCommandModal(false));
  const [soundStudioOpen, setSoundStudioOpen] = useState(false);
  const [focusStudioOpen, setFocusStudioOpen] = useState(false);

  // Private Canvas Connection (sessionStorage only — NEVER pre-filled with personal course URL!)
  const [courseUrl, setCourseUrl] = useState('');
  const [canvasToken, setCanvasToken] = useState('');
  const [isCanvasConnected, setIsCanvasConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Paste-a-reading form
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteText, setPasteText] = useState('');

  // Load saved preferences, Neural Identity, cross-session progress, and extension handoff
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedSize = localStorage.getItem(TEXT_SIZE_KEY) as TextSize | null;
    if (savedSize && ['small', 'comfortable', 'big'].includes(savedSize)) setTextSize(savedSize);
    const savedDyslexia = localStorage.getItem(DYSLEXIA_KEY);
    if (savedDyslexia !== null) setDyslexiaFriendly(savedDyslexia === 'true');
    const savedBionic = localStorage.getItem(BIONIC_KEY);
    if (savedBionic !== null) setBionicOn(savedBionic === 'true');
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setDarkMode(savedTheme === 'dark');
    const savedColor = localStorage.getItem(COLOR_THEME_KEY) as ColorThemeId | null;
    if (savedColor && savedColor in COLOR_THEMES) setColorTheme(savedColor);
    const savedChimes = localStorage.getItem(CHIMES_KEY);
    if (savedChimes !== null) setChimesOn(savedChimes === 'true');

    try {
      const savedProfileRaw = localStorage.getItem(NEURAL_PROFILE_KEY);
      if (savedProfileRaw) {
        const parsed = JSON.parse(savedProfileRaw) as Partial<NeuralProfile>;
        setProfile({ ...DEFAULT_NEURAL_PROFILE, ...parsed });
      }
      const checkInDone = localStorage.getItem(CHECKIN_DONE_KEY);
      if (!checkInDone) {
        setShowCheckIn(true);
      }
    } catch {
      // Ignore malformed profile
    }

    try {
      const vault = JSON.parse(localStorage.getItem('prism_starred_items') || '[]');
      if (Array.isArray(vault)) {
        setStarredContents(vault.map((v: { content?: string }) => v.content || ''));
      }
    } catch {
      // Ignore malformed vault
    }

    // Restore cross-session progress (XP, streak, best streak, days shown up, completed topics, custom pasted topics, last card)
    try {
      const rawProgress = localStorage.getItem(PROGRESS_KEY);
      if (rawProgress) {
        const saved = JSON.parse(rawProgress) as SavedProgress;
        const today = todayKey();
        const isSameDay = saved.lastActiveDate === today;
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const nextStreak = isSameDay
          ? Math.max(1, saved.streakDays || 1)
          : saved.lastActiveDate === yesterday
            ? (saved.streakDays || 1) + 1
            : 1;
        const nextDaysShownUp = isSameDay
          ? Math.max(1, saved.daysShownUp || saved.streakDays || 1)
          : (saved.daysShownUp || saved.streakDays || 1) + 1;
        const nextBestStreak = Math.max(nextStreak, saved.bestStreak || 1);

        setXp(Number(saved.xp || 0));
        setWinsToday(isSameDay ? Number(saved.winsToday || 0) : 0);
        setStreakDays(nextStreak);
        setBestStreak(nextBestStreak);
        setDaysShownUp(nextDaysShownUp);
        if (Array.isArray(saved.completedTopics)) setCompletedTopics(saved.completedTopics);

        const mergedTopics = Array.isArray(saved.customTopics) && saved.customTopics.length > 0
          ? [...saved.customTopics, ...DEMO_QUESTS]
          : DEMO_QUESTS;
        setTopics(mergedTopics);

        if (saved.lastTopicId) {
          const foundIdx = mergedTopics.findIndex((t) => t.id === saved.lastTopicId);
          if (foundIdx >= 0 && mergedTopics[foundIdx].cards?.length) {
            const topicCards = mergedTopics[foundIdx].cards!;
            const safeCardIdx = Math.min(Math.max(0, saved.lastCardIdx || 0), topicCards.length - 1);
            setActiveTopicIdx(foundIdx);
            setCards(topicCards);
            setCardIdx(safeCardIdx);
            if (safeCardIdx > 0 || (saved.xp || 0) > 0) {
              setResumedBanner(`Welcome back — resumed at Card ${safeCardIdx + 1} (${saved.xp || 0} XP saved)`);
            }
          }
        }
      }
    } catch {
      // Ignore malformed saved progress
    }

    const savedUrl = sessionStorage.getItem(CANVAS_URL_KEY);
    const savedToken = sessionStorage.getItem(CANVAS_TOKEN_KEY);
    if (savedUrl) setCourseUrl(savedUrl);
    if (savedToken) setCanvasToken(savedToken);

    const loadHandoff = () => {
      const raw = sessionStorage.getItem(CANVAS_HANDOFF_KEY);
      if (!raw) return;
      sessionStorage.removeItem(CANVAS_HANDOFF_KEY);
      try {
        const payload = JSON.parse(raw) as { title?: string; text?: string };
        if (payload?.text?.trim()) {
          const handoffCards = splitIntoPrismCards(payload.title || 'Canvas Reading', payload.text, false);
          const customTopic: CanvasTopic = {
            id: `ext-${Date.now()}`,
            title: payload.title || 'Captured Canvas Reading',
            moduleName: 'Captured via Chrome Extension',
            type: 'Custom',
            cards: handoffCards,
          };
          setTopics((prev) => [customTopic, ...prev]);
          setActiveTopicIdx(0);
          setCards(handoffCards);
          setCardIdx(0);
          setShowStageClear(false);
        }
      } catch {
        // Ignore invalid handoff payload
      }
    };
    loadHandoff();
    window.addEventListener('prism:canvas-handoff', loadHandoff);
    setHydrated(true);
    return () => window.removeEventListener('prism:canvas-handoff', loadHandoff);
  }, []);

  // Persist visual, audio, and Neural Identity preferences
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    localStorage.setItem(TEXT_SIZE_KEY, textSize);
    localStorage.setItem(DYSLEXIA_KEY, String(dyslexiaFriendly));
    localStorage.setItem(BIONIC_KEY, String(bionicOn));
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    localStorage.setItem(COLOR_THEME_KEY, colorTheme);
    localStorage.setItem(CHIMES_KEY, String(chimesOn));
    try {
      localStorage.setItem(NEURAL_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore quota errors
    }
  }, [hydrated, textSize, dyslexiaFriendly, bionicOn, darkMode, colorTheme, chimesOn, profile]);

  // Persist cross-session progress
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    const active = topics[activeTopicIdx];
    const customTopics = topics.filter((t) => t.type === 'Custom').slice(0, 12);
    const payload: SavedProgress = {
      xp,
      winsToday,
      streakDays,
      bestStreak: Math.max(bestStreak, streakDays),
      daysShownUp,
      lastActiveDate: todayKey(),
      completedTopics,
      lastTopicId: active?.id,
      lastCardIdx: cardIdx,
      customTopics,
    };
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }, [hydrated, xp, winsToday, streakDays, bestStreak, daysShownUp, completedTopics, topics, activeTopicIdx, cardIdx]);

  // Gentle Body-Doubling Sprint timer tick
  useEffect(() => {
    if (!sprintRunning || sprintSecsLeft <= 0) return;
    const interval = setInterval(() => {
      setSprintSecsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSprintRunning(false);
          setSprintFinishedNote(true);
          setXp((curr) => curr + (challengeSprintActive ? 30 : 15));
          if (chimesRef.current) playSprintCompleteChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sprintRunning, sprintSecsLeft, challengeSprintActive]);

  const applyPreset = (presetId: Exclude<NeuralPresetId, 'custom'>) => {
    const preset = NEURAL_PRESETS[presetId];
    setProfile(preset.profile);
    setTextSize(preset.recommendedTextSize);
    setBionicOn(preset.recommendedBionic);
    setDyslexiaFriendly(preset.recommendedEasyRead);
    if (!preset.profile.showRsvpMode) setRsvpActive(false);
  };

  const handleCheckInComplete = (result: ReturnType<typeof buildProfileFromCheckIn>) => {
    setProfile(result.profile);
    setTextSize(result.textSize);
    setBionicOn(result.bionicOn);
    setDyslexiaFriendly(result.dyslexiaFriendly);
    setChimesOn(result.chimesOn);
    if (!result.profile.showRsvpMode) setRsvpActive(false);
    setShowCheckIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHECKIN_DONE_KEY, '1');
    }
  };

  const handleSkipCheckIn = () => {
    setShowCheckIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHECKIN_DONE_KEY, '1');
    }
  };

  const theme = COLOR_THEMES[colorTheme];
  const activeTopic = topics[activeTopicIdx] || DEMO_QUESTS[0];
  const currentCard = cards[cardIdx] || cards[0];
  const currentCardKey = currentCard ? `${activeTopic.id}:${currentCard.id}` : '';
  const currentRefraction = currentCardKey ? refractions[currentCardKey] : undefined;
  const isPrismVisible = currentCardKey ? Boolean(showPrismForCard[currentCardKey]) : false;

  const nextTopic = useMemo(() => {
    if (activeTopicIdx + 1 < topics.length) return topics[activeTopicIdx + 1];
    return null;
  }, [activeTopicIdx, topics]);

  const bodyDoubleMessage = useMemo(() => {
    if (sprintFinishedNote) {
      return challengeSprintActive
        ? `Beat-the-Clock complete! ${sprintCardsDone} cards cleared (+30 XP)!`
        : 'Sprint complete! +15 XP — want a quick 20s brain break?';
    }
    if (sprintTotalSecs === 0) {
      return profile.challengeMode
        ? 'Beat-the-Clock ready — race 3 cards in 4 minutes or pick a steady sprint!'
        : 'Studying with you — pick a gentle sprint or just read at your own pace.';
    }
    const pct = 1 - sprintSecsLeft / sprintTotalSecs;
    if (!sprintRunning) return 'Paused — zero pressure. Resume whenever your brain feels ready.';
    if (challengeSprintActive) {
      return sprintCardsDone >= 3
        ? 'Goal crushed! 3+ cards cleared before the clock!'
        : `Beat-the-Clock active: ${sprintCardsDone} / 3 cards cleared — keep rolling!`;
    }
    if (pct < 0.35) return 'Right here with you — just focus on this one calm card.';
    if (pct < 0.75) return 'Halfway through this sprint — steady, awesome momentum!';
    return 'Final stretch — proud of your focus!';
  }, [sprintFinishedNote, sprintTotalSecs, sprintSecsLeft, sprintRunning, profile.challengeMode, challengeSprintActive, sprintCardsDone]);

  const startSprint = (minutes: number, isChallenge = false) => {
    const secs = minutes * 60;
    setSprintTotalSecs(secs);
    setSprintSecsLeft(secs);
    setSprintRunning(true);
    setSprintFinishedNote(false);
    setChallengeSprintActive(isChallenge);
    setSprintCardsDone(0);
  };

  const resetSprint = () => {
    setSprintRunning(false);
    setSprintTotalSecs(0);
    setSprintSecsLeft(0);
    setSprintFinishedNote(false);
    setChallengeSprintActive(false);
    setSprintCardsDone(0);
  };

  const loadTopicByIndex = async (idx: number, topicList: CanvasTopic[] = topics, tokenOverride?: string, urlOverride?: string) => {
    const target = topicList[idx];
    if (!target) return;
    setActiveTopicIdx(idx);
    setCardIdx(0);
    setShowStageClear(false);
    setTopicError(null);
    setRefractNotice(null);
    setResumedBanner(null);

    if (target.cards && target.cards.length > 0) {
      setCards(target.cards);
      return;
    }

    const tokenToUse = tokenOverride ?? canvasToken;
    const urlToUse = urlOverride ?? courseUrl;
    if (!tokenToUse) {
      setTopicError('Reconnect your Canvas token to open this topic.');
      return;
    }

    setLoadingTopic(true);
    try {
      const res = await fetch('/api/canvas/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-canvas-token': tokenToUse,
        },
        body: JSON.stringify({
          courseUrl: urlToUse,
          itemType: target.type,
          pageUrl: target.pageUrl,
          contentId: target.contentId,
          title: target.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not open this topic.');
      const loadedCards: PrismCard[] = Array.isArray(data.cards) && data.cards.length > 0
        ? data.cards
        : [{ id: 'card-1', heading: target.title, text: 'No readable text found on this Canvas page.', wordCount: 8 }];
      setCards(loadedCards);
      setTopics((prev) => prev.map((t, i) => (i === idx ? { ...t, cards: loadedCards } : t)));
    } catch (err: unknown) {
      setTopicError(err instanceof Error ? err.message : 'Could not load this Canvas topic.');
    } finally {
      setLoadingTopic(false);
    }
  };

  const handleConnectCanvas = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setConnecting(true);
    try {
      const res = await fetch('/api/canvas/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-canvas-token': canvasToken.trim(),
        },
        body: JSON.stringify({ courseUrl: courseUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not connect to Canvas.');
      const fetchedTopics: CanvasTopic[] = Array.isArray(data.topics) ? data.topics : [];
      if (fetchedTopics.length === 0) {
        throw new Error('Connected to Canvas, but no readable pages were found in this course yet.');
      }

      sessionStorage.setItem(CANVAS_TOKEN_KEY, canvasToken.trim());
      sessionStorage.setItem(CANVAS_URL_KEY, courseUrl.trim());
      setIsCanvasConnected(true);
      setTopics(fetchedTopics);
      setShowConnectModal(false);
      await loadTopicByIndex(0, fetchedTopics, canvasToken.trim(), courseUrl.trim());
    } catch (err: unknown) {
      setConnectError(err instanceof Error ? err.message : 'Could not connect to Canvas.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectCanvas = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CANVAS_TOKEN_KEY);
      sessionStorage.removeItem(CANVAS_URL_KEY);
    }
    setCanvasToken('');
    setCourseUrl('');
    setIsCanvasConnected(false);
    setTopics(DEMO_QUESTS);
    setActiveTopicIdx(0);
    setCards(DEMO_QUESTS[0].cards || []);
    setCardIdx(0);
    setShowStageClear(false);
  };

  const handleLoadPastedReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const title = pasteTitle.trim() || 'My Pasted Reading';
    const newCards = splitIntoPrismCards(title, pasteText, false);
    const customTopic: CanvasTopic = {
      id: `paste-${Date.now()}`,
      title,
      moduleName: 'Private Browser Reading',
      type: 'Custom',
      cards: newCards,
    };
    const nextList = [customTopic, ...topics];
    setTopics(nextList);
    setActiveTopicIdx(0);
    setCards(newCards);
    setCardIdx(0);
    setShowStageClear(false);
    setPasteTitle('');
    setPasteText('');
    setShowConnectModal(false);
  };

  const handleRefractCard = async () => {
    if (!currentCard || !currentCardKey) return;

    if (currentRefraction) {
      setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: !prev[currentCardKey] }));
      return;
    }

    setRefracting(true);
    setRefractNotice(null);

    if (localOnlyMode) {
      const local = createInstantLocalPrism(currentCard.text, currentCard.heading);
      setRefractions((prev) => ({ ...prev, [currentCardKey]: local }));
      setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: true }));
      if (chimesOn) playRefractPulse();
      setRefracting(false);
      return;
    }

    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lane: 'play',
          text: `${currentCard.heading}\n\n${currentCard.text}`,
          missionGoal: 'Turn this short study card into a tiny plain-language idea, a memorable metaphor, a dopamine boost, and one tiny next move.',
          simplicityLevel: 'concise',
          cognitiveMode: 'adhd',
          isScenic: true,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.chunks?.[0]) {
        const local = createInstantLocalPrism(currentCard.text, currentCard.heading);
        setRefractions((prev) => ({ ...prev, [currentCardKey]: local }));
        setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: true }));
        if (chimesOn) playRefractPulse();
        setRefractNotice('Local Structural Refraction — verify against your source material (0 tokens).');
        return;
      }

      const firstChunk = payload.chunks[0];
      const fallback = createInstantLocalPrism(currentCard.text, currentCard.heading);
      const isLocalSource =
        payload.usage?.provider === 'local'
        || payload.mode === 'local'
        || payload.routeMeta?.isLocalFallback === true;
      const refracted: PrismCardRefraction = {
        tinyIdea: payload.playCard?.tinyIdea || payload.tldr?.[0] || firstChunk.summary || fallback.tinyIdea,
        metaphor: payload.playCard?.metaphor || firstChunk.metaphor || fallback.metaphor,
        dopamineBoost: payload.playCard?.dopamineBoost || firstChunk.dopamineHook || fallback.dopamineBoost,
        oneSmallMove: payload.playCard?.oneSmallMove || payload.actions?.[0]?.task || fallback.oneSmallMove,
        keyTerms:
          Array.isArray(payload.playCard?.keyTerms) && payload.playCard.keyTerms.length > 0
            ? payload.playCard.keyTerms
            : Array.isArray(firstChunk.keyTerms) && firstChunk.keyTerms.length > 0
              ? firstChunk.keyTerms
              : fallback.keyTerms,
        source: isLocalSource ? 'local' : 'ai',
      };

      if (isLocalSource) {
        setRefractNotice('Local Structural Refraction — verify against your source material (0 tokens).');
      }

      setRefractions((prev) => ({ ...prev, [currentCardKey]: refracted }));
      setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: true }));
      if (chimesOn) playRefractPulse();
    } catch {
      const local = createInstantLocalPrism(currentCard.text, currentCard.heading);
      setRefractions((prev) => ({ ...prev, [currentCardKey]: local }));
      setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: true }));
      if (chimesOn) playRefractPulse();
      setRefractNotice('Local Structural Refraction — verify against your source material (offline fallback).');
    } finally {
      setRefracting(false);
    }
  };

  const handleStarToVault = (content: string, type: 'metaphor' | 'hook') => {
    if (!content) return;
    try {
      const existing = JSON.parse(localStorage.getItem('prism_starred_items') || '[]');
      const list = Array.isArray(existing) ? existing : [];
      const exists = list.some((i: { content: string }) => i.content === content);
      const updated = exists
        ? list.filter((i: { content: string }) => i.content !== content)
        : [{ heading: type === 'metaphor' ? 'The Metaphor' : 'Dopamine Boost', content, type }, ...list];
      localStorage.setItem('prism_starred_items', JSON.stringify(updated));
      setStarredContents(updated.map((i: { content: string }) => i.content));
    } catch {
      // Ignore storage errors
    }
  };

  const handleClaimWin = () => {
    const nextWins = winsToday + 1;
    setWinsToday(nextWins);
    setXp((prev) => prev + 25);
    setWinPulseCount((c) => c + 1);
    if (sprintRunning) {
      setSprintCardsDone((c) => c + 1);
    }
    if (!profile.reducedMotion) {
      setWinBurst(true);
      setTimeout(() => setWinBurst(false), 750);
    }
    setResumedBanner(null);

    const isLastCard = cardIdx >= cards.length - 1;
    if (isLastCard) {
      if (chimesOn) playStageClearFanfare();
      if (!completedTopics.includes(activeTopic.id)) {
        setCompletedTopics((prev) => [...prev, activeTopic.id]);
      }
      setShowStageClear(true);
      return;
    }

    if (chimesOn) playCardWinChime();

    if (nextWins % 3 === 0) {
      setBreakLevel(Math.floor(nextWins / 3));
      setShowBreak(true);
    }

    setCardIdx((prev) => prev + 1);
    setRefractNotice(null);
  };

  // Keyboard Flow Shortcuts (← / → for cards, R to Refract, B for Bionic)
  const claimWinRef = useRef(handleClaimWin);
  claimWinRef.current = handleClaimWin;
  const refractRef = useRef(handleRefractCard);
  refractRef.current = handleRefractCard;

  useEffect(() => {
    if (!profile.keyboardFlow || typeof window === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (showConnectModal || showQuestDrawer || showCommandModal || showCheckIn || showIdentityDrawer || showBrainDump || showBreak || showStageClear) {
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        claimWinRef.current();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCardIdx((i) => Math.max(0, i - 1));
      } else if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        void refractRef.current();
      } else if (e.key.toLowerCase() === 'b' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setBionicOn((b) => !b);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [profile.keyboardFlow, showConnectModal, showQuestDrawer, showCommandModal, showCheckIn, showIdentityDrawer, showBrainDump, showBreak, showStageClear]);

  const surfaceBg = darkMode ? theme.darkBg : theme.lightBg;
  const glassCard = darkMode ? theme.darkCard : theme.lightCard;
  const readingSurface = darkMode ? theme.darkInner : theme.lightInner;
  const mutedText = darkMode ? 'text-slate-400' : theme.lightMuted;
  const subtlePill = darkMode
    ? 'bg-white/5 border-white/10 text-slate-200'
    : 'bg-[#ede7db]/90 border-[#d6ccb9] text-[#243040]';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${surfaceBg}`}>
      {/* Quiet Fidget Corner (Reusing Dassah's Prism PrismWeaver) */}
      {profile.showFidgetCorner && !profile.reducedMotion && !profile.lowBatteryMode && (
        <PrismWeaver completedPulse={winPulseCount} focusMode="dastastic" />
      )}

      {/* Ambient Background + Truly Visible Kinetic Living Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {profile.kineticMotion && !profile.reducedMotion ? (
          <>
            {/* Luminous sweeping prism orbs along peripheral edges */}
            <motion.div
              animate={{ x: [0, 150, -90, 0], y: [0, 130, -60, 0], scale: [1, 1.22, 0.9, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-16 -left-16 h-[26rem] w-[26rem] rounded-full blur-2xl"
              style={{
                background: darkMode
                  ? `radial-gradient(circle, ${theme.swatch}70 0%, transparent 70%)`
                  : `radial-gradient(circle, ${theme.swatch}48 0%, transparent 70%)`,
              }}
            />
            <motion.div
              animate={{ x: [0, -160, 100, 0], y: [0, -120, 90, 0], scale: [1, 0.9, 1.24, 1] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-4 -right-16 h-[28rem] w-[28rem] rounded-full blur-2xl"
              style={{
                background: darkMode
                  ? 'radial-gradient(circle, rgba(34,211,238,0.42) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(14,165,233,0.34) 0%, transparent 70%)',
              }}
            />
            <motion.div
              animate={{ x: [-80, 120, -80], y: [40, -90, 40], scale: [0.95, 1.15, 0.95] }}
              transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[22rem] w-[22rem] rounded-full blur-3xl"
              style={{
                background: darkMode
                  ? 'radial-gradient(circle, rgba(168,85,247,0.32) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)',
              }}
            />
            {/* Crisp floating frosted prism rings in peripheral margins */}
            <motion.div
              animate={{ y: [0, -45, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              className={`hidden md:block absolute top-28 left-10 h-36 w-36 rounded-[2.5rem] border-2 ${
                darkMode ? 'border-blue-400/35 bg-blue-500/10' : 'border-blue-500/30 bg-blue-400/10'
              }`}
            />
            <motion.div
              animate={{ y: [0, 50, 0], rotate: [360, 180, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className={`hidden md:block absolute bottom-28 right-10 h-44 w-44 rounded-full border-2 ${
                darkMode ? 'border-cyan-400/35 bg-cyan-500/10' : 'border-emerald-500/30 bg-emerald-400/10'
              }`}
            />
          </>
        ) : (
          <>
            <div className={`absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl ${darkMode ? theme.darkGlowA : theme.lightGlowA}`} />
            <div className={`absolute bottom-0 right-1/4 h-96 w-96 rounded-full blur-3xl ${darkMode ? theme.darkGlowB : theme.lightGlowB}`} />
          </>
        )}
      </div>

      {/* Full-Width Spacious Top Navigation Bar (mirroring main Dassah's Prism) */}
      <header className="relative z-20 w-full border-b border-black/5 dark:border-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          {/* Left: Calm Progress Pill */}
          <div
            className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-xs font-bold ${subtlePill}`}
            title={profile.shameFreeStreak ? `${daysShownUp} total days shown up (shame-free)` : `Competitive Streak: ${streakDays}d · Personal Best: ${bestStreak}d`}
          >
            <Flame size={14} className="text-amber-500" />
            <span>{winsToday} {winsToday === 1 ? 'win' : 'wins'}</span>
            <span className="opacity-35">·</span>
            <span className="text-emerald-600 dark:text-emerald-400">{xp} XP</span>
            <span className="opacity-35">·</span>
            {profile.shameFreeStreak ? (
              <span>{daysShownUp}d shown up</span>
            ) : (
              <span>{streakDays}d (Best {bestStreak}d)</span>
            )}
          </div>

          {/* Right: Separated Spatial Controls (Prism Switcher · Neural Command · Neural Identity · Theme) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div data-tour="play-engine-switcher">
              <PrismSwitcherPopover current="play" darkMode={darkMode} />
            </div>

            <button
              data-tour="play-neural-command"
              onClick={() => setShowCommandModal(true)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black transition-all hover:border-blue-500/50 ${subtlePill}`}
            >
              <Compass size={15} className={theme.accentText} />
              <span>Neural Command</span>
              {isCanvasConnected && <span className="h-2 w-2 rounded-full bg-emerald-500" title="Canvas Connected" />}
            </button>

            <button
              data-tour="play-neural-identity"
              onClick={() => setShowIdentityDrawer(true)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black transition-all hover:border-amber-400/60 ${subtlePill}`}
            >
              <Crown size={15} className="text-amber-400" />
              <span>Neural Identity</span>
            </button>

            <button
              onClick={() => setDarkMode((d) => !d)}
              aria-label={darkMode ? 'Switch to Soft Paper Light Mode' : 'Switch to Dark Mode'}
              title={darkMode ? 'Switch to Soft Paper Light Mode' : 'Switch to Dark Mode'}
              className={`rounded-2xl border p-2.5 transition-colors ${subtlePill}`}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Spacious, Uncluttered Center Reading Stage */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-6 pb-36 sm:px-6 sm:pt-8 space-y-6">
        {/* Signature Prism Play Wordmark & Catchphrase (mirroring Prism Focus hero) */}
        {!profile.lowBatteryMode && (
          <div className="text-center space-y-3">
            <Link
              href="/engine"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.2)] transition-all hover:border-emerald-400/60"
            >
              <Sparkles size={12} className="text-emerald-400" /> Dassah&apos;s Prism Engine · Powered by The Prism Engine
            </Link>
            <h1 className="prism-brand text-4xl sm:text-6xl md:text-7xl font-black tracking-tight italic leading-[1.15]">
              Prism{' '}
              <span className="prism-text brand-prism">
                Play
              </span>
            </h1>
            <PrismPlayTagline darkMode={darkMode} reducedMotion={profile.reducedMotion} />
          </div>
        )}
        {/* Low-Battery Mode Banner ("Just 1 Card Today") */}
        {profile.lowBatteryMode && (
          <div className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-xs font-bold ${subtlePill}`}>
            <span className="inline-flex items-center gap-2">
              <BatteryLow size={15} className="text-emerald-500" />
              Low-Battery Mode: Just this 1 calm card today. Extra docks are tucked away.
            </span>
            <button
              onClick={() => setProfile((p) => ({ ...p, preset: 'custom', lowBatteryMode: false }))}
              className="rounded-xl bg-blue-600 px-3 py-1 text-[11px] font-black text-white hover:bg-blue-500"
            >
              Exit Low-Battery
            </button>
          </div>
        )}

        {/* Cross-Session Resume Banner */}
        {resumedBanner && !profile.lowBatteryMode && (
          <div className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold ${subtlePill}`}>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              {resumedBanner}
            </span>
            <button onClick={() => setResumedBanner(null)} aria-label="Dismiss welcome back notice" className="opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Single Slim Reading Comfort Strip (the ONLY control bar above the card!) */}
        {!profile.lowBatteryMode && (
          <section
            aria-label="Reading comfort controls"
            className={`flex flex-wrap items-center justify-between gap-3 rounded-3xl border px-4 py-3 backdrop-blur-2xl ${glassCard}`}
          >
            {/* Text Size */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${mutedText}`}>Size:</span>
              <div
                className={`inline-flex rounded-2xl border p-1 ${darkMode ? 'border-white/10 bg-black/30' : 'border-[#d6ccb9] bg-[#ebe4d7]'}`}
                role="group"
                aria-label="Text size"
              >
                {(['small', 'comfortable', 'big'] as TextSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    aria-pressed={textSize === size}
                    className={`rounded-xl px-3 py-1 text-xs font-bold capitalize transition-all ${
                      textSize === size
                        ? `${theme.accentBg} text-white shadow-sm`
                        : `${mutedText} hover:opacity-100`
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Bionic · Easy-Read · Read Aloud */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setBionicOn((b) => !b)}
                aria-pressed={bionicOn}
                className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  bionicOn
                    ? `border-transparent text-white ${theme.accentBg}`
                    : `${subtlePill} hover:border-blue-500/40`
                }`}
              >
                <Eye size={13} /> Bionic
              </button>

              <button
                onClick={() => setDyslexiaFriendly((d) => !d)}
                aria-pressed={dyslexiaFriendly}
                className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  dyslexiaFriendly
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : `${subtlePill} hover:border-emerald-500/40`
                }`}
              >
                <BookOpen size={13} /> Easy-Read
              </button>

              {currentCard && (
                <ReadAloud
                  text={`${currentCard.heading}. ${currentCard.text}`}
                  darkMode={darkMode}
                  defaultSpeed={profile.preferredReadSpeed}
                />
              )}
            </div>
          </section>
        )}

        {/* Main Quest Card Surface */}
        <main>
          {loadingTopic ? (
            <div className={`rounded-[2rem] border p-12 text-center backdrop-blur-2xl ${glassCard} space-y-4`}>
              <Loader2 size={32} className="mx-auto animate-spin text-blue-500" />
              <p className="text-lg font-bold">Opening your next tiny quest...</p>
              <p className={`text-sm ${mutedText}`}>Splitting the Canvas page into calm, bite-sized cards.</p>
            </div>
          ) : topicError ? (
            <div className={`rounded-[2rem] border p-8 text-center backdrop-blur-2xl ${glassCard} space-y-4`}>
              <p className="text-base font-bold text-rose-500">{topicError}</p>
              <button
                onClick={() => setShowConnectModal(true)}
                className={`rounded-2xl px-5 py-2.5 text-sm font-bold text-white ${theme.accentBg}`}
              >
                Open Canvas Connection
              </button>
            </div>
          ) : showStageClear ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-[2.25rem] border p-8 sm:p-10 text-center backdrop-blur-2xl ${glassCard} space-y-6`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                <Trophy size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-500">Stage Clear!</p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{activeTopic.title}</h1>
                <p className={`mx-auto max-w-md text-sm sm:text-base ${mutedText}`}>
                  You finished every card in this quest without opening a single scary dashboard. Your brain earned a real win!
                </p>
              </div>

              {profile.bossFightMode && (
                <StageBossFight
                  cards={cards}
                  darkMode={darkMode}
                  subtlePill={subtlePill}
                  timedMode={profile.challengeMode}
                  onVictory={(bonus) => setXp((curr) => curr + bonus)}
                />
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {nextTopic ? (
                  <button
                    onClick={() => void loadTopicByIndex(activeTopicIdx + 1)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-black text-white shadow-xl transition-all active:scale-95 ${theme.accentBg}`}
                  >
                    Play Next Topic: {nextTopic.title.slice(0, 34)}{nextTopic.title.length > 34 ? '…' : ''} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowQuestDrawer(true)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-black text-white shadow-xl transition-all ${theme.accentBg}`}
                  >
                    Pick Another Quest <Compass size={16} />
                  </button>
                )}

                <button
                  onClick={() => {
                    setBreakLevel((b) => b + 1);
                    setShowBreak(true);
                  }}
                  className={`rounded-2xl border px-5 py-4 text-sm font-bold transition-colors ${subtlePill}`}
                >
                  Take a 20s Brain Break
                </button>
              </div>
            </motion.div>
          ) : currentCard ? (
            <AnimatePresence mode="wait">
              <motion.article
                key={currentCardKey}
                initial={profile.reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={profile.reducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: profile.reducedMotion ? 0 : 0.25 }}
                className={`relative overflow-hidden rounded-[2.25rem] border p-6 sm:p-9 backdrop-blur-2xl ${glassCard} space-y-6`}
              >
                {winBurst && !profile.reducedMotion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute right-6 top-6 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-black text-white shadow-lg"
                  >
                    +25 XP · Nice!
                  </motion.div>
                )}

                {/* Calm Quest Meta */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-xs font-black uppercase tracking-[0.18em] ${theme.accentText}`}>
                      Today&apos;s Tiny Quest · {activeTopic.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {profile.showRsvpMode && (
                        <button
                          type="button"
                          onClick={() => setRsvpActive((r) => !r)}
                          aria-pressed={rsvpActive}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                            rsvpActive ? 'border-blue-500 bg-blue-600 text-white' : subtlePill
                          }`}
                        >
                          <FastForward size={12} /> {rsvpActive ? 'RSVP On' : 'RSVP Flash'}
                        </button>
                      )}
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${subtlePill}`}>
                        Card {cardIdx + 1} of {cards.length}
                      </span>
                    </div>
                  </div>

                  <ProgressPrism progress={(cardIdx + 1) / Math.max(1, cards.length)} />

                  {/* "Where Was I?" 1-Line Story Recap */}
                  {cardIdx > 0 && cards[cardIdx - 1] && (
                    <p className={`rounded-xl border px-3 py-1.5 text-xs ${subtlePill} opacity-85`}>
                      <strong>Previously:</strong> {cards[cardIdx - 1].heading} —{' '}
                      {cards[cardIdx - 1].text.split(/(?<=[.!?])\s+/)[0]?.slice(0, 120)}
                    </p>
                  )}

                  <h1 className="pt-1 text-xl sm:text-2xl font-black tracking-tight break-words">
                    {currentCard.heading}
                  </h1>
                </div>

                {/* Readable Card Body — RSVP Flash (Tool D) OR Standard / Bionic with Prism Lens */}
                {profile.showRsvpMode && rsvpActive ? (
                  <RsvpSpeedReader
                    text={currentCard.text}
                    darkMode={darkMode}
                    subtlePill={subtlePill}
                  />
                ) : (
                  <div
                    className={`w-full max-w-full overflow-hidden rounded-3xl border p-5 sm:p-7 transition-all break-words [overflow-wrap:anywhere] ${readingSurface} ${TEXT_SIZE_STYLES[textSize]} ${
                      dyslexiaFriendly ? 'tracking-[0.025em] [word-spacing:0.1em]' : ''
                    }`}
                    style={{
                      fontFamily: dyslexiaFriendly ? 'var(--font-reading), Lexend, sans-serif' : 'var(--font-sans), Inter, sans-serif',
                    }}
                  >
                    {currentCard.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className={`break-words [overflow-wrap:anywhere] ${pIdx > 0 ? 'mt-4' : ''}`}>
                        {bionicOn ? (
                          <BionicText
                            text={paragraph}
                            onWordSelect={profile.showPrismLens ? (w) => setLensWord(w) : undefined}
                          />
                        ) : profile.showPrismLens ? (
                          paragraph.split(/\s+/).filter(Boolean).map((word, wIdx, arr) => {
                            const cleaned = word.replace(/^[^a-zA-Z0-9\u00C0-\u024F]+|[^a-zA-Z0-9\u00C0-\u024F]+$/g, '').trim();
                            const trailing = wIdx < arr.length - 1 ? ' ' : '';
                            if (cleaned.length < 3 || cleaned.length > 60) {
                              return <React.Fragment key={wIdx}>{word}{trailing}</React.Fragment>;
                            }
                            return (
                              <React.Fragment key={wIdx}>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setLensWord(cleaned)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setLensWord(cleaned);
                                    }
                                  }}
                                  title={`Tap to inspect “${cleaned}” in Prism Lens`}
                                  className="inline rounded-md px-0.5 cursor-pointer transition-colors hover:bg-blue-500/15 active:bg-blue-500/25"
                                >
                                  {word}
                                </span>
                                {trailing}
                              </React.Fragment>
                            );
                          })
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                    {profile.showPrismLens && (
                      <p className={`mt-4 text-[11px] font-semibold opacity-65 ${mutedText}`}>
                        Tip: Tap any word to open Prism Lens (Ask DJ or Google without leaving your quest).
                      </p>
                    )}
                  </div>
                )}

                {/* Voice "Talk It Out" Rubber-Duck Recap Mic (Tool H) */}
                {profile.showVoiceRecap && (
                  <VoiceTalkItOut
                    key={currentCardKey}
                    subtlePill={subtlePill}
                    onXpEarned={(bonus) => setXp((curr) => curr + bonus)}
                  />
                )}

                {/* Refract with Prism Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    data-tour="play-refract-btn"
                    onClick={() => void handleRefractCard()}
                    disabled={refracting}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 ${theme.accentBg}`}
                  >
                    {refracting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Refracting this card...
                      </>
                    ) : isPrismVisible ? (
                      <>
                        <Wand2 size={16} /> Hide Prism Lenses
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} /> Refract with Prism
                      </>
                    )}
                  </button>

                  {refractNotice && (
                    <span className={`text-xs font-medium ${mutedText}`}>{refractNotice}</span>
                  )}
                </div>

                {/* Refracted Prism Cards */}
                <AnimatePresence>
                  {isPrismVisible && currentRefraction && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden pt-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-xs font-black uppercase tracking-[0.2em] ${theme.accentText}`}>
                          Prism View ({currentRefraction.source === 'ai' ? 'AI Prism' : 'Instant Local Prism · Unlimited'})
                        </span>
                        {currentRefraction.keyTerms.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {currentRefraction.keyTerms.map((term) => (
                              <span
                                key={term}
                                className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${subtlePill}`}
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={`rounded-2xl border p-4 sm:p-5 ${darkMode ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-300/70 bg-blue-50/75 text-slate-900'}`}>
                        <div className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          <Sparkles size={14} /> The Tiny Idea
                        </div>
                        <p className="text-base font-bold leading-relaxed break-words">{currentRefraction.tinyIdea}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 ${darkMode ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-cyan-300/70 bg-cyan-50/75 text-slate-900'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                              <Brain size={14} /> The Metaphor
                            </div>
                            <button
                              onClick={() => handleStarToVault(currentRefraction.metaphor, 'metaphor')}
                              aria-label="Save metaphor to Dopamine Vault"
                              className={`rounded-xl p-1.5 transition-colors ${
                                starredContents.includes(currentRefraction.metaphor)
                                  ? 'bg-amber-500 text-slate-950'
                                  : subtlePill
                              }`}
                            >
                              <Star size={14} fill={starredContents.includes(currentRefraction.metaphor) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          <p className="text-sm sm:text-base font-semibold leading-relaxed italic break-words">
                            &ldquo;{currentRefraction.metaphor}&rdquo;
                          </p>
                        </div>

                        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 ${darkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-300/70 bg-amber-50/75 text-slate-900'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                              <Rocket size={14} /> Dopamine Boost
                            </div>
                            <button
                              onClick={() => handleStarToVault(currentRefraction.dopamineBoost, 'hook')}
                              aria-label="Save dopamine boost to Dopamine Vault"
                              className={`rounded-xl p-1.5 transition-colors ${
                                starredContents.includes(currentRefraction.dopamineBoost)
                                  ? 'bg-amber-500 text-slate-950'
                                  : subtlePill
                              }`}
                            >
                              <Star size={14} fill={starredContents.includes(currentRefraction.dopamineBoost) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          <p className="text-sm sm:text-base font-semibold leading-relaxed italic break-words">
                            &ldquo;{currentRefraction.dopamineBoost}&rdquo;
                          </p>
                        </div>
                      </div>

                      <div className={`rounded-2xl border p-4 ${darkMode ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-300/70 bg-emerald-50/75 text-slate-900'}`}>
                        <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={14} /> One Small Move
                        </div>
                        <p className="text-sm font-medium leading-relaxed break-words">{currentRefraction.oneSmallMove}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gentle Game Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                  <button
                    onClick={() => setCardIdx((i) => Math.max(0, i - 1))}
                    disabled={cardIdx === 0}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-bold transition-all disabled:opacity-35 ${subtlePill}`}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <button
                    data-tour="play-claim-win-btn"
                    onClick={handleClaimWin}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-xl transition-all hover:bg-emerald-500 active:scale-95"
                  >
                    <Trophy size={16} />
                    {cardIdx === cards.length - 1 ? 'Claim Stage Win!' : 'Claim Win & Next Card'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>
          ) : null}
        </main>
      </div>

      {/* Cozy Micro-Break Modal */}
      <AnimatePresence>
        {showBreak && (
          <NeuralMicroBreak
            level={breakLevel}
            onComplete={() => setShowBreak(false)}
          />
        )}
      </AnimatePresence>

      {/* Switch Quest Drawer */}
      <AnimatePresence>
        {showQuestDrawer && (
          <div className="fixed inset-0 z-[400] flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.aside
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              className={`h-full w-full max-w-md overflow-y-auto border-l p-6 space-y-5 ${
                darkMode ? 'border-white/10 bg-[#0b1224] text-slate-100' : 'border-[#d6ccb9] bg-[#f8f4eb] text-[#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <Layers size={18} className={theme.accentText} /> Choose a Quest
                  </h2>
                  <p className={`text-xs ${mutedText}`}>Pick just one topic that feels doable right now.</p>
                </div>
                <button
                  onClick={() => setShowQuestDrawer(false)}
                  aria-label="Close quest drawer"
                  className={`rounded-xl border p-2 ${subtlePill}`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5">
                {topics.map((topic, idx) => {
                  const isActive = idx === activeTopicIdx;
                  const isDone = completedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setShowQuestDrawer(false);
                        void loadTopicByIndex(idx);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-600/15'
                          : darkMode
                            ? 'border-white/10 bg-white/5 hover:border-blue-500/40'
                            : 'border-[#dcd3c2] bg-[#f1ebe0] hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold ${mutedText}`}>{topic.moduleName}</span>
                        {isDone && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={11} /> Cleared
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-bold break-words">{topic.title}</p>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Connect Canvas or Paste Reading Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 z-[450] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-[2rem] border p-6 sm:p-8 space-y-5 ${
                darkMode ? 'border-white/15 bg-[#0f172a] text-slate-100' : 'border-[#d6ccb9] bg-[#faf7f0] text-[#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Bring Your Canvas Notes Here</h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  aria-label="Close connect dialog"
                  className={`rounded-xl border p-2 ${subtlePill}`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className={`grid grid-cols-2 gap-2 rounded-2xl border p-1 ${darkMode ? 'border-white/10' : 'border-[#d6ccb9] bg-[#eee8dc]'}`}>
                <button
                  onClick={() => setConnectTab('canvas')}
                  className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                    connectTab === 'canvas' ? `${theme.accentBg} text-white` : mutedText
                  }`}
                >
                  Canvas Auto-Sync
                </button>
                <button
                  onClick={() => setConnectTab('paste')}
                  className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                    connectTab === 'paste' ? `${theme.accentBg} text-white` : mutedText
                  }`}
                >
                  Paste a Reading (No Token)
                </button>
              </div>

              {connectTab === 'canvas' ? (
                <form onSubmit={handleConnectCanvas} className="space-y-4">
                  <div className={`rounded-2xl border p-3.5 text-xs space-y-1 ${subtlePill}`}>
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" /> 100% Private to You
                    </p>
                    <p className={mutedText}>
                      In Canvas, open <strong>Account → Settings → Approved Integrations → + New Access Token</strong>. Your course link and token stay only in this browser tab and clear when you close it.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold" htmlFor="canvas-course-url">Your Canvas Course Link</label>
                    <input
                      id="canvas-course-url"
                      type="url"
                      required
                      value={courseUrl}
                      onChange={(e) => setCourseUrl(e.target.value)}
                      placeholder="https://your-school.instructure.com/courses/1234/modules"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 ${
                        darkMode ? 'border-white/15 bg-slate-950 text-white placeholder:text-slate-500' : 'border-[#cfc5b2] bg-[#f3efe6] text-slate-900 placeholder:text-slate-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold" htmlFor="canvas-access-token">Personal Access Token</label>
                    <input
                      id="canvas-access-token"
                      type="password"
                      required
                      value={canvasToken}
                      onChange={(e) => setCanvasToken(e.target.value)}
                      placeholder="Paste your Canvas access token"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 ${
                        darkMode ? 'border-white/15 bg-slate-950 text-white placeholder:text-slate-500' : 'border-[#cfc5b2] bg-[#f3efe6] text-slate-900 placeholder:text-slate-500'
                      }`}
                    />
                  </div>

                  {connectError && (
                    <p className="rounded-xl bg-rose-500/15 px-3.5 py-2.5 text-xs font-semibold text-rose-500">
                      {connectError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {isCanvasConnected && (
                      <button
                        type="button"
                        onClick={handleDisconnectCanvas}
                        className="rounded-xl border border-rose-500/40 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10"
                      >
                        Disconnect &amp; Clear Token
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={connecting}
                      className={`ml-auto inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black text-white disabled:opacity-60 ${theme.accentBg}`}
                    >
                      {connecting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {connecting ? 'Loading Quests...' : 'Load My Canvas Quests'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoadPastedReading} className="space-y-4">
                  <p className={`text-xs ${mutedText}`}>
                    Paste any Canvas lesson, article, or study notes here — Prism Play saves it privately in your browser and splits it into calm cards automatically.
                  </p>
                  <input
                    type="text"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    placeholder="Topic name (optional)"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 ${
                      darkMode ? 'border-white/15 bg-slate-950 text-white placeholder:text-slate-500' : 'border-[#cfc5b2] bg-[#f3efe6] text-slate-900 placeholder:text-slate-500'
                    }`}
                  />
                  <textarea
                    required
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste your notes here — Prism Play will turn them into calm playable cards..."
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 ${
                      darkMode ? 'border-white/15 bg-slate-950 text-white placeholder:text-slate-500' : 'border-[#cfc5b2] bg-[#f3efe6] text-slate-900 placeholder:text-slate-500'
                    }`}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-500"
                  >
                    Turn Into Calm Prism Cards
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Brain Check-In (15-Second Setup & A–H Analysis with "Skip & Just Continue") */}
      <AnimatePresence>
        {showCheckIn && (
          <QuickBrainCheckIn
            darkMode={darkMode}
            onComplete={handleCheckInComplete}
            onSkip={handleSkipCheckIn}
          />
        )}
      </AnimatePresence>

      {/* Neural Identity Drawer (4 Presets + All Individual & A–H Toggles) */}
      <AnimatePresence>
        {showIdentityDrawer && (
          <NeuralIdentityDrawer
            darkMode={darkMode}
            profile={profile}
            onChangeProfile={(next) => {
              setProfile(next);
              if (!next.showRsvpMode) setRsvpActive(false);
            }}
            onApplyPreset={applyPreset}
            onOpenCheckIn={() => {
              setShowIdentityDrawer(false);
              setShowCheckIn(true);
            }}
            onClose={() => setShowIdentityDrawer(false)}
          />
        )}
      </AnimatePresence>

      {/* Brain Dump Distraction Catcher Drawer */}
      <AnimatePresence>
        {showBrainDump && (
          <BrainDumpDrawer
            darkMode={darkMode}
            onClose={() => setShowBrainDump(false)}
          />
        )}
      </AnimatePresence>

      {/* Prism Lens Word Helper Popup (Tap Any Word -> Ask DJ / Google) */}
      <AnimatePresence>
        {lensWord && currentCard && (
          <PrismLensPopup
            word={lensWord}
            cardContext={`${currentCard.heading}\n${currentCard.text}`}
            darkMode={darkMode}
            onClose={() => setLensWord(null)}
          />
        )}
      </AnimatePresence>

      {/* Dedicated Bottom Floating Studio Dock (gives Soundscape, Focus Companion, Brain Dump & Quests their own spacious home) */}
      {!profile.lowBatteryMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[260] w-[calc(100%-1.5rem)] max-w-2xl flex flex-col items-center gap-3 pointer-events-none">
          {/* Soundscape Studio Popover (kept mounted so audio/Spotify keeps playing when collapsed!) */}
          {profile.showSensoryBar && (
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
                  showSoundtrackPin={profile.showSoundtrackPin}
                  showGamma40={profile.showGamma40}
                  glassCard={glassCard}
                  subtlePill={subtlePill}
                  mutedText={mutedText}
                />
              </div>
            </div>
          )}

          {/* Focus Companion / Beat-the-Clock Popover */}
          <AnimatePresence>
            {profile.showBodyDoubling && focusStudioOpen && (
              <motion.section
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                aria-label="Gentle body-doubling focus companion"
                className={`w-full pointer-events-auto rounded-3xl border p-4 sm:p-5 backdrop-blur-2xl shadow-2xl ${glassCard} space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      {sprintRunning && !profile.reducedMotion && (
                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${challengeSprintActive ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      )}
                      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${sprintRunning ? (challengeSprintActive ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-blue-500/70'}`} />
                    </span>
                    {challengeSprintActive ? (
                      <Timer size={15} className="text-amber-500 shrink-0" />
                    ) : (
                      <HeartHandshake size={15} className={`${theme.accentText} shrink-0`} />
                    )}
                    <span className="font-bold">{bodyDoubleMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFocusStudioOpen(false)}
                    aria-label="Hide Focus Companion"
                    className={`rounded-xl border p-1.5 shrink-0 ${subtlePill}`}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {sprintTotalSecs === 0 ? (
                    <>
                      {profile.challengeMode && (
                        <button
                          onClick={() => startSprint(4, true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
                        >
                          <Timer size={13} /> 4m Beat-the-Clock (3 cards!)
                        </button>
                      )}
                      {[5, 10, 15].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => startSprint(mins, false)}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${subtlePill} hover:border-emerald-500/50`}
                        >
                          {mins}m sprint
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <span className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-black tabular-nums ${subtlePill}`}>
                        {formatTimer(sprintSecsLeft)}
                      </span>
                      {sprintSecsLeft > 0 ? (
                        <button
                          onClick={() => setSprintRunning((r) => !r)}
                          className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold ${subtlePill}`}
                        >
                          {sprintRunning ? <Pause size={12} /> : <Play size={12} />}
                          {sprintRunning ? 'Pause' : 'Resume'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSprintFinishedNote(false);
                            setShowBreak(true);
                          }}
                          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          Take 20s Break
                        </button>
                      )}
                      <button
                        onClick={resetSprint}
                        aria-label="Reset focus sprint"
                        className={`rounded-xl border p-1.5 ${subtlePill}`}
                      >
                        <RotateCcw size={13} />
                      </button>
                    </>
                  )}
                </div>

                {sprintTotalSecs > 0 && (
                  <div className={`h-1.5 w-full overflow-hidden rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${challengeSprintActive ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, ((sprintTotalSecs - sprintSecsLeft) / sprintTotalSecs) * 100)}%` }}
                    />
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Compact Floating Studio Pill Bar */}
          <nav
            aria-label="Prism Play studio tools"
            className={`pointer-events-auto inline-flex flex-wrap items-center justify-center gap-2 rounded-full border px-3 py-2 backdrop-blur-2xl shadow-2xl ${glassCard}`}
          >
            <button
              type="button"
              onClick={() => setShowQuestDrawer(true)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all hover:border-blue-500/50 ${subtlePill}`}
            >
              <Layers size={14} className={theme.accentText} /> Quests
            </button>

            {profile.showSensoryBar && (
              <button
                type="button"
                aria-pressed={soundStudioOpen}
                onClick={() => {
                  setFocusStudioOpen(false);
                  setSoundStudioOpen((o) => !o);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  soundStudioOpen ? `${theme.accentBg} border-transparent text-white` : `${subtlePill} hover:border-blue-500/50`
                }`}
              >
                <Headphones size={14} /> Soundscape
              </button>
            )}

            {profile.showBodyDoubling && (
              <button
                type="button"
                aria-pressed={focusStudioOpen}
                onClick={() => {
                  setSoundStudioOpen(false);
                  setFocusStudioOpen((o) => !o);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  focusStudioOpen || sprintRunning
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : `${subtlePill} hover:border-emerald-500/50`
                }`}
              >
                <HeartHandshake size={14} />
                {sprintTotalSecs > 0 && sprintSecsLeft > 0 ? formatTimer(sprintSecsLeft) : 'Focus Sprint'}
              </button>
            )}

            {profile.showBrainDump && (
              <button
                type="button"
                onClick={() => setShowBrainDump(true)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all hover:border-amber-500/50 ${subtlePill}`}
              >
                <StickyNote size={14} className="text-amber-500" /> Brain Dump
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Dedicated Neural Command Modal (Canvas Sync, Quests, Live Vibes, Chimes & Privacy) */}
      <AnimatePresence>
        {showCommandModal && (
          <div className="fixed inset-0 z-[450] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.25rem] border p-6 sm:p-10 space-y-7 shadow-2xl transition-colors duration-300 ${
                darkMode ? `${theme.darkCard} text-slate-100` : `${theme.lightCard} ${theme.lightText}`
              }`}
              style={{
                boxShadow: `0 25px 80px -15px ${theme.swatch}45`,
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 right-0 h-52 w-52 rounded-full blur-3xl opacity-40 transition-colors duration-300"
                style={{ backgroundColor: theme.swatch }}
              />
              <div className="relative flex items-start justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black italic flex items-center gap-3">
                    <Compass size={22} className={theme.accentText} /> Neural Command
                  </h2>
                  <p className={`text-xs sm:text-sm ${mutedText}`}>
                    Manage your Canvas course, switch quests, preview your color vibe live, and control privacy.
                  </p>
                </div>
                <button
                  onClick={() => setShowCommandModal(false)}
                  aria-label="Close Neural Command"
                  className={`rounded-2xl border p-2.5 ${subtlePill}`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Section 1: Canvas & Readings */}
              <section className="relative space-y-3">
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${theme.accentText}`}>Canvas &amp; Readings</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommandModal(false);
                      setShowConnectModal(true);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all hover:border-blue-500/60 ${subtlePill}`}
                  >
                    <p className="text-sm font-black flex items-center gap-2">
                      <KeyRound size={15} className={theme.accentText} />
                      {isCanvasConnected ? 'Canvas Connected' : 'Connect Canvas / Paste Notes'}
                    </p>
                    <p className={`mt-1 text-xs leading-relaxed ${mutedText}`}>
                      Sync your own Canvas course link or paste any reading privately in this browser.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCommandModal(false);
                      setShowQuestDrawer(true);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all hover:border-blue-500/60 ${subtlePill}`}
                  >
                    <p className="text-sm font-black flex items-center gap-2">
                      <Layers size={15} className="text-emerald-500" /> Choose a Quest
                    </p>
                    <p className={`mt-1 text-xs leading-relaxed ${mutedText}`}>
                      Jump between your loaded Canvas topics or saved readings without seeing scary totals.
                    </p>
                  </button>
                </div>
              </section>

              {/* Section 2: Visual Vibe & Win Chimes (Live Preview inside Modal) */}
              <section className="relative space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Visual Vibe &amp; Sound Feedback</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${subtlePill}`}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.swatch }} />
                    Live: {theme.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.values(COLOR_THEMES) as ColorTheme[]).map((t) => {
                    const active = t.id === colorTheme;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setColorTheme(t.id)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
                          active
                            ? darkMode
                              ? 'border-white/50 bg-white/15 text-white shadow-md'
                              : 'border-slate-700/50 bg-[#e2dacb] text-slate-900 shadow-sm'
                            : `${subtlePill} opacity-85 hover:opacity-100`
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: t.swatch }} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <div className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${subtlePill}`}>
                  <div>
                    <p className="text-sm font-bold flex items-center gap-2">
                      {chimesOn ? <Volume2 size={15} className="text-emerald-500" /> : <VolumeX size={15} />}
                      Celebration Win Chimes
                    </p>
                    <p className={`text-xs ${mutedText}`}>Soft harmonic chimes when you claim a card win or clear a stage.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChimesOn((c) => !c)}
                    className={`rounded-xl px-4 py-2 text-xs font-black ${
                      chimesOn ? 'bg-emerald-600 text-white' : darkMode ? 'bg-white/10 text-slate-200' : 'bg-[#d9d0be] text-slate-800'
                    }`}
                  >
                    {chimesOn ? 'On' : 'Muted'}
                  </button>
                </div>
              </section>

              {/* Section 3: Privacy & Unlimited Mode */}
              <section className="relative space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">Privacy &amp; Unlimited Reading</p>
                <div className={`rounded-2xl border p-4 space-y-3 ${subtlePill}`}>
                  <div className="flex items-start gap-2.5 text-xs leading-relaxed">
                    <Lock size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Private to your browser:</strong> Your Canvas link, access token, and notes stay strictly on your device — nobody else can see them.
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                    <span className={`text-xs ${mutedText}`}>Force zero-token-limit instant local refraction:</span>
                    <button
                      type="button"
                      onClick={() => setLocalOnlyMode((m) => !m)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition-colors ${
                        localOnlyMode
                          ? 'bg-emerald-600 text-white'
                          : darkMode ? 'bg-white/10 text-slate-200 hover:bg-white/15' : 'bg-[#dfd7c7] text-[#1c1711]'
                      }`}
                    >
                      {localOnlyMode ? 'Unlimited Local Prism: ON' : 'Auto AI + Unlimited Fallback'}
                    </button>
                  </div>
                </div>
              </section>

              <div className="relative flex flex-col items-center gap-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCommandModal(false)}
                  className={`rounded-full px-10 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white shadow-lg transition-all hover:scale-105 ${theme.accentBg}`}
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
          accent="emerald"
          onOpenNeuralGuide={() => setTourTrigger((c) => c + 1)}
        />
      </div>
      <PrismTourOverlay
        storageKey="prism_play_tour_v1"
        prismName="Prism Play"
        welcomeMessage="Turning dread into play — one calm card at a time."
        accent="emerald"
        steps={PLAY_POINTER_TOUR_STEPS}
        darkMode={darkMode}
        manualTriggerCount={tourTrigger}
      />
    </div>
  );
}

function PrismPlayTagline({ darkMode, reducedMotion }: { darkMode: boolean; reducedMotion: boolean }) {
  const [phase, setPhase] = useState<'noise' | 'flash' | 'clarity'>(reducedMotion ? 'clarity' : 'noise');

  useEffect(() => {
    if (reducedMotion) {
      setPhase('clarity');
      return;
    }
    const timer1 = setTimeout(() => setPhase('flash'), 900);
    const timer2 = setTimeout(() => setPhase('clarity'), 1250);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [reducedMotion]);

  return (
    <div className="relative h-10 flex items-center justify-center overflow-hidden">
      <motion.p
        animate={{
          filter: phase === 'noise' ? 'blur(4px)' : 'blur(0px)',
          opacity: phase === 'noise' ? 0.6 : 1,
          x: phase === 'noise' ? [0, -2, 2, -1, 0] : 0,
          scale: phase === 'flash' ? 1.05 : 1,
        }}
        transition={{
          x: phase === 'noise' ? { repeat: Infinity, duration: 0.2 } : { duration: 0.2 },
          filter: { duration: 0.5 },
          scale: { duration: 0.2 },
        }}
        className={`text-base sm:text-xl font-bold italic tracking-tight text-center transition-colors duration-500 ${
          phase === 'clarity'
            ? darkMode
              ? 'text-blue-400 drop-shadow-[0_0_18px_rgba(59,130,246,0.35)]'
              : 'text-blue-600'
            : darkMode
              ? 'text-slate-200'
              : 'text-slate-700'
        }`}
      >
        &ldquo;Turning Dread into Play.&rdquo;
      </motion.p>

      <AnimatePresence>
        {phase === 'flash' && !reducedMotion && (
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '200%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 z-10 w-40 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

