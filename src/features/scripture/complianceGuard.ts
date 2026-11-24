const FORBIDDEN_LICENSED_TEXT_KEYS = new Set([
  'verbatimtext',
  'passagetext',
  'passages',
  'scripturetext',
  'verses',
  'versetext',
  'content',
  'bibletext',
  'textbody',
]);

/**
 * YouVersion Platform Terms of Use AI Guard:
 * Ensures licensed Scripture body text is NEVER forwarded into LLM study or chat payloads.
 * Only passage references (e.g. "Psalm 23:1-4") and user questions are allowed.
 */
export function sanitizeReferenceOnlyInput(rawBody: Record<string, unknown>): {
  hadForbiddenText: boolean;
  sanitized: Record<string, unknown>;
} {
  const sanitized: Record<string, unknown> = {};
  let hadForbiddenText = false;

  for (const [key, value] of Object.entries(rawBody)) {
    if (FORBIDDEN_LICENSED_TEXT_KEYS.has(key.toLowerCase())) {
      hadForbiddenText = true;
      continue;
    }
    sanitized[key] = value;
  }

  return { hadForbiddenText, sanitized };
}
