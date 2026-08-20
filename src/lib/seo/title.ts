import { siteName } from "@/lib/site";

export const MAX_RENDERED_TITLE_LENGTH = 60;
const BRAND_SUFFIX = ` | ${siteName}`;

export type SeoTitleOptions = {
  title: string;
  appendBrand?: boolean;
  /** Bespoke editorial titles are never truncated. */
  preserveVerbatim?: boolean;
};

function cleanTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
function truncateAtWord(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  if (maxLength < 2) return value.slice(0, maxLength);
  const slice = value.slice(0, maxLength - 1).trimEnd();
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace >= Math.floor(maxLength * 0.55) ? slice.slice(0, lastSpace) : slice;
  return `${base.trimEnd()}…`;
}

/** Builds the complete rendered title, including branding, within one shared budget. */
export function buildSeoTitle({
  title,
  appendBrand = true,
  preserveVerbatim = false,
}: SeoTitleOptions): string {
  const core = cleanTitle(title);
  if (!core) return siteName;
  if (core.includes(siteName)) {
    return preserveVerbatim ? core : truncateAtWord(core, MAX_RENDERED_TITLE_LENGTH);
  }
  if (appendBrand && `${core}${BRAND_SUFFIX}`.length <= MAX_RENDERED_TITLE_LENGTH) {
    return `${core}${BRAND_SUFFIX}`;
  }
  if (preserveVerbatim) return core;
  return truncateAtWord(core, MAX_RENDERED_TITLE_LENGTH);
}
