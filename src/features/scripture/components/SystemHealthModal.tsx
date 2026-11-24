'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';

interface HealthPayload {
  overall: 'healthy' | 'degraded';
  checkedAt: string;
  bibleProviders: Array<{
    id: string;
    label: string;
    configured: boolean;
    status: 'ready' | 'waiting' | 'missing';
    message: string;
    nextStep: string;
  }>;
  aiCascade: {
    studyAndSongsOrder: Array<{
      name: string;
      models: string;
      configured: boolean;
    }>;
    askDjDefault: {
      name: string;
      model: string;
      statefulMemory: boolean;
      configured: boolean;
    };
  };
  upkeepAlerts: Array<{
    level: 'waiting' | 'advisory' | 'ready';
    title: string;
    detail: string;
    action: string;
  }>;
}

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemHealthModal({ isOpen, onClose }: SystemHealthModalProps) {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scripture/health?probe=1');
      if (!res.ok) {
        throw new Error(`Health check returned status ${res.status}`);
      }
      const json = (await res.json()) as HealthPayload;
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. Check that the server is running and try again.`
          : 'Could not reach the diagnostics endpoint.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void runCheck();
    }
  }, [isOpen]);

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
      aria-label="System Status and Recovery"
    >
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-purple-500/35 bg-[#090A14] text-slate-100 shadow-2xl shadow-purple-950/60">
        <header className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 text-blue-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white">
                System Status and Upkeep Guide
              </h2>
              <p className="text-xs text-slate-300">
                Live Bible providers, AI fallback order, and clear next steps if anything pauses.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runCheck}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#101223] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-purple-400/50 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Recheck
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close System Status"
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-2 text-slate-300 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {loading && !data && (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              Checking live Bible and AI services...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5 text-rose-100 space-y-1">
              <div className="font-semibold">Diagnostics could not run</div>
              <p>{error}</p>
            </div>
          )}

          {data && (
            <>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-black/45 px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={`h-4 w-4 ${
                      data.overall === 'healthy' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  />
                  <span className="font-semibold text-white">
                    {data.overall === 'healthy'
                      ? 'Core Study, Worship, and Bible Services Healthy'
                      : 'Running in Degraded Reserve Mode'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-300">
                  Checked {new Date(data.checkedAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                  Bible Translation Providers
                </h3>
                <div className="space-y-2">
                  {data.bibleProviders.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-slate-800/90 bg-black/45 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">{p.label}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            p.status === 'ready'
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/35'
                              : p.status === 'waiting'
                                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/35'
                                : 'bg-rose-500/20 text-rose-200 border border-rose-500/35'
                          }`}
                        >
                          {p.status === 'ready' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : p.status === 'waiting' ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {p.status === 'ready'
                            ? 'Ready'
                            : p.status === 'waiting'
                              ? 'Waiting'
                              : 'Key Missing'}
                        </span>
                      </div>
                      <p className="text-slate-300">{p.message}</p>
                      <p className="text-blue-200/90">
                        <strong className="text-slate-200">Next step:</strong> {p.nextStep}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                  AI Execution Cascade
                </h3>
                <div className="rounded-xl border border-slate-800/90 bg-black/45 p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <span className="text-slate-200 font-medium">
                      Ask DJ Companion Default: {data.aiCascade.askDjDefault.name} ({data.aiCascade.askDjDefault.model})
                    </span>
                    <span className="text-[11px] text-emerald-300">
                      {data.aiCascade.askDjDefault.configured ? 'Configured' : 'Key Missing'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {data.aiCascade.studyAndSongsOrder.map((tier, idx) => (
                      <div key={tier.name} className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-medium text-white">
                            {idx + 1}. {tier.name}
                          </span>
                          <span className="ml-2 text-slate-300">{tier.models}</span>
                        </div>
                        <span
                          className={
                            tier.configured ? 'text-emerald-300 font-medium' : 'text-amber-300'
                          }
                        >
                          {tier.configured ? 'Ready' : 'Not Configured'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {data.upkeepAlerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                    Upkeep and Waiting Notices
                  </h3>
                  <div className="space-y-2">
                    {data.upkeepAlerts.map((alert, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-1"
                      >
                        <div className="font-semibold text-amber-200">{alert.title}</div>
                        <p className="text-slate-200">{alert.detail}</p>
                        <p className="text-blue-200">
                          <strong className="text-white">Action:</strong> {alert.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
