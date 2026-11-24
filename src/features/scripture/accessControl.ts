/**
 * Private Prism Word accounts are configured in the server environment, never
 * committed to the public repository or returned as a public allowlist.
 */
export function getAllowedPrismWordEmails(): string[] {
  return (process.env.PRISM_WORD_ALLOWED_EMAILS || '')
    .split(',')
    .map((email) => normalizePrismWordEmail(email))
    .filter(Boolean);
}

/**
 * Normalizes and validates whether an email belongs strictly to the two
 * authorised Prism Word family accounts.
 */
export function normalizePrismWordEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isAllowedPrismWordEmail(email: unknown): boolean {
  const normalized = normalizePrismWordEmail(email);
  return Boolean(normalized && getAllowedPrismWordEmails().includes(normalized));
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
