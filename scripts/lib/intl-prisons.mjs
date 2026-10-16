/**
 * Shared builder for official-source international prison bundles.
 * intl_prisons_bundles/<cc>/<cc>_prisons.json → src/data/generated/<cc>Prisons.generated.ts
 * Fails (exit 1) on any schema violation; never loosens verification.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const INTL_COUNTRIES = {
  ca: { name: "Canada", regionField: "province", levels: ["federal", "provincial", "territorial"] },
  au: { name: "Australia", regionField: "region", levels: ["state", "territory"] },
  nz: { name: "New Zealand", regionField: "region", levels: ["national"] },
  ie: { name: "Ireland", regionField: "region", levels: ["national"] },
  za: { name: "South Africa", regionField: "region", levels: ["national"] },
};

const STATUSES = new Set(["open", "closed", "historic"]);
const OPERATOR_TYPES = new Set(["public", "private"]);
const SECURITY_UNION = new Set(["Minimum", "Low", "Medium", "High", "Maximum", "Supermax", "Multi"]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(s) {
  return String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function bundlePaths(cc) {
  const dir = path.join(ROOT, "intl_prisons_bundles", cc);
  return { dir, rows: path.join(dir, `${cc}_prisons.json`), excluded: path.join(dir, "excluded.json") };
}

export function readFrozenSlugs(cc) {
  const frozen = JSON.parse(fs.readFileSync(path.join(ROOT, "intl_prisons_bundles", "frozen-slugs.json"), "utf8"));
  return frozen[cc] ?? null;
}

/** Returns a list of human-readable violations (empty when the bundle is valid). */
export function validateBundle(cc, rows) {
  const cfg = INTL_COUNTRIES[cc];
  const errors = [];
  const seen = new Set();
  rows.forEach((r, i) => {
    const at = `${cc}[${i}] ${r.slug ?? "?"}`;
    for (const f of ["slug", "name", "country", "jurisdiction", "jurisdictionLevel", "operator", "operatorType", "status", "city", "sourceUrl", "checkedAt", cfg.regionField]) {
      if (typeof r[f] !== "string" || !r[f].trim()) errors.push(`${at}: missing ${f}`);
    }
    if (r.country !== cc) errors.push(`${at}: country must be "${cc}"`);
    if (r.slug && !SLUG_RE.test(r.slug)) errors.push(`${at}: invalid slug`);
    if (seen.has(r.slug)) errors.push(`${at}: duplicate slug`);
    seen.add(r.slug);
    if (!STATUSES.has(r.status)) errors.push(`${at}: invalid status ${r.status}`);
    if (!OPERATOR_TYPES.has(r.operatorType)) errors.push(`${at}: invalid operatorType ${r.operatorType}`);
    if (!cfg.levels.includes(r.jurisdictionLevel)) errors.push(`${at}: invalid jurisdictionLevel ${r.jurisdictionLevel}`);
    if (typeof r.sourceUrl === "string" && !/^https:\/\//.test(r.sourceUrl)) errors.push(`${at}: sourceUrl must be https`);
    if (r.capacity != null && (!Number.isInteger(r.capacity) || r.capacity <= 0 || !r.capacitySource)) errors.push(`${at}: capacity needs a positive integer and capacitySource`);
    const hasLat = r.latitude != null || r.longitude != null;
    if (hasLat && (r.coordinateEvidence?.precision !== "facility" || !r.coordinateEvidence?.source)) errors.push(`${at}: coordinates need facility-precision coordinateEvidence with a source`);
  });
  const frozen = readFrozenSlugs(cc);
  if (!frozen) errors.push(`${cc}: no frozen slug list`);
  else {
    const have = new Set(rows.map((r) => r.slug));
    for (const s of frozen) if (!have.has(s)) errors.push(`${cc}: frozen slug missing from bundle: ${s}`);
    for (const s of have) if (!frozen.includes(s)) errors.push(`${cc}: slug not in frozen list: ${s}`);
  }
  return errors;
}

function facilityLabel(cc, r) {
  if (cc === "ca") return r.jurisdictionLevel === "federal" ? "Federal correctional institution" : `${r.jurisdictionLevel === "territorial" ? "Territorial" : "Provincial"} correctional facility`;
  if (cc === "au") return `${r.operatorType === "private" ? "Privately operated" : "Publicly operated"} correctional centre`;
  return "Correctional facility";
}

export function toPrison(cc, r) {
  const cfg = INTL_COUNTRIES[cc];
  const region = r[cfg.regionField].trim();
  const type = r.facilityType?.trim() || facilityLabel(cc, r);
  const located = r.coordinateEvidence?.precision === "facility" && typeof r.latitude === "number" && typeof r.longitude === "number";
  const statusNote = r.status === "closed" && /temporarily closed/i.test(r.notes ?? "") ? "Temporarily closed" : undefined;
  const statusPhrase = r.status === "closed" ? ` It is listed by its official source as ${statusNote ? "temporarily closed" : "closed"}.` : r.status === "historic" ? " It is a historic site and no longer holds prisoners." : "";
  return {
    name: r.name.trim(),
    slug: r.slug,
    country: cfg.name,
    countrySlug: cc,
    stateOrRegion: region,
    regionSlug: slugify(region),
    city: r.city.trim(),
    securityLevel: SECURITY_UNION.has(r.securityLevel) ? r.securityLevel : "Not specified",
    ...(r.securityLevel && !/^not specified$/i.test(r.securityLevel.trim()) ? { securityDescription: r.securityLevel.trim() } : {}),
    capacity: r.capacity ?? 0,
    operator: r.operator,
    openedYear: r.yearOpened ?? 0,
    latitude: located ? r.latitude : 0,
    longitude: located ? r.longitude : 0,
    ...(located ? { coordinateEvidence: { precision: "facility", source: r.coordinateEvidence.source, ...(r.coordinateEvidence.checkedAt ? { checkedAt: r.coordinateEvidence.checkedAt } : {}) } } : {}),
    status: r.status,
    ...(r.statusSource ? { statusSource: r.statusSource } : {}),
    ...(statusNote ? { statusNote } : {}),
    type,
    overview: `${r.name.trim()} is a ${type.toLowerCase()} in ${r.city.trim()}, ${region}, operated by ${r.operator}.${statusPhrase}`,
    history: "",
    prisonLife: "",
    visitingInfo: "",
    institutionalId: `${cc}:${r.slug}`,
    dataProvenance: "official_source",
    ...(r.address ? { address: r.address } : {}),
    ...(r.postcode ? { postcode: r.postcode } : {}),
    jurisdiction: r.jurisdiction,
    jurisdictionLevel: r.jurisdictionLevel,
    operatorType: r.operatorType,
    sourceUrl: r.sourceUrl,
    ...(r.additionalSourceUrls?.length ? { additionalSourceUrls: r.additionalSourceUrls } : {}),
    sourceCheckedAt: r.checkedAt,
  };
}

export function buildCountry(cc) {
  const { rows: rowsPath } = bundlePaths(cc);
  const rows = JSON.parse(fs.readFileSync(rowsPath, "utf8"));
  const errors = validateBundle(cc, rows);
  if (errors.length) {
    console.error(`[intl:${cc}] bundle failed validation:\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  const prisons = rows.map((r) => toPrison(cc, r));
  const exportName = `${cc}PrisonsGenerated`;
  const out = path.join(ROOT, "src", "data", "generated", `${cc}Prisons.generated.ts`);
  const body = `/* eslint-disable */\n/** Auto-generated by scripts/build-${cc}-prisons.mjs from intl_prisons_bundles/${cc}/ — do not edit by hand */\nimport type { Prison } from "@/types/prison";\n\nexport const ${exportName}: Prison[] = ${JSON.stringify(prisons, null, 2)};\n`;
  fs.writeFileSync(out, body);
  console.log(`[intl:${cc}] wrote ${prisons.length} prisons → ${path.relative(ROOT, out)}`);
}
