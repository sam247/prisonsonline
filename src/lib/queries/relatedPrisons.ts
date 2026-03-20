import { prisons } from "@/data/prisons";
import { getOperatorSlugForPrison } from "@/lib/programmatic/ukPrisonHubs";
import { facilityTypeSlugForPrison } from "@/lib/programmatic/usFederalHubs";
import type { Prison } from "@/types/prison";

/**
 * Related prisons for profile pages: region → operator → security band → same predominant function → rest of country (name order).
 * Falls back to legacy-style country/security OR match if the ranked list stays very small (manual international rows).
 */
export function getRelatedPrisonsForProfile(prison: Prison, limit = 8): Prison[] {
  const out: Prison[] = [];
  const seen = new Set<string>();

  const push = (p: Prison) => {
    if (p.slug === prison.slug || seen.has(p.slug)) return;
    seen.add(p.slug);
    out.push(p);
  };

  const sameCountry = prisons.filter((p) => p.countrySlug === prison.countrySlug && p.slug !== prison.slug);
  const opSlug = getOperatorSlugForPrison(prison);
  const isUsFederalOperator = prison.countrySlug === "us" && /federal bureau of prisons/i.test(prison.operator || "");
  const useOperatorBucket = opSlug !== "" && opSlug !== "unknown" && !isUsFederalOperator;
  const fnTrim = (prison.predominantFunction || "").trim();
  const usFacilitySlug =
    prison.countrySlug === "us" && prison.dataProvenance === "bop_import"
      ? facilityTypeSlugForPrison(prison)
      : "";

  const takeUntilLimit = () => out.length >= limit;

  for (const p of sameCountry) {
    if (p.regionSlug === prison.regionSlug) push(p);
    if (takeUntilLimit()) return out.slice(0, limit);
  }
  if (usFacilitySlug) {
    for (const p of sameCountry) {
      if (facilityTypeSlugForPrison(p) === usFacilitySlug) push(p);
      if (takeUntilLimit()) return out.slice(0, limit);
    }
  }
  if (useOperatorBucket) {
    for (const p of sameCountry) {
      if (getOperatorSlugForPrison(p) === opSlug) push(p);
      if (takeUntilLimit()) return out.slice(0, limit);
    }
  }
  for (const p of sameCountry) {
    if (p.securityLevel === prison.securityLevel) push(p);
    if (takeUntilLimit()) return out.slice(0, limit);
  }
  if (fnTrim) {
    for (const p of sameCountry) {
      if ((p.predominantFunction || "").trim() === fnTrim) push(p);
      if (takeUntilLimit()) return out.slice(0, limit);
    }
  }

  const rest = sameCountry
    .filter((p) => !seen.has(p.slug))
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const p of rest) {
    push(p);
    if (takeUntilLimit()) return out.slice(0, limit);
  }

  if (out.length < Math.min(4, limit)) {
    for (const p of prisons) {
      if (p.slug === prison.slug || seen.has(p.slug)) continue;
      if (p.countrySlug === prison.countrySlug || p.securityLevel === prison.securityLevel) {
        push(p);
        if (takeUntilLimit()) break;
      }
    }
  }

  return out.slice(0, limit);
}
