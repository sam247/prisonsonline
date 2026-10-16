import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { prisons, officialInternationalPrisons, getRelatedPrisons } from "@/data/prisons";
import { getRelatedPrisonsForProfile } from "@/lib/queries/relatedPrisons";
import { buildPrisonProfileEntries, buildPrisonIntentEntries } from "@/lib/seo/sitemapEntries";
import { getPrisonMapRecords } from "@/lib/prison-map/records";
import { getCountry } from "@/data/countries";
import { INTL_COUNTRIES, validateBundle, readFrozenSlugs, bundlePaths, toPrison } from "../scripts/lib/intl-prisons.mjs";
import { intlCountryRedirects } from "../config/intl-country-redirects.mjs";

const SHIPPED = Array.from(new Set(officialInternationalPrisons.map((p) => p.countrySlug)));
const STATUSES = new Set(["open", "closed", "historic"]);

test("each shipped country has a valid bundle matching its frozen slugs", () => {
  assert.ok(SHIPPED.length > 0);
  for (const cc of SHIPPED) {
    assert.ok(cc in INTL_COUNTRIES, `${cc} configured`);
    const rows = JSON.parse(fs.readFileSync(bundlePaths(cc).rows, "utf8"));
    assert.deepEqual(validateBundle(cc, rows), [], `${cc} bundle valid`);
    const generated = officialInternationalPrisons.filter((p) => p.countrySlug === cc).map((p) => p.slug);
    assert.deepEqual(generated, readFrozenSlugs(cc), `${cc} generated slugs equal frozen list, in order`);
    const excluded = JSON.parse(fs.readFileSync(bundlePaths(cc).excluded, "utf8"));
    for (const e of excluded) assert.ok(e.name && e.reason, `${cc} excluded entry has name and reason`);
  }
});

test("generated rows follow the schema", () => {
  for (const p of officialInternationalPrisons) {
    const at = `${p.countrySlug}/${p.slug}`;
    assert.equal(p.dataProvenance, "official_source", at);
    assert.match(p.sourceUrl ?? "", /^https:\/\//, `${at} sourceUrl`);
    assert.ok(p.jurisdiction && p.jurisdictionLevel && p.operator && p.city && p.stateOrRegion, `${at} required fields`);
    assert.ok(p.operatorType === "public" || p.operatorType === "private", `${at} operatorType`);
    assert.ok(STATUSES.has(p.status ?? ""), `${at} status`);
    if (p.latitude || p.longitude) assert.equal(p.coordinateEvidence?.precision, "facility", `${at} coordinates need facility evidence`);
    assert.doesNotMatch(`${p.overview} ${p.type}`, /import|dataset|placeholder/i, `${at} copy`);
    assert.equal(p.visitingInfo, "", `${at} no invented visiting copy`);
  }
});

test("slugs are unique per country and never collide with region slugs", () => {
  for (const cc of SHIPPED) {
    const rows = prisons.filter((p) => p.countrySlug === cc);
    const slugs = rows.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length, `${cc} unique prison slugs`);
    const regions = new Set(rows.map((p) => p.regionSlug));
    for (const s of slugs) assert.ok(!regions.has(s), `${cc}: prison slug ${s} collides with a region slug`);
  }
  // Frozen slugs shared by two countries. Routes are country-scoped, so URLs stay unique, but prison images
  // are keyed by bare slug, so a shared slug must never carry an image record until image lookup is country-aware.
  const FROZEN_CROSS_COUNTRY: Record<string, string[]> = { "prince-albert-correctional-centre": ["ca", "za"] };
  for (const p of officialInternationalPrisons) {
    const owners = prisons.filter((x) => x.slug === p.slug).map((x) => x.countrySlug).sort();
    if (FROZEN_CROSS_COUNTRY[p.slug]) {
      assert.deepEqual(owners, FROZEN_CROSS_COUNTRY[p.slug], `${p.slug} known cross-country owners`);
      assert.equal(p.facilityImage, undefined, `${p.slug} is shared across countries and must not carry a slug-keyed image`);
    } else assert.equal(owners.length, 1, `${p.slug} unique site-wide`);
  }
});

test("closed prisons stay out of sitemaps; no intent URLs for new countries", () => {
  const profiles = new Set(buildPrisonProfileEntries("https://x").map((e) => e.loc));
  for (const p of officialInternationalPrisons) {
    assert.equal(profiles.has(`https://x/prisons/${p.countrySlug}/${p.slug}`), p.status !== "closed", `${p.slug} sitemap membership`);
  }
  const intents = buildPrisonIntentEntries("https://x").map((e) => e.loc);
  for (const cc of SHIPPED) assert.ok(!intents.some((l) => l.includes(`/prisons/${cc}/`)), `${cc} has no intent URLs`);
});

