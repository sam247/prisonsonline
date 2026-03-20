import type { Prison } from "@/types/prison";

export interface PrisonFilter {
  countrySlug?: string;
  regionSlug?: string;
  city?: string;
  securityLevel?: Prison["securityLevel"];
  typeContains?: string;
}

/** Query helper for future collection pages; safe to use from server components. */
export function prisonsWhere(prisons: Prison[], f: PrisonFilter): Prison[] {
  return prisons.filter((p) => {
    if (f.countrySlug && p.countrySlug !== f.countrySlug) return false;
    if (f.regionSlug && p.regionSlug !== f.regionSlug) return false;
    if (f.city && p.city.toLowerCase() !== f.city.toLowerCase()) return false;
    if (f.securityLevel && p.securityLevel !== f.securityLevel) return false;
    if (f.typeContains && !p.type.toLowerCase().includes(f.typeContains.toLowerCase())) return false;
    return true;
  });
}
