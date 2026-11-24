'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Compass,
  Eraser,
  Gamepad2,
  Grid3x3,
  Heart,
  HelpCircle,
  Lock,
  Pencil,
  RotateCcw,
  Shuffle,
  Sparkles,
  Undo2,
  X,
} from 'lucide-react';
import type { StudyBreakdown } from '../types';
import {
  CONNECTIONS_PUZZLES,
  DISPATCH_LEVELS,
  SUDOKU_TIERS,
  type ConnectionsGroup,
  type ConnectionsPuzzle,
  type DispatchLevel,
  type DispatchTile,
  type SudokuTierSpec,
} from '../studyGamesData';

interface StudyPlayModalProps {
  isOpen: boolean;
  reference: string;
  study: StudyBreakdown | null;
  onClose: () => void;
}

type GameTab = 'connections' | 'dispatch' | 'sudoku';

function readStorageArray(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeStorageArray(key: string, values: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(values))));
  } catch {
    // Ignore storage quota errors
  }
}

function deterministicMix(items: string[], seedShift: number): string[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (i * 7 + seedShift + arr[i].length * 3) % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function randomShuffle(items: string[]): string[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

const TIER_STYLES: Record<ConnectionsGroup['tier'], string> = {
  1: 'border-blue-400/50 bg-blue-950/55 text-blue-100',
  2: 'border-indigo-400/50 bg-indigo-950/55 text-indigo-100',
  3: 'border-purple-400/55 bg-purple-950/60 text-purple-100',
  4: 'border-amber-400/55 bg-amber-950/50 text-amber-100',
};

const TIER_LABELS: Record<ConnectionsGroup['tier'], string> = {
  1: 'Clear',
  2: 'Tricky',
  3: 'Deep Cut',
  4: 'Trap Group',
};

/* -------------------------------------------------------------------------- */
/* TAB 1: COVENANT CONNECTIONS (4x4 Scripture Categories with Red Herrings)   */
/* -------------------------------------------------------------------------- */
function CovenantConnectionsGame({ puzzle }: { puzzle: ConnectionsPuzzle }) {
  const allItems = puzzle.groups.flatMap((g) => g.items);
  const [tiles, setTiles] = useState<string[]>(() => deterministicMix(allItems, puzzle.level * 5));
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<ConnectionsGroup[]>([]);
  const [mistakesLeft, setMistakesLeft] = useState<number>(4);
  const [toast, setToast] = useState<string | null>(null);
  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState<string[]>(() =>
    readStorageArray('prism_word_connections_solved'),
  );

  const isFailed = mistakesLeft <= 0 && solvedGroups.length < 4;
  const isWon = solvedGroups.length === 4;

  const resetPuzzle = () => {
    setTiles(deterministicMix(allItems, puzzle.level * 5 + 3));
    setSelected([]);
    setSolvedGroups([]);
    setMistakesLeft(4);
    setToast(null);
  };

  const toggleTile = (word: string) => {
    if (isFailed || isWon) return;
    setToast(null);
    setSelected((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= 4) return prev;
      return [...prev, word];
    });
  };

  const submitSelection = () => {
    if (selected.length !== 4 || isFailed || isWon) return;
    const remainingGroups = puzzle.groups.filter(
      (g) => !solvedGroups.some((sg) => sg.id === g.id),
    );

    const exact = remainingGroups.find((g) =>
      g.items.every((item) => selected.includes(item)),
    );

    if (exact) {
      const nextSolved = [...solvedGroups, exact];
      setSolvedGroups(nextSolved);
      setTiles((prev) => prev.filter((t) => !exact.items.includes(t)));
      setSelected([]);
      setToast(`Matched: ${exact.title}!`);
      if (nextSolved.length === 4) {
        const updated = [...solvedPuzzleIds, puzzle.id];
        setSolvedPuzzleIds(updated);
        writeStorageArray('prism_word_connections_solved', updated);
      }
      return;
    }

    const oneAway = remainingGroups.some(
      (g) => g.items.filter((item) => selected.includes(item)).length === 3,
    );
    const nextMistakes = mistakesLeft - 1;
    setMistakesLeft(nextMistakes);
    if (nextMistakes <= 0) {
      setSolvedGroups(puzzle.groups as unknown as ConnectionsGroup[]);
      setTiles([]);
      setSelected([]);
      setToast('Out of attempts — study the groups below and retry!');
    } else {
      setToast(
        oneAway
          ? 'One away! Three of these four belong together.'
          : 'Not a matching quartet. Watch out for crossover traps across books.',
      );
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-black/45 px-3.5 py-2.5 text-xs">
        <div>
          <span className="font-semibold text-white">{puzzle.title}</span>
          <span className="ml-2 text-[11px] text-purple-300">{puzzle.difficulty}</span>
          {solvedPuzzleIds.includes(puzzle.id) && (
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> Solved
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <span>Attempts:</span>
          {Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i < mistakesLeft ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 px-0.5">
        Find <strong>4 groups of 4</strong> matching Scripture terms. Hint: {puzzle.trapHint}
      </p>

      {/* Solved Group Banners */}
      {solvedGroups.length > 0 && (
        <div className="space-y-2">
          {solvedGroups.map((g) => (
            <div key={g.id} className={`rounded-xl border px-3.5 py-2.5 ${TIER_STYLES[g.tier]}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold">{g.title}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-90">
                  {TIER_LABELS[g.tier]} ({g.ref})
                </span>
              </div>
              <div className="mt-1 text-xs font-medium tracking-wide">
                {g.items.join(', ')}
              </div>
              <p className="mt-1 text-[11px] opacity-85">{g.insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* Remaining 4x4 Grid */}
      {tiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tiles.map((word) => {
            const isSel = selected.includes(word);
            return (
              <button
                key={word}
                type="button"
                onClick={() => toggleTile(word)}
                className={`rounded-xl border px-2.5 py-3.5 text-xs font-semibold transition ${
                  isSel
                    ? 'border-purple-400 bg-gradient-to-br from-blue-600/40 to-purple-600/45 text-white shadow-md shadow-purple-950/60'
                    : 'border-slate-800 bg-[#0F1123] text-slate-200 hover:border-blue-500/40 hover:text-white'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="rounded-xl border border-purple-500/35 bg-purple-950/25 px-3 py-2 text-xs text-purple-100">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {tiles.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setTiles((prev) => randomShuffle(prev))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-black/45 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Shuffle
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                disabled={selected.length === 0}
                className="rounded-lg border border-slate-800 bg-black/45 px-3 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-40"
              >
                Deselect
              </button>
            </>
          )}
          <button
            type="button"
            onClick={resetPuzzle}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-black/45 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {tiles.length > 0 && (
          <button
            type="button"
            onClick={submitSelection}
            disabled={selected.length !== 4}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-40"
          >
            Submit Quartet ({selected.length}/4)
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TAB 2: EXODUS DISPATCH (Spatial Blocking + Limited Dock Capacity Strategy) */
/* -------------------------------------------------------------------------- */
interface DispatchSnapshot {
  lanes: DispatchTile[][];
  dock: DispatchTile[];
  gateIndex: number;
  boardedInGate: number;
}

function settleDispatchState(level: DispatchLevel, state: DispatchSnapshot): DispatchSnapshot {
  let gateIndex = state.gateIndex;
  let boardedInGate = state.boardedInGate;
  let dock = [...state.dock];

  while (gateIndex < level.gates.length) {
    const activeGate = level.gates[gateIndex];
    let keptDock: DispatchTile[] = [];
    for (const item of dock) {
      if (item.groupId === activeGate.groupId && boardedInGate < activeGate.needed) {
        boardedInGate += 1;
      } else {
        keptDock.push(item);
      }
    }
    dock = keptDock;
    keptDock = [];

    if (boardedInGate >= activeGate.needed) {
      gateIndex += 1;
      boardedInGate = 0;
    } else {
      break;
    }
  }

  return { lanes: state.lanes, dock, gateIndex, boardedInGate };
}

function ExodusDispatchGame({ level }: { level: DispatchLevel }) {
  const initialSnapshot = (): DispatchSnapshot =>
    settleDispatchState(level, {
      lanes: level.lanes.map((lane) => [...lane]),
      dock: [],
      gateIndex: 0,
      boardedInGate: 0,
    });

  const [state, setState] = useState<DispatchSnapshot>(initialSnapshot);
  const [undoStack, setUndoStack] = useState<DispatchSnapshot[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>(() =>
    readStorageArray('prism_word_dispatch_solved'),
  );

  const isWon = state.gateIndex >= level.gates.length;
  const activeGate = !isWon ? level.gates[state.gateIndex] : null;
  const frontMatchesExist =
    activeGate !== null && state.lanes.some((lane) => lane.length > 0 && lane[0].groupId === activeGate.groupId);
  const isGridlocked =
    !isWon && activeGate !== null && state.dock.length >= level.dockCapacity && !frontMatchesExist;

  const dispatchFrontTile = (laneIdx: number) => {
    if (isWon || !activeGate) return;
    const lane = state.lanes[laneIdx];
    if (!lane || lane.length === 0) return;

    const frontTile = lane[0];
    const isMatch = frontTile.groupId === activeGate.groupId;

    if (!isMatch && state.dock.length >= level.dockCapacity) {
      setErrorMsg(
        `Dock is FULL (${level.dockCapacity}/${level.dockCapacity})! "${frontTile.label}" does not belong to ${activeGate.title}. Undo or pick a matching front tile.`,
      );
      return;
    }

    setUndoStack((prev) => [...prev, state]);
    setErrorMsg(null);

    const nextLanes = state.lanes.map((l, idx) => (idx === laneIdx ? l.slice(1) : l));
    const nextState = settleDispatchState(level, {
      lanes: nextLanes,
      dock: isMatch ? state.dock : [...state.dock, frontTile],
      gateIndex: state.gateIndex,
      boardedInGate: isMatch ? state.boardedInGate + 1 : state.boardedInGate,
    });

    setState(nextState);
    if (nextState.gateIndex >= level.gates.length) {
      const updated = [...solvedIds, level.id];
      setSolvedIds(updated);
      writeStorageArray('prism_word_dispatch_solved', updated);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setState(prev);
    setErrorMsg(null);
  };

  const handleReset = () => {
    setState(initialSnapshot());
    setUndoStack([]);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-black/45 px-3.5 py-2.5 text-xs">
        <div>
          <span className="font-semibold text-white">{level.title}</span>
          {solvedIds.includes(level.id) && (
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> Cleared
            </span>
          )}
          <div className="text-[11px] text-slate-400">{level.subtitle}</div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0D0F1D] px-2.5 py-1 text-[11px] text-slate-300 hover:text-white disabled:opacity-40"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0D0F1D] px-2.5 py-1 text-[11px] text-slate-300 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Restart
          </button>
        </div>
      </div>

      {/* Active Gate & Timeline Roadmap */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {level.gates.map((g, idx) => {
          const isCurrent = idx === state.gateIndex;
          const isDone = idx < state.gateIndex;
          return (
            <div
              key={g.groupId}
              className={`rounded-xl border px-2.5 py-2 text-[11px] transition ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200'
                  : isCurrent
                    ? 'border-purple-400 bg-gradient-to-br from-blue-600/30 to-purple-600/30 text-white shadow-sm shadow-purple-950/50'
                    : 'border-slate-700/80 bg-black/45 text-slate-300'
              }`}
            >
              <div className="font-semibold truncate">{g.title}</div>
              <div className="text-[11px] opacity-90">
                {isDone
                  ? `Complete (${g.needed} of ${g.needed})`
                  : isCurrent
                    ? `Active (${state.boardedInGate} of ${g.needed}), ${g.ref}`
                    : `Queued (${g.needed})`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Limited Waiting Dock Buffer */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0A0C18] p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold uppercase tracking-wider text-blue-300">
            Waiting Dock ({state.dock.length} of {level.dockCapacity} slots used)
          </span>
          <span className="text-slate-300">Matching parked tiles board automatically when their Gate opens</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: level.dockCapacity }, (_, idx) => {
            const tile = state.dock[idx];
            return (
              <div
                key={idx}
                className={`flex min-h-[38px] items-center justify-center rounded-lg border px-2 py-1.5 text-center text-[11px] font-medium ${
                  tile
                    ? 'border-amber-400/50 bg-amber-950/35 text-amber-100'
                    : 'border-dashed border-slate-700 bg-black/45 text-slate-400'
                }`}
              >
                {tile ? tile.label : 'Empty Slot'}
              </div>
            );
          })}
        </div>
      </div>

      {isGridlocked && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/45 bg-rose-950/35 px-3.5 py-2.5 text-xs text-rose-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-300 shrink-0" />
            <span>
              <strong>Gridlock!</strong> Dock is full and no front tile matches <em>{activeGate?.title}</em>. Undo or restart to pick a smarter lane order.
            </span>
          </div>
        </div>
      )}

      {errorMsg && !isGridlocked && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/25 px-3 py-2 text-xs text-rose-200">
          {errorMsg}
        </div>
      )}

      {isWon ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-4 space-y-2 text-xs text-emerald-100">
          <div className="flex items-center gap-2 font-semibold text-sm text-emerald-300">
            <Award className="h-4 w-4" />
            All Gates Cleared with Redemptive Thread Intact
          </div>
          <p className="text-slate-200 leading-relaxed">{level.lesson}</p>
        </div>
      ) : (
        <div
          className={`grid gap-2.5 ${
            level.lanes.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {state.lanes.map((lane, laneIdx) => (
            <div
              key={laneIdx}
              className="rounded-xl border border-slate-800/80 bg-black/45 p-2.5 space-y-2"
            >
              <div className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Lane {laneIdx + 1}
              </div>
              {lane.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-700 py-6 text-center text-[11px] text-slate-400">
                  Cleared
                </div>
              ) : (
                <div className="space-y-1.5">
                  {lane.map((tile, tileIdx) => {
                    const isFront = tileIdx === 0;
                    if (isFront) {
                      return (
                        <button
                          key={tile.id}
                          type="button"
                          onClick={() => dispatchFrontTile(laneIdx)}
                          className="w-full rounded-lg border border-purple-400/55 bg-gradient-to-br from-blue-900/50 to-purple-900/55 px-2.5 py-2.5 text-center text-xs font-semibold text-white shadow-sm transition hover:border-blue-300 hover:scale-[1.02]"
                        >
                          <div>{tile.label}</div>
                          <div className="mt-0.5 text-[10px] font-normal text-purple-200">
                            Front (Tap to Dispatch)
                          </div>
                        </button>
                      );
                    }
                    return (
                      <div
                        key={tile.id}
                        className="flex items-center justify-center gap-1 rounded-lg border border-slate-800 bg-[#0B0C17] px-2 py-2 text-center text-[11px] text-slate-300"
                      >
                        <Lock className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{tile.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TAB 3: MASTER SCRIPTURE SUDOKU (Hard 6x6 & True 9x9 + Pencil Notes)        */
/* -------------------------------------------------------------------------- */
function MasterSudokuGame({ tier }: { tier: SudokuTierSpec }) {
  const n = tier.size;
  const [board, setBoard] = useState<number[][]>(() => tier.puzzle.map((r) => [...r]));
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [notesMode, setNotesMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [solvedTiers, setSolvedTiers] = useState<string[]>(() =>
    readStorageArray('prism_word_sudoku_solved'),
  );

  const isSolved = board.every((row, r) => row.every((v, c) => v === tier.solution[r][c]));
  const isLost = mistakes >= tier.maxMistakes && !isSolved;

  const resetBoard = () => {
    setBoard(tier.puzzle.map((r) => [...r]));
    setNotes({});
    setSelectedCell(null);
    setMistakes(0);
    setWrongFlash(null);
  };

  const placeValue = (num: number) => {
    if (!selectedCell || isSolved || isLost) return;
    const [r, c] = selectedCell;
    if (tier.puzzle[r][c] !== 0 || board[r][c] === tier.solution[r][c]) return;

    const cellKey = `${r}-${c}`;

    if (num === 0) {
      setBoard((prev) => prev.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? 0 : v)) : row)));
      setNotes((prev) => {
        const copy = { ...prev };
        delete copy[cellKey];
        return copy;
      });
      return;
    }

    if (notesMode) {
      setNotes((prev) => {
        const existing = prev[cellKey] ?? [];
        const updated = existing.includes(num)
          ? existing.filter((x) => x !== num)
          : [...existing, num].sort((a, b) => a - b);
        return { ...prev, [cellKey]: updated };
      });
      return;
    }

    if (tier.solution[r][c] !== num) {
      setMistakes((m) => m + 1);
      setWrongFlash(cellKey);
      setTimeout(() => setWrongFlash(null), 550);
      return;
    }

    const nextBoard = board.map((row, ri) =>
      ri === r ? row.map((v, ci) => (ci === c ? num : v)) : row,
    );
    setBoard(nextBoard);

    // Auto-clear pencil candidate from row, col, and box
    const boxR = Math.floor(r / tier.boxRows) * tier.boxRows;
    const boxC = Math.floor(c / tier.boxCols) * tier.boxCols;
    setNotes((prev) => {
      const copy = { ...prev };
      delete copy[cellKey];
      for (let idx = 0; idx < n; idx++) {
        for (const k of [`${r}-${idx}`, `${idx}-${c}`]) {
          if (copy[k]) copy[k] = copy[k].filter((x) => x !== num);
        }
      }
      for (let rr = boxR; rr < boxR + tier.boxRows; rr++) {
        for (let cc = boxC; cc < boxC + tier.boxCols; cc++) {
          const k = `${rr}-${cc}`;
          if (copy[k]) copy[k] = copy[k].filter((x) => x !== num);
        }
      }
      return copy;
    });

    if (nextBoard.every((row, ri) => row.every((v, ci) => v === tier.solution[ri][ci]))) {
      const updated = [...solvedTiers, tier.id];
      setSolvedTiers(updated);
      writeStorageArray('prism_word_sudoku_solved', updated);
    }
  };

  const applyHint = () => {
    if (isSolved || isLost) return;
    const target = selectedCell;
    if (target) {
      const [tr, tc] = target;
      if (board[tr][tc] !== tier.solution[tr][tc]) {
        const nextBoard = board.map((row, ri) =>
          ri === tr ? row.map((v, ci) => (ci === tc ? tier.solution[tr][tc] : v)) : row,
        );
        setBoard(nextBoard);
        if (nextBoard.every((row, ri) => row.every((v, ci) => v === tier.solution[ri][ci]))) {
          const updated = [...solvedTiers, tier.id];
          setSolvedTiers(updated);
          writeStorageArray('prism_word_sudoku_solved', updated);
        }
        return;
      }
    }
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] !== tier.solution[r][c]) {
          setSelectedCell([r, c]);
          const nextBoard = board.map((row, ri) =>
            ri === r ? row.map((v, ci) => (ci === c ? tier.solution[r][c] : v)) : row,
          );
          setBoard(nextBoard);
          if (nextBoard.every((row, ri) => row.every((v, ci) => v === tier.solution[ri][ci]))) {
            const updated = [...solvedTiers, tier.id];
            setSolvedTiers(updated);
            writeStorageArray('prism_word_sudoku_solved', updated);
          }
          return;
        }
      }
    }
  };

  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]] : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-black/45 px-3.5 py-2.5 text-xs">
        <div>
          <span className="font-semibold text-white">{tier.title}</span>
          {solvedTiers.includes(tier.id) && (
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
          )}
          <div className="text-xs text-slate-300">{tier.subtitle}</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={mistakes >= 2 ? 'text-rose-300 font-semibold' : 'text-slate-200'}>
            Mistakes: {mistakes} of {tier.maxMistakes}
          </span>
          <button
            type="button"
            onClick={applyHint}
            disabled={isSolved || isLost}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/40 bg-blue-950/35 px-2.5 py-1 text-blue-100 hover:text-white disabled:opacity-40"
          >
            <HelpCircle className="h-3 w-3" />
            Hint
          </button>
          <button
            type="button"
            onClick={resetBoard}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0D0F1D] px-2.5 py-1 text-slate-200 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Virtue Legend */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {tier.symbols.map((s) => (
          <span
            key={s.num}
            className={`rounded-md border px-2 py-0.5 text-[11px] ${
              selectedValue === s.num
                ? 'border-purple-400 bg-purple-600/35 text-white font-semibold'
                : 'border-slate-700/80 bg-black/50 text-slate-300'
            }`}
          >
            <strong className="text-blue-300">{s.num}</strong> {s.name}
          </span>
        ))}
      </div>

      {/* Sudoku Grid (6x6 or 9x9) */}
      <div
        className={`mx-auto grid gap-0 border-2 border-purple-500/50 rounded-xl overflow-hidden bg-slate-900/50 ${
          n === 9 ? 'grid-cols-9 max-w-[396px]' : 'grid-cols-6 max-w-[330px]'
        }`}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const isGiven = tier.puzzle[r][c] !== 0;
            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
            const samePeer =
              selectedCell &&
              (selectedCell[0] === r ||
                selectedCell[1] === c ||
                (Math.floor(selectedCell[0] / tier.boxRows) === Math.floor(r / tier.boxRows) &&
                  Math.floor(selectedCell[1] / tier.boxCols) === Math.floor(c / tier.boxCols)));
            const sameDigit = selectedValue > 0 && val === selectedValue;
            const isBoxRight = (c + 1) % tier.boxCols === 0 && c < n - 1;
            const isBoxBottom = (r + 1) % tier.boxRows === 0 && r < n - 1;
            const cellKey = `${r}-${c}`;
            const cellNotes = notes[cellKey] ?? [];
            const isWrong = wrongFlash === cellKey;

            return (
              <button
                key={cellKey}
                type="button"
                onClick={() => setSelectedCell([r, c])}
                className={`relative aspect-square flex items-center justify-center border border-slate-800/80 transition ${
                  isBoxRight ? 'border-r-2 border-r-purple-400/55' : ''
                } ${isBoxBottom ? 'border-b-2 border-b-purple-400/55' : ''} ${
                  isWrong
                    ? 'bg-rose-600/45 text-white'
                    : isSelected
                      ? 'bg-purple-600/45 ring-2 ring-inset ring-purple-300 text-white'
                      : sameDigit
                        ? 'bg-blue-600/25 text-blue-100'
                        : samePeer
                          ? 'bg-slate-800/45'
                          : isGiven
                            ? 'bg-[#090B16]'
                            : 'bg-[#0E1022]'
                }`}
              >
                {val > 0 ? (
                  <span
                    className={`${n === 9 ? 'text-sm' : 'text-base'} font-semibold ${
                      isGiven ? 'text-slate-100' : 'text-blue-300'
                    }`}
                  >
                    {val}
                  </span>
                ) : cellNotes.length > 0 ? (
                  <div
                    className={`grid w-full h-full p-0.5 ${
                      n === 9 ? 'grid-cols-3 text-[8px]' : 'grid-cols-3 text-[9px]'
                    } leading-none text-purple-300/80`}
                  >
                    {Array.from({ length: n }, (_, k) => k + 1).map((cand) => (
                      <span key={cand} className="flex items-center justify-center">
                        {cellNotes.includes(cand) ? cand : ''}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            );
          }),
        )}
      </div>

      {/* Keypad & Pencil Toggle */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setNotesMode((p) => !p)}
            aria-pressed={notesMode}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              notesMode
                ? 'border-purple-400 bg-purple-600/35 text-white'
                : 'border-slate-800 bg-black/50 text-slate-300 hover:text-white'
            }`}
          >
            <Pencil className="h-3.5 w-3.5" />
            Notes: {notesMode ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => placeValue(0)}
            disabled={!selectedCell || isSolved || isLost}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-40"
          >
            <Eraser className="h-3.5 w-3.5" />
            Erase
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5">
          {tier.symbols.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => placeValue(s.num)}
              disabled={!selectedCell || isSolved || isLost}
              className="min-w-[38px] rounded-xl border border-slate-700/90 bg-[#101224] px-2.5 py-2 text-xs font-semibold text-white transition hover:border-purple-400 disabled:opacity-40"
            >
              {s.num}
            </button>
          ))}
        </div>
      </div>

      {isLost && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-center text-xs text-rose-100">
          3 mistakes reached on {tier.title}. Tap <strong>Reset</strong> or switch Pencil Notes ON to scan candidates cleanly.
        </div>
      )}

      {isSolved ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-3 text-center text-xs text-emerald-100 space-y-1">
          <div className="font-semibold text-emerald-300">
            Solved {tier.title}!
          </div>
          <p>{tier.verseBanner}</p>
        </div>
      ) : (
        <p className="text-center text-[11px] text-slate-400">{tier.verseBanner}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN MODAL SHELL                                                           */
/* -------------------------------------------------------------------------- */
export function StudyPlayModal({ isOpen, reference, study, onClose }: StudyPlayModalProps) {
  const [tab, setTab] = useState<GameTab>('connections');
  const [connIdx, setConnIdx] = useState<number>(0);
  const [dispIdx, setDispIdx] = useState<number>(0);
  const [sudokuIdx, setSudokuIdx] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Prism Word Strategy Games"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-purple-500/35 bg-[#090A14] text-slate-100 shadow-2xl shadow-purple-950/60">
        <header className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 text-purple-300">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white">
                Study Play Strategic Puzzles
              </h2>
              <p className="text-xs text-slate-300">
                Logic and Scripture mastery while resting after {reference}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Study Play"
            className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* 3 Strategy Game Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-800/80 px-5 py-3 bg-black/30">
          <button
            type="button"
            onClick={() => setTab('connections')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              tab === 'connections'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Covenant Connections
          </button>
          <button
            type="button"
            onClick={() => setTab('dispatch')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              tab === 'dispatch'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            Exodus Dispatch
          </button>
          <button
            type="button"
            onClick={() => setTab('sudoku')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              tab === 'sudoku'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Grid3x3 className="h-3.5 w-3.5" />
            Master Sudoku (6x6 and 9x9)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === 'connections' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {CONNECTIONS_PUZZLES.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setConnIdx(idx)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                      connIdx === idx
                        ? 'border-purple-400 bg-purple-600/30 text-white'
                        : 'border-slate-700 bg-black/45 text-slate-300 hover:text-white'
                    }`}
                  >
                    Puzzle {p.level}: {p.title}
                  </button>
                ))}
              </div>
              <CovenantConnectionsGame
                key={CONNECTIONS_PUZZLES[connIdx].id}
                puzzle={CONNECTIONS_PUZZLES[connIdx]}
              />
            </div>
          )}

          {tab === 'dispatch' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {DISPATCH_LEVELS.map((lv, idx) => (
                  <button
                    key={lv.id}
                    type="button"
                    onClick={() => setDispIdx(idx)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                      dispIdx === idx
                        ? 'border-purple-400 bg-purple-600/30 text-white'
                        : 'border-slate-800 bg-black/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lv.title}
                  </button>
                ))}
              </div>
              <ExodusDispatchGame
                key={DISPATCH_LEVELS[dispIdx].id}
                level={DISPATCH_LEVELS[dispIdx]}
              />
            </div>
          )}

          {tab === 'sudoku' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {SUDOKU_TIERS.map((st, idx) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSudokuIdx(idx)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                      sudokuIdx === idx
                        ? 'border-purple-400 bg-purple-600/30 text-white'
                        : 'border-slate-800 bg-black/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.title}
                  </button>
                ))}
              </div>
              <MasterSudokuGame
                key={SUDOKU_TIERS[sudokuIdx].id}
                tier={SUDOKU_TIERS[sudokuIdx]}
              />
            </div>
          )}

          {study?.memoryAnchor && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-950/15 px-3.5 py-2.5 text-xs text-slate-300 flex items-start gap-2">
              <Heart className="h-3.5 w-3.5 shrink-0 text-purple-300 mt-0.5" />
              <span>
                <strong className="text-purple-200">{study.memoryAnchor.acronymWord}:</strong>{' '}
                {study.memoryAnchor.metaphor}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
