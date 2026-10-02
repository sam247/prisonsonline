/**
 * Deterministic town/city derivation from HMPPS UK prison address strings.
 *
 * HMPPS addresses end "…, <town>, [<county>,] <postcode>". The original generator took the last
 * comma part, so any address carrying a county showed the county as the city (e.g. Gartree →
 * "Leicestershire" instead of "Market Harborough"). This strips trailing parts that exactly match
 * a known county / county-level region (including standard postal abbreviations used in the data),
 * then takes the part before it. No inference beyond the address text:
 *  - bare city names that double as county names (Durham, Nottingham, York, Lincoln…) are NOT counties here;
 *  - if the remaining part is a qualifier ("Nr Woodbridge", "Stretton Nr Oakham") or an island
 *    ("Isle of Sheppey"), the original value is kept (ambiguous);
 *  - misspelt counties (e.g. "Sstaffordshire") are not matched and stay unchanged;
 *  - a town token known to be misspelt in the HMPPS feed is not promoted (kept ambiguous) so we
 *    never publish a typo as the city; fix those upstream or via an explicit data correction.
 */
export const UK_ADDRESS_COUNTIES = new Set(
  [
    "Bedfordshire", "Buckinghamshire", "Bucks", "Cambridgeshire", "Cheshire", "Cleveland", "County Durham",
    "Cumbria", "Derbyshire", "Devon", "Dorset", "East Sussex", "East Yorkshire", "Essex", "Glos",
    "Gloucestershire", "Hampshire", "Hertfordshire", "Kent", "Lancashire", "Lancs", "Leicestershire",
    "Lincolnshire", "Lincs", "Middlesex", "Monmouthshire", "Norfolk", "North Wales", "North Yorkshire",
    "Northamptonshire", "Northumberland", "Nottinghamshire", "Notts", "Oxfordshire", "OXON", "Rutland",
    "Shropshire", "Somerset", "South Wales", "South Yorkshire", "Staffordshire", "Suffolk", "Surrey",
    "Warwickshire", "West Midlands", "West Sussex", "West Yorkshire", "Wiltshire", "Worcestershire",
  ].map((c) => c.toLowerCase()),
);

const COUNTRY_PART = /^(UK|United Kingdom|England|Wales|Scotland|Northern Ireland)$/i;
const AMBIGUOUS_TOWN = /(^|\s)nr\.?(\s|$)|^isle of\s/i;
/** Town tokens misspelt in the HMPPS feed (HMP/YOI Swinfen Hall: "Linchfield" for Lichfield). */
const KNOWN_MISSPELT_TOWNS = new Set(["linchfield"]);

function addressParts(address, postcode) {
  if (!address) return [];
  let a = String(address).replace(/\s+/g, " ").trim();
  if (postcode) a = a.replace(new RegExp(String(postcode).replace(/\s+/g, "\\s*"), "i"), "").trim();
  return a.split(",").map((s) => s.trim()).filter(Boolean);
}

/** Legacy behaviour: last comma part (after dropping postcode / country). */
export function legacyCityFromAddress(address, postcode) {
  const parts = addressParts(address, postcode);
  if (parts.length === 0) return "";
  const last = parts[parts.length - 1];
  if (COUNTRY_PART.test(last)) return parts[parts.length - 2] || parts[0];
  return last || parts[0];
}

/**
 * County-aware city. Returns { city, reason } where reason is
 * "unchanged" | "county_stripped" | "ambiguous_kept".
 */
export function deriveCityFromAddress(address, postcode) {
  const legacy = legacyCityFromAddress(address, postcode);
  const parts = addressParts(address, postcode);
  while (parts.length && COUNTRY_PART.test(parts[parts.length - 1])) parts.pop();
  let stripped = false;
  while (parts.length > 1 && UK_ADDRESS_COUNTIES.has(parts[parts.length - 1].toLowerCase())) {
    parts.pop();
    stripped = true;
  }
  if (!stripped) return { city: legacy, reason: "unchanged" };
  const town = parts[parts.length - 1];
  if (!town || AMBIGUOUS_TOWN.test(town) || KNOWN_MISSPELT_TOWNS.has(town.toLowerCase())) return { city: legacy, reason: "ambiguous_kept" };
  return { city: town, reason: "county_stripped" };
}
