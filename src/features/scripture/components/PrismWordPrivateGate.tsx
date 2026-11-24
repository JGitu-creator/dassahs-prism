'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PrismWordClient } from './PrismWordClient';
import { PrismWordIcon } from './PrismWordIcon';

interface AuthState {
  status: 'checking' | 'authorized' | 'locked' | 'forbidden';
  email?: string;
  rejectedEmail?: string;
  supabaseConfigured: boolean;
  reason?: string;
}

export function PrismWordPrivateGate() {
  const [auth, setAuth] = useState<AuthState>({
    status: 'checking',
    supabaseConfigured: false,
  });
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkServerAuth = useCallback(async (accessToken?: string) => {
    try {
      const res = await fetch('/api/scripture/auth', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (!res.ok) {
        setAuth({
          status: 'locked',
          supabaseConfigured: false,
          reason: 'Please sign in with an authorised family account.',
        });
        return;
      }
      const data = (await res.json()) as {
        authorized: boolean;
        email?: string;
        rejectedEmail?: string;
        supabaseConfigured?: boolean;
        reason?: string;
      };

      if (data.authorized && data.email) {
        setAuth({
          status: 'authorized',
          email: data.email,
          supabaseConfigured: Boolean(data.supabaseConfigured),
        });
      } else if (data.rejectedEmail) {
        setAuth({
          status: 'forbidden',
          rejectedEmail: data.rejectedEmail,
          supabaseConfigured: Boolean(data.supabaseConfigured),
          reason: data.reason || 'This private sanctuary is restricted to authorised family accounts only.',
        });
      } else {
        setAuth({
          status: 'locked',
          supabaseConfigured: Boolean(data.supabaseConfigured),
          reason: data.reason,
        });
      }
    } catch {
      setAuth((prev) => ({
        ...prev,
        status: 'locked',
        reason: 'Could not verify sanctuary access. Please refresh or try again.',
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active) {
          await checkServerAuth(data.session?.access_token);
        }
      } catch {
        if (active) {
          await checkServerAuth();
        }
      }
    };
    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void checkServerAuth(session?.access_token);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [checkServerAuth]);

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/scripture/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = (await res.json()) as { authorized?: boolean; email?: string; error?: string };
      if (!res.ok || !data.authorized) {
        setErrorMsg(data.error || 'Access denied. Only authorised family email addresses can enter.');
        return;
      }
      setEmailInput('');
      setAuth((prev) => ({
        status: 'authorized',
        email: data.email,
        supabaseConfigured: prev.supabaseConfigured,
      }));
    } catch {
      setErrorMsg('Connection interrupted while checking access. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/scripture`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) setErrorMsg(error.message);
    } catch {
      setErrorMsg('Unable to start Google sign in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/scripture/auth', { method: 'DELETE' });
      await supabase.auth.signOut().catch(() => {});
      setEmailInput('');
      setErrorMsg(null);
      setAuth((prev) => ({
        status: 'locked',
        supabaseConfigured: prev.supabaseConfigured,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (auth.status === 'authorized' && auth.email) {
    return <PrismWordClient userEmail={auth.email} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen [color-scheme:dark] bg-[#07070D] text-slate-100 flex items-center justify-center p-5 font-[var(--font-sans)]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.10),transparent_48%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.12),transparent_50%)]"
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-purple-500/35 bg-[#0B0C17]/95 p-7 shadow-2xl shadow-purple-950/60 backdrop-blur-xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/35 bg-gradient-to-br from-blue-950 to-purple-950">
              <PrismWordIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Prism Word</h1>
              <p className="text-xs text-slate-300">Private Family Sanctuary</p>
            </div>
          </div>
          <Link
            href="/engine"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-black/50 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Engine
          </Link>
        </div>

        {auth.status === 'checking' ? (
          <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            Checking private sanctuary access...
          </div>
        ) : auth.status === 'forbidden' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 space-y-1.5 text-xs text-rose-100">
              <div className="flex items-center gap-2 font-semibold text-rose-200">
                <ShieldAlert className="h-4 w-4" />
                Account Not Authorised
              </div>
              <p>
                Signed in as <strong className="text-white">{auth.rejectedEmail}</strong>. This private sanctuary is strictly restricted to authorised family accounts only.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-medium text-white hover:opacity-95"
            >
              Sign Out and Switch Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-black/45 p-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-purple-200">
                <Lock className="h-4 w-4 text-blue-300" />
                Hidden Private Sanctuary
              </div>
              <p className="text-slate-300 leading-relaxed">
                Notes, reflections, and worship study are private, non shareable, and locked to authorised family accounts only.
              </p>
            </div>

            {auth.supabaseConfigured && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-medium text-white shadow-md shadow-purple-950/50 transition hover:opacity-95 disabled:opacity-50"
                >
                  Continue with Authorised Google Account
                </button>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="h-px flex-1 bg-slate-800" />
                  <span>or unlock with authorised email</span>
                  <span className="h-px flex-1 bg-slate-800" />
                </div>
              </>
            )}

            <form onSubmit={handleLocalSubmit} className="space-y-3">
              <div>
                <label htmlFor="sanctuary-email" className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-300">
                  Authorised Family Email
                </label>
                <input
                  id="sanctuary-email"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your authorised email to unlock"
                  className="w-full rounded-xl border border-slate-700 bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                />
              </div>
              <button
                type="submit"
                disabled={!emailInput.trim() || submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#101223] px-4 py-2.5 text-xs font-medium text-slate-100 hover:border-purple-400/50 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                Unlock Private Sanctuary
              </button>
            </form>

            {errorMsg && (
              <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/35 px-3.5 py-2.5 text-xs text-rose-100">
                {errorMsg}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
