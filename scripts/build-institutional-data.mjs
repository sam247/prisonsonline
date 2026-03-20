#!/usr/bin/env node
/**
 * Reads hmpps_hmcts_json/*.json and writes src/data/generated/*.ts
 * Run: node scripts/build-institutional-data.mjs [--strict]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "hmpps_hmcts_json");
const OUT = path.join(ROOT, "src/data/generated");

const strict = process.argv.includes("--strict");

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

const UK_POSTCODE = /([A-Z]{1,2}\d[A-Z0-9]?\s*\d[A-Z]{2})\b/i;

function extractPostcode(text) {
  if (!text) return "";
  const m = String(text).match(UK_POSTCODE);
  return m ? m[1].toUpperCase().replace(/\s+/, " ") : "";
}

function parseLabelledLines(description) {
  const lines = String(description || "").split(/\r?\n/).map((l) => l.trim());
  const map = {};
  let key = null;
  const buf = [];
  const flush = () => {
    if (key) map[key] = buf.join("\n").trim();
    key = null;
    buf.length = 0;
  };
  for (const line of lines) {
    if (!line) continue;
    const m = line.match(/^([A-Za-z][^:]{0,60}):\s*(.*)$/);
    if (m && !line.startsWith("http")) {
      flush();
      key = m[1].trim();
      buf.push(m[2]);
    } else if (key) buf.push(line);
  }
  flush();
  return map;
}

function mapSecurityLevel(p) {
  const pf = `${p["Predominant Function"] || ""} ${p["Cohort of Prisoners Held"] || ""}`.toLowerCase();
  const op = `${p.Operator || ""} ${p["Prison Sub-Group 1"] || ""}`.toLowerCase();
  if (pf.includes("high security")) return "Category A";
  if (/\bcat\s*a\b|category\s*a/.test(pf)) return "Category A";
  if (/\bcat\s*b\b|category\s*b/.test(pf)) return "Category B";
  if (/\bcat\s*c\b|category\s*c/.test(pf)) return "Category C";
  if (/\bcat\s*d\b|category\s*d|open prison/.test(pf)) return "Category D";
  if (pf.includes("reception") && !pf.includes("trainer")) return "Category B";
  if (pf.includes("trainer") && pf.includes("cat c")) return "Category C";
  if (op.includes("privately") || /\bserco\b|\bg4s\b|\bsodexo\b/.test(op)) return "Multi";
  return "Multi";
}

function guessCity(address, postcode) {
  if (!address) return "";
  let a = address.replace(/\s+/g, " ").trim();
  if (postcode) a = a.replace(new RegExp(postcode.replace(/ /g, "\\s*"), "i"), "").trim();
  const parts = a.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  const last = parts[parts.length - 1];
  if (/^(UK|England|Wales|Scotland|Northern Ireland)$/i.test(last)) return parts[parts.length - 2] || parts[0];
  return parts[parts.length - 1] || parts[0];
}

function synthesiseNarrative(name, p) {
  const info = (p.Information || "").trim();
  const overview =
    info ||
    `${name} is a prison establishment in England and Wales listed in official HMPPS administrative data.`;
  const history = `Detailed historical narrative for ${name} is not part of the imported dataset. This profile reflects current listing fields (region, function, operator, and cohort) from HMPPS data.`;
  const cohort = p["Cohort of Prisoners Held"] || "";
  const fn = p["Predominant Function"] || "";
  const gender = p.Gender || "";
  const prisonLife = [
    cohort && `Cohort: ${cohort}.`,
    fn && `Predominant function: ${fn}.`,
    gender && `Gender provision: ${gender}.`,
    "Day-to-day regime details should be confirmed with the establishment or official prison finder information.",
  ]
    .filter(Boolean)
    .join(" ");
  const phone = (p.Telephone || "").replace(/\s+/g, " ").trim();
  const visitingInfo = phone
    ? `For visits and bookings, contact the establishment on ${phone}. Always follow the latest official guidance published for visitors.`
    : "Contact the establishment for up-to-date visiting arrangements. Check GOV.UK for official visitor information.";
  return { overview, history, prisonLife, visitingInfo };
}

function uniqueSlug(base, used) {
  let s = slugify(base) || "prison";
  let n = s;
  let i = 2;
  while (used.has(n)) {
    n = `${s}-${i}`;
    i++;
  }
  used.add(n);
  return n;
}

function normaliseHmppsPrison(raw, usedSlugs) {
  const p = parseLabelledLines(raw.description);
  const regionName = (p["Prison Region"] || "Unknown region").trim();
  const regionSlug = slugify(regionName);
  const slug = uniqueSlug(raw.id || raw.name, usedSlugs);
  const addressLine = (p.Address || "").replace(/\s+/g, " ").trim();
  const postcode = extractPostcode(addressLine) || extractPostcode(raw.description);
  const city = guessCity(addressLine, postcode) || guessCity(p.Address || "", postcode);
  const { overview, history, prisonLife, visitingInfo } = synthesiseNarrative(raw.name, p);
  const lat = raw.latitude != null && !Number.isNaN(Number(raw.latitude)) ? Number(raw.latitude) : 0;
  const lng = raw.longitude != null && !Number.isNaN(Number(raw.longitude)) ? Number(raw.longitude) : 0;

  return {
    name: raw.name,
    slug,
    country: "United Kingdom",
    countrySlug: "uk",
    stateOrRegion: regionName,
    regionSlug,
    city: city || "—",
    securityLevel: mapSecurityLevel(p),
    capacity: 0,
    operator: (p.Operator || "Not specified").replace(/\s+/g, " ").trim(),
    openedYear: 0,
    latitude: lat,
    longitude: lng,
    type: [p["Cohort of Prisoners Held"], p["Predominant Function"]].filter(Boolean).join(" · ") || "Prison",
    overview,
    history,
    prisonLife,
    visitingInfo,
    institutionalId: `hmpps-prison:${raw.id}`,
    dataProvenance: "hmpps_import",
    address: addressLine || undefined,
    postcode: postcode || undefined,
    phone: (p.Telephone || "").replace(/\s+/g, " ").trim() || undefined,
    gender: (p.Gender || "").trim() || undefined,
    predominantFunction: (p["Predominant Function"] || "").trim() || undefined,
    cohort: (p["Cohort of Prisoners Held"] || "").trim() || undefined,
    prisonSubGroup1: (p["Prison Sub-Group 1"] || "").trim() || undefined,
    prisonSubGroup2: (p["Prison Sub-Group 2"] || "").trim().replace(/^None$/i, "") || undefined,
    shortDescription: (p.Information || "").trim() || undefined,
    source: "hmpps_hmcts_json/hmpps_prisons_only.json",
    sourceType: "hmpps_prison",
    sourceRaw: {
      id: raw.id,
      name: raw.name,
      type: raw.type,
      source_group: raw.source_group,
      description: raw.description,
      styleUrl: raw.styleUrl,
      latitude: raw.latitude,
      longitude: raw.longitude,
    },
  };
}

function normaliseProbation(raw, usedSlugs) {
  const p = parseLabelledLines(raw.description);
  const regionName = (p["Probation Region"] || "").trim() || "Unknown";
  const slug = uniqueSlug(raw.id || raw.name, usedSlugs);
  const addr = (p.Address || "").replace(/\s+/g, " ").trim();
  const postcode = extractPostcode(addr) || extractPostcode(raw.description);
  const phone = (p["Office Phone Number"] || "").replace(/\s+/g, " ").trim() || undefined;
  return {
    institutionalId: `hmpps-probation:${raw.id}`,
    slug,
    name: raw.name,
    country: "United Kingdom",
    countrySlug: "uk",
    region: regionName,
    regionSlug: slugify(regionName),
    address: addr || undefined,
    postcode: postcode || undefined,
    phone,
    buildingType: (p["Type of Building"] || "").trim() || undefined,
    localAuthority: (p["Local Authority"] || "").trim() || undefined,
    type: "probation_centre",
    source: "hmpps_hmcts_json/hmpps_probation_centres.json",
    sourceType: "hmpps_probation",
    sourceRaw: {
      id: raw.id,
      name: raw.name,
      type: raw.type,
      source_group: raw.source_group,
      description: raw.description,
      styleUrl: raw.styleUrl,
      latitude: raw.latitude,
      longitude: raw.longitude,
    },
  };
}

function normaliseHmcts(raw, usedSlugs) {
  const p = parseLabelledLines(raw.description);
  const addr = (p.Address || p.Adress || "")
    .replace(/\s+/g, " ")
    .trim();
  let postcode = (p.Postcode || "").replace(/\s+/g, " ").trim();
  if (!postcode) postcode = extractPostcode(addr) || extractPostcode(raw.description);
  const slug = uniqueSlug(raw.id || raw.name, usedSlugs);
  return {
    institutionalId: `hmcts:${raw.id}`,
    slug,
    name: raw.name.replace(/\s+/g, " ").trim(),
    country: "United Kingdom",
    countrySlug: "uk",
    address: addr || undefined,
    postcode: postcode || undefined,
    courtRegion: (p["Court Region"] || "").trim() || undefined,
    jurisdiction: (p["Jurisdiction (From MDS)"] || p["Jurisdiction"] || "").trim() || undefined,
    type: "hmcts_site",
    source: "hmpps_hmcts_json/hmcts_sites.json",
    sourceType: "hmcts_site",
    sourceRaw: {
      id: raw.id,
      name: raw.name,
      type: raw.type,
      source_group: raw.source_group,
      description: raw.description,
      styleUrl: raw.styleUrl,
      latitude: raw.latitude,
      longitude: raw.longitude,
    },
  };
}

function emitTsFile(fileName, header, body) {
  const content = `${header}\n${body}\n`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, fileName), content, "utf8");
}

function serialiseExport(name, data) {
  return `export const ${name} = ${JSON.stringify(data, null, 2)} as const;\n`;
}

function main() {
  const report = { errors: [], warnings: [] };

  const prisonsJson = JSON.parse(fs.readFileSync(path.join(RAW, "hmpps_prisons_only.json"), "utf8"));
  const probationJson = JSON.parse(fs.readFileSync(path.join(RAW, "hmpps_probation_centres.json"), "utf8"));
  const hmctsJson = JSON.parse(fs.readFileSync(path.join(RAW, "hmcts_sites.json"), "utf8"));
  const mapJson = fs.existsSync(path.join(RAW, "hmpps_sites_map.json"))
    ? JSON.parse(fs.readFileSync(path.join(RAW, "hmpps_sites_map.json"), "utf8"))
    : [];

  const usedPrison = new Set();
  const prisons = prisonsJson.map((r) => normaliseHmppsPrison(r, usedPrison));

  prisons.forEach((p) => {
    if (!p.stateOrRegion || p.stateOrRegion === "Unknown region") report.warnings.push(`Missing region: ${p.slug}`);
    if (!p.postcode) report.warnings.push(`Missing postcode: ${p.slug}`);
    if (!p.phone) report.warnings.push(`Missing phone: ${p.slug}`);
  });

  const usedProb = new Set();
  const probation = probationJson.map((r) => normaliseProbation(r, usedProb));

  const usedHmcts = new Set();
  const hmcts = hmctsJson.map((r) => normaliseHmcts(r, usedHmcts));

  const regionCounts = new Map();
  for (const p of prisons) {
    regionCounts.set(p.regionSlug, (regionCounts.get(p.regionSlug) || 0) + 1);
  }
  const ukRegions = [...new Set(prisons.map((p) => p.regionSlug))]
    .map((slug) => {
      const name = prisons.find((p) => p.regionSlug === slug)?.stateOrRegion || slug;
      return { slug, name, prisonCount: regionCounts.get(slug) || 0 };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const operatorCounts = new Map();
  for (const p of prisons) {
    const op = p.operator || "Not specified";
    operatorCounts.set(op, (operatorCounts.get(op) || 0) + 1);
  }
  const operators = [...operatorCounts.entries()]
    .map(([name, prisonCount]) => ({ slug: slugify(name) || "unknown", name, prisonCount }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const expectedMap = prisons.length + probation.length + hmcts.length;
  if (mapJson.length && mapJson.length !== expectedMap) {
    report.warnings.push(`hmpps_sites_map.json count ${mapJson.length} !== split sum ${expectedMap}`);
  }

  const prisonSlugs = prisons.map((p) => p.slug);
  const seen = new Set();
  for (const s of prisonSlugs) {
    if (seen.has(s)) report.errors.push(`Duplicate prison slug: ${s}`);
    seen.add(s);
  }

  const header = `/* eslint-disable */\n/** Auto-generated by scripts/build-institutional-data.mjs — do not edit by hand */\n`;

  emitTsFile(
    "ukPrisons.generated.ts",
    `${header}import type { Prison } from "@/types/prison";\n`,
    `${serialiseExport("ukPrisonsGeneratedRaw", prisons)}\nexport const ukPrisonsGenerated: Prison[] = [...ukPrisonsGeneratedRaw];\n`,
  );

  emitTsFile(
    "probationCentres.generated.ts",
    `${header}import type { ProbationCentre } from "@/types/institutional";\n`,
    `${serialiseExport("probationCentresGeneratedRaw", probation)}\nexport const probationCentresGenerated: ProbationCentre[] = [...probationCentresGeneratedRaw];\n`,
  );

  emitTsFile(
    "hmctsSites.generated.ts",
    `${header}import type { HmctsSite } from "@/types/institutional";\n`,
    `${serialiseExport("hmctsSitesGeneratedRaw", hmcts)}\nexport const hmctsSitesGenerated: HmctsSite[] = [...hmctsSitesGeneratedRaw];\n`,
  );

  emitTsFile("ukRegions.generated.ts", header, serialiseExport("ukRegionsGenerated", ukRegions));

  emitTsFile("ukOperators.generated.ts", header, serialiseExport("ukOperatorsGenerated", operators));

  emitTsFile(
    "generatedIndex.ts",
    `${header}export { ukPrisonsGenerated } from "./ukPrisons.generated";\nexport { probationCentresGenerated } from "./probationCentres.generated";\nexport { hmctsSitesGenerated } from "./hmctsSites.generated";\nexport { ukRegionsGenerated } from "./ukRegions.generated";\nexport { ukOperatorsGenerated } from "./ukOperators.generated";\n`,
    "",
  );

  console.log("--- institutional data build ---");
  console.log("Prisons (UK):", prisons.length);
  console.log("Probation centres:", probation.length);
  console.log("HMCTS sites:", hmcts.length);
  console.log("Map file (validation):", mapJson.length);
  console.log("UK regions:", ukRegions.length);
  console.log("UK operators:", operators.length);
  if (report.warnings.length) {
    console.log("Warnings:", report.warnings.length, "(show first 15)");
    report.warnings.slice(0, 15).forEach((w) => console.log("  -", w));
  }
  if (report.errors.length) {
    console.error("Errors:", report.errors);
    if (strict) process.exit(1);
  }

  console.log("Written to", OUT);
}

main();
