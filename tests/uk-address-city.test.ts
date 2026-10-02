import assert from "node:assert/strict";
import { test } from "node:test";
// @ts-expect-error — plain .mjs build helper without type declarations
import { deriveCityFromAddress, legacyCityFromAddress } from "../scripts/uk-address-city.mjs";
import { getPrisonByCountryAndSlug } from "@/data/prisons";

type Derived = { city: string; reason: "unchanged" | "county_stripped" | "ambiguous_kept" };
const derive = deriveCityFromAddress as (a: string, p: string) => Derived;

test("county suffix is stripped and the town before it is used", () => {
  assert.deepEqual(derive("Gallow Field Road, Market Harborough, Leicestershire, LE16 7RP", "LE16 7RP"), {
    city: "Market Harborough",
    reason: "county_stripped",
  });
  assert.equal(derive("PO Box 50, Bicester, OXON, OX25 1PZ", "OX25 1PZ").city, "Bicester");
  assert.equal(derive("Bridge Road, Wrexham Industrial Estate, Wrexham, North Wales, LL13 9QE", "LL13 9QE").city, "Wrexham");
  assert.equal(derive("Sutton Lane, Sutton Valence, Maidstone, Kent ME17 3DF", "ME17 3DF").city, "Maidstone");
  assert.equal(derive("Buckley Hall Road, Rochdale, Lancashire , OL12 9DP", "OL12 9DP").city, "Rochdale");
});

test("addresses without a county keep the legacy city (cities that share a county name are not counties)", () => {
  for (const [a, p] of [
    ["Old Elvet, Durham, DH1 3HU", "DH1 3HU"],
    ["Retford, Nottingham, DN22 8EU", "DN22 8EU"],
    ["York, YO41 1PS", "YO41 1PS"],
    ["Western Way, Thamesmead, London, SE28 0EB", "SE28 0EB"],
  ]) {
    const d = derive(a, p);
    assert.equal(d.reason, "unchanged");
    assert.equal(d.city, legacyCityFromAddress(a, p));
  }
});

test("ambiguous town parts keep the existing value", () => {
  assert.deepEqual(derive("Willoughby, Nr. Rugby, Warwickshire, CV23 8SZ", "CV23 8SZ"), { city: "Warwickshire", reason: "ambiguous_kept" });
  assert.deepEqual(derive("Grove Road, Hollesley, Nr Woodbridge, Suffolk IP12 3BF", "IP12 3BF"), { city: "Suffolk", reason: "ambiguous_kept" });
  assert.deepEqual(derive("Stocken Hall Road, Stretton Nr Oakham, Rutland, LE15 7RD", "LE15 7RD"), { city: "Rutland", reason: "ambiguous_kept" });
  assert.deepEqual(derive("Brabazon Road, Eastchurch, Isle of Sheppey, Kent ME12 4AX", "ME12 4AX"), { city: "Kent", reason: "ambiguous_kept" });
  assert.deepEqual(derive("The Drive, Swinfen, Linchfield, Staffordshire WS14 9QS", "WS14 9QS"), { city: "Staffordshire", reason: "ambiguous_kept" });
  assert.equal(derive("Eccleshall, Sstaffordshire, ST21 6LQ", "ST21 6LQ").reason, "unchanged");
});

test("generated UK profiles use the town, not the county", () => {
  assert.equal(getPrisonByCountryAndSlug("uk", "hmp-gartree")?.city, "Market Harborough");
  assert.equal(getPrisonByCountryAndSlug("uk", "hmp-littlehey")?.city, "Huntingdon");
  assert.equal(getPrisonByCountryAndSlug("uk", "hmp-durham")?.city, "Durham");
  assert.equal(getPrisonByCountryAndSlug("uk", "hmp-rye-hill")?.city, "Warwickshire");
});
