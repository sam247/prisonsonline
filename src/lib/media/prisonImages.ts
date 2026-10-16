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

/** Aliases are country-qualified keys: "<cc>/<slug>" -> other "<cc>/<slug>" keys to try. */
const prisonImageSlugAliases: Record<string, string[]> = {
  "uk/hmp-yoi-bronzefield": ["uk/hmp-bronzefield"],
};

/** Canonical image key: "<countrySlug>/<prisonSlug>", e.g. "ca/prince-albert-correctional-centre". */
export function prisonImageKey(countrySlug: string, slug: string): string {
  return `${String(countrySlug || "").trim().toLowerCase()}/${String(slug || "").trim()}`;
}

/**
 * Normalizes a sheet slug column (full URL, /prisons/<cc>/<slug> path, or "<cc>/<slug>") to the
 * country-qualified image key. Bare slugs have no country and return null.
 */
export function normalizePrisonImageKey(raw: string): string | null {
  let s = String(raw || "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) {
    try {
      s = new URL(s).pathname;
    } catch {
      return null;
    }
  }
  const parts = s.split("/").filter(Boolean);
  if (parts[0] === "prisons") parts.shift();
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return prisonImageKey(parts[0], parts[1]);
}

/** Raw image record for a prison, by country + slug (with aliases). */
export function getPrisonImageRecord(countrySlug: string, slug: string): PrisonImageRecord | undefined {
  const key = prisonImageKey(countrySlug, slug);
  return prisonImages[key] ?? prisonImageSlugAliases[key]?.map((alias) => prisonImages[alias]).find(Boolean);
}

/**
 * Resolved Wikimedia (or other) facility photo for a prison. Used when merging into `Prison.facilityImage`.
 */
export function getPrisonImage(countrySlug: string, slug: string): RealFacilityImage | undefined {
  const row = getPrisonImageRecord(countrySlug, slug);
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