test("related prisons stay within the same country", () => {
  for (const p of officialInternationalPrisons) {
    for (const r of getRelatedPrisonsForProfile(p, 8)) assert.equal(r.countrySlug, p.countrySlug, `${p.slug} → ${r.slug}`);
    for (const r of getRelatedPrisons(p)) assert.equal(r.countrySlug, p.countrySlug, `${p.slug} → ${r.slug}`);
  }
});

test("map plots only official facility-precision coordinates", () => {
  const records = getPrisonMapRecords();
  for (const cc of SHIPPED) {
    const rows = records.filter((r) => r.id.startsWith(`${cc}/`));
    assert.equal(rows.length, prisons.filter((p) => p.countrySlug === cc).length, `${cc} on the map list`);
    for (const r of rows) {
      const prison = prisons.find((p) => `${p.countrySlug}/${p.slug}` === r.id)!;
      if (r.exclusion) continue;
      assert.equal(r.country, cc);
      assert.equal(r.precision, "facility", r.id);
      assert.equal(prison.coordinateEvidence?.precision, "facility", r.id);
    }
  }
});

test("country directories: counts from data and legacy URLs redirect", () => {
  for (const cc of SHIPPED) {
    const country = getCountry(cc)!;
    assert.ok(country, `${cc} has a country profile`);
    const open = officialInternationalPrisons.filter((p) => p.countrySlug === cc && p.status === "open").length;
    assert.equal(country.prisonCount, open, `${cc} prisonCount derived from data`);
  }
  const map = new Map(intlCountryRedirects.map((r) => [r.source, r]));
  for (const [cc, name] of [["au", "australia"], ["ca", "canada"]] as const) {
    if (!SHIPPED.includes(cc)) continue;
    for (const source of [`/countries/${name}`, `/prisons/${name}`]) {
      assert.equal(map.get(source)?.destination, `/prisons/${cc}`, source);
      assert.equal(map.get(source)?.permanent, true, source);
    }
    assert.equal(getCountry(name), undefined, `legacy ${name} profile removed`);
  }
});

test("generated files are in sync with their bundles", () => {
  for (const cc of SHIPPED) {
    const rows = JSON.parse(fs.readFileSync(bundlePaths(cc).rows, "utf8"));
    const generated = officialInternationalPrisons.filter((p) => p.countrySlug === cc);
    assert.deepEqual(generated.map((p) => ({ ...p, facilityImage: undefined })), rows.map((r: unknown) => ({ ...toPrison(cc, r), facilityImage: undefined })), `${cc}: run npm run data:build:${cc}`);
  }
});

test("AU temporarily closed facilities are closed, labelled, and never listed as operating", () => {
  for (const slug of ["dawn-de-loas-correctional-centre", "oberon-correctional-centre"]) {
    const p = officialInternationalPrisons.find((x) => x.countrySlug === "au" && x.slug === slug);
    assert.ok(p, slug);
    assert.equal(p.status, "closed");
    assert.equal(p.statusNote, "Temporarily closed");
    assert.match(p.overview, /temporarily closed/);
  }
});

test("ZA uses official DCS regions and management areas; nothing inferred is shown", () => {
  const DCS_REGIONS = ["Eastern Cape", "Free State / Northern Cape", "Gauteng", "KwaZulu-Natal", "Limpopo, Mpumalanga & North West", "Western Cape"];
  const za = officialInternationalPrisons.filter((p) => p.countrySlug === "za");
  assert.equal(za.length, 215);
  assert.deepEqual(Array.from(new Set(za.map((p) => p.stateOrRegion))).sort(), [...DCS_REGIONS].sort());
  const rows = JSON.parse(fs.readFileSync(bundlePaths("za").rows, "utf8")) as Record<string, unknown>[];
  for (const r of rows) {
    assert.equal(r.country, "za");
    assert.ok(!("region" in r) && !("province" in r), `${r.slug}: no inferred province`);
    assert.ok(!/inferred/i.test(String(r.notes ?? "")), `${r.slug}: no inferred note`);
  }
  for (const p of za) {
    assert.ok(p.managementArea?.trim(), `${p.slug}: management area`);
    assert.ok(p.city.trim(), `${p.slug}: never a blank city`);
    assert.ok(p.operator.trim(), `${p.slug}: never a blank operator`);
    assert.equal(p.jurisdiction, "Department of Correctional Services");
  }
});
