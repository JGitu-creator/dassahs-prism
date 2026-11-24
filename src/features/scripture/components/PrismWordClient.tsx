'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  CalendarCheck2,
  Check,
  ChevronDown,
  Columns2,
  Gamepad2,
  Heart,
  Lightbulb,
  Loader2,
  Lock,
  MessageCircle,
  Music,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  CORE_TRANSLATIONS,
  type BiblePassageResult,
  type BibleVersionMeta,
  type StudyBreakdown,
} from '../types';
import { BIBLE_BOOKS, parseBibleReference } from '../usfm';
import { AskDJScriptureDrawer } from './AskDJScriptureDrawer';
import { PrismWordEntrance } from './PrismWordEntrance';
import { PrismWordIcon } from './PrismWordIcon';
import { InteractiveVerseText, ReferenceText } from './ReferenceText';
import { StudyPlayModal } from './StudyPlayModal';
import { SystemHealthModal } from './SystemHealthModal';
import { WorshipStudio } from './WorshipStudio';

type StudyTab = 'exegesis' | 'reflect' | 'worship';
type ExegesisSection =
  | 'context'
  | 'dopamine'
  | 'verse-by-verse'
  | 'guardrails'
  | 'christ'
  | 'cross-refs';

const QUICK_PASSAGES = [
  'Psalm 23:1-6',
  'Romans 8:28-39',
  'John 15:1-11',
  'Proverbs 3:5-6',
  '1 Corinthians 13:4-8',
  'Philippians 4:6-8',
] as const;

interface ObedienceCommitment {
  id: string;
  reference: string;
  text: string;
  done: boolean;
}

