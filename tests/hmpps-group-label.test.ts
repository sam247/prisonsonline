import assert from "node:assert/strict";
import { test } from "node:test";
import { isHmppsGroupRegion, otherPrisonsInLabel, prisonsInLabel, regionDisplayLabel } from "@/lib/prisons/hmppsGroupLabel";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";

test("relabels known HMPPS groups for UK prisons", () => {
  const p = { countrySlug: "uk", stateOrRegion: "LONG TERM & HIGH SECURITY ESTATE" };
  assert.equal(regionDisplayLabel(p), "HMPPS prison group: Long Term & High Security Estate");
  assert.equal(otherPrisonsInLabel(p), "Other prisons in this HMPPS group");
  assert.equal(prisonsInLabel(p), "Prisons in this HMPPS group");
  assert.equal(regionDisplayLabel({ countrySlug: "uk", stateOrRegion: "YOUTH CUSTODY SERVICE" }), "HMPPS prison group: Youth Custody Service");
  assert.equal(regionDisplayLabel({ countrySlug: "uk", stateOrRegion: "PRIVATELY MANAGED PRISON" }), "HMPPS prison group: Privately Managed Prisons");
  assert.equal(regionDisplayLabel({ countrySlug: "uk", stateOrRegion: "WOMENS PRISON GROUP" }), "HMPPS prison group: Women's Prison Group");
});

test("leaves geographic UK regions and US states unchanged", () => {
  assert.equal(regionDisplayLabel({ countrySlug: "uk", stateOrRegion: "YORKSHIRE" }), "YORKSHIRE");
  assert.equal(otherPrisonsInLabel({ countrySlug: "uk", stateOrRegion: "LONDON" }), "Other prisons in LONDON");
  const us = { countrySlug: "us", stateOrRegion: "PRIVATELY MANAGED PRISON" };
  assert.equal(isHmppsGroupRegion(us), false);
  assert.equal(regionDisplayLabel({ countrySlug: "us", stateOrRegion: "Texas" }), "Texas");
});

test("affects exactly 40 UK prison pages", () => {
  assert.equal(ukPrisonsGenerated.filter((p) => isHmppsGroupRegion(p)).length, 40);
});
