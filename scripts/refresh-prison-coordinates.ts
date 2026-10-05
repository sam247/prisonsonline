import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { HttpGet } from "../src/lib/verification/govukClient";
import { usPrisonsGenerated } from "../src/data/generated/usPrisons.generated";
import { getFacilityVerification } from "../src/data/facilitySources";
import { publishedFacts } from "../src/lib/verification/publishedFacts";
import { defaultUsHttpGet, fetchBopLocations } from "../src/lib/verification/bopClient";
import { matchBopLocation } from "../src/lib/verification/discoverUsSource";
import { BOP_LOCATIONS_URL } from "../src/lib/verification/usSourcePolicy";
import { bopLocationConflicts, validCoordinates } from "../src/lib/prison-map/location";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export async function refreshPrisonCoordinates(options: { inputPath?: string; reportFile?: string; httpGet?: HttpGet } = {}) {
  const input = options.inputPath ?? path.join(root, "us_prisons_clean_bundle/us_prisons_clean.json");
  const reportPath = options.reportFile ?? path.join(root, "data/verification/reports/prison-map-coordinate-refresh.json");
  const checkedAt = new Date().toISOString();
  const report: { checkedAt: string; source: string; enriched: number; issues: { id: string; reason: string; evidence?: unknown }[]; error?: string } = { checkedAt, source: BOP_LOCATIONS_URL, enriched: 0, issues: [] };
  try {
    const locations = await fetchBopLocations(options.httpGet ?? defaultUsHttpGet(30000));
    // ponytail: <50 catches obvious truncation; prefer source version/count guarantees if BOP adds them.
    if (locations.length < 50 || locations.filter(p => validCoordinates(p.latitude, p.longitude, "us")).length < 50) throw new Error("BOP directory incomplete or coordinate schema unavailable; source data unchanged.");
    const raw = JSON.parse(await fs.readFile(input, "utf8"));
    if (!Array.isArray(raw) || raw.length !== usPrisonsGenerated.length || new Set(raw.map(row => row?.slug)).size !== raw.length) throw new Error("Rebuild canonical US records before refreshing; source/generated inventory differs.");
    const canonical = new Map(usPrisonsGenerated.map(p => [p.slug, p]));
    const enriched = raw.map(row => {
      const prison = canonical.get(row.slug);
      if (!prison) throw new Error(`Canonical record missing: ${row.slug}`);
      if (["name", "address", "postcode", "city", "state", "facilityType"].some(field => row[field] !== prison.sourceRaw?.[field])) throw new Error(`Rebuild canonical US records before refreshing: stale generated facts for ${row.slug}`);
      const location = matchBopLocation(prison, locations);
      const facts = publishedFacts(prison, getFacilityVerification(prison.countrySlug, prison.slug));
      const conflicts = location ? bopLocationConflicts({ ...prison, address: facts.address, postcode: facts.postcode }, location) : ["No unique match in official BOP directory"];
      if (location && !validCoordinates(location.latitude, location.longitude, "us")) conflicts.push("Invalid official coordinates");
      if (row.state === "RQ") report.issues.push({ id: `us/${row.slug}`, reason: "Legacy state code RQ; official BOP uses PR (Puerto Rico)", evidence: { published: row.state, official: location?.state } });
      if (conflicts.length || !location) {
        report.issues.push({ id: `us/${row.slug}`, reason: conflicts.join(", "), evidence: location ? { published: { address: facts.address, postcode: facts.postcode, city: prison.city, state: row.state }, official: { address: location.address, postcode: location.zipCode, city: location.city, state: location.state } } : undefined });
        const { latitude, longitude, coordinateEvidence, ...unchanged } = row;
        return unchanged;
      }
      report.enriched++;
      return { ...row, latitude: location.latitude, longitude: location.longitude, coordinateEvidence: {
        precision: "facility", source: BOP_LOCATIONS_URL, checkedAt,
        address: location.address, postcode: location.zipCode, city: location.city,
        stateCode: location.state, facilityType: location.type,
      } };
    });
    await fs.writeFile(`${input}.tmp`, `${JSON.stringify(enriched, null, 2)}\n`);
    await fs.rename(`${input}.tmp`, input);
  } catch (error) {
    report.error = error instanceof Error ? error.message : String(error);
    report.enriched = 0;
  } finally {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void refreshPrisonCoordinates().then(report => {
    console.log(report.error ?? `Enriched ${report.enriched} canonical US records; ${report.issues.length} review issues.`);
    if (report.error) process.exitCode = 1;
  });
}
