import { topPrisonEntityCohortGenerated } from "@/data/generated/topPrisonEntityCohort.generated";

const cohortSet = new Set(topPrisonEntityCohortGenerated.map((row) => `${row.countrySlug}/${row.prisonSlug}`));

export function isInTopEntityCohort(countrySlug: string, prisonSlug: string): boolean {
  return cohortSet.has(`${countrySlug}/${prisonSlug}`);
}

export function listTopEntityCohortKeys(): string[] {
  return Array.from(cohortSet);
}

