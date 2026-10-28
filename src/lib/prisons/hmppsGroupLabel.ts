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

/**
 * The region to show in visitor-facing location strings ("City, Region, Country").
 * Empty for HMPPS functional groups, which are not places; otherwise the raw region.
 */
export function geographicRegion(p: PrisonLike): string {
  return isHmppsGroupRegion(p) ? "" : (p.stateOrRegion ?? "").trim();
}

/**
 * True when a non-US region only repeats the city ("London" / "LONDON", "Dublin" / "Co. Dublin"),
 * so visible location lines can drop it. US states stay ("New York, New York" names two places).
 * Display only: meta, JSON-LD and copy helpers keep using geographicRegion().
 */
export function regionRepeatsCity(p: PrisonLike & { city?: string | null }, region: string): boolean {
  if (p.countrySlug === "us") return false;
  const norm = (v: string | null | undefined) => (v ?? "").trim().toLowerCase().replace(/^(co\.?|county)\s+/, "");
  const r = norm(region);
  return r !== "" && r === norm(p.city);
}

/** Readable name for a raw region string when it is an HMPPS group; otherwise null. */
export function hmppsGroupReadableName(raw: string | null | undefined): string | null {
  const key = (raw ?? "").trim().toUpperCase();
  return HMPPS_NON_GEOGRAPHIC_GROUPS.has(key) ? READABLE_NAMES[key] : null;
}

/**
 * Visible title-safe name for a UK region/group string: HMPPS groups become
 * "the <Readable Name> (HMPPS prison group)"-style labels via the callers below;
 * geographic regions are returned unchanged.
 */
export function regionTitleName(raw: string | null | undefined): string {
  return hmppsGroupReadableName(raw) ?? (raw ?? "").trim();
}

/** Visible hub/article heading: "Prisons in <Region>" or "<Group>: HMPPS prison group". */
export function prisonsInHeading(raw: string | null | undefined): string {
  const g = hmppsGroupReadableName(raw);
  return g ? `${g}: HMPPS prison group` : `Prisons in ${(raw ?? "").trim()}`;
}

/**
 * Visitor-facing name for a UK geographic HMPPS region (display only).
 * Raw values are upper case ("KENT, SURREY & SUSSEX"); this renders
 * "Kent, Surrey and Sussex". Already mixed-case values (e.g. "HMPPS Wales")
 * and non-UK regions are returned unchanged. Data is never modified.
 */
export function ukGeographicRegionDisplayName(p: PrisonLike): string {
  const raw = geographicRegion(p);
  if (p.countrySlug !== "uk" || !raw || raw !== raw.toUpperCase()) return raw;
  return raw
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*&\s*/g, " and ")
    .toLowerCase()
    .replace(/(^|[\s,])([a-z])/g, (_m, pre: string, c: string) => pre + c.toUpperCase())
    .replace(/\bAnd\b/g, "and");
}
