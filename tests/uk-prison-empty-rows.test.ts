import assert from "node:assert/strict";
import { test } from "node:test";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";
import { ukRegionsGenerated } from "@/data/generated/ukRegions.generated";
import { getPrisonByCountryAndSlug } from "@/data/prisons";

test("blank HMPPS prison rows (e.g. prison-122) are not published", () => {
  assert.equal(ukPrisonsGenerated.some((p) => !p.name.trim()), false);
  assert.equal(ukPrisonsGenerated.some((p) => p.slug === "prison-122"), false);
  assert.equal(getPrisonByCountryAndSlug("uk", "prison-122"), undefined);
  assert.equal(ukRegionsGenerated.some((r) => r.slug === "unknown-region"), false);
});
