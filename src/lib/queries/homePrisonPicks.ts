import type { Prison } from "@/types/prison";

/** Pick up to `limit` prisons, preferring at most one per `regionSlug` for visual diversity on the homepage. */
export function pickPrisonsDiverseRegions(candidates: Prison[], limit: number): Prison[] {
  const byRegion = new Map<string, Prison[]>();
  for (const p of candidates) {
    const k = p.regionSlug || "_";
    if (!byRegion.has(k)) byRegion.set(k, []);
    byRegion.get(k)!.push(p);
  }
  const out: Prison[] = [];
  const keys = Array.from(byRegion.keys()).sort((a, b) => a.localeCompare(b));
  for (const k of keys) {
    if (out.length >= limit) break;
    const arr = byRegion.get(k)!;
    arr.sort((a, b) => a.slug.localeCompare(b.slug));
    out.push(arr[0]);
  }
  const pool = [...candidates].sort((a, b) => a.slug.localeCompare(b.slug));
  for (const p of pool) {
    if (out.length >= limit) break;
    if (!out.some((x) => x.slug === p.slug)) out.push(p);
  }
  return out.slice(0, limit);
}
