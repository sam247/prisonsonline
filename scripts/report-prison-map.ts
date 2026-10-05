import fs from "node:fs";
import { getPrisonMapRecords } from "../src/lib/prison-map/records";
import { coreUsFacilityName } from "../src/lib/verification/normalize";
import { prisons } from "../src/data/prisons";

const records = getPrisonMapRecords();
const refresh = JSON.parse(fs.readFileSync("data/verification/reports/prison-map-coordinate-refresh.json", "utf8"));
const groups = new Map<string, string[]>();
for (const record of records.filter(p => !p.exclusion)) {
  const key = `${record.latitude},${record.longitude}`;
  groups.set(key, [...(groups.get(key) ?? []), record.id]);
}
const duplicates = prisons.filter(p => p.countrySlug === "united-states").flatMap(legacy =>
  prisons.filter(p => p.countrySlug === "us" && coreUsFacilityName(p.name) === coreUsFacilityName(legacy.name))
    .map(p => `${legacy.countrySlug}/${legacy.slug} ↔ ${p.countrySlug}/${p.slug}`));
const uk = records.filter(p => p.country === "uk" && !p.exclusion).length;
const us = records.filter(p => p.country === "us" && !p.reentryOffice && !p.exclusion).length;
const offices = records.filter(p => p.reentryOffice && !p.exclusion).length;
const report = `# Prison Map data-quality review\n\nGenerated from the canonical inventory. Coordinate refresh checked: ${refresh.checkedAt}.\n\n## Coverage\n\n- UK: ${uk}/${records.filter(p => p.country === "uk").length} postcode locations.\n- US: ${us} prison/facility profiles (including legacy profiles); ${offices} optional reentry offices, off by default.\n- Coordinates are not promises of exact visitor entrances. UK coordinates are postcode locations; ${records.filter(p => p.id.startsWith("united-states/") && !p.exclusion).length} legacy US profiles retain existing manual coordinates.\n\n## Excluded records\n\n${records.filter(p => p.exclusion).map(p => `- ${p.id}: ${p.exclusion}`).join("\n")}\n\n## Authoritative refresh review\n\n${refresh.error ? `Refresh failed; canonical source preserved: ${refresh.error}\n` : ""}${refresh.issues.map((issue: { id: string; reason: string; evidence?: unknown }) => `- ${issue.id}: ${issue.reason}${issue.evidence ? ` — ${JSON.stringify(issue.evidence)}` : ""}`).join("\n")}\n\n## Shared coordinates and possible duplicate profiles\n\n${Array.from(groups.values()).filter(g => g.length > 1).map(g => `- Shared coordinates: ${g.join(", ")}. Review for shared sites/postcodes; records retained.`).join("\n")}\n${duplicates.map(pair => `- Possible same facility: ${pair}. Profiles retained; identity/status review needed.`).join("\n")}\n\n## Other review notes\n\n- uk/hmp-brixton: canonical postcode SW2 5XF was resolved by the existing postcodes.io build; included as an approximate postcode location.\n${records.some(p => p.id === "uk/prison-122") ? "- uk/prison-122: missing name/address/postcode; cannot be mapped reliably." : "- The former empty uk/prison-122 record is no longer present in the canonical inventory."}\n- US state code RQ is interpreted as Puerto Rico in the map projection, with the canonical address and state source unchanged.\n- UK region values mix management groups with geography; no geographic UK region filter is exposed.\n- Security classifications include inferred labels; no security filter is exposed.\n- No general active/closed status field exists. Alcatraz is explicitly historic, evidenced by https://www.nps.gov/alca/learn/historyculture/index.htm. Missing status is not interpreted as active.\n\nRun existing country verifier commands for review; this report does not authorize address changes, profile consolidation or database cleanup.\n`;
fs.writeFileSync("data/verification/reports/prison-map-data-quality.md", report);
console.log(`UK ${uk}; US profiles ${us}; optional offices ${offices}; excluded ${records.filter(p => p.exclusion).length}.`);
