import type { RealFacilityImage } from "@/types/media";
import prisonImagesJson from "@/data/prisonImages.json";

export type PrisonImageRecord = {
  imageUrl: string;
  credit: string;
  licence: string;
  alt: string;
  licenceUrl?: string;
  author?: string;
  title?: string;
  sourceUrl?: string;
  caption?: string;
};

const prisonImages = prisonImagesJson as Record<string, PrisonImageRecord>;

const prisonImageSlugAliases: Record<string, string[]> = {
  "hmp-yoi-bronzefield": ["hmp-bronzefield"],
};

/**
 * Normalizes a sheet slug column: full URL, path like /prisons/uk/hmp-x, or bare slug.
 */
export function normalizePrisonImageKey(raw: string): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (s.includes("/")) {
    const parts = s.split("/").filter(Boolean);
    const last = parts[parts.length - 1]?.replace(/\/$/, "") ?? "";
    return last || null;
  }
  return s;
}

export type PrisonImageScope = { countrySlug: string; ambiguousSlugs: ReadonlySet<string> };

/** Country-scoped image key, e.g. "ca/prince-albert-correctional-centre" (used only for cross-country slugs). */
export function prisonImageKey(countrySlug: string, slug: string): string {
  return `${String(countrySlug || "").trim().toLowerCase()}/${String(slug || "").trim()}`;
}

/**
 * Raw image record for a prison slug: country-scoped key first, then bare slug / aliases, except that a
 * slug shared across countries never falls back to its bare-slug record. Single source of truth for
 * both `facilityImage` and lastModified/sitemap dates.
 */
export function getPrisonImageRecord(slug: string, scope?: PrisonImageScope): PrisonImageRecord | undefined {
  const scoped = scope ? prisonImages[prisonImageKey(scope.countrySlug, slug)] : undefined;
  if (scoped) return scoped;
  if (scope?.ambiguousSlugs.has(slug)) return undefined;
  return (
    prisonImages[slug] ??
    prisonImageSlugAliases[slug]?.map((alias) => prisonImages[alias]).find((candidate) => Boolean(candidate))
  );
}

/**
 * Resolved Wikimedia (or other) facility photo for a prison slug. Used when merging into `Prison.facilityImage`.
 *
 * Image records are keyed by bare slug. A slug used by more than one country (e.g. the frozen
 * `prince-albert-correctional-centre`, CA and ZA) is ambiguous: its bare-slug record is never used,
 * so one country's photo cannot appear on the other's page. Such a prison only gets an image from a
 * country-scoped key (`<countrySlug>/<slug>`).
 */
export function getPrisonImage(slug: string, scope?: PrisonImageScope): RealFacilityImage | undefined {
  const row = getPrisonImageRecord(slug, scope);
  if (!row?.imageUrl?.trim()) return undefined;
  return {
    type: "real",
    src: row.imageUrl,
    alt: row.alt.trim() || `Photograph of ${slug.replace(/-/g, " ")}`,
    ...(row.credit?.trim() ? { credit: row.credit.trim() } : {}),
    ...(row.licence?.trim() ? { licence: row.licence.trim() } : {}),
    ...(row.licenceUrl?.trim() ? { licenceUrl: row.licenceUrl.trim() } : {}),
    ...(row.author?.trim() ? { author: row.author.trim() } : {}),
    ...(row.title?.trim() ? { title: row.title.trim() } : {}),
    ...(row.sourceUrl?.trim() ? { sourceUrl: row.sourceUrl.trim() } : {}),
    ...(row.caption?.trim() ? { caption: row.caption.trim() } : {}),
  };
}
