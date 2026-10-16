import assert from "node:assert/strict";
import { test } from "node:test";
import { stripImportWording, visitorOverview, visitorPrisonLife } from "@/lib/seo/visitorCopy";
import { usPrisonsGenerated } from "@/data/generated/usPrisons.generated";

const IMPORT_RE = /dataset|site build|imported|\bimport\b/i;

test("phoenix-ccm overview keeps facts and drops import wording", () => {
  const p = usPrisonsGenerated.find((x) => x.slug === "phoenix-ccm")!;
  assert.ok(p);
  const o = visitorOverview(p);
  assert.match(o, /^Phoenix Ccm is a Federal Bureau of Prisons \(OTHER\) facility in Arizona\./);
  assert.doesNotMatch(o, IMPORT_RE);
  assert.equal(visitorPrisonLife(p.prisonLife), "");
});

test("every US row renders overview and prison life without import wording", () => {
  for (const p of usPrisonsGenerated) {
    const o = visitorOverview(p);
    assert.ok(o.length > 20, p.slug);
    assert.doesNotMatch(o, IMPORT_RE, p.slug);
    assert.ok(o.includes(p.name.trim()), p.slug);
    assert.doesNotMatch(visitorPrisonLife(p.prisonLife), IMPORT_RE, p.slug);
  }
});

test("real prose is untouched and empty results fall back to neutral facts", () => {
  const real = "HMP Example is a busy local prison. It has a large education block.";
  assert.equal(stripImportWording(real), real);
  assert.equal(visitorPrisonLife("Inmates work in the kitchen."), "Inmates work in the kitchen.");
  assert.equal(
    visitorOverview({ overview: "Listed in the BOP-derived dataset used in this site build.", name: "Test Fci", securityLevel: "Medium", city: "Tucson", stateOrRegion: "Arizona" }),
    "Test Fci is a prison facility in Tucson, Arizona. It is listed as medium security.",
  );
});
