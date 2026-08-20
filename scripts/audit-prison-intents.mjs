import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const intents = ["visiting-times", "contact-details", "booking-a-visit", "what-to-expect"];
const usRollout = ["florence-admax-usp", "alderson-fpc", "manchester-fci", "brooklyn-mdc", "atlanta-fci", "coleman-i-usp"];

function generatedArray(file, endMarker) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const assignment = source.indexOf("= [");
  const start = assignment < 0 ? -1 : assignment + 2;
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Could not parse ${file}`);
  return JSON.parse(source.slice(start, end + 1));
}

function readEvidence(file, metricNames) {
  const out = new Map();
  if (!fs.existsSync(file)) return out;
  const [header, ...rows] = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const columns = header.split(",");
  for (const row of rows) {
    const values = row.split(",");
    const record = Object.fromEntries(columns.map((column, index) => [column, values[index] ?? ""]));
    const url = record.url?.replace(/\/$/, "");
    if (!url) continue;
    out.set(url, Object.fromEntries(metricNames.map((name) => [name, Number(record[name]) || 0])));
  }
  return out;
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const uk = generatedArray("src/data/generated/ukPrisons.generated.ts", "] as const;");
const us = generatedArray("src/data/generated/usPrisons.generated.ts", "];\n").filter((prison) => usRollout.includes(prison.slug));
const prisons = [...uk, ...us];
if (prisons.length !== 129) throw new Error(`Expected 129 rollout prisons, found ${prisons.length}`);

const sourceRegistry = fs.readFileSync(path.join(root, "src/data/facilitySources.ts"), "utf8");
const verified = new Set([
  ...sourceRegistry.matchAll(/govRecord\("([^"]+)"/g),
  ...sourceRegistry.matchAll(/prisonSlug:\s*"([^"]+)"/g),
].map((match) => match[1]));

const growthDir = path.join(root, "data/growth");
const bing = readEvidence(path.join(growthDir, "bing-intent-pages-2026-08-20.csv"), ["bing_clicks", "bing_impressions", "bing_avg_position"]);
const gsc = readEvidence(path.join(growthDir, "gsc-intent-pages-2026-08-20.csv"), ["gsc_clicks", "gsc_impressions"]);
const ga4 = readEvidence(path.join(growthDir, "ga4-intent-pages-2026-08-20.csv"), ["ga4_organic_sessions"]);

const rows = [];
for (const prison of prisons) {
  for (const intent of intents) {
    const url = `https://prisonsonline.com/prisons/${prison.countrySlug}/${prison.slug}/${intent}`;
    const metrics = { ...(bing.get(url) ?? {}), ...(gsc.get(url) ?? {}), ...(ga4.get(url) ?? {}) };
    const searchEvidence = (metrics.bing_clicks ?? 0) + (metrics.bing_impressions ?? 0) + (metrics.gsc_clicks ?? 0) + (metrics.gsc_impressions ?? 0) + (metrics.ga4_organic_sessions ?? 0) > 0;
    const hasFacts = Boolean(prison.address || prison.postcode || prison.phone);
    const isVerifiedContact = intent === "contact-details" && verified.has(prison.slug);
    let classification;
    let reason;
    if (searchEvidence) {
      classification = "KEEP";
      reason = "90-day Bing, GSC or GA4 evidence";
    } else if (isVerifiedContact) {
      classification = "KEEP";
      reason = "Primary-source fact block implemented";
    } else if (intent === "contact-details" && hasFacts) {
      classification = "ENRICH";
      reason = "Valid contact intent with structured facility facts; primary-source verification still required";
    } else {
      classification = "REVIEW";
      reason = "No measured demand in supplied exports and current content is substantially generic";
    }
    rows.push({
      url, prison: prison.name, prison_slug: prison.slug, country: prison.countrySlug, intent,
      page_family: `prison_${intent.replaceAll("-", "_")}`,
      bing_clicks: metrics.bing_clicks ?? 0, bing_impressions: metrics.bing_impressions ?? 0,
      bing_avg_position: metrics.bing_avg_position || "", gsc_clicks: metrics.gsc_clicks ?? 0,
      gsc_impressions: metrics.gsc_impressions ?? 0, ga4_organic_sessions: metrics.ga4_organic_sessions ?? 0,
      facility_specific_facts: hasFacts ? "yes" : "no", verified_source: isVerifiedContact ? "yes" : "no",
      classification, reason,
    });
  }
}

const outputDir = path.join(root, "docs/seo");
fs.mkdirSync(outputDir, { recursive: true });
const columns = Object.keys(rows[0]);
fs.writeFileSync(path.join(outputDir, "prison-intent-audit-2026-08-20.csv"), `${columns.join(",")}\n${rows.map((row) => columns.map((column) => csv(row[column])).join(",")).join("\n")}\n`);

const counts = Object.fromEntries(["KEEP", "ENRICH", "REVIEW", "REMOVE/NOINDEX CANDIDATE"].map((label) => [label, rows.filter((row) => row.classification === label).length]));
const markdown = `# Prison intent URL audit\n\nDate: 2026-08-20  \nAudit population: ${rows.length} pre-existing intent URLs (${prisons.length} prisons × four base intents).\n\n| Classification | Count |\n|---|---:|\n${Object.entries(counts).map(([label, count]) => `| ${label} | ${count} |`).join("\n")}\n\n## Evidence\n\n- Bing page statistics: 90 days ending 2026-08-20.\n- Google Search Console top-page export: 90 days ending 2026-08-20. The connector returned clicks but not impressions in this export.\n- GA4 organic-search sessions by landing page: 2026-05-23 to 2026-08-20.\n- Facility specificity and primary-source coverage: current repository data and verification registry.\n\n## Safety decision\n\nNo URL is classified as a removal/noindex candidate in this implementation. REVIEW means that the page requires a later evidence and content decision; it remains indexable and in the sitemap. The seven newly enabled legal-visit URLs are outside this 516-URL baseline and are source-qualified separately.\n`;
fs.writeFileSync(path.join(outputDir, "prison-intent-audit-2026-08-20.md"), markdown);
console.log(JSON.stringify({ total: rows.length, ...counts }, null, 2));
