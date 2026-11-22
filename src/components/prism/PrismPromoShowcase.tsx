'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

/**
 * PrismPromoShowcase
 *
 * Plays the 75-second Prism Engine promo (1920x1080, 30fps).
 * Expected files (drop into /public/media/ — nothing is fetched until the video element loads):
 *   - /media/dassahs-prism-engine-promo-75s-muted.mp4  (silent autoplay preview, same timeline)
 *   - /media/dassahs-prism-engine-promo-75s.mp4        (full cut: narration + score)
 *   - /media/dassahs-prism-engine-promo-75s.vtt        (optional captions)
 *   - /media/dassahs-prism-engine-promo-poster.webp    (optional poster)
 * If the files are not present yet, a graceful chapter-only storyboard is shown instead.
 */

export const PROMO_CHAPTERS = [
  { t: 0, label: 'Signal', copy: 'Too much to process? Find the signal.' },
  { t: 5, label: 'Engine', copy: 'One engine. Two paths.' },
  { t: 12, label: 'Your material', copy: 'Bring your material. Set a clear objective.' },
  { t: 21, label: 'Refraction', copy: 'Summary, metaphor, next action (illustrative sample).' },
  { t: 31, label: 'Prism Play', copy: 'Turn dread into play. One calm card, then the next.' },
  { t: 43, label: 'Lens', copy: 'Understand a term. Small wins, keep going.' },
  { t: 53, label: 'Identity', copy: 'Tune the flow to you: sound, reading, pace.' },
  { t: 61, label: 'Fallback', copy: 'More than one path. Browser-private notes, 4-tier fallback.' },
  { t: 68, label: 'Explore', copy: 'Dassah’s Prism. Turn overwhelming noise into clear focus.' },
] as const;

const FULL_SRC = '/media/dassahs-prism-engine-promo-75s.mp4';
const MUTED_SRC = '/media/dassahs-prism-engine-promo-75s-muted.mp4';
const CAPTIONS_SRC = '/media/dassahs-prism-engine-promo-75s.vtt';
const POSTER_SRC = '/media/dassahs-prism-engine-promo-poster.webp';

export function PrismPromoShowcase({ darkMode = true }: { darkMode?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fullCut, setFullCut] = useState(false);
  const [playing, setPlaying] = useState(false);
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

  const frame = darkMode
    ? 'border-white/12 bg-[#0b1224]/80 shadow-[0_30px_90px_rgba(0,0,0,0.55)]'
    : 'border-[#d6ccb9] bg-[#faf7f0]/90 shadow-[0_24px_70px_rgba(23,33,51,0.12)]';
  const heading = darkMode ? 'text-white' : 'text-[#172133]';
  const muted = darkMode ? 'text-slate-300' : 'text-[#394658]';
  const pillIdle = darkMode
    ? 'border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/[0.12]'
    : 'border-[#d6ccb9] bg-[#ece5d8] text-[#243040] hover:bg-[#e2d9c8]';
  const pillActive = darkMode
    ? 'border-cyan-300 bg-cyan-400/20 text-cyan-100'
    : 'border-blue-700 bg-blue-600 text-white';

  return (
    <section aria-label="Prism Engine 75-second promo" className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${heading}`}>See the Prism Engine in 75 seconds</h2>
        <p className={`mx-auto max-w-2xl text-sm sm:text-base font-medium ${muted}`}>
          From overload to one clear next step: Dassah’s Prism for understanding, Prism Play for small wins.
        </p>
      </div>

      <div className={`overflow-hidden rounded-3xl border ${frame}`}>
        {unavailable ? (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
            <p className={`text-lg font-black ${heading}`}>The promo cut is being finalized</p>
            <p className={`max-w-md text-sm font-medium ${muted}`}>
              Jump through the storyboard below. The video will appear here as soon as it is published.
            </p>
          </div>
        ) : (
          <div className="relative aspect-video bg-black">
            <video
              key={fullCut ? 'full' : 'preview'}
              ref={videoRef}
              src={fullCut ? FULL_SRC : MUTED_SRC}
              poster={POSTER_SRC}
              className="h-full w-full object-cover"
              playsInline
              muted={!fullCut}
              loop={!fullCut}
              autoPlay={!reducedMotion}
              controls={fullCut}
              preload="metadata"
              aria-label="Dassah’s Prism Engine promo video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setUnavailable(true)}
            >
              {fullCut && <track kind="captions" src={CAPTIONS_SRC} srcLang="en" label="English" default />}
            </video>
            {!fullCut && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? 'Pause preview' : 'Play preview'}
                className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-black/85"
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}
          </div>
        )}

        <div className="space-y-4 p-4 sm:p-5">
          <p className={`text-sm font-semibold ${muted}`} aria-live="polite">
            <span className="font-black">{PROMO_CHAPTERS[activeIndex].label}:</span> {PROMO_CHAPTERS[activeIndex].copy}
          </p>

          <div role="group" aria-label="Jump to a chapter" className="flex flex-wrap gap-2">
            {PROMO_CHAPTERS.map((chapter, i) => (
              <button
                key={chapter.t}
                type="button"
                onClick={() => seekTo(i)}
                aria-pressed={activeIndex === i}
                disabled={unavailable}
                className={`rounded-full border px-3 py-1.5 text-xs font-black tracking-wide transition-colors disabled:opacity-60 ${activeIndex === i ? pillActive : pillIdle}`}
              >
                {chapter.t}s · {chapter.label}
              </button>
            ))}
          </div>

          {!unavailable && (
            <button
              type="button"
              onClick={fullCut ? backToPreview : watchFullCut}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-blue-500"
            >
              {fullCut ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {fullCut ? 'Back to silent preview' : 'Watch full cut with narration & score'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default PrismPromoShowcase;
