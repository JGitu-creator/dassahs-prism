'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class PrismWordErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected interruption occurred in Prism Word.',
    };
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleClearLocalCacheAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        const keysToClear: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('prism_word_')) {
            keysToClear.push(k);
          }
        }
        for (const k of keysToClear) {
          localStorage.removeItem(k);
        }
      } catch {
        // Ignore storage access errors
      }
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#07070D] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-3xl border border-purple-500/40 bg-[#0B0C17] p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-950/30 text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Prism Word Paused to Protect Your Study</h1>
              <p className="text-xs text-slate-300">
                Something interrupted the screen, so we caught it safely before anything froze.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-black/50 p-3.5 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-purple-200">What happened</div>
            <p className="break-words text-slate-300">{this.state.errorMessage}</p>
          </div>

          <div className="rounded-xl border border-blue-500/25 bg-blue-950/20 p-3.5 text-xs text-slate-200 space-y-1.5">
            <div className="font-semibold text-blue-200">How to recover</div>
            <p>1. Try Reload Sanctuary first. Most temporary glitches clear right away.</p>
            <p>2. If it happens again, choose Reset Local Cache to clear any corrupt saved browser state.</p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-medium text-white hover:opacity-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reload Sanctuary
            </button>
            <button
              type="button"
              onClick={this.handleClearLocalCacheAndReload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/25 px-4 py-2.5 text-xs font-medium text-amber-100 hover:bg-amber-950/45"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Local Cache
            </button>
            <Link
              href="/engine"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-black/40 px-4 py-2.5 text-xs font-medium text-slate-200 hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              Back to Prism Engine
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
