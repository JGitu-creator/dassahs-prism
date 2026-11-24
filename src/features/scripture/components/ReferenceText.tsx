'use client';

import React from 'react';
import { parseBracketedReferences } from '../referenceParser';

function renderBionicSegment(segment: string): React.ReactNode {
  const cut = Math.max(1, Math.ceil(segment.length * 0.42));
  return (
    <>
      <span className="font-semibold text-purple-200">{segment.slice(0, cut)}</span>
      <span>{segment.slice(cut)}</span>
    </>
  );
}

function renderBionicWords(text: string): React.ReactNode {
  return text.split(/(\s+)/).map((segment, index) => {
    if (/^\s+$/.test(segment) || segment.length === 0) {
      return <React.Fragment key={index}>{segment}</React.Fragment>;
    }
    return <React.Fragment key={index}>{renderBionicSegment(segment)}</React.Fragment>;
  });
}

interface ReferenceTextProps {
  text: string;
  sparkleMode?: boolean;
  onOpenReference: (normalizedRef: string) => void;
  className?: string;
}

/**
 * Renders prose with clickable [Book Ch:V] pills that open Ask DJ inline without
 * navigating away or breaking reading flow.
 */
export function ReferenceText({
  text,
  sparkleMode = false,
  onOpenReference,
  className = '',
}: ReferenceTextProps) {
  const tokens = parseBracketedReferences(text);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        if (token.type === 'ref') {
          return (
            <button
              key={`${token.normalizedRef}-${idx}`}
              type="button"
              onClick={() => onOpenReference(token.normalizedRef)}
              title={`Open [${token.normalizedRef}] in Ask DJ`}
              className="mx-0.5 inline-flex items-center rounded-md border border-purple-500/40 bg-blue-500/15 px-1.5 py-0.5 font-sans text-[0.82em] font-medium text-blue-300 transition hover:border-purple-400 hover:bg-purple-500/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              [{token.value}]
            </button>
          );
        }

        return (
          <React.Fragment key={idx}>
            {sparkleMode ? renderBionicWords(token.value) : token.value}
          </React.Fragment>
        );
      })}
    </span>
  );
}

/**
 * Renders verbatim Scripture text where any word (3+ letters) can be tapped
 * to inspect via Prism Word Lens (Ask DJ or Google meaning) without breaking flow.
 */
export function InteractiveVerseText({
  text,
  bionicEnabled,
  onWordSelect,
}: {
  text: string;
  bionicEnabled: boolean;
  onWordSelect: (word: string) => void;
}) {
  return (
    <>
      {text.split(/(\s+)/).map((segment, idx) => {
        if (/^\s+$/.test(segment) || segment.length === 0) {
          return <React.Fragment key={idx}>{segment}</React.Fragment>;
        }
        const cleaned = segment
          .replace(/^[^a-zA-Z0-9\u00C0-\u024F]+|[^a-zA-Z0-9\u00C0-\u024F]+$/g, '')
          .trim();
        const selectable = cleaned.length >= 3 && cleaned.length <= 50;

        if (!selectable) {
          return (
            <React.Fragment key={idx}>
              {bionicEnabled ? renderBionicSegment(segment) : segment}
            </React.Fragment>
          );
        }

        return (
          <span
            key={idx}
            role="button"
            tabIndex={0}
            title={`Tap "${cleaned}" for Ask DJ / Google meaning`}
            onClick={() => onWordSelect(cleaned)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWordSelect(cleaned);
              }
            }}
            className="cursor-pointer rounded px-0.5 -mx-0.5 transition hover:bg-purple-500/20 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
          >
            {bionicEnabled ? renderBionicSegment(segment) : segment}
          </span>
        );
      })}
    </>
  );
}
