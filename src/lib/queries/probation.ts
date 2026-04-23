import { probationCentresGenerated as probationCentres } from "@/data/generated/probationCentres.generated";
import type { ProbationCentre } from "@/types/institutional";

export const MIN_PROBATION_HUB_GROUP_SIZE = 3;

export function getProbationCentresByCountry(countrySlug: string): ProbationCentre[] {
  return probationCentres.filter((c) => c.countrySlug === countrySlug);
}

export function getProbationCentreByCountryAndSlug(
  countrySlug: string,
  slug: string,
): ProbationCentre | undefined {
  return probationCentres.find((c) => c.countrySlug === countrySlug && c.slug === slug);
}

export function getProbationRegionsByCountry(countrySlug: string): string[] {
  return Array.from(
    new Set(getProbationCentresByCountry(countrySlug).map((c) => c.regionSlug).filter(Boolean) as string[]),
  ).sort();
}

export function getProbationCentresByRegion(countrySlug: string, regionSlug: string): ProbationCentre[] {
  return getProbationCentresByCountry(countrySlug)
    .filter((c) => c.regionSlug === regionSlug)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function probationServiceTypeSlug(centre: ProbationCentre): string {
  return (centre.buildingType || "general")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function listProbationServiceTypeHubSlugs(countrySlug: string): string[] {
  const counts = new Map<string, number>();
  for (const c of getProbationCentresByCountry(countrySlug)) {
    const slug = probationServiceTypeSlug(c);
    counts.set(slug, (counts.get(slug) || 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, n]) => n >= MIN_PROBATION_HUB_GROUP_SIZE)
    .map(([slug]) => slug)
    .sort();
}

export function getProbationCentresByServiceType(countrySlug: string, typeSlug: string): ProbationCentre[] {
  return getProbationCentresByCountry(countrySlug)
    .filter((c) => probationServiceTypeSlug(c) === typeSlug)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveProbationUkSecondSegment(
  slug: string,
): { kind: "centre"; centre: ProbationCentre } | { kind: "region"; centres: ProbationCentre[] } | { kind: "not_found" } {
  const centre = getProbationCentreByCountryAndSlug("uk", slug);
  if (centre) return { kind: "centre", centre };
  const centres = getProbationCentresByRegion("uk", slug);
  if (centres.length > 0) return { kind: "region", centres };
  return { kind: "not_found" };
}

