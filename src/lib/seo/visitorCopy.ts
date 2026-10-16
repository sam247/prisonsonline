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

/** Import/dataset clauses and sentences that should never reach visitors. */
const IMPORT_CLAUSE_PATTERNS = [
  /,?\s*listed in the [A-Za-z-]*\s*dataset used in this site build/gi,
  /,?\s*(?:as )?(?:listed|shown) in the imported (?:dataset|BOP listing)/gi,
];
const IMPORT_SENTENCE_PATTERNS = [
  /\b(?:not included in|not part of) (?:this|the) (?:imported )?(?:dataset|listing|import)\b/i,
  /\bimported (?:dataset|BOP listing)\b/i,
  /\bdataset used in this site build\b/i,
  /\bsite build\b/i,
];

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/** Strip import clauses, then drop any sentence that is still import wording. */
export function stripImportWording(text: string | undefined | null): string {
  let t = text?.trim() ?? "";
  if (!t) return "";
  for (const re of IMPORT_CLAUSE_PATTERNS) t = t.replace(re, "");
  return splitSentences(t)
    .filter((s) => /[A-Za-z0-9]/.test(s) && !IMPORT_SENTENCE_PATTERNS.some((re) => re.test(s)))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

type OverviewInput = {
  overview?: string | null;
  name: string;
  securityLevel?: string | null;
  city?: string | null;
  stateOrRegion?: string | null;
};

/**
 * Visitor-facing overview. Removes import/dataset wording (e.g. US BOP
 * "listed in the BOP-derived dataset used in this site build"). If nothing
 * real is left, builds a neutral sentence from stored fields only.
 */
export function visitorOverview(p: OverviewInput): string {
  const cleaned = stripImportWording(p.overview);
  if (cleaned) return cleaned;
  const where = [p.city?.trim(), p.stateOrRegion?.trim()].filter(Boolean).join(", ");
  const level = p.securityLevel?.trim();
  const levelText = level && !/^multi$/i.test(level) ? ` It is listed as ${level.toLowerCase()} security.` : "";
  return `${p.name.trim()} is a prison facility${where ? ` in ${where}` : ""}.${levelText}`;
}

/** Visitor-facing prison life text; empty string means hide the section. */
const POINTER_ONLY = /^(?:use|check|confirm with) (?:the )?official\b/i;

export function visitorPrisonLife(prisonLife: string | undefined | null): string {
  const cleaned = stripImportWording(prisonLife);
  // A lone "use official sources" pointer left after stripping has no facts: hide the section.
  return splitSentences(cleaned).every((s) => POINTER_ONLY.test(s)) ? "" : cleaned;
}
