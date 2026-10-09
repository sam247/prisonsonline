import assert from "node:assert/strict";
import { test } from "node:test";
// @ts-expect-error — plain .mjs build helper without type declarations
import { UK_ADDRESS_CORRECTIONS, applyUkAddressCorrection } from "../scripts/uk-address-corrections.mjs";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";

type Correction = { address: string; sourceUrl: string; note: string };
const corrections = UK_ADDRESS_CORRECTIONS as Record<string, Correction>;
const apply = applyUkAddressCorrection as (slug: string, address: string) => string;

const EXPECTED: Record<string, string> = {
  "hmp-holme-house": "Holme House Road, Stockton on Tees, TS18 2QU",
  "hmyoi-cookham-wood": "Sir Evelyn Road, Rochester, ME1 3LU",
};

test("address correction map entries are sourced from official UK government pages", () => {
  assert.deepEqual(Object.keys(corrections).sort(), Object.keys(EXPECTED).sort());
  for (const [slug, entry] of Object.entries(corrections)) {
    assert.equal(entry.address, EXPECTED[slug]);
    assert.match(new URL(entry.sourceUrl).hostname, /(^|\.)gov\.uk$/);
    assert.ok(entry.note.trim().length > 10, `${slug}: note required`);
  }
});

test("address correction wins over feed typo; other slugs pass through", () => {
  assert.equal(
    apply("hmp-holme-house", "Holme House Road, Stickton on Tees, TS18 2QU"),
    "Holme House Road, Stockton on Tees, TS18 2QU",
  );
  assert.equal(
    apply("hmyoi-cookham-wood", "Sir Evelyn Road, Rochaester, ME1 3LU"),
    "Sir Evelyn Road, Rochester, ME1 3LU",
  );
  assert.equal(
    apply("hmp-belmarsh", "Western Way, Thamesmead, London, SE28 0EB"),
    "Western Way, Thamesmead, London, SE28 0EB",
  );
  assert.equal(apply("constructor", "X"), "X");
});

test("generated UK prisons carry the corrected address strings", () => {
  for (const [slug, address] of Object.entries(EXPECTED)) {
    assert.equal(ukPrisonsGenerated.find((p) => p.slug === slug)?.address, address, slug);
  }
});

test("city headers remain the #15 corrections (address fix does not alter city)", () => {
  assert.equal(ukPrisonsGenerated.find((p) => p.slug === "hmp-holme-house")?.city, "Stockton-on-Tees");
  assert.equal(ukPrisonsGenerated.find((p) => p.slug === "hmyoi-cookham-wood")?.city, "Rochester");
});
