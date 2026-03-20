import type { Prison } from "@/types/prison";
import { getPrisonsByCountry, getPrisonsByRegion } from "@/data/prisons";
import { slugifyKey } from "@/lib/programmatic/slugify";

/** Minimum facilities to publish a US federal facility-type hub URL. */
export const MIN_US_FACILITY_TYPE_HUB = 3;

/** Minimum facilities to treat a US state as eligible for generated directory articles (not region URL gating). */
export const MIN_US_STATE_ARTICLE = 3;

const usFederal = (): Prison[] => getPrisonsByCountry("us");

export function facilityTypeSlugForPrison(p: Prison): string {
  const raw = (p.facilityType || "other").trim().toLowerCase();
  return raw ? slugifyKey(raw) : "other";
}

function countBy<K>(items: Prison[], keyFn: (p: Prison) => K): Map<K, Prison[]> {
  const m = new Map<K, Prison[]>();
  for (const p of items) {
    const k = keyFn(p);
    const arr = m.get(k) ?? [];
    arr.push(p);
    m.set(k, arr);
  }
  return m;
}

export function listUsFacilityTypeHubSlugs(): string[] {
  const map = countBy(usFederal(), (p) => facilityTypeSlugForPrison(p));
  return Array.from(map.entries())
    .filter(([, arr]) => arr.length >= MIN_US_FACILITY_TYPE_HUB)
    .map(([slug]) => slug)
    .sort();
}

export function getPrisonsForUsFacilityTypeHub(typeSlug: string): Prison[] {
  return usFederal().filter((p) => facilityTypeSlugForPrison(p) === typeSlug);
}

export function resolveUsFacilityTypeHub(typeSlug: string): {
  prisons: Prison[];
  typeLabel: string;
} | null {
  const list = getPrisonsForUsFacilityTypeHub(typeSlug);
  if (list.length < MIN_US_FACILITY_TYPE_HUB) return null;
  const label = list[0]?.facilityType?.toUpperCase() || typeSlug.toUpperCase();
  return { prisons: list, typeLabel: label };
}

export function usFacilityTypeHubHref(p: Prison): string | null {
  if (p.countrySlug !== "us") return null;
  const slug = facilityTypeSlugForPrison(p);
  const n = getPrisonsForUsFacilityTypeHub(slug).length;
  return n >= MIN_US_FACILITY_TYPE_HUB ? `/prisons/us/facility-type/${slug}` : null;
}

/** State browse URL uses existing region segment: /prisons/us/{regionSlug} */
export function usStateBrowseHref(p: Prison): string {
  return `/prisons/us/${p.regionSlug}`;
}

/**
 * Link to state-level programmatic hub listing only when enough sites exist (optional UI gating).
 * Region page still exists in routing for all states with ≥1 prison via allCountrySecondSegmentParams.
 */
export function usStateHubMeetsArticleThreshold(regionSlug: string): boolean {
  return getPrisonsByRegion("us", regionSlug).length >= MIN_US_STATE_ARTICLE;
}

export function listUsStateRegionSlugsForArticles(): string[] {
  const map = countBy(usFederal(), (p) => p.regionSlug);
  return Array.from(map.entries())
    .filter(([, arr]) => arr.length >= MIN_US_STATE_ARTICLE)
    .map(([slug]) => slug)
    .sort();
}

export function listUsFederalSitemapPaths(): { path: string; priority: number }[] {
  const priority = 0.51;
  const out: { path: string; priority: number }[] = [];
  for (const typeSlug of listUsFacilityTypeHubSlugs()) {
    out.push({ path: `/prisons/us/facility-type/${typeSlug}`, priority });
  }
  return out;
}
