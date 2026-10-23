import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { AD_POLICY } from "@/lib/ads/layoutPolicy";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";
import { usPrisonsGenerated } from "@/data/generated/usPrisons.generated";

const IMPORT_RE = /imported dataset|BOP-derived dataset|imported BOP|The import lists|not included in this dataset|site build/i;

test("stored UK and US profile copy no longer contains import-dataset wording", () => {
  assert.equal(ukPrisonsGenerated.length, 122);
  for (const prison of ukPrisonsGenerated) {
    assert.equal(prison.history, "", prison.slug);
    const blob = [prison.overview, prison.history, prison.prisonLife, prison.visitingInfo].join("\n");
    assert.doesNotMatch(blob, IMPORT_RE, prison.slug);
  }
  assert.equal(usPrisonsGenerated.length > 100, true);
  for (const prison of usPrisonsGenerated) {
    assert.equal(prison.history, "", prison.slug);
    assert.equal(prison.prisonLife, "", prison.slug);
    const blob = [prison.overview, prison.history, prison.prisonLife, prison.visitingInfo].join("\n");
    assert.doesNotMatch(blob, IMPORT_RE, prison.slug);
    assert.match(prison.overview, /Federal Bureau of Prisons/, prison.slug);
    assert.match(prison.visitingInfo, /official BOP facility page/, prison.slug);
  }
});

test("ad slot count stays the same and units are width-constrained", () => {
  assert.deepEqual(
    Object.values(AD_POLICY).map((policy) => policy.slots.length),
    [2, 1, 1, 1],
  );
  const view = readFileSync("src/components/pages/PrisonProfileView.tsx", "utf8");
  assert.equal(view.match(/<AdSenseUnit /g)?.length, 2);
  const ad = readFileSync("src/components/ads/AdSenseUnit.tsx", "utf8");
  assert.equal(ad.match(/<ins/g)?.length, 1);
  assert.match(ad, /data-ad-slot-frame=\{slot\}/);
  assert.match(ad, /data-full-width-responsive="false"/);
  assert.match(ad, /maxWidth: "100%"/);
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /ins\.adsbygoogle/);
});
