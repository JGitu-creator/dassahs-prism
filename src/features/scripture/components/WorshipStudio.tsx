'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Disc3,
  ExternalLink,
  Loader2,
  Music2,
  Pause,
  Play,
  Radio,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type {
  GeneratedWorshipSong,
  MusicTrackMatch,
  WorshipGenre,
  WorshipPairingItem,
} from '../types';
import { WorshipBackingTrack } from '../worshipSynth';
import { normalizeChordProgression } from '../chordUtils';

const GENRE_TILES: Array<{
  id: WorshipGenre;
  label: string;
  vibe: string;
}> = [
  { id: 'amapiano', label: 'Amapiano', vibe: 'Deep log drum and Rhodes keys' },
  { id: 'afro-gospel', label: 'Afro Gospel', vibe: 'Joyful syncopated praise' },
  { id: 'hymns', label: 'Hymns', vibe: 'Reverent organ harmony' },
  { id: 'lofi', label: 'Lo Fi', vibe: 'Warm quiet chill swing' },
  { id: 'rnb', label: 'R&B', vibe: 'Neo soul ninth chords and bass' },
];

type ShelfItem = WorshipPairingItem & { category: 'Hymn' | 'Worship' };
type EmbedMode = 'apple' | 'spotify' | 'youtube' | null;

const MAX_WORSHIP_SLIDES = 14;

interface WorshipStudioProps {
  reference: string;
  hymns: WorshipPairingItem[];
  modernSongs: WorshipPairingItem[];
}

