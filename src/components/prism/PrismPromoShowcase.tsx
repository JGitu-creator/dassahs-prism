'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Music, Pause, Play, Sparkles, Volume2, VolumeX } from 'lucide-react';

/**
 * 75-second Prism Engine promo showcase + 15% low-volume ambient instrumental bar.
 *
 * Uses the restored media assets in /public/media/:
 *   - /media/Dassahs-Prism-product-promo-draft.mp4      (75s product promo video)
 *   - /media/Prism-joyful-instrumental.mp3              (92s wordless joyful instrumental)
 *   - /brand/03-prism-ribbon.png                        (Prism Ribbon poster)
 */

export const PROMO_CHAPTERS = [
  { t: 0, label: 'Signal', copy: 'Too much to process? Find the signal.' },
  { t: 5, label: 'Engine', copy: 'One engine. Two paths.' },
  { t: 12, label: 'Your material', copy: 'Bring your material. Set a clear objective.' },
  { t: 21, label: 'Refraction', copy: 'Summary, metaphor, next action (illustrative sample).' },
  { t: 31, label: 'Prism Play', copy: 'Turn dread into play. One calm card, then the next.' },
  { t: 43, label: 'Lens', copy: 'Understand a term. Small wins, keep going.' },
  { t: 53, label: 'Identity', copy: 'Tune the flow to you: sound, reading, pace.' },
  { t: 61, label: 'Fallback', copy: 'More than one path. Browser-private notes, self-healing fallback.' },
  { t: 68, label: 'Explore', copy: 'Dassah’s Prism. Turn overwhelming noise into clear focus.' },
] as const;

const PROMO_VIDEO_SRC = '/media/Dassahs-Prism-product-promo-draft.mp4';
const INSTRUMENTAL_SRC = '/media/Prism-joyful-instrumental.mp3';
const POSTER_SRC = '/brand/03-prism-ribbon.png';
const AMBIENT_DEFAULT_VOLUME = 0.15;

