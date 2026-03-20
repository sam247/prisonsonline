#!/usr/bin/env node
/**
 * Reads us_prisons_clean_bundle/us_prisons_clean.json → src/data/generated/usPrisons.generated.ts
 * Run: node scripts/build-us-prisons.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "us_prisons_clean_bundle", "us_prisons_clean.json");
const OUT = path.join(ROOT, "src", "data", "generated", "usPrisons.generated.ts");

const STATE_CODE_TO_NAME = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function titleCaseWords(s) {
  return String(s || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function mapSecurityLevel(facilityType, slug, name) {
  const t = (facilityType || "").toLowerCase();
  const hay = `${slug} ${name}`.toLowerCase();
  if (hay.includes("admax") || hay.includes("adx")) return "Supermax";
  if (t === "usp") return "High";
  if (t === "fci") return "Medium";
  if (t === "fpc") return "Low";
  return "Multi";
}

function facilityTypeLabel(ft) {
  const u = String(ft || "other").toLowerCase();
  const map = {
    usp: "USP (United States Penitentiary)",
    fci: "FCI (Federal Correctional Institution)",
    fpc: "FPC (Federal Prison Camp)",
    fdc: "FDC (Federal Detention Center)",
    fmc: "FMC (Federal Medical Center)",
    mcc: "MCC (Metropolitan Correctional Center)",
    mdc: "MDC (Metropolitan Detention Center)",
    other: "Other BOP facility type",
  };
  return map[u] || `${u.toUpperCase()} (BOP)`;
}

function buildRecord(raw) {
  const code = String(raw.state || "").toUpperCase().trim();
  const stateName = STATE_CODE_TO_NAME[code] || code || "Unknown";
  const regionSlug = slugify(stateName);
  const facilityType = String(raw.facilityType || "other").toLowerCase();
  const name = titleCaseWords(raw.name || raw.slug.replace(/-/g, " "));
  const city = titleCaseWords(raw.city || "");

  const overview = `${name} is a Federal Bureau of Prisons (${facilityType.toUpperCase()}) facility in ${stateName}, listed in the BOP-derived dataset used in this site build. Security level shown here is a simplified directory label, not a substitute for official BOP classification.`;
  const history =
    "Detailed institutional history is not part of the imported BOP listing. Confirm dates, capacity, and regime with the Federal Bureau of Prisons or the facility’s official page.";
  const prisonLife =
    "Day-to-day regime and programmes are not included in this dataset. Use official BOP sources for population, programmes, and rules.";
  const visitingInfo =
    raw.phone
      ? `The import lists phone ${raw.phone}. Visiting rules change; confirm hours and requirements on the official BOP facility page before travelling.`
    : "Visiting information is not in this import. Use the official BOP facility page for current visiting rules.";

  return {
    name,
    slug: raw.slug,
    country: "United States (Federal)",
    countrySlug: "us",
    stateOrRegion: stateName,
    regionSlug,
    city,
    securityLevel: mapSecurityLevel(facilityType, raw.slug, raw.name),
    capacity: 0,
    operator: "Federal Bureau of Prisons",
    openedYear: 0,
    latitude: 0,
    longitude: 0,
    type: facilityType.toUpperCase(),
    overview,
    history,
    prisonLife,
    visitingInfo,
    institutionalId: `bop:${raw.slug}`,
    dataProvenance: "bop_import",
    address: raw.address || "",
    postcode: raw.postcode || "",
    phone: raw.phone || "",
    predominantFunction: facilityTypeLabel(facilityType),
    shortDescription: `${name} — ${facilityType.toUpperCase()} in ${stateName} (Federal BOP listing).`,
    source: "us_prisons_clean_bundle/us_prisons_clean.json",
    sourceType: "bop_prison",
    facilityType,
    sourceRaw: raw,
  };
}

function collectSlugsFromTs(filePath, label) {
  if (!fs.existsSync(filePath)) return new Set();
  const t = fs.readFileSync(filePath, "utf8");
  const set = new Set();
  for (const m of t.matchAll(/"slug":\s*"([^"]+)"/g)) set.add(m[1]);
  return set;
}

const ukPath = path.join(ROOT, "src", "data", "generated", "ukPrisons.generated.ts");
const legacyPath = path.join(ROOT, "src", "data", "prisons.legacy-international.ts");
const reserved = new Set([...collectSlugsFromTs(ukPath, "uk"), ...collectSlugsFromTs(legacyPath, "legacy")]);

const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));
if (!Array.isArray(raw)) throw new Error("Expected JSON array");

const slugs = new Set();
const rows = [];
for (const r of raw) {
  if (!r.slug) continue;
  if (slugs.has(r.slug)) throw new Error(`Duplicate US slug: ${r.slug}`);
  if (reserved.has(r.slug)) throw new Error(`US slug collides with existing prison: ${r.slug}`);
  slugs.add(r.slug);
  rows.push(buildRecord(r));
}

rows.sort((a, b) => a.name.localeCompare(b.name, "en-US"));

const json = JSON.stringify(rows, null, 2);
const ts = `/* eslint-disable */
/** Auto-generated by scripts/build-us-prisons.mjs — do not edit by hand */
import type { Prison } from "@/types/prison";

export const usPrisonsGenerated: Prison[] = ${json};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, ts, "utf8");
console.log(`US prisons: ${rows.length} → ${path.relative(ROOT, OUT)}`);
