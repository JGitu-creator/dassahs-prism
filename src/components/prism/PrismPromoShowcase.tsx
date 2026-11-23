'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Film, Music, Pause, Sparkles } from 'lucide-react';

/**
 * Clean Cinema Slot + 15% Low-Background Ambient Joyful Instrumental Bar.
 * Ready for the upcoming custom Dassah's Prism Engine showcase video while keeping
 * the 15% soft background instrumental live right now.
 */

const INSTRUMENTAL_SRC = '/media/Prism-joyful-instrumental.mp3';
const AMBIENT_DEFAULT_VOLUME = 0.15;

export function PrismPromoShowcase({ darkMode = true }: { darkMode?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(AMBIENT_DEFAULT_VOLUME);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  const toggleAmbientInstrumental = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = ambientVolume;
    if (audio.paused) {
      void audio.play().then(() => setAmbientPlaying(true)).catch(() => setAmbientPlaying(false));
    } else {
      audio.pause();
      setAmbientPlaying(false);
    }
  };

  const heading = darkMode ? 'text-white' : 'text-[#172133]';
  const muted = darkMode ? 'text-slate-300' : 'text-[#394658]';

  return (
    <section id="prism-promo-showcase" aria-label="Prism Engine ambient instrumental and cinema slot" className="space-y-4">
      {/* Ambient Low-Background Joyful Instrumental Bar (15% Default Volume, User-Controlled) */}
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border px-5 py-4 backdrop-blur-2xl transition-all ${
          darkMode
            ? 'border-cyan-400/25 bg-[#091227]/85 text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]'
            : 'border-[#d6ccb9] bg-[#faf7f0]/95 text-[#172133] shadow-md'
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
        <div className="flex flex-wrap items-center gap-3.5">
          <button
            type="button"
            onClick={toggleAmbientInstrumental}
            aria-pressed={ambientPlaying}
            className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs sm:text-sm font-black tracking-wide transition-all cursor-pointer ${
              ambientPlaying
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 text-white shadow-[0_0_24px_rgba(34,211,238,0.45)]'
                : darkMode
                  ? 'bg-white/10 text-white hover:bg-white/15 border border-white/15'
                  : 'bg-[#172133] text-[#faf7f0] hover:bg-[#24324c]'
            }`}
          >
            {ambientPlaying ? <Pause size={15} /> : <Music size={15} />}
            {ambientPlaying ? `Pause Ambient Score (${Math.round(ambientVolume * 100)}%)` : 'Play Soft Background Instrumental'}
          </button>
          <div className="text-left">
            <p className={`text-xs sm:text-sm font-black flex flex-wrap items-center gap-2 ${heading}`}>
              <span>The Prism Engine · Ambient Studio Score</span>
              <span className="rounded-full bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                Low Background · {Math.round(ambientVolume * 100)}%
              </span>
            </p>
            <p className={`text-[11px] sm:text-xs font-medium ${muted}`}>
              Gentle wordless instrumental tuned at 15% while you explore Prism Focus &amp; Prism Play.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
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
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <Film size={11} className="text-cyan-400" /> Director&apos;s Cut Cinema Slot Ready
          </span>
        </div>
      </div>
    </section>
  );
}

export default PrismPromoShowcase;
