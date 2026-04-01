import { slugVariantIndex } from "@/lib/seo/prisonProfileCopy";

const TITLE_SUFFIXES = [
  "Prison – Visiting & Contact Info",
  "Prison – Visiting Guide & Contact Details",
  "Prison – Visiting Times, Contact & Info",
  "Prison – Visits, Contact & Practical Information",
] as const;

const MAX_TITLE_LEN = 60;

function truncateNameAtWord(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  if (maxLen <= 1) return "…";
  const slice = name.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLen * 0.4 ? slice.slice(0, lastSpace) : slice.trimEnd();
  return `${base}…`;
}

/**
 * Title for prison profile pages: variant suffix (never truncated); prison name truncated only so the full title fits ~60 chars.
 */
export function buildPrisonPageTitle(prisonName: string, slug: string): string {
  const suffix = TITLE_SUFFIXES[slugVariantIndex(slug, TITLE_SUFFIXES.length)];
  const sep = " ";
  const name = prisonName.trim();
  const suffixPart = `${sep}${suffix}`;
  const full = `${name}${suffixPart}`;
  if (full.length <= MAX_TITLE_LEN) return full;
  const maxNameLen = MAX_TITLE_LEN - suffixPart.length;
  if (maxNameLen < 2) return `${name.slice(0, 1)}…${suffixPart}`;
  return `${truncateNameAtWord(name, maxNameLen)}${suffixPart}`;
}
