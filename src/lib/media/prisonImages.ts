import type { RealFacilityImage } from "@/types/media";
import prisonImagesJson from "@/data/prisonImages.json";

export type PrisonImageRecord = {
  imageUrl: string;
  credit: string;
  licence: string;
  alt: string;
};

const prisonImages = prisonImagesJson as Record<string, PrisonImageRecord>;

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

/**
 * Resolved Wikimedia (or other) facility photo for a prison slug. Used when merging into `Prison.facilityImage`.
 */
export function getPrisonImage(slug: string): RealFacilityImage | undefined {
  const row = prisonImages[slug];
  if (!row?.imageUrl?.trim()) return undefined;
  return {
    type: "real",
    src: row.imageUrl,
    alt: row.alt.trim() || `Photograph of ${slug.replace(/-/g, " ")}`,
    ...(row.credit?.trim() ? { credit: row.credit.trim() } : {}),
    ...(row.licence?.trim() ? { licence: row.licence.trim() } : {}),
  };
}
