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

const PLACEHOLDER_VISITING_PATTERNS = [/^the import lists\b/i, /\bimport(ed)? (lists|dataset|listing)\b/i];

/**
 * Returns visitor-facing visiting text. Import-placeholder rows (e.g. US BOP
 * "The import lists phone …") are replaced with neutral wording built from the
 * real contact fields. Stored data is not edited.
 */
export function visitorVisitingInfo(p: { visitingInfo?: string | null; phone?: string | null; country?: string | null }): string {
  const text = p.visitingInfo?.trim() ?? "";
  if (!text || !PLACEHOLDER_VISITING_PATTERNS.some((re) => re.test(text))) return text;
  const phone = p.phone?.trim() || text.match(/phone\s+([+\d][\d\s().-]{6,}\d)/i)?.[1];
  const official = /united states|usa|\bus\b/i.test(p.country ?? "") || /BOP/.test(text)
    ? "the official BOP facility page"
    : "the official facility page";
  return phone
    ? `For visiting information, contact the facility on ${phone} or check ${official}. Visiting rules change, so confirm hours and requirements before travelling.`
    : `For visiting information, check ${official}. Visiting rules change, so confirm hours and requirements before travelling.`;
}
