export const DEFAULT_WORSHIP_CHORDS = ['Cm9', 'Abmaj7', 'Fm9', 'G7'] as const;

const CHORD_TOKEN_REGEX =
  /^[A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add|M)?[0-9]*(?:(?:maj|min|m|dim|aug|sus|add|#|\b)[0-9]*)*(?:\/[A-G](?:#|b)?)?$/;

function extractTokensFromString(rawText: string): string[] {
  const results: string[] = [];
  const cleaned = rawText.replace(/^[\[\]"'`]+|[\[\]"'`]+$/g, '').trim();
  if (!cleaned) return results;

  const segments = cleaned.split(/[,|→;\n]+|\s+-\s+/);
  for (const segment of segments) {
    const seg = segment.trim();
    if (!seg) continue;

    if (/\s/.test(seg)) {
      const subParts = seg.split(/\s+/).map((p) => p.replace(/^["'`()]+|["'`()]+$/g, '').trim());
      const chordSubParts = subParts.filter((p) => CHORD_TOKEN_REGEX.test(p));
      if (chordSubParts.length >= 2) {
        results.push(...chordSubParts);
        continue;
      }
    }

    const token = seg.replace(/^["'`()]+|["'`()]+$/g, '').trim();
    if (CHORD_TOKEN_REGEX.test(token)) {
      results.push(token);
    } else if (/^[A-G][#b]?/.test(token) && token.length <= 12) {
      results.push(token);
    }
  }

  return results;
}

function collectChordCandidates(
  node: unknown,
  out: string[],
  depth = 0,
  seen = new WeakSet<object>(),
): void {
  if (depth > 5 || out.length >= 16 || node == null) return;

  if (typeof node === 'string') {
    out.push(...extractTokensFromString(node));
    return;
  }

  if (typeof node === 'object') {
    if (seen.has(node)) return;
    seen.add(node);
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      collectChordCandidates(item, out, depth + 1, seen);
      if (out.length >= 16) break;
    }
    return;
  }

  if (typeof node === 'object') {
    for (const value of Object.values(node as Record<string, unknown>)) {
      collectChordCandidates(value, out, depth + 1, seen);
      if (out.length >= 16) break;
    }
  }
}

/**
 * Normalizes LLM-produced chord progressions (flat arrays, nested section arrays,
 * `{ verse: [...], chorus: [...] }` objects, or delimited strings) into a clean
 * non-empty flat string[] capped at 8 chords.
 */
export function normalizeChordProgression(
  raw: unknown,
  fallback: readonly string[] = DEFAULT_WORSHIP_CHORDS,
): string[] {
  const collected: string[] = [];
  collectChordCandidates(raw, collected);
  const sliced = collected.slice(0, 8);
  return sliced.length > 0 ? sliced : [...fallback];
}
