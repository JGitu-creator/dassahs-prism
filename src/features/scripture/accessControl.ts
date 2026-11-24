export const ALLOWED_PRISM_WORD_EMAILS = [
  'phidotaxis@gmail.com',
  'chanhadassah@gmail.com',
] as const;

const ALLOWED_SET = new Set<string>(ALLOWED_PRISM_WORD_EMAILS);

/**
 * Normalizes and validates whether an email belongs strictly to the two
 * authorised Prism Word family accounts.
 */
export function normalizePrismWordEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isAllowedPrismWordEmail(email: unknown): boolean {
  const normalized = normalizePrismWordEmail(email);
  return Boolean(normalized && ALLOWED_SET.has(normalized));
}

/**
 * Strips path traversal tokens and unsafe filesystem characters from note identifiers
 * so every stored file stays safely inside its intended vault subfolder.
 */
export function sanitizeVaultFileId(raw: unknown): string {
  const text = typeof raw === 'string' ? raw.trim() : '';
  const cleaned = text
    .replace(/\.\.+/g, '.')
    .replace(/[\/\\:*?"<>|\x00-\x1F]/g, '_')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/^[._]+|[._]+$/g, '')
    .slice(0, 64);
  return cleaned || 'general';
}
