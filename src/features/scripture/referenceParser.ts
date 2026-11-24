import { parseBibleReference } from './usfm.ts';

export type ReferenceToken =
  | { type: 'text'; value: string }
  | { type: 'ref'; value: string; normalizedRef: string };

const BRACKETED_REF_REGEX = /\[([^\[\]\n]{3,60})\]/g;

/**
 * Splits prose containing bracketed scripture references such as [John 10:11] or
 * [1 Cor 13:4-7] into safe text and clickable cross-reference tokens.
 * Bracketed items that are not valid Bible references remain plain text.
 */
export function parseBracketedReferences(input: string): ReferenceToken[] {
  const text = String(input || '');
  if (!text) return [];

  const tokens: ReferenceToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BRACKETED_REF_REGEX)) {
    const fullMatch = match[0];
    const inner = match[1].trim();
    const index = match.index ?? 0;

    const parsed = parseBibleReference(inner);
    if (!parsed) {
      continue;
    }

    if (index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, index) });
    }

    tokens.push({
      type: 'ref',
      value: inner,
      normalizedRef: parsed.normalized,
    });

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  if (tokens.length === 0) {
    tokens.push({ type: 'text', value: text });
  }

  return tokens;
}
