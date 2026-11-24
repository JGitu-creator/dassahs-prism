'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PrismWordIcon } from './PrismWordIcon';

interface PrismWordEntranceProps {
  visible: boolean;
  onComplete: () => void;
}

const ORBIT_NODES = [
  { radius: 86, duration: 9, color: 'bg-blue-400 shadow-[0_0_14px_#60a5fa]', delay: 0 },
  { radius: 132, duration: 13, color: 'bg-purple-400 shadow-[0_0_16px_#a78bfa]', delay: 0.4 },
  { radius: 178, duration: 17, color: 'bg-cyan-300 shadow-[0_0_14px_#67e8f9]', delay: 0.8 },
];

/**
 * Exclusive kinetic orbital sanctuary opening for Prism Word,
 * inspired by Google Antigravity, GitHub, and Mistral AI.
 */
export function PrismWordEntrance({ visible, onComplete }: PrismWordEntranceProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      onComplete();
      return;
    }
    if (!visible) return;
    const timer = setTimeout(() => {
      onComplete();
    }, 2100);
    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  if (reducedMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden bg-[#06060C] text-white"
        >
          {/* Deep kinetic radial light */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.25, 0.55, 0.35], scale: [0.85, 1.15, 1] }}
            transition={{ duration: 2.1, ease: 'easeOut' }}
            className="pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.28)_0%,rgba(59,130,246,0.16)_45%,transparent_72%)] blur-2xl"
          />

          {/* Concentric Kinetic Orbital Rings */}
          <div className="relative flex h-80 w-80 items-center justify-center">
            {ORBIT_NODES.map((orbit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.72, rotate: idx * 45 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: idx % 2 === 0 ? 360 + idx * 45 : -360 + idx * 45,
                }}
                transition={{
                  opacity: { duration: 0.5, delay: idx * 0.1 },
                  scale: { duration: 0.7, ease: 'easeOut' },
                  rotate: { duration: orbit.duration, repeat: Infinity, ease: 'linear' },
                }}
                style={{ width: orbit.radius * 2, height: orbit.radius * 2 }}
                className="absolute rounded-full border border-purple-400/20"
              >
                <span
                  className={`absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full ${orbit.color}`}
                />
              </motion.div>
            ))}

            {/* Central Refracting Prism Diamond */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
              animate={{ scale: [0.7, 1.08, 1], opacity: 1, rotate: [45, 225, 45] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-300/40 bg-gradient-to-br from-blue-600/80 via-indigo-600/80 to-purple-600/80 shadow-[0_0_45px_rgba(139,92,246,0.6)] backdrop-blur-xl"
            >
              <div className="-rotate-45">
                <PrismWordIcon className="h-9 w-9" />
              </div>
            </motion.div>
          </div>

          {/* Minimalist Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-2 text-center space-y-1.5"
          >
            <h2 className="text-2xl font-semibold tracking-[0.18em] uppercase bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent">
              Prism Word
            </h2>
            <p className="text-xs tracking-[0.2em] uppercase text-slate-300">
              Quiet Focus, Deep Scripture, and Worship
            </p>
          </motion.div>

          <button
            type="button"
            onClick={onComplete}
            className="mt-8 rounded-full border border-slate-700 bg-black/60 px-4 py-1.5 text-xs font-medium text-slate-200 transition hover:border-purple-400/60 hover:text-white"
          >
            Enter Sanctuary
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
