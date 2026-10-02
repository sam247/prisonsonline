import assert from "node:assert/strict";
import { test } from "node:test";
// @ts-expect-error — plain .mjs build helper without type declarations
import { UK_CITY_CORRECTIONS, applyUkCityCorrection } from "../scripts/uk-city-corrections.mjs";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";

type Correction = { city: string; sourceUrl: string; note: string };
const corrections = UK_CITY_CORRECTIONS as Record<string, Correction>;
const apply = applyUkCityCorrection as (slug: string, derived: string) => string;

const EXPECTED: Record<string, string> = {
  "hmp-dartmoor": "Princetown",
  "hmp-holme-house": "Stockton-on-Tees",
  "hmyoi-cookham-wood": "Rochester",
  "hmp-ranby": "Retford",
  "hmp-leyhill": "Wotton-under-Edge",
};

test("correction map entries are sourced from official UK government pages", () => {
  assert.deepEqual(Object.keys(corrections).sort(), Object.keys(EXPECTED).sort());
  for (const [slug, entry] of Object.entries(corrections)) {
    assert.equal(entry.city, EXPECTED[slug]);
    assert.match(new URL(entry.sourceUrl).hostname, /(^|\.)gov\.uk$/);
    assert.ok(entry.note.trim().length > 10, `${slug}: note required`);
  }
});

test("correction wins over any derived city; other slugs pass through", () => {
  // Values produced by main's last-part rule and by the county-aware derivation (PR #14).
  assert.equal(apply("hmp-dartmoor", "Devon"), "Princetown");
  assert.equal(apply("hmp-dartmoor", "Yelverton"), "Princetown");
  assert.equal(apply("hmp-holme-house", "Stickton on Tees"), "Stockton-on-Tees");
  assert.equal(apply("hmyoi-cookham-wood", "Rochaester"), "Rochester");
  assert.equal(apply("hmp-ranby", "Nottingham"), "Retford");
  assert.equal(apply("hmp-leyhill", "Gloucester"), "Wotton-under-Edge");
  assert.equal(apply("hmp-gartree", "Market Harborough"), "Market Harborough");
  assert.equal(apply("constructor", "X"), "X");
});

test("generated UK prisons carry the corrected cities", () => {
  for (const [slug, city] of Object.entries(EXPECTED)) {
    assert.equal(ukPrisonsGenerated.find((p) => p.slug === slug)?.city, city, slug);
  }
});
