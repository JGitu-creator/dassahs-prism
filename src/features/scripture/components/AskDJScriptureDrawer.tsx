'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Loader2, Send, Sparkles, X } from 'lucide-react';
import type { AskDjChatTurn, BiblePassageResult } from '../types';
import { ReferenceText } from './ReferenceText';

interface AskDJScriptureDrawerProps {
  isOpen: boolean;
  primaryReference: string;
  clickedReference: string | null;
  focusWord: string | null;
  activeTranslation: string;
  sparkleMode: boolean;
  onSelectReference: (ref: string) => void;
  onClose: () => void;
}

export function AskDJScriptureDrawer({
  isOpen,
  primaryReference,
  clickedReference,
  focusWord,
  activeTranslation,
  sparkleMode,
  onSelectReference,
  onClose,
}: AskDJScriptureDrawerProps) {
  const [passage, setPassage] = useState<BiblePassageResult | null>(null);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [messages, setMessages] = useState<AskDjChatTurn[]>([]);
  const [providerLabel, setProviderLabel] = useState<string>('');
  const [interactionId, setInteractionId] = useState<string | undefined>(undefined);
  const [asking, setAsking] = useState(false);
  const [input, setInput] = useState('');
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadReferenceOrWordContext() {
      if (!clickedReference && !focusWord) {
        setPassage(null);
        setMessages([]);
        setProviderLabel('');
        setInteractionId(undefined);
        return;
      }

      setMessages([]);
      setProviderLabel('');
      setInteractionId(undefined);

      if (clickedReference) {
        setLoadingPassage(true);
        try {
          const passageRes = await fetch(
            `/api/scripture/passage?ref=${encodeURIComponent(clickedReference)}&translation=${encodeURIComponent(activeTranslation)}`,
          );
          if (!cancelled && passageRes.ok) {
            const data = (await passageRes.json()) as BiblePassageResult;
            setPassage(data);
          }
        } catch {
          // Non-fatal
        } finally {
          if (!cancelled) setLoadingPassage(false);
        }
      } else {
        setPassage(null);
      }

      setAsking(true);
      try {
        const question = focusWord
          ? `What does the word "${focusWord}" mean in ${primaryReference}, and what is its original Hebrew/Greek nuance?`
          : `How does ${clickedReference} connect to ${primaryReference}?`;

        const djRes = await fetch('/api/scripture/ask-dj', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primaryReference,
            clickedReference: clickedReference ?? undefined,
            focusWord: focusWord ?? undefined,
            question,
            history: [],
          }),
        });
        if (!cancelled && djRes.ok) {
          const djData = (await djRes.json()) as {
            reply: string;
            providerLabel?: string;
            interactionId?: string;
          };
          setMessages([{ role: 'assistant', text: djData.reply }]);
          setProviderLabel(djData.providerLabel || '');
          setInteractionId(djData.interactionId);
        }
      } catch {
        if (!cancelled) {
          setMessages([
            {
              role: 'assistant',
              text: focusWord
                ? `Could not reach Ask DJ right now for "${focusWord}". Compare ${primaryReference} across ESV and Amplified to see its full meaning.`
                : `Could not reach Ask DJ right now. Read [${clickedReference}] above alongside [${primaryReference}].`,
            },
          ]);
        }
      } finally {
        if (!cancelled) setAsking(false);
      }
    }

    void loadReferenceOrWordContext();
    return () => {
      cancelled = true;
    };
  }, [isOpen, clickedReference, focusWord, primaryReference, activeTranslation]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, asking]);

  async function handleSendQuestion(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || asking) return;

    const nextHistory: AskDjChatTurn[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(nextHistory);
    setInput('');
    setAsking(true);

    try {
      const res = await fetch('/api/scripture/ask-dj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primaryReference,
            clickedReference: clickedReference ?? undefined,
            focusWord: focusWord ?? undefined,
            previousInteractionId: interactionId,
            question: trimmed,
            history: messages,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            reply: string;
            providerLabel?: string;
            interactionId?: string;
          };
          setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
          if (data.providerLabel) setProviderLabel(data.providerLabel);
          if (data.interactionId) setInteractionId(data.interactionId);
        } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Ask DJ could not answer that question right now. Please try again.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Network hiccup reaching Ask DJ. Please try again.' },
      ]);
    } finally {
      setAsking(false);
    }
  }

  if (!isOpen) return null;

  const headerTitle = focusWord
    ? `Word Lens: “${focusWord}”`
    : clickedReference
      ? `Cross Reference: ${clickedReference}`
      : `Ask DJ: ${primaryReference}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <aside
        aria-label="Ask DJ Scripture Drawer"
        className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-purple-500/25 bg-[#090A14] text-slate-100 shadow-2xl shadow-purple-950/60"
      >
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-purple-900/40">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{headerTitle}</h2>
              <p className="text-xs text-slate-300">
                Staying in flow with <span className="text-blue-300">{primaryReference}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Ask DJ drawer"
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {clickedReference && (
            <div className="rounded-2xl border border-blue-500/25 bg-blue-950/20 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                  <BookOpen className="h-3.5 w-3.5" />
                  {passage?.reference || clickedReference}
                </span>
                <span className="rounded-md border border-purple-500/30 bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium text-purple-200">
                  {passage?.activeTranslation || activeTranslation}
                </span>
              </div>

              {loadingPassage ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                  Fetching passage...
                </div>
              ) : passage ? (
                <div className="space-y-2">
                  <div className="font-[var(--font-reading)] text-[15.5px] leading-relaxed text-slate-100">
                    {passage.verses.map((v) => (
                      <p key={v.number} className="mb-1.5 last:mb-0">
                        <span className="mr-1.5 font-[var(--font-sans)] text-[11px] font-semibold text-purple-300">
                          {v.number}
                        </span>
                        {v.text}
                      </p>
                    ))}
                  </div>
                  <p className="border-t border-slate-800/80 pt-2 text-[11px] leading-snug text-slate-400">
                    {passage.copyright}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          <div className="space-y-3">
            {messages.length === 0 && !asking && (
              <div className="rounded-xl border border-slate-800/80 bg-[#101223]/75 p-4 text-xs text-slate-200 leading-relaxed">
                Ask anything about <span className="text-blue-300">{primaryReference}</span>: historical background, Hebrew and Greek roots, or how to apply it together.
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'ml-8 border border-blue-500/30 bg-blue-600/20 text-blue-50'
                    : 'mr-4 border border-purple-500/25 bg-[#121428] text-slate-200'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  <span>{msg.role === 'user' ? 'You' : 'DJ'}</span>
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => {
                        void fetch('/api/scripture/notes', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'ask-dj-insight',
                            passageId: primaryReference,
                            reference: clickedReference || primaryReference,
                            question: messages[i - 1]?.role === 'user' ? messages[i - 1].text : '',
                            reply: msg.text,
                          }),
                        }).catch(() => {});
                      }}
                      className="rounded-md border border-purple-500/35 bg-purple-950/35 px-2 py-0.5 text-[10px] font-normal normal-case text-purple-200 hover:text-white"
                    >
                      Save to DJ&apos;s Notes
                    </button>
                  )}
                </div>
                <ReferenceText
                  text={msg.text}
                  sparkleMode={sparkleMode}
                  onOpenReference={onSelectReference}
                />
              </div>
            ))}

            {asking && (
              <div className="mr-4 flex items-center gap-2 rounded-2xl border border-purple-500/20 bg-[#121428] px-4 py-3 text-xs text-purple-200">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                Reflecting on Scripture context...
              </div>
            )}

            {providerLabel && (
              <p className="text-[11px] text-slate-400">{providerLabel}</p>
            )}
            <div ref={scrollEndRef} />
          </div>
        </div>

        <div className="border-t border-slate-800/80 bg-[#07070D] p-4 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {[
              'What does this reveal about God?',
              'Explain the Hebrew or Greek root',
              'How can we practise this today?',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-full border border-slate-700 bg-[#101223] px-2.5 py-1 text-[11px] text-slate-200 transition hover:border-purple-500/50 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendQuestion} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask DJ to explore deeper..."
              className="flex-1 rounded-xl border border-slate-700 bg-[#101223] px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || asking}
              aria-label="Send question to Ask DJ"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-medium text-white shadow-md shadow-purple-950/50 transition hover:opacity-95 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
