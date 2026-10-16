/**
 * Display-only helpers for UK prisons whose `stateOrRegion` is an HMPPS
 * functional prison group rather than a geographic region.
 * Data, slugs and URLs are unchanged; only visible labels differ.
 */
type PrisonLike = { countrySlug: string; stateOrRegion?: string | null };

/** Explicit list of HMPPS group values that are NOT geographic regions. */
export const HMPPS_NON_GEOGRAPHIC_GROUPS: ReadonlySet<string> = new Set([
  "LONG TERM & HIGH SECURITY ESTATE",
  "YOUTH CUSTODY SERVICE",
  "PRIVATELY MANAGED PRISON",
  "WOMENS PRISON GROUP",
]);

const READABLE_NAMES: Record<string, string> = {
  "LONG TERM & HIGH SECURITY ESTATE": "Long Term & High Security Estate",
  "YOUTH CUSTODY SERVICE": "Youth Custody Service",
  "PRIVATELY MANAGED PRISON": "Privately Managed Prisons",
  "WOMENS PRISON GROUP": "Women's Prison Group",
};

export function isHmppsGroupRegion(p: PrisonLike): boolean {
  return p.countrySlug === "uk" && HMPPS_NON_GEOGRAPHIC_GROUPS.has((p.stateOrRegion ?? "").trim().toUpperCase());
}

/** "HMPPS prison group: <Name>" for HMPPS groups; otherwise the raw region. */
export function regionDisplayLabel(p: PrisonLike): string {
  const raw = (p.stateOrRegion ?? "").trim();
  if (!isHmppsGroupRegion(p)) return raw;
  return `HMPPS prison group: ${READABLE_NAMES[raw.toUpperCase()]}`;
}

/** Link/heading text for the sibling-prisons hub. */
export function otherPrisonsInLabel(p: PrisonLike): string {
  return isHmppsGroupRegion(p) ? "Other prisons in this HMPPS group" : `Other prisons in ${p.stateOrRegion ?? ""}`;
}

export function prisonsInLabel(p: PrisonLike): string {
  return isHmppsGroupRegion(p) ? "Prisons in this HMPPS group" : `Prisons in ${p.stateOrRegion ?? ""}`;
}
