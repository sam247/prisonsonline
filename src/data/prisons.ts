import type { Prison } from "@/types/prison";
import { ukPrisonsGenerated } from "./generated/ukPrisons.generated";
import { usPrisonsGenerated } from "./generated/usPrisons.generated";
import { legacyInternationalPrisons } from "./prisons.legacy-international";

export type { Prison } from "@/types/prison";

/** UK HMPPS import, US federal BOP import, then legacy manual international profiles. */
export const prisons: Prison[] = [...ukPrisonsGenerated, ...usPrisonsGenerated, ...legacyInternationalPrisons];

export const countries = Array.from(new Set(prisons.map((p) => p.country))).sort();

export const getCountrySlug = (country: string) => {
  const prison = prisons.find((p) => p.country === country);
  return prison?.countrySlug || country.toLowerCase().replace(/\s+/g, "-");
};

export const getRegionsByCountry = (countrySlug: string) => {
  const regionMap = new Map<string, string>();
  prisons
    .filter((p) => p.countrySlug === countrySlug)
    .forEach((p) => regionMap.set(p.regionSlug, p.stateOrRegion));
  return Array.from(regionMap.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getPrisonsByCountry = (countrySlug: string) =>
  prisons.filter((p) => p.countrySlug === countrySlug);

export const getPrisonsByRegion = (countrySlug: string, regionSlug: string) =>
  prisons.filter((p) => p.countrySlug === countrySlug && p.regionSlug === regionSlug);

/** Slug-only lookup (articles and cross-links); first match wins. */
export const getPrison = (slug: string) => prisons.find((p) => p.slug === slug);

/** Canonical resolver for `/prisons/[country]/[slug]`. */
export const getPrisonByCountryAndSlug = (countrySlug: string, slug: string) =>
  prisons.find((p) => p.slug === slug && p.countrySlug === countrySlug);

export const getRelatedPrisons = (prison: Prison, limit = 4) =>
  prisons
    .filter(
      (p) =>
        p.slug !== prison.slug &&
        (p.countrySlug === prison.countrySlug || p.securityLevel === prison.securityLevel),
    )
    .slice(0, limit);

export const searchPrisons = (query: string) => {
  const q = query.toLowerCase();
  return prisons.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.stateOrRegion.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (p.postcode?.toLowerCase().includes(q) ?? false) ||
      (p.address?.toLowerCase().includes(q) ?? false),
  );
};

export const securityLevels = Array.from(new Set(prisons.map((p) => p.securityLevel))).sort();
