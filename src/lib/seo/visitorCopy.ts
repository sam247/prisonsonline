/**
 * Detects stored history text that is an internal import placeholder rather than
 * visitor-facing prose. Templates hide the History section when this returns false.
 * (The stored data itself is owned by the UK Verifier and is not edited here.)
 */
const PLACEHOLDER_HISTORY_PATTERNS = [
  /not part of the imported/i,
  /\bimported (dataset|BOP listing)\b/i,
];

export function hasVisitorHistory(history: string | undefined | null): boolean {
  const text = history?.trim();
  if (!text) return false;
  return !PLACEHOLDER_HISTORY_PATTERNS.some((re) => re.test(text));
}
