import { test } from "node:test";
import assert from "node:assert/strict";
import { prisons } from "../src/data/prisons";
import { geographicRegion, regionRepeatsCity, ukGeographicRegionDisplayName } from "../src/lib/prisons/hmppsGroupLabel";

test("regionRepeatsCity drops a region that only repeats the city (non-US)", () => {
  assert.equal(regionRepeatsCity({ countrySlug: "uk", city: "London" }, "LONDON"), true);
  assert.equal(regionRepeatsCity({ countrySlug: "ie", city: "Dublin" }, "Co. Dublin"), true);
  assert.equal(regionRepeatsCity({ countrySlug: "uk", city: "Maidstone" }, "KENT, SURREY & SUSSEX"), false);
  assert.equal(regionRepeatsCity({ countrySlug: "us", city: "New York" }, "New York"), false);
  assert.equal(regionRepeatsCity({ countrySlug: "uk", city: "London" }, ""), false);
});

test("no non-US card or UK header location line repeats the city as the region", () => {
  for (const p of prisons) {
    const card = geographicRegion(p);
    if (p.countrySlug !== "us" && card && card.toLowerCase() === (p.city ?? "").toLowerCase()) {
      assert.equal(regionRepeatsCity(p, card), true, p.slug);
    }
    if (p.countrySlug === "uk") {
      const hdr = ukGeographicRegionDisplayName(p);
      if (hdr && hdr.toLowerCase() === (p.city ?? "").toLowerCase()) assert.equal(regionRepeatsCity(p, hdr), true, p.slug);
    }
  }
});
