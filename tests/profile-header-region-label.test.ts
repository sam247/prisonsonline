import { test } from "node:test";
import assert from "node:assert/strict";
import { ukPrisonsGenerated as ukPrisons } from "../src/data/generated/ukPrisons.generated";
import { isHmppsGroupRegion, regionDisplayLabel, ukGeographicRegionDisplayName } from "../src/lib/prisons/hmppsGroupLabel";

const headerText = (p: any) =>
  isHmppsGroupRegion(p)
    ? `${p.city}, ${p.country} · ${regionDisplayLabel(p)}`
    : `${p.city}, ${ukGeographicRegionDisplayName(p)}, ${p.country}`;

test("no UK profile header renders a raw upper-case group/region name", () => {
  assert.ok(ukPrisons.length > 100);
  for (const p of ukPrisons as any[]) {
    const raw = (p.stateOrRegion ?? "").trim();
    if (raw && raw === raw.toUpperCase()) assert.ok(!headerText(p).includes(raw), `${p.slug}: ${headerText(p)}`);
  }
});

test("geographic regions read naturally", () => {
  const f = (r: string) => ukGeographicRegionDisplayName({ countrySlug: "uk", stateOrRegion: r });
  assert.equal(f("KENT, SURREY & SUSSEX"), "Kent, Surrey and Sussex");
  assert.equal(f("GREATER MANCHESTER,MERSEYSIDE & CHESHIRE"), "Greater Manchester, Merseyside and Cheshire");
  assert.equal(f("HMPPS Wales"), "HMPPS Wales");
  assert.equal(ukGeographicRegionDisplayName({ countrySlug: "us", stateOrRegion: "TX" }), "TX");
});
