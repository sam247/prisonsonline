import assert from "node:assert/strict";
import { haversineMiles } from "@/lib/queries/nearbyCourtsPrisons";
import { isCourtTypeHubSlug, resolveCourtSlug, getCourtsForTypeHub } from "@/lib/queries/courts";

assert.equal(isCourtTypeHubSlug("crown-courts"), true);
assert.equal(isCourtTypeHubSlug("birmingham-crown-court"), false);

const birmingham = resolveCourtSlug("birmingham-crown-court");
assert.equal(birmingham.kind, "court");
if (birmingham.kind === "court") {
  assert.equal(birmingham.court.slug, "birmingham-crown-court");
  assert.ok(birmingham.court.indexable);
}

const hub = resolveCourtSlug("crown-courts");
assert.equal(hub.kind, "hub");
if (hub.kind === "hub") {
  assert.ok(hub.courts.length >= 3);
}

const crown = getCourtsForTypeHub("crown-courts");
assert.ok(crown.every((c) => c.hubSlugs.includes("crown-courts")));

const miles = haversineMiles(51.5, -0.1, 51.5, -0.1);
assert.ok(miles < 0.01);

const d = haversineMiles(51.5074, -0.1278, 52.4862, -1.8904);
assert.ok(d > 100 && d < 130);

console.log(
  JSON.stringify(
    {
      birmingham: birmingham.kind,
      crownHubCount: hub.kind === "hub" ? hub.courts.length : 0,
      sampleMiles: Math.round(d),
    },
    null,
    2,
  ),
);