function getSundayWeekKey(now = new Date()): string {
  const copy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  copy.setDate(copy.getDate() - copy.getDay());
  const y = copy.getFullYear();
  const m = String(copy.getMonth() + 1).padStart(2, '0');
  const d = String(copy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface PrismWordClientProps {
  userEmail?: string;
  onSignOut?: () => void;
}

export function PrismWordClient({ userEmail, onSignOut }: PrismWordClientProps) {
  const [showEntrance, setShowEntrance] = useState<boolean>(true);

  const [activeRef, setActiveRef] = useState<string>('Psalm 23:1-6');
  const [jumpInput, setJumpInput] = useState<string>('Psalm 23:1-6');
  const [selectedBookUsfm, setSelectedBookUsfm] = useState<string>('PSA');
  const [selectedChapter, setSelectedChapter] = useState<number>(23);
  const [verseRangeInput, setVerseRangeInput] = useState<string>('1-6');

  const [primaryTranslation, setPrimaryTranslation] = useState<string>('ESV');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareTranslation, setCompareTranslation] = useState<string>('AMP');

  const [bionicScan, setBionicScan] = useState<boolean>(false);
  const [studyPlayOpen, setStudyPlayOpen] = useState<boolean>(false);
  const [healthOpen, setHealthOpen] = useState<boolean>(false);
  const [passageRetryNonce, setPassageRetryNonce] = useState<number>(0);
  const [studyRetryNonce, setStudyRetryNonce] = useState<number>(0);

  const [versions, setVersions] = useState<BibleVersionMeta[]>([]);
  const [extraVersions, setExtraVersions] = useState<BibleVersionMeta[]>([]);
  const [passage, setPassage] = useState<BiblePassageResult | null>(null);
  const [comparePassage, setComparePassage] = useState<BiblePassageResult | null>(null);
  const [loadingPassage, setLoadingPassage] = useState<boolean>(true);
  const [passageError, setPassageError] = useState<string | null>(null);

  const [studyTab, setStudyTab] = useState<StudyTab>('exegesis');
  const [openExegesisSection, setOpenExegesisSection] = useState<ExegesisSection | null>('context');
  const [study, setStudy] = useState<StudyBreakdown | null>(null);
  const [loadingStudy, setLoadingStudy] = useState<boolean>(true);
  const [studyError, setStudyError] = useState<string | null>(null);

  // Personal notes + Weekly Obedience Commitments & Sunday Review (Private Vault)
  const [journalNote, setJournalNote] = useState<string>('');
  const [commitments, setCommitments] = useState<ObedienceCommitment[]>([]);
  const [commitmentInput, setCommitmentInput] = useState<string>('');
  const [sundayReviewOpen, setSundayReviewOpen] = useState<boolean>(false);
  const [graceReflection, setGraceReflection] = useState<string>('');
  const [reviewedWeekKey, setReviewedWeekKey] = useState<string | null>(null);
  const [currentWeekKey, setCurrentWeekKey] = useState<string>('');
  const [diskVaultActive, setDiskVaultActive] = useState<boolean>(false);
  const [vaultStatusText, setVaultStatusText] = useState<string>('');
  const noteSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reflectionSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tapped word Prism Lens + Ask DJ drawer
  const [lensWord, setLensWord] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerRef, setDrawerRef] = useState<string | null>(null);
  const [drawerWord, setDrawerWord] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/scripture/versions')
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            versions?: BibleVersionMeta[];
            extraYouVersionVersions?: BibleVersionMeta[];
          } | null,
        ) => {
          if (data?.versions) setVersions(data.versions);
          if (data?.extraYouVersionVersions) setExtraVersions(data.extraYouVersionVersions);
        },
      )
      .catch(() => {});
  }, []);

  const selectedBook = useMemo(
    () => BIBLE_BOOKS.find((b) => b.usfm === selectedBookUsfm) ?? BIBLE_BOOKS[18],
    [selectedBookUsfm],
  );

  const selectPassageReference = useCallback((nextRef: string) => {
    const parsed = parseBibleReference(nextRef);
    const normalized = parsed?.normalized ?? nextRef;
    setActiveRef(normalized);
    setJumpInput(normalized);
    setLensWord('');
    if (parsed) {
      setSelectedBookUsfm(parsed.book.usfm);
      setSelectedChapter(parsed.chapter);
      if (parsed.verseStart !== undefined) {
        setVerseRangeInput(
          parsed.verseEnd !== undefined
            ? `${parsed.verseStart}-${parsed.verseEnd}`
            : `${parsed.verseStart}`,
        );
      } else {
        setVerseRangeInput('');
      }
      try {
        setJournalNote(localStorage.getItem(`prism_word_notes_${parsed.usfm}`) || '');
      } catch {
        setJournalNote('');
      }
    }
    setPassageError(null);
  }, []);

  useEffect(() => {
    const weekKey = getSundayWeekKey();
    let cancelled = false;

    const loadInitialVault = async () => {
      try {
        const res = await fetch(
          `/api/scripture/notes?passageId=${encodeURIComponent('PSA.23.1-6')}&weekKey=${encodeURIComponent(weekKey)}`,
        );
        if (res.ok && !cancelled) {
          const vault = (await res.json()) as {
            diskVaultActive?: boolean;
            note?: string;
            commitments?: ObedienceCommitment[];
            graceReflection?: string;
          };
          setCurrentWeekKey(weekKey);
          setDiskVaultActive(Boolean(vault.diskVaultActive));
          if (typeof vault.note === 'string' && vault.note) setJournalNote(vault.note);
          if (Array.isArray(vault.commitments) && vault.commitments.length > 0) {
            setCommitments(vault.commitments);
          }
          if (typeof vault.graceReflection === 'string' && vault.graceReflection) {
            setGraceReflection(vault.graceReflection);
          }
          const savedReviewWeek = localStorage.getItem('prism_word_sunday_review_week');
          if (savedReviewWeek) setReviewedWeekKey(savedReviewWeek);
          if (
            new Date().getDay() === 0 &&
            Array.isArray(vault.commitments) &&
            vault.commitments.some((c) => !c.done) &&
            savedReviewWeek !== weekKey
          ) {
            setSundayReviewOpen(true);
          }
          return;
        }
      } catch {
        // Fall through to local browser backup
      }

      if (cancelled) return;
      setCurrentWeekKey(weekKey);
      try {
        const savedNote = localStorage.getItem('prism_word_notes_PSA.23.1-6') || '';
        if (savedNote) setJournalNote(savedNote);
        const savedCommitments = localStorage.getItem('prism_word_commitments');
        let loadedCommitments: ObedienceCommitment[] = [];
        if (savedCommitments) {
          const parsed = JSON.parse(savedCommitments) as ObedienceCommitment[];
          if (Array.isArray(parsed)) {
            loadedCommitments = parsed;
            setCommitments(parsed);
          }
        }
        const savedReviewWeek = localStorage.getItem('prism_word_sunday_review_week');
        if (savedReviewWeek) setReviewedWeekKey(savedReviewWeek);
        const savedReflectionsRaw = localStorage.getItem('prism_word_sunday_reflections');
        if (savedReflectionsRaw) {
          const refMap = JSON.parse(savedReflectionsRaw) as Record<string, string>;
          if (refMap && typeof refMap[weekKey] === 'string') {
            setGraceReflection(refMap[weekKey]);
          }
        }
        if (
          new Date().getDay() === 0 &&
          loadedCommitments.some((c) => !c.done) &&
          savedReviewWeek !== weekKey
        ) {
          setSundayReviewOpen(true);
        }
      } catch {
        // Ignore
      }
    };

    void loadInitialVault();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const parsed = parseBibleReference(activeRef);
    const passageId = parsed?.usfm || activeRef;
    const weekKey = currentWeekKey || getSundayWeekKey();

    const syncPassageNote = async () => {
      try {
        const res = await fetch(
          `/api/scripture/notes?passageId=${encodeURIComponent(passageId)}&weekKey=${encodeURIComponent(weekKey)}`,
        );
        if (res.ok && !cancelled) {
          const vault = (await res.json()) as { diskVaultActive?: boolean; note?: string };
          setDiskVaultActive(Boolean(vault.diskVaultActive));
          if (typeof vault.note === 'string') {
            setJournalNote(vault.note);
            return;
          }
        }
      } catch {
        // Ignore and use local fallback below
      }
      if (!cancelled) {
        try {
          setJournalNote(localStorage.getItem(`prism_word_notes_${passageId}`) || '');
        } catch {
          setJournalNote('');
        }
      }
    };

    void syncPassageNote();
    return () => {
      cancelled = true;
    };
  }, [activeRef, currentWeekKey]);

  const persistCommitments = (next: ObedienceCommitment[]) => {
    setCommitments(next);
    try {
      localStorage.setItem('prism_word_commitments', JSON.stringify(next));
    } catch {
      // Ignore
    }
    void fetch('/api/scripture/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'commitments', commitments: next }),
    }).catch(() => {});
  };

  const handleGraceReflectionChange = (value: string) => {
    setGraceReflection(value);
    const key = currentWeekKey || getSundayWeekKey();
    try {
      const existingRaw = localStorage.getItem('prism_word_sunday_reflections');
      const map = existingRaw ? (JSON.parse(existingRaw) as Record<string, string>) : {};
      localStorage.setItem(
        'prism_word_sunday_reflections',
        JSON.stringify({ ...map, [key]: value }),
      );
    } catch {
      // Ignore
    }
    if (reflectionSaveTimerRef.current) clearTimeout(reflectionSaveTimerRef.current);
    reflectionSaveTimerRef.current = setTimeout(() => {
      void fetch('/api/scripture/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sunday-reflection',
          weekKey: key,
          reflection: value,
        }),
      }).catch(() => {});
    }, 450);
  };

  const completeSundayCheckIn = () => {
    const key = currentWeekKey || getSundayWeekKey();
    setReviewedWeekKey(key);
    try {
      localStorage.setItem('prism_word_sunday_review_week', key);
    } catch {
      // Ignore
    }
    setSundayReviewOpen(false);
  };

  const addCommitment = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    if (commitments.some((c) => c.text.toLowerCase() === clean.toLowerCase())) return;
    const entry: ObedienceCommitment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      reference: activeRef,
      text: clean,
      done: false,
    };
    persistCommitments([entry, ...commitments]);
    setCommitmentInput('');
  };

  const toggleCommitmentDone = (id: string) => {
    persistCommitments(
      commitments.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
    );
  };

  const removeCommitment = (id: string) => {
    persistCommitments(commitments.filter((c) => c.id !== id));
  };

  const handleNoteChange = (next: string) => {
    setJournalNote(next);
    const parsed = parseBibleReference(activeRef);
    const passageId = parsed?.usfm || activeRef;
    const key = `prism_word_notes_${passageId}`;
    try {
      localStorage.setItem(key, next);
    } catch {
      // Ignore
    }
    setVaultStatusText('Saving privately...');
    if (noteSaveTimerRef.current) clearTimeout(noteSaveTimerRef.current);
    noteSaveTimerRef.current = setTimeout(() => {
      void fetch('/api/scripture/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'passage-note',
          passageId,
          reference: activeRef,
          content: next,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((resData: { saved?: boolean } | null) => {
          setVaultStatusText(
            resData?.saved
              ? "Saved in DJ's Notes folder"
              : 'Saved privately in browser',
          );
        })
        .catch(() => {
          setVaultStatusText('Saved privately in browser');
        });
    }, 450);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadPassages() {
      setLoadingPassage(true);
      setPassageError(null);
      try {
        const res = await fetch(
          `/api/scripture/passage?ref=${encodeURIComponent(activeRef)}&translation=${encodeURIComponent(primaryTranslation)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Could not load passage');
        }
        if (!cancelled) setPassage(data as BiblePassageResult);

        if (compareMode) {
          const cmpRes = await fetch(
            `/api/scripture/passage?ref=${encodeURIComponent(activeRef)}&translation=${encodeURIComponent(compareTranslation)}`,
          );
          if (cmpRes.ok && !cancelled) {
            setComparePassage((await cmpRes.json()) as BiblePassageResult);
          }
        } else if (!cancelled) {
          setComparePassage(null);
        }
      } catch (err) {
        if (!cancelled) {
          setPassageError(err instanceof Error ? err.message : 'Unable to load scripture.');
        }
      } finally {
        if (!cancelled) setLoadingPassage(false);
      }
    }

    void loadPassages();
    return () => {
      cancelled = true;
    };
  }, [activeRef, primaryTranslation, compareMode, compareTranslation, passageRetryNonce]);

  useEffect(() => {
    let cancelled = false;

    async function loadStudy() {
      setLoadingStudy(true);
      setStudyError(null);
      try {
        const res = await fetch('/api/scripture/study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: activeRef,
            translationName: primaryTranslation,
          }),
        });
        if (!res.ok) {
          throw new Error('Could not load AI study breakdown right now.');
        }
        if (!cancelled) {
          const data = (await res.json()) as StudyBreakdown;
          setStudy(data);
        }
      } catch (err) {
        if (!cancelled) {
          setStudyError(
            err instanceof Error
              ? `${err.message} Tap Retry Study or open System Status to inspect AI providers.`
              : 'Could not reach the study service right now.',
          );
        }
      } finally {
        if (!cancelled) setLoadingStudy(false);
      }
    }

    void loadStudy();
    return () => {
      cancelled = true;
    };
  }, [activeRef, primaryTranslation, studyRetryNonce]);

  const openCrossReference = useCallback((ref: string) => {
    setDrawerWord(null);
    setDrawerRef(ref);
    setDrawerOpen(true);
  }, []);

  const openWordInAskDj = (word: string) => {
    setDrawerRef(null);
    setDrawerWord(word);
    setDrawerOpen(true);
    setLensWord('');
  };

  const openGeneralAskDj = () => {
    setDrawerRef(null);
    setDrawerWord(null);
    setDrawerOpen(true);
  };

  const handleBookOrChapterApply = () => {
    const book = BIBLE_BOOKS.find((b) => b.usfm === selectedBookUsfm);
    if (!book) return;
    const cleanRange = verseRangeInput.trim().replace(/^:/, '');
    const candidate = cleanRange
      ? `${book.name} ${selectedChapter}:${cleanRange}`
      : `${book.name} ${selectedChapter}`;
    const parsed = parseBibleReference(candidate);
    if (parsed) {
      selectPassageReference(parsed.normalized);
    } else {
      setPassageError(`Could not understand reference "${candidate}". Try e.g. 1-6 or leave verses blank.`);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseBibleReference(jumpInput);
    if (parsed) {
      selectPassageReference(parsed.normalized);
    } else {
      setPassageError(`Unknown reference "${jumpInput}". Try "Psalm 23:1-6", "Romans 8:28", or "John 15".`);
    }
  };

  const toggleAccordion = (section: ExegesisSection) => {
    setOpenExegesisSection((prev) => (prev === section ? null : section));
  };

  const translationButtons = versions.length > 0
    ? versions
    : CORE_TRANSLATIONS.map((code) => ({
        code,
        name: code,
        shortLabel: code,
        isDefault: code === 'ESV',
        available: true,
        provider: 'sandbox-fallback' as const,
      }));

  return (
    <div className="min-h-screen [color-scheme:dark] bg-[#07070D] text-slate-100 selection:bg-purple-500/30 font-[var(--font-sans)]">
      <PrismWordEntrance
        visible={showEntrance}
        onComplete={() => setShowEntrance(false)}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.09),transparent_48%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.10),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 space-y-5">
        {/* Whisper-Minimalist Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#0B0C17]/90 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/engine"
              title="Back to Dassah's Prism Engine"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-black/60 text-slate-300 transition hover:border-blue-500/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400/60"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/35 bg-gradient-to-br from-blue-950/90 to-purple-950/90 shadow-sm shadow-purple-950/60">
              <PrismWordIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white font-[var(--font-display)]">Prism Word</h1>
              <p className="text-xs text-slate-300">Minimalist Sanctuary for Deep Study and Worship</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHealthOpen(true)}
              title="Check Bible and AI service status and upkeep notes"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-black/55 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-400/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400/60"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-300" />
              Status
            </button>

            <button
              type="button"
              onClick={() => setSundayReviewOpen((prev) => !prev)}
              aria-expanded={sundayReviewOpen}
              title="Review last week's obedience commitments before starting today's passage"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
                sundayReviewOpen
                  ? 'border-purple-400/60 bg-purple-600/25 text-white'
                  : 'border-slate-700/80 bg-black/55 text-slate-200 hover:border-purple-400/50 hover:text-white'
              }`}
            >
              <CalendarCheck2 className="h-3.5 w-3.5 text-blue-300" />
              Sunday Review
              {commitments.some((c) => !c.done) && reviewedWeekKey !== currentWeekKey && (
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setStudyPlayOpen(true)}
              title="Open challenging Bible strategy games (Connections, Exodus Dispatch, and Master Sudoku)"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-black/55 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-purple-400/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400/60"
            >
              <Gamepad2 className="h-3.5 w-3.5 text-purple-300" />
              Study Play
            </button>

            <button
              type="button"
              onClick={openGeneralAskDj}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm shadow-purple-950/50 transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-purple-300/70"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Ask DJ
            </button>

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title={userEmail ? `Signed in as ${userEmail}. Lock private sanctuary` : 'Lock private sanctuary'}
                className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-black/55 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-rose-400/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400/60"
              >
                <Lock className="h-3 w-3 text-purple-300" />
                Lock
              </button>
            )}
          </div>
        </header>

        {/* Clean Passage Selector Bar */}
        <section className="rounded-2xl border border-slate-800/80 bg-[#0B0C17]/90 px-4 py-3.5 backdrop-blur-xl space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <form onSubmit={handleJumpSubmit} className="flex flex-1 min-w-[220px] items-end gap-2">
              <div className="flex-1">
                <label htmlFor="jump-ref" className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-300">
                  Go to Passage
                </label>
                <input
                  id="jump-ref"
                  type="text"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  placeholder="Psalm 23:1-6 or John 3:16"
                  className="w-full rounded-xl border border-slate-700/90 bg-black/60 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl border border-blue-500/40 bg-blue-600/20 px-3.5 py-1.5 text-xs font-medium text-blue-100 transition hover:bg-blue-600/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/60"
              >
                Open
              </button>
            </form>

            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label htmlFor="book-select" className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-300">
                  Book
                </label>
                <select
                  id="book-select"
                  value={selectedBookUsfm}
                  onChange={(e) => {
                    setSelectedBookUsfm(e.target.value);
                    setSelectedChapter(1);
                    setVerseRangeInput('');
                  }}
                  className="[color-scheme:dark] rounded-xl border border-slate-700/90 bg-[#0B0C17] px-2.5 py-1.5 text-xs text-slate-100 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                >
                  <optgroup label="Old Testament" className="bg-[#0B0C17] text-purple-200">
                    {BIBLE_BOOKS.filter((b) => b.testament === 'OT').map((b) => (
                      <option key={b.usfm} value={b.usfm} className="bg-[#0B0C17] text-slate-100">
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="New Testament" className="bg-[#0B0C17] text-blue-200">
                    {BIBLE_BOOKS.filter((b) => b.testament === 'NT').map((b) => (
                      <option key={b.usfm} value={b.usfm} className="bg-[#0B0C17] text-slate-100">
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label htmlFor="chapter-select" className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-300">
                  Chapter
                </label>
                <select
                  id="chapter-select"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(Number(e.target.value))}
                  className="[color-scheme:dark] w-16 rounded-xl border border-slate-700/90 bg-[#0B0C17] px-2 py-1.5 text-xs text-slate-100 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                >
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                    <option key={ch} value={ch} className="bg-[#0B0C17] text-slate-100">
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="verse-range" className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-300">
                  Verses
                </label>
                <input
                  id="verse-range"
                  type="text"
                  value={verseRangeInput}
                  onChange={(e) => setVerseRangeInput(e.target.value)}
                  placeholder="1-6"
                  className="w-16 rounded-xl border border-slate-700/90 bg-black/60 px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                />
              </div>

              <button
                type="button"
                onClick={handleBookOrChapterApply}
                className="rounded-xl border border-purple-500/35 bg-purple-600/15 px-3 py-1.5 text-xs font-medium text-purple-200 transition hover:bg-purple-600/30 hover:text-white"
              >
                Load
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_PASSAGES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => selectPassageReference(preset)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${
                  activeRef === preset
                    ? 'border border-purple-400/50 bg-purple-500/20 text-purple-200'
                    : 'border border-slate-800/80 bg-black/35 text-slate-400 hover:border-blue-500/40 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {passageError && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-500/40 bg-rose-950/35 px-3.5 py-2.5 text-xs text-rose-100">
              <span>{passageError}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPassageRetryNonce((n) => n + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-400/50 bg-rose-900/40 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-rose-800/50"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => setHealthOpen(true)}
                  className="rounded-lg border border-slate-700 bg-black/50 px-2.5 py-1 text-[11px] text-slate-200 hover:text-white"
                >
                  System Status
                </button>
              </div>
            </div>
          )}
        </section>

        {sundayReviewOpen && (
          <section
            aria-label="Sunday Review Last Week's Obedience"
            className="rounded-2xl border border-purple-500/35 bg-gradient-to-br from-blue-950/35 via-[#0B0C17]/95 to-purple-950/35 p-4 sm:p-5 backdrop-blur-xl space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-2.5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-200">
                  Sunday Check In: Review Last Week&apos;s Obedience
                </div>
                <p className="text-xs text-slate-300">
                  Reflect on how God met you as you lived out recent commitments before opening today&apos;s passage.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>
                  {commitments.filter((c) => c.done).length} of {commitments.length} walked out
                </span>
                <button
                  type="button"
                  onClick={() => setSundayReviewOpen(false)}
                  aria-label="Close Sunday Review"
                  className="rounded-lg border border-slate-700 bg-black/55 p-1 text-slate-300 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {commitments.length === 0 ? (
              <p className="rounded-xl border border-slate-800/80 bg-black/45 px-3.5 py-2.5 text-xs text-slate-300">
                No commitments saved yet. Open <span className="text-purple-200 font-medium">Study and Hook</span> on any passage to add one concrete step for the week.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {commitments.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-black/50 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="mr-1.5 text-[11px] font-medium text-blue-300">[{c.reference}]</span>
                      <span className={c.done ? 'line-through text-slate-400' : 'text-slate-100'}>{c.text}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleCommitmentDone(c.id)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                          c.done
                            ? 'border-emerald-500/45 bg-emerald-500/20 text-emerald-200'
                            : 'border-slate-700 bg-[#101223] text-slate-200 hover:border-emerald-400/50 hover:text-emerald-200'
                        }`}
                      >
                        {c.done && <Check className="h-3 w-3" />}
                        {c.done ? 'Walked It Out' : 'Mark Walked Out'}
                      </button>
                      {c.done && (
                        <button
                          type="button"
                          onClick={() =>
                            persistCommitments(
                              commitments.map((item) => (item.id === c.id ? { ...item, done: false } : item)),
                            )
                          }
                          className="rounded-lg border border-blue-500/35 bg-blue-950/35 px-2.5 py-1 text-[11px] text-blue-200 hover:text-white"
                        >
                          Carry Forward
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeCommitment(c.id)}
                        aria-label="Remove commitment"
                        className="rounded-lg border border-slate-700 bg-black/45 p-1 text-slate-300 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                value={graceReflection}
                onChange={(e) => handleGraceReflectionChange(e.target.value)}
                placeholder="Grace reflection: Where did you see God's faithfulness this week?"
                className="flex-1 min-w-[240px] rounded-xl border border-slate-700 bg-[#07070D] px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              />
              <button
                type="button"
                onClick={completeSundayCheckIn}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm shadow-purple-950/50 transition hover:opacity-95"
              >
                Complete Check In and Enter Word
              </button>
            </div>
          </section>
        )}

        {/* Main 2-Column Sanctuary */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          {/* LEFT: Sticky Minimalist Scripture Reader (Never leaves empty void when scrolling) */}
          <section className="lg:col-span-7 lg:sticky lg:top-5 rounded-2xl border border-slate-800/75 bg-[#0B0C17]/85 p-5 sm:p-7 backdrop-blur-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  {passage?.reference || activeRef}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {translationButtons.map((v) => {
                  const isActive = primaryTranslation === v.code;
                  return (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => setPrimaryTranslation(v.code)}
                      title={v.name}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'border border-slate-800 bg-black/45 text-slate-400 hover:border-purple-500/40 hover:text-white'
                      }`}
                    >
                      {v.shortLabel}
                    </button>
                  );
                })}

                {extraVersions.length > 0 && (
                  <select
                    aria-label="More Bible translations"
                    value={CORE_TRANSLATIONS.includes(primaryTranslation as (typeof CORE_TRANSLATIONS)[number]) ? '' : primaryTranslation}
                    onChange={(e) => {
                      if (e.target.value) setPrimaryTranslation(e.target.value);
                    }}
                    className="[color-scheme:dark] max-w-[140px] rounded-lg border border-slate-700/90 bg-[#0B0C17] px-2.5 py-1 text-xs text-slate-100 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                  >
                    <option value="" className="bg-[#0B0C17] text-slate-300">More versions</option>
                    {extraVersions.map((ev) => (
                      <option key={ev.code} value={ev.code} className="bg-[#0B0C17] text-slate-100">
                        {ev.shortLabel} ({ev.name})
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => setCompareMode((prev) => !prev)}
                  aria-pressed={compareMode}
                  title="Compare two translations side by side"
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition ${
                    compareMode
                      ? 'border-blue-400/60 bg-blue-600/25 text-blue-100'
                      : 'border-slate-700/80 bg-black/55 text-slate-300 hover:text-white'
                  }`}
                >
                  <Columns2 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setBionicScan((prev) => !prev)}
                  aria-pressed={bionicScan}
                  title="Gentle reading eye anchor bolding"
                  className={`rounded-lg border px-2 py-1 text-xs font-medium transition ${
                    bionicScan
                      ? 'border-purple-400/60 bg-purple-600/25 text-purple-100'
                      : 'border-slate-700/80 bg-black/55 text-slate-300 hover:text-white'
                  }`}
                >
                  Aa
                </button>
              </div>
            </div>

            {compareMode && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-500/25 bg-blue-950/20 px-3 py-2 text-xs">
                <span className="text-blue-200">Comparing <strong>{primaryTranslation}</strong> with:</span>
                <div className="flex flex-wrap gap-1">
                  {CORE_TRANSLATIONS.filter((c) => c !== primaryTranslation).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCompareTranslation(code)}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                        compareTranslation === code
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {passage?.notice && (
              <p className="rounded-lg border border-purple-500/25 bg-purple-950/20 px-3 py-2 text-xs text-purple-200">
                {passage.notice}
              </p>
            )}

            {loadingPassage ? (
              <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                Loading Scripture...
              </div>
            ) : passage ? (
              <div className={compareMode && comparePassage ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}>
                <div className="space-y-4">
                  {compareMode && (
                    <div className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                      {passage.activeTranslation}
                    </div>
                  )}
                  <div className="font-[var(--font-reading)] text-base sm:text-[17.5px] leading-[1.9] tracking-[0.005em] text-slate-50 space-y-3.5">
                    {passage.verses.map((v) => (
                      <p key={v.number}>
                        <span className="mr-2.5 font-[var(--font-sans)] text-xs font-semibold text-purple-300 select-none">
                          {v.number}
                        </span>
                        <InteractiveVerseText
                          text={v.text}
                          bionicEnabled={bionicScan}
                          onWordSelect={(w) => setLensWord(w)}
                        />
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-slate-300">
                    Tip: Tap any word in the verse to open Prism Word Lens without leaving the page.
                  </p>
                  <p className="border-t border-slate-800/70 pt-3 text-[11px] leading-relaxed text-slate-400">
                    {passage.copyright}
                  </p>
                </div>

                {compareMode && comparePassage && (
                  <div className="space-y-4 border-t border-slate-800/70 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                      {comparePassage.activeTranslation}
                    </div>
                    <div className="font-[var(--font-reading)] text-base sm:text-[17px] leading-[1.9] tracking-[0.005em] text-slate-100 space-y-3.5">
                      {comparePassage.verses.map((v) => (
                        <p key={v.number}>
                          <span className="mr-2.5 font-[var(--font-sans)] text-xs font-semibold text-blue-300 select-none">
                            {v.number}
                          </span>
                          <InteractiveVerseText
                            text={v.text}
                            bionicEnabled={bionicScan}
                            onWordSelect={(w) => setLensWord(w)}
                          />
                        </p>
                      ))}
                    </div>
                    <p className="border-t border-slate-800/70 pt-3 text-[11px] leading-relaxed text-slate-400">
                      {comparePassage.copyright}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </section>

          {/* RIGHT: Progressive Minimalist Deep Study Panel */}
          <aside className="lg:col-span-5 rounded-2xl border border-slate-800/80 bg-[#0B0C17]/90 p-5 backdrop-blur-xl space-y-4">
            <div className="flex gap-1 rounded-xl border border-slate-800 bg-black/55 p-1">
              {(
                [
                  { id: 'exegesis', label: 'Deep Exegesis', icon: Sparkles },
                  { id: 'reflect', label: 'Study and Hook', icon: Heart },
                  { id: 'worship', label: 'Worship Deck', icon: Music },
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const active = studyTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStudyTab(id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition ${
                      active
                        ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {studyError && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-100">
                <span>{studyError}</span>
                <button
                  type="button"
                  onClick={() => setStudyRetryNonce((n) => n + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-400/50 bg-amber-900/40 px-2.5 py-1 text-[11px] font-medium text-white"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry Study
                </button>
              </div>
            )}

            {loadingStudy ? (
              <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                Preparing deep exegesis, hidden gem, and worship...
              </div>
            ) : study ? (
              <div className="space-y-3">
                {/* TAB 1: DEEP EXEGESIS + HIDDEN GEM */}
                {studyTab === 'exegesis' && (
                  <div className="space-y-2.5">
                    <AccordionLayer
                      title="1. Historical and Covenant Setting"
                      isOpen={openExegesisSection === 'context'}
                      onToggle={() => toggleAccordion('context')}
                    >
                      <div className="space-y-2 text-xs leading-relaxed text-slate-200">
                        <p><strong className="text-white">Author:</strong> {study.overview.author}</p>
                        <p><strong className="text-white">Audience:</strong> {study.overview.audience}</p>
                        <p><strong className="text-white">Genre:</strong> {study.overview.genre}</p>
                        <p>
                          <strong className="text-blue-300">Setting: </strong>
                          <ReferenceText text={study.overview.historicalContext} onOpenReference={openCrossReference} />
                        </p>
                        <p>
                          <strong className="text-purple-300">Original Hearers: </strong>
                          <ReferenceText text={study.overview.originalHearers} onOpenReference={openCrossReference} />
                        </p>
                        <p>
                          <strong className="text-blue-300">Place in Scripture: </strong>
                          <ReferenceText text={study.overview.redemptivePlacement} onOpenReference={openCrossReference} />
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-white">Structure: </strong>
                          <ReferenceText text={study.overview.literaryStructure} onOpenReference={openCrossReference} />
                        </p>
                      </div>
                    </AccordionLayer>

                    <AccordionLayer
                      title={`Hidden Gem: ${study.dopamineHook.title}`}
                      isOpen={openExegesisSection === 'dopamine'}
                      onToggle={() => toggleAccordion('dopamine')}
                    >
                      <p className="text-xs leading-relaxed text-purple-100">
                        <ReferenceText text={study.dopamineHook.fact} onOpenReference={openCrossReference} />
                      </p>
                    </AccordionLayer>

                    <AccordionLayer
                      title="2. Verse by Verse Exegesis and Word Lens"
                      isOpen={openExegesisSection === 'verse-by-verse'}
                      onToggle={() => toggleAccordion('verse-by-verse')}
                    >
                      <div className="space-y-3">
                        {study.verseExegesis.map((block, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-800/80 bg-black/45 p-3 space-y-1">
                            <div className="text-xs font-semibold text-blue-300">
                              {block.verseRange}: {block.heading}
                            </div>
                            <p className="text-xs leading-relaxed text-slate-200">
                              <ReferenceText text={block.explanation} onOpenReference={openCrossReference} />
                            </p>
                          </div>
                        ))}

                        <div className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                          Original Hebrew and Greek Word Lens
                        </div>
                        {study.wordStudies.map((w, idx) => (
                          <div key={idx} className="rounded-xl border border-purple-500/25 bg-black/45 p-3 space-y-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold text-white">
                                {w.original} <span className="text-xs font-normal text-purple-300">({w.transliteration})</span>
                              </span>
                              <span className="text-[10px] uppercase text-blue-300">{w.language}</span>
                            </div>
                            <p className="text-xs text-slate-100">{w.meaning}</p>
                            <p className="text-xs leading-relaxed text-slate-300">
                              <ReferenceText text={w.prismInsight} onOpenReference={openCrossReference} />
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionLayer>

                    <AccordionLayer
                      title="3. What This Passage Does Not Mean"
                      isOpen={openExegesisSection === 'guardrails'}
                      onToggle={() => toggleAccordion('guardrails')}
                    >
                      <ul className="space-y-2 text-xs leading-relaxed text-slate-200 list-disc pl-4">
                        {study.notMeaning.map((item, idx) => (
                          <li key={idx}>
                            <ReferenceText text={item} onOpenReference={openCrossReference} />
                          </li>
                        ))}
                      </ul>
                    </AccordionLayer>

                    <AccordionLayer
                      title="4. The Christ and Gospel Thread"
                      isOpen={openExegesisSection === 'christ'}
                      onToggle={() => toggleAccordion('christ')}
                    >
                      <p className="text-xs leading-relaxed text-slate-100">
                        <ReferenceText text={study.christThread} onOpenReference={openCrossReference} />
                      </p>
                    </AccordionLayer>

                    <AccordionLayer
                      title={`5. Cross References (${study.crossReferences.length})`}
                      isOpen={openExegesisSection === 'cross-refs'}
                      onToggle={() => toggleAccordion('cross-refs')}
                    >
                      <div className="space-y-2">
                        {study.crossReferences.map((cr, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-800/75 bg-black/40 p-2.5 text-xs text-slate-200 leading-relaxed">
                            <button
                              type="button"
                              onClick={() => openCrossReference(cr.ref)}
                              className="mr-2 inline-flex items-center rounded-md border border-purple-500/45 bg-blue-500/20 px-1.5 py-0.5 font-medium text-blue-200 transition hover:bg-purple-500/30 hover:text-white"
                            >
                              [{cr.ref}]
                            </button>
                            <ReferenceText text={cr.connection} onOpenReference={openCrossReference} />
                          </div>
                        ))}
                      </div>
                    </AccordionLayer>
                  </div>
                )}

                {/* TAB 2: MEMORY METAPHOR, ACRONYM, 7 QUESTIONS & JOURNAL */}
                {studyTab === 'reflect' && (
                  <div className="space-y-3.5">
                    {/* Metaphor + Acronym Memory Anchor */}
                    <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-blue-950/25 to-purple-950/25 p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-200">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Memory Metaphor and Acronym ({study.memoryAnchor.acronymWord})
                        </span>
                      </div>
                      <p className="text-xs italic leading-relaxed text-blue-100">
                        “{study.memoryAnchor.metaphor}”
                      </p>
                      <ul className="space-y-1 text-xs text-slate-100 pt-1">
                        {study.memoryAnchor.acronymLines.map((line, i) => (
                          <li key={i} className="leading-relaxed">{line}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weekly Obedience Commitments Tracker */}
                    <div className="rounded-xl border border-blue-500/30 bg-black/50 p-3.5 space-y-2.5">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                          This Week’s Obedience Commitment
                        </div>
                        <p className="text-xs text-slate-300">
                          Pick one quick action from this passage or write your own to practise together.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          ...study.questions.obedienceStep.slice(0, 1),
                          ...study.lessons.slice(0, 2),
                        ].map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => addCommitment(suggestion)}
                            className="inline-flex items-center gap-1 rounded-full border border-purple-500/35 bg-purple-600/20 px-2.5 py-1 text-left text-[11px] text-purple-100 transition hover:border-purple-400 hover:text-white"
                          >
                            <Plus className="h-3 w-3 shrink-0" />
                            <span className="line-clamp-1">{suggestion}</span>
                          </button>
                        ))}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          addCommitment(commitmentInput);
                        }}
                        className="flex gap-1.5"
                      >
                        <input
                          type="text"
                          value={commitmentInput}
                          onChange={(e) => setCommitmentInput(e.target.value)}
                          placeholder="Or write one concrete step you will obey this week..."
                          className="flex-1 rounded-lg border border-slate-700 bg-[#07070D] px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                        />
                        <button
                          type="submit"
                          disabled={!commitmentInput.trim()}
                          className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                        >
                          Commit
                        </button>
                      </form>

                      {commitments.length > 0 && (
                        <ul className="space-y-1.5 pt-1 border-t border-slate-800/70">
                          {commitments.map((c) => (
                            <li
                              key={c.id}
                              className="flex items-start justify-between gap-2 rounded-lg border border-slate-800/80 bg-[#0B0C17] px-2.5 py-2 text-xs"
                            >
                              <button
                                type="button"
                                onClick={() => toggleCommitmentDone(c.id)}
                                className="flex flex-1 items-start gap-2 text-left"
                              >
                                <span
                                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                    c.done
                                      ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300'
                                      : 'border-slate-500 bg-black/45'
                                  }`}
                                >
                                  {c.done && <Check className="h-3 w-3" />}
                                </span>
                                <span className={c.done ? 'line-through text-slate-400' : 'text-slate-100'}>
                                  <span className="text-[11px] text-blue-300 mr-1">[{c.reference}]</span>
                                  {c.text}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCommitment(c.id)}
                                aria-label="Remove commitment"
                                className="text-slate-300 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {(
                      [
                        { title: '1. Textual Discovery', items: study.questions.textualDiscovery, accent: 'text-blue-300' },
                        { title: '2. Theological Anchor', items: study.questions.theologicalAnchor, accent: 'text-cyan-300' },
                        { title: '3. Heart Check Together', items: study.questions.couplesHeart, accent: 'text-purple-300' },
                        { title: '4. Weekly Obedience Step', items: study.questions.obedienceStep, accent: 'text-indigo-300' },
                      ] as const
                    ).map((group) => (
                      <div key={group.title} className="rounded-xl border border-slate-800/80 bg-black/45 p-3.5 space-y-1.5">
                        <div className={`text-[11px] font-semibold uppercase tracking-wider ${group.accent}`}>
                          {group.title}
                        </div>
                        <ul className="space-y-1.5 text-xs leading-relaxed text-slate-200 list-disc pl-4">
                          {group.items.map((q, i) => (
                            <li key={i}>
                              <ReferenceText text={q} onOpenReference={openCrossReference} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    <div className="rounded-xl border border-purple-500/25 bg-purple-950/20 p-3.5 space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-200">
                        Guided Prayer Together
                      </div>
                      <p className="font-[var(--font-reading)] text-sm italic leading-relaxed text-purple-100">
                        {study.guidedPrayer}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800/80 bg-black/45 p-3.5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="study-notes" className="text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                          Private Study Notes ({activeRef})
                        </label>
                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/35 bg-purple-950/30 px-2.5 py-0.5 text-[11px] text-purple-200">
                          <Lock className="h-3 w-3" />
                          {vaultStatusText ||
                            (diskVaultActive
                              ? "Hidden in DJ's Notes folder (Not Shareable)"
                              : 'Private and Not Shareable')}
                        </span>
                      </div>
                      <textarea
                        id="study-notes"
                        rows={3}
                        value={journalNote}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        placeholder="Write down private insights, prayers, or answers from tonight's study..."
                        className="w-full rounded-xl border border-slate-700 bg-[#07070D] p-3 text-xs text-slate-100 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: FOLDER WORSHIP LIBRARY & SONG STUDIO */}
                {studyTab === 'worship' && (
                  <WorshipStudio
                    reference={activeRef}
                    hymns={study.worship.hymns}
                    modernSongs={study.worship.modernSongs}
                  />
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
                  <span>{study.providerLabel}</span>
                  <button
                    type="button"
                    onClick={() => setShowEntrance(true)}
                    className="hover:text-purple-200 transition"
                  >
                    Replay Opening Animation
                  </button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>

      {/* Floating Prism Word Lens Card when tapping a word in Scripture */}
      {lensWord && (
        <aside
          aria-label="Prism Word Lens"
          className="fixed bottom-5 left-5 z-40 w-[min(340px,calc(100vw-2.5rem))] rounded-2xl border border-purple-500/40 bg-[#0B0C17]/95 p-4 text-slate-100 shadow-2xl shadow-purple-950/70 backdrop-blur-xl space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                Prism Word Lens
              </span>
              <h3 className="mt-0.5 text-base font-semibold text-white">“{lensWord}”</h3>
              <p className="text-xs text-slate-300">Inspect meaning without losing reading flow.</p>
            </div>
            <button
              type="button"
              onClick={() => setLensWord('')}
              aria-label="Close Prism Word Lens"
              className="rounded-lg p-1 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openWordInAskDj(lensWord)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-xs font-medium text-white transition hover:opacity-95"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Ask DJ
            </button>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`${lensWord} bible meaning ${activeRef}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-black/55 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-purple-400/50 hover:text-white"
            >
              <Search className="h-3.5 w-3.5" />
              Google
            </a>
          </div>
        </aside>
      )}

      <AskDJScriptureDrawer
        isOpen={drawerOpen}
        primaryReference={activeRef}
        clickedReference={drawerRef}
        focusWord={drawerWord}
        activeTranslation={primaryTranslation}
        sparkleMode={bionicScan}
        onSelectReference={openCrossReference}
        onClose={() => setDrawerOpen(false)}
      />

      <StudyPlayModal
        isOpen={studyPlayOpen}
        reference={activeRef}
        study={study}
        onClose={() => setStudyPlayOpen(false)}
      />

      <SystemHealthModal
        isOpen={healthOpen}
        onClose={() => setHealthOpen(false)}
      />
    </div>
  );
}

function AccordionLayer({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-black/35 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium text-slate-100 transition hover:bg-white/[0.02]"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-purple-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-slate-800/60 px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
