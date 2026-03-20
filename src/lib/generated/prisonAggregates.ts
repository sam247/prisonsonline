import type { Prison } from "@/types/prison";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const arr = m.get(k) ?? [];
    arr.push(item);
    m.set(k, arr);
  }
  return m;
}

const uk = ukPrisonsGenerated;

export const prisonsByCountrySlug = groupBy(uk, (p) => p.countrySlug);
export const prisonsByRegionSlug = groupBy(uk, (p) => p.regionSlug);
export const prisonsByOperatorSlug = groupBy(uk, (p) =>
  (p.operator || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown",
);

export function listUkPrisonsByRegion(regionSlug: string): Prison[] {
  return uk.filter((p) => p.regionSlug === regionSlug);
}

export function isPrivatelyManagedPrison(p: Prison): boolean {
  const t = `${p.operator} ${p.prisonSubGroup1 ?? ""} ${p.prisonSubGroup2 ?? ""}`.toLowerCase();
  return /serco|g4s|sodexo|privately|private sector|private managed/.test(t);
}
