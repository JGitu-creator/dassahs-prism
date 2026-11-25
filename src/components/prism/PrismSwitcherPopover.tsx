'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  ChevronDown,
  Flame,
  Gamepad2,
  Sparkles,
} from 'lucide-react';

export type PrismWorkspaceId = 'engine' | 'focus' | 'play' | 'word' | 'forge';

const WORKSPACE_ITEMS: ReadonlyArray<{
  id: PrismWorkspaceId;
  name: string;
  subtitle: string;
  href: string;
  dotColor: string;
  textColor: string;
  icon: typeof Brain;
}> = [
  {
    id: 'engine',
    name: "Dassah's Prism Engine",
    subtitle: 'Main Hub & All Workspaces',
    href: '/engine',
    dotColor: 'bg-cyan-400',
    textColor: 'text-cyan-400',
    icon: Sparkles,
  },
  {
    id: 'focus',
    name: 'Prism Focus',
    subtitle: 'Documents, PDFs & Articles',
    href: '/',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-400',
    icon: Brain,
  },
  {
    id: 'play',
    name: 'Prism Play',
    subtitle: 'Coursework & Study Quests',
    href: '/canvas',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    icon: Gamepad2,
  },
  {
    id: 'forge',
    name: 'Prism Forge',
    subtitle: 'Tech, Formulas & Code Calm',
    href: '/forge',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-400',
    icon: Flame,
  },
  {
    id: 'word',
    name: 'Prism Word',
    subtitle: 'Private Scripture Sanctuary',
    href: '/scripture',
    dotColor: 'bg-purple-500',
    textColor: 'text-purple-400',
    icon: BookOpen,
  },
];

export function PrismSwitcherPopover({
  current,
  darkMode = true,
  compact = false,
  badgeNode,
}: {
  current: PrismWorkspaceId;
  darkMode?: boolean;
  compact?: boolean;
  badgeNode?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const menuSurface = darkMode
    ? 'bg-[#0b1224]/95 border-white/15 text-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.75)]'
    : 'bg-[#f3ede0]/98 border-[#cfc3ad] text-[#1e293b] shadow-[0_20px_55px_rgba(30,41,59,0.14)]';

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Switch Prism workspace or return to Dassah's Prism Engine"
        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
          compact
            ? 'text-[var(--fg)] hover:text-blue-400'
            : darkMode
              ? 'rounded-2xl border border-white/12 bg-white/[0.06] px-3.5 py-2 text-slate-100 hover:border-amber-400/50'
              : 'rounded-2xl border border-[#cfc3ad] bg-[#e5dccb] px-3.5 py-2 text-[#1e293b] hover:border-amber-600/50'
        }`}
      >
        <Sparkles size={13} className="text-amber-400 shrink-0" />
        <span className={compact ? 'hidden md:inline' : ''}>Prism Engine</span>
        {badgeNode}
        <ChevronDown
          size={12}
          className={`opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className={`absolute left-0 top-full mt-2.5 z-[600] w-64 rounded-3xl border p-2 backdrop-blur-2xl ${menuSurface}`}
          >
            <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] opacity-60">
              Jump to Workspace
            </p>
            <div className="space-y-1">
              {WORKSPACE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isCurrent = item.id === current;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between gap-2.5 rounded-2xl px-3 py-2.5 transition-all ${
                      isCurrent
                        ? darkMode
                          ? 'bg-white/10 border border-white/15'
                          : 'bg-[#e4dbc8] border border-[#c5b79e]'
                        : darkMode
                          ? 'hover:bg-white/[0.06]'
                          : 'hover:bg-[#eae2d3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                          darkMode ? 'bg-white/[0.06]' : 'bg-[#dfd5c3]'
                        } ${item.textColor}`}
                      >
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-black leading-tight truncate">{item.name}</p>
                        <p className="text-[10px] opacity-65 truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className={`h-2 w-2 rounded-full shrink-0 ${item.dotColor}`} title="Current workspace" />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
