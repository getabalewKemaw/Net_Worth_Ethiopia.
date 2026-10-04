/**
 * Utility functions for parsing amounts, text normalization, and date parsing.
 */

/**
 * Parses numeric Birr amount from extracted string token, handling commas (e.g. "1,500.50" -> 1500.5).
 */
export function parseBirrAmount(rawToken: string | null | undefined): number | null {
  if (!rawToken) return null;
  const cleaned = rawToken.replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100) / 100;
}

/**
 * Cleans extra whitespace and control characters from text.
 */
export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Formats a timestamp into an ISO string safely.
 */
export function formatTimestamp(dateMs: number | string | undefined): string {
  if (!dateMs) return new Date().toISOString();
  try {
    const d = new Date(dateMs);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Simple client-side UUID generator.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'txn-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
}