export function PrismPromoShowcase({ darkMode = true }: { darkMode?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fullCut, setFullCut] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(AMBIENT_DEFAULT_VOLUME);
  const [activeIndex, setActiveIndex] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pendingSeek = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  const indexForTime = (time: number) => {
    let idx = 0;
    PROMO_CHAPTERS.forEach((chapter, i) => {
      if (time >= chapter.t) idx = i;
    });
    return idx;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) setActiveIndex(indexForTime(video.currentTime));
  };

  const seekTo = useCallback((index: number) => {
    setActiveIndex(index);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = PROMO_CHAPTERS[index].t;
    void video.play().catch(() => undefined);
  }, []);

  const watchFullCut = () => {
    const video = videoRef.current;
    pendingSeek.current = video ? video.currentTime : 0;
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setAmbientPlaying(false);
    }
    setFullCut(true);
  };

  const backToPreview = () => {
    const video = videoRef.current;
    pendingSeek.current = video ? video.currentTime : 0;
    setFullCut(false);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (pendingSeek.current !== null) {
      video.currentTime = Math.min(pendingSeek.current, video.duration || pendingSeek.current);
      pendingSeek.current = null;
      void video.play().catch(() => undefined);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  };

  const toggleAmbientInstrumental = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = ambientVolume;
    if (audio.paused) {
      if (fullCut) {
        setFullCut(false);
      }
      void audio.play().then(() => setAmbientPlaying(true)).catch(() => setAmbientPlaying(false));
    } else {
      audio.pause();
      setAmbientPlaying(false);
    }
  };

  const frame = darkMode
    ? 'border-white/15 bg-[#0b1224]/90 shadow-[0_30px_90px_rgba(0,0,0,0.65)]'
    : 'border-[#d6ccb9] bg-[#faf7f0] shadow-[0_24px_70px_rgba(23,33,51,0.12)]';
  const heading = darkMode ? 'text-white' : 'text-[#172133]';
  const muted = darkMode ? 'text-slate-300' : 'text-[#394658]';
  const pillIdle = darkMode
    ? 'border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/[0.12]'
    : 'border-[#d6ccb9] bg-[#ece5d8] text-[#243040] hover:bg-[#e2d9c8]';
  const pillActive = darkMode
    ? 'border-cyan-300 bg-cyan-400/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
    : 'border-blue-700 bg-blue-600 text-white';

  return (
    <section id="prism-promo-showcase" aria-label="Prism Engine 75-second promo and ambient instrumental" className="space-y-5">
      {/* Ambient Low-Background Joyful Instrumental Bar (15% Default Volume, User-Controlled) */}
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border px-5 py-3.5 transition-all ${
          darkMode
            ? 'border-amber-400/25 bg-gradient-to-r from-[#111a33]/95 via-[#131d38]/95 to-[#171538]/95 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)]'
            : 'border-[#d6ccb9] bg-[#faf7f0] text-[#172133] shadow-md'
        }`}
      >
        <audio
          ref={audioRef}
          src={INSTRUMENTAL_SRC}
          loop
          preload="none"
          onPlay={() => setAmbientPlaying(true)}
          onPause={() => setAmbientPlaying(false)}
        />
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={toggleAmbientInstrumental}
            aria-pressed={ambientPlaying}
            className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs sm:text-sm font-black tracking-wide transition-all ${
              ambientPlaying
                ? 'bg-gradient-to-r from-amber-500 via-blue-600 to-violet-600 text-white shadow-[0_0_24px_rgba(59,130,246,0.45)]'
                : darkMode
                  ? 'bg-white/10 text-white hover:bg-white/15 border border-white/15'
                  : 'bg-[#172133] text-[#faf7f0] hover:bg-[#24324c]'
            }`}
          >
            {ambientPlaying ? <Pause size={15} /> : <Music size={15} />}
            {ambientPlaying ? 'Pause Ambient Instrumental (15%)' : 'Play Soft Background Instrumental'}
          </button>
          <div className="text-left">
            <p className={`text-xs sm:text-sm font-black flex items-center gap-1.5 ${heading}`}>
              <span>Prism Joyful Instrumental</span>
              <span className="rounded-full bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                Low Background · {Math.round(ambientVolume * 100)}%
              </span>
            </p>
            <p className={`text-[11px] sm:text-xs font-medium ${muted}`}>
              Wordless ambient score tuned to a gentle 15% background level while you explore.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label htmlFor="prism-ambient-volume" className={`text-[11px] font-bold uppercase tracking-wider ${muted}`}>
            Level
          </label>
          <input
            id="prism-ambient-volume"
            type="range"
            min={0.05}
            max={0.5}
            step={0.05}
            value={ambientVolume}
            onChange={(e) => setAmbientVolume(Number(e.target.value))}
            aria-label="Ambient instrumental volume"
            className="h-1.5 w-24 cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* 75-Second Product Showcase Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-300">
            <Sparkles size={12} />
            <span>75-Second Product Preview · Authentic Captures</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${heading}`}>
            See Dassah’s Prism Engine in 75 seconds
          </h2>
        </div>
        <p className={`max-w-md text-xs sm:text-sm font-medium ${muted}`}>
          From overload to one clear next step: Dassah’s Prism for understanding, Prism Play for manageable study cards.
        </p>
      </div>

      <div className={`overflow-hidden rounded-3xl border ${frame}`}>
        {unavailable ? (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
            <p className={`text-lg font-black ${heading}`}>Interactive 75-Second Storyboard</p>
            <p className={`max-w-md text-sm font-medium ${muted}`}>
              Explore the 9 product chapters below.
            </p>
          </div>
        ) : (
          <div className="relative aspect-video bg-[#070b16]">
            <video
              key={fullCut ? 'full' : 'preview'}
              ref={videoRef}
              src={PROMO_VIDEO_SRC}
              poster={POSTER_SRC}
              className="h-full w-full object-cover"
              playsInline
              muted={!fullCut}
              loop={!fullCut}
              autoPlay={!reducedMotion}
              controls={fullCut}
              preload="metadata"
              aria-label="Dassah’s Prism Engine 75-second product preview video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setUnavailable(true)}
            />
            {!fullCut && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause preview' : 'Play preview'}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-black/75 px-3.5 py-2 text-xs font-black text-white backdrop-blur-md border border-white/15 hover:bg-black/90"
                >
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                  <span>{playing ? 'Pause Preview' : 'Play 75s Preview'}</span>
                </button>
                <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur-md border border-white/10">
                  Product preview · Muted autoplay
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className={`text-sm font-semibold ${muted}`} aria-live="polite">
              <span className={`font-black ${heading}`}>{PROMO_CHAPTERS[activeIndex].label}:</span>{' '}
              {PROMO_CHAPTERS[activeIndex].copy}
            </p>
            {!unavailable && (
              <button
                type="button"
                onClick={fullCut ? backToPreview : watchFullCut}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-lg transition hover:from-blue-500 hover:to-violet-500"
              >
                {fullCut ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {fullCut ? 'Back to silent loop' : 'Watch with narration & score'}
              </button>
            )}
          </div>

          <div role="group" aria-label="Jump to a chapter" className="flex flex-wrap gap-2">
            {PROMO_CHAPTERS.map((chapter, i) => (
              <button
                key={chapter.t}
                type="button"
                onClick={() => seekTo(i)}
                aria-pressed={activeIndex === i}
                disabled={unavailable}
                className={`rounded-full border px-3 py-1.5 text-xs font-black tracking-wide transition-colors disabled:opacity-60 ${
                  activeIndex === i ? pillActive : pillIdle
                }`}
              >
                {chapter.t}s · {chapter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrismPromoShowcase;
