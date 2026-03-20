import {
  getPrisonByCountryAndSlug,
  getPrisonsByRegion,
  getRegionsByCountry,
  prisons,
} from "@/data/prisons";
import type { Prison } from "@/types/prison";

export type ResolvedCountrySecondSegment =
  | { kind: "prison"; prison: Prison }
  | { kind: "region"; regionSlug: string; prisons: Prison[] }
  | { kind: "not_found" };

/**
 * /prisons/[country]/[slug] — slug may be a prison slug or a region slug.
 * If both match (rare), prefer prison.
 */
export function resolveCountrySecondSegment(countrySlug: string, slug: string): ResolvedCountrySecondSegment {
  const prison = getPrisonByCountryAndSlug(countrySlug, slug);
  if (prison) return { kind: "prison", prison };

  const inRegion = getPrisonsByRegion(countrySlug, slug);
  if (inRegion.length > 0) return { kind: "region", regionSlug: slug, prisons: inRegion };

  return { kind: "not_found" };
}

export function allCountrySecondSegmentParams(): { country: string; slug: string }[] {
  const countrySlugs = Array.from(new Set(prisons.map((p) => p.countrySlug)));
  const out: { country: string; slug: string }[] = [];

  for (const country of countrySlugs) {
    const slugSet = new Set<string>();
    prisons.filter((p) => p.countrySlug === country).forEach((p) => slugSet.add(p.slug));
    getRegionsByCountry(country).forEach((r) => slugSet.add(r.slug));
    Array.from(slugSet).forEach((slug) => {
      out.push({ country, slug });
    });
  }

  return out;
}