function parseSpotifyEmbedUrl(raw: string): string | null {
  const m = raw.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0`;
}

function parseYouTubeEmbedUrl(raw: string): string | null {
  const short = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = raw.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return null;
}

export function WorshipStudio({ reference, hymns, modernSongs }: WorshipStudioProps) {
  const shelfSongs: ShelfItem[] = [
    ...hymns.map((h) => ({ ...h, category: 'Hymn' as const })),
    ...modernSongs.map((m) => ({ ...m, category: 'Worship' as const })),
  ].slice(0, MAX_WORSHIP_SLIDES);

  // Single-Card Carousel State
  const [slideIndex, setSlideIndex] = useState(0);
  const [matchesByQuery, setMatchesByQuery] = useState<Record<string, MusicTrackMatch>>({});
  const [embedMode, setEmbedMode] = useState<EmbedMode>(null);
  const [playingPreview, setPlayingPreview] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [pinnedSpotifyByTitle, setPinnedSpotifyByTitle] = useState<Record<string, string>>({});
  const [pinnedYtByTitle, setPinnedYtByTitle] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Song Studio State
  const [studioOpen, setStudioOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<WorshipGenre>('amapiano');
  const [composedSong, setComposedSong] = useState<GeneratedWorshipSong | null>(null);
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState<number>(-1);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const synthRef = useRef<WorshipBackingTrack | null>(null);
  const wheelCooldownRef = useRef<number>(0);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const queries = [
      ...hymns.map((h) => h.searchQuery),
      ...modernSongs.map((m) => m.searchQuery),
    ].slice(0, MAX_WORSHIP_SLIDES);

    for (const q of queries) {
      if (!q) continue;
      fetch(`/api/scripture/music?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: MusicTrackMatch | null) => {
          if (!cancelled && data) {
            setMatchesByQuery((prev) => ({ ...prev, [q]: data }));
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [hymns, modernSongs]);

  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      audioEl?.pause();
      synthRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    synthRef.current?.stop();
  }, [reference]);

  const safeIdx = shelfSongs.length > 0 ? slideIndex % shelfSongs.length : 0;
  const activeSong = shelfSongs[safeIdx];
  const activeMatch = activeSong ? matchesByQuery[activeSong.searchQuery] : undefined;

  const goToSlide = (nextIdx: number) => {
    audioRef.current?.pause();
    setPlayingPreview(false);
    setEmbedMode(null);
    if (shelfSongs.length === 0) return;
    setSlideIndex((nextIdx + shelfSongs.length) % shelfSongs.length);
  };

  const togglePreview = () => {
    if (!audioRef.current) return;
    if (playingPreview) {
      audioRef.current.pause();
      setPlayingPreview(false);
    } else {
      void audioRef.current.play();
      setPlayingPreview(true);
    }
  };

  const handlePinUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSong) return;
    const sp = parseSpotifyEmbedUrl(customUrl);
    if (sp) {
      setPinnedSpotifyByTitle((p) => ({ ...p, [activeSong.title]: sp }));
      setEmbedMode('spotify');
      setCustomUrl('');
      return;
    }
    const yt = parseYouTubeEmbedUrl(customUrl);
    if (yt) {
      setPinnedYtByTitle((p) => ({ ...p, [activeSong.title]: yt }));
      setEmbedMode('youtube');
      setCustomUrl('');
    }
  };

  const handleComposeSong = async () => {
    synthRef.current?.stop();
    setIsSynthPlaying(false);
    setActiveChordIndex(-1);
    setComposeError(null);
    setComposing(true);

    try {
      const res = await fetch('/api/scripture/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          genre: selectedGenre,
        }),
      });
      if (!res.ok) {
        setComposeError('Could not compose the song right now. Choose a genre and tap compose again, or check System Status.');
        return;
      }
      const data = (await res.json()) as GeneratedWorshipSong;
      setComposedSong({
        ...data,
        chordProgression: normalizeChordProgression(data.chordProgression),
      });
    } catch {
      setComposeError('Connection interrupted while composing. Please check your internet connection and tap compose again.');
    } finally {
      setComposing(false);
    }
  };

  const toggleSynthPlayback = () => {
    if (!composedSong) return;
    setComposeError(null);
    if (isSynthPlaying) {
      synthRef.current?.stop();
      setIsSynthPlaying(false);
      setActiveChordIndex(-1);
      return;
    }

    if (!synthRef.current) {
      synthRef.current = new WorshipBackingTrack();
    }
    const normalizedChords = normalizeChordProgression(composedSong.chordProgression);
    const started = synthRef.current.start(
      composedSong.genre,
      composedSong.bpm,
      normalizedChords,
      (idx) => setActiveChordIndex(idx),
    );
    if (!started) {
      setIsSynthPlaying(false);
      setComposeError('Browser audio playback was paused or blocked. Click inside the page and tap Play Live Groove again.');
      return;
    }
    setIsSynthPlaying(true);
  };

  const handleCopyPrompt = async () => {
    if (!composedSong?.sunoPrompt) return;
    try {
      await navigator.clipboard.writeText(
        `${composedSong.sunoPrompt}\n\nLyrics:\n${composedSong.sections
          .map((s) => `[${s.label}]\n${s.lyrics}`)
          .join('\n\n')}`,
      );
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const pinnedSpotify = activeSong ? pinnedSpotifyByTitle[activeSong.title] : undefined;
  const pinnedYt = activeSong ? pinnedYtByTitle[activeSong.title] : undefined;
  const spotifySearch =
    activeMatch?.spotifySearchUrl ||
    `https://open.spotify.com/search/${encodeURIComponent(activeSong?.searchQuery || '')}`;
  const ytSearch =
    activeMatch?.youtubeSearchUrl ||
    `https://music.youtube.com/search?q=${encodeURIComponent(activeSong?.searchQuery || '')}`;
  const lyricsSearch = `https://www.google.com/search?q=${encodeURIComponent(
    `${activeSong?.title || ''} ${activeSong?.artistOrAuthor || ''} lyrics`,
  )}`;

  const handleDeckWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (shelfSongs.length <= 1) return;
    const dominantDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(dominantDelta) < 24) return;
    const now = Date.now();
    if (now - wheelCooldownRef.current < 260) return;
    wheelCooldownRef.current = now;
    goToSlide(dominantDelta > 0 ? safeIdx + 1 : safeIdx - 1);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || shelfSongs.length <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const diff = touchStartXRef.current - endX;
    touchStartXRef.current = null;
    if (Math.abs(diff) >= 40) {
      goToSlide(diff > 0 ? safeIdx + 1 : safeIdx - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Single-Tile Interactive Stacked Worship Slide Deck (0 to 14 passage-matched slides) */}
      {activeSong ? (
        <div className="relative pt-1">
          {shelfSongs.length > 2 && (
            <div
              aria-hidden="true"
              className="pointer-events-none mx-4 -mb-2 h-2.5 rounded-t-2xl border border-b-0 border-blue-500/20 bg-[#0D1024]/70"
            />
          )}
          {shelfSongs.length > 1 && (
            <div
              aria-hidden="true"
              className="pointer-events-none mx-2 -mb-2 h-2.5 rounded-t-2xl border border-b-0 border-purple-500/25 bg-[#10122A]/85"
            />
          )}
          <div
            onWheel={handleDeckWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative rounded-2xl border border-slate-800/90 bg-black/55 p-4 shadow-xl shadow-purple-950/30 space-y-3"
          >
            {/* Carousel Header & Spin Controls */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/70 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                  Worship Deck (Slide {safeIdx + 1} of {shelfSongs.length})
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    activeSong.category === 'Hymn'
                      ? 'bg-blue-500/15 text-blue-200 border border-blue-500/30'
                      : 'bg-purple-500/15 text-purple-200 border border-purple-500/30'
                  }`}
                >
                  {activeSong.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline text-[11px] text-slate-300">Scroll or swipe</span>
                <button
                  type="button"
                  onClick={() => goToSlide(safeIdx - 1)}
                  aria-label="Previous worship song"
                  className="rounded-lg border border-slate-700 bg-[#0D0F1D] p-1.5 text-slate-200 transition hover:border-purple-400/50 hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => goToSlide(safeIdx + 1)}
                  aria-label="Next worship song"
                  className="rounded-lg border border-slate-700 bg-[#0D0F1D] p-1.5 text-slate-200 transition hover:border-purple-400/50 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          {/* Horizontal Scrollable Pill Strip for Quick Spin/Jump */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {shelfSongs.map((s, idx) => (
              <button
                key={`${s.title}-${idx}`}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] transition ${
                  idx === safeIdx
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium'
                    : 'border border-slate-700 bg-[#0D0F1D] text-slate-300 hover:text-white'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Active Song Slide Content */}
          <div className="flex items-start gap-3">
            {activeMatch?.artworkUrl ? (
              <img
                src={activeMatch.artworkUrl}
                alt={activeSong.title}
                className="h-12 w-12 shrink-0 rounded-xl border border-slate-800 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#101223] text-purple-300">
                <Music2 className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-white">{activeSong.title}</h3>
              <p className="truncate text-xs text-slate-300">
                {activeMatch?.artistName ? `${activeMatch.artistName}, ` : ''}
                {activeSong.artistOrAuthor}
              </p>
            </div>
          </div>

          <p className="rounded-xl border border-purple-500/20 bg-purple-950/20 px-3 py-2 font-[var(--font-reading)] text-xs italic text-purple-100">
            “{activeSong.lyricHighlight}”
          </p>
          <p className="text-xs leading-relaxed text-slate-200">{activeSong.whyItFits}</p>

          {/* Inline Player & Platform Controls */}
          <div className="flex flex-wrap gap-1.5">
            {activeMatch?.previewUrl && (
              <>
                <audio
                  ref={audioRef}
                  src={activeMatch.previewUrl}
                  onEnded={() => setPlayingPreview(false)}
                  preload="none"
                />
                <button
                  type="button"
                  onClick={togglePreview}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    playingPreview
                      ? 'bg-purple-600 text-white'
                      : 'border border-blue-500/40 bg-blue-600/20 text-blue-100 hover:text-white'
                  }`}
                >
                  {playingPreview ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  {playingPreview ? 'Pause Preview' : '30 Second Preview'}
                </button>
              </>
            )}

            {activeMatch?.appleMusicEmbedUrl && (
              <button
                type="button"
                onClick={() => setEmbedMode(embedMode === 'apple' ? null : 'apple')}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                  embedMode === 'apple'
                    ? 'border-rose-400/60 bg-rose-500/20 text-rose-100'
                    : 'border-slate-800 bg-[#101223] text-rose-200 hover:border-rose-400/40'
                }`}
              >
                <Radio className="h-3 w-3" />
                Apple Music
              </button>
            )}

            {pinnedSpotify ? (
              <button
                type="button"
                onClick={() => setEmbedMode(embedMode === 'spotify' ? null : 'spotify')}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-1 text-[11px] text-emerald-100"
              >
                Spotify Player
              </button>
            ) : (
              <a
                href={spotifySearch}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#101223] px-2.5 py-1 text-[11px] text-emerald-300 hover:border-emerald-500/45 hover:text-white"
              >
                Spotify <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {pinnedYt ? (
              <button
                type="button"
                onClick={() => setEmbedMode(embedMode === 'youtube' ? null : 'youtube')}
                className="inline-flex items-center gap-1 rounded-lg border border-red-400/50 bg-red-500/20 px-2.5 py-1 text-[11px] text-red-100"
              >
                YouTube Player
              </button>
            ) : (
              <a
                href={ytSearch}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#101223] px-2.5 py-1 text-[11px] text-red-300 hover:border-red-500/45 hover:text-white"
              >
                YouTube <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <a
              href={lyricsSearch}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#101223] px-2.5 py-1 text-[11px] text-slate-300 hover:border-purple-400/40 hover:text-white"
            >
              Lyrics <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {embedMode === 'apple' && activeMatch?.appleMusicEmbedUrl && (
            <iframe
              title={`Apple Music — ${activeSong.title}`}
              allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
              height="175"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              src={activeMatch.appleMusicEmbedUrl}
              className="w-full overflow-hidden rounded-xl border border-slate-800 bg-black/50"
            />
          )}

          {embedMode === 'spotify' && pinnedSpotify && (
            <iframe
              title={`Spotify — ${activeSong.title}`}
              src={pinnedSpotify}
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="w-full overflow-hidden rounded-xl border border-slate-800 bg-black/50"
            />
          )}

          {embedMode === 'youtube' && pinnedYt && (
            <iframe
              title={`YouTube — ${activeSong.title}`}
              src={pinnedYt}
              height="205"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full overflow-hidden rounded-xl border border-slate-800 bg-black/50"
            />
          )}

          <form onSubmit={handlePinUrl} className="flex gap-1.5 pt-1 border-t border-slate-800/70">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Optional: paste a Spotify or YouTube link to embed right here..."
              className="flex-1 rounded-lg border border-slate-700 bg-[#07070D] px-2.5 py-1 text-[11px] text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customUrl.trim()}
              className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-2.5 py-1 text-[11px] text-purple-100 hover:text-white disabled:opacity-40"
            >
              Embed
            </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/90 bg-black/50 p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
              Worship Deck
            </span>
            <span className="rounded-full border border-slate-700 bg-[#0D0F1D] px-2.5 py-0.5 text-[10px] font-medium text-slate-300">
              None Found
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            No existing hymns or worship songs were matched directly to {reference}. Open the AI Song Maker below to compose an original worship track from this passage.
          </p>
          <button
            type="button"
            onClick={() => setStudioOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-600/20 px-3 py-1.5 text-[11px] font-medium text-purple-100 transition hover:bg-purple-600/35 hover:text-white"
          >
            <Sparkles className="h-3 w-3" />
            Compose Original Song
          </button>
        </div>
      )}

      {/* 2. Collapsible AI Worship Song Studio (5 Genres) */}
      <div className="rounded-xl border border-purple-500/25 bg-black/45 overflow-hidden">
        <button
          type="button"
          onClick={() => setStudioOpen((prev) => !prev)}
          aria-expanded={studioOpen}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/[0.02]"
        >
          <div className="flex items-center gap-2">
            <Disc3 className="h-4 w-4 text-purple-300" />
            <div>
              <div className="text-xs font-semibold text-white">Create Original Song for {reference}</div>
              <div className="text-[11px] text-slate-300">
                Amapiano, Afro Gospel, Hymns, Lo Fi, and R&amp;B
              </div>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-purple-300 transition-transform ${studioOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {studioOpen && (
          <div className="border-t border-slate-800/70 p-4 space-y-3 bg-gradient-to-br from-blue-950/15 via-transparent to-purple-950/15">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GENRE_TILES.map((g) => {
                const active = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGenre(g.id)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      active
                        ? 'border-purple-400 bg-gradient-to-r from-blue-600/25 to-purple-600/25 text-white'
                        : 'border-slate-800 bg-black/45 text-slate-300 hover:border-purple-500/40 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-medium">{g.label}</div>
                    <div className="text-[10px] text-slate-400">{g.vibe}</div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleComposeSong}
              disabled={composing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-medium text-white shadow-md shadow-purple-950/50 transition hover:opacity-95 disabled:opacity-50"
            >
              {composing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Composing {selectedGenre.toUpperCase()} Song...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Compose Lyrics &amp; Play Live Groove
                </>
              )}
            </button>

            {composeError && (
              <p role="alert" className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
                {composeError}
              </p>
            )}

            {composedSong && (
              <div className="rounded-xl border border-slate-800/90 bg-black/60 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{composedSong.title}</h4>
                    <p className="text-xs text-slate-300">
                      {composedSong.key}, {composedSong.bpm} BPM, {composedSong.meter}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSynthPlayback}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      isSynthPlaying
                        ? 'bg-purple-500 text-white'
                        : 'border border-blue-500/45 bg-blue-600/20 text-blue-100 hover:bg-blue-600/35 hover:text-white'
                    }`}
                  >
                    {isSynthPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {isSynthPlaying ? 'Stop Groove' : 'Play Live Groove'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-slate-300 mr-1">Chords:</span>
                  {normalizeChordProgression(composedSong.chordProgression).map((chord, idx) => (
                    <span
                      key={`${chord}-${idx}`}
                      className={`rounded-md px-2 py-0.5 text-xs font-mono transition ${
                        activeChordIndex === idx && isSynthPlaying
                          ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.7)] scale-105'
                          : 'border border-slate-700 bg-[#101223] text-blue-200'
                      }`}
                    >
                      {chord}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  {composedSong.sections.map((sec, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                        {sec.label}
                      </div>
                      <p className="whitespace-pre-line font-[var(--font-reading)] text-sm leading-relaxed text-slate-100">
                        {sec.lyrics}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800/80 pt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300">
                    {composedSong.providerLabel}. Copy for full AI singing on Suno or Udio:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-200 transition hover:border-purple-400/50 hover:text-white"
                  >
                    {copiedPrompt ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedPrompt ? 'Copied' : 'Copy for AI Singers'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
