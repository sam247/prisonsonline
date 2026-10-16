/**
 * Display formatting for official-source international profiles (ca, au, nz, ie, za).
 * Pure functions; shared by the profile view, cards and tests.
 */

const REGION_ABBREVIATIONS: Record<string, string[]> = {
  // Australia
  "new south wales": ["NSW"], victoria: ["VIC", "Vic"], queensland: ["QLD", "Qld"], "south australia": ["SA"],
  "western australia": ["WA"], tasmania: ["TAS", "Tas"], "northern territory": ["NT"], "australian capital territory": ["ACT"],
  // Canada
  ontario: ["ON", "Ont"], quebec: ["QC", "Que"], "british columbia": ["BC"], alberta: ["AB", "Alta"], saskatchewan: ["SK", "Sask"],
  manitoba: ["MB", "Man"], "nova scotia": ["NS"], "new brunswick": ["NB"], "newfoundland and labrador": ["NL"],
  "prince edward island": ["PE", "PEI"], yukon: ["YT"], "northwest territories": ["NT"], nunavut: ["NU"],
};

function norm(s: string): string {
  return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function containsPhrase(haystack: string, needle: string, caseSensitive = false): boolean {
  const h = caseSensitive ? haystack : norm(haystack);
  const n = caseSensitive ? needle : norm(needle);
  const esc = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${esc}($|[^\\p{L}\\p{N}])`, "u").test(h);
}

/** True when the address line already names the place (or, for a region, its official abbreviation). */
export function addressMentions(address: string, place: string): boolean {
  if (!place.trim()) return true;
  if (containsPhrase(address, place)) return true;
  return (REGION_ABBREVIATIONS[norm(place.trim())] ?? []).some((abbr) => containsPhrase(address, abbr, true));
}

/** Address line plus only the city / region / postcode it doesn't already contain. */
export function formatIntlAddress(p: { address?: string; city?: string; stateOrRegion?: string; postcode?: string }): string {
  const parts: string[] = [];
  const line = p.address?.trim() ?? "";
  if (line) parts.push(line);
  for (const extra of [p.city, p.stateOrRegion, p.postcode]) {
    const v = extra?.trim();
    if (!v) continue;
    const sofar = parts.join(", ");
    if (sofar && addressMentions(sofar, v)) continue;
    parts.push(v);
  }
  return parts.join(", ");
}

const REGIME = /^(.*?)\s*\((closed|open|semi-open)\)\s*$/i;

/**
 * Security classification for display. Official text is kept, but it is phrased so it cannot be read as
 * facility status: Irish Prison Service "Medium (closed)" → "Medium security (closed regime)". Any other
 * clause that says something is closed (e.g. a unit closed since 2020) is dropped from the classification.
 */
export function formatIntlSecurity(raw?: string | null): string | undefined {
  let s = raw?.trim();
  if (!s || /^not specified$/i.test(s)) return undefined;
  const regime = REGIME.exec(s);
  if (regime) {
    const level = regime[1].trim();
    return `${level}${/security/i.test(level) ? "" : " security"} (${regime[2].toLowerCase()} regime)`;
  }
  // Drop parenthetical clauses that mention closure; they describe units, not security.
  s = s.replace(/\s*\([^)]*\bclosed\b[^)]*\)/gi, "").trim();
  if (/\bclosed\b/i.test(s)) return undefined;
  if (!s) return undefined;
  return /security|classification|ratings?|levels?/i.test(s) ? s : `${s} security`;
}
