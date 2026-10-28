import test from "node:test";
import assert from "node:assert/strict";
import { ukPrisonsGenerated } from "../src/data/generated/ukPrisons.generated";
import { resolveUkFunctionHub, listUkHubSitemapPaths, ukFunctionHubHref } from "../src/lib/programmatic/ukPrisonHubs";
import { applyUkPrisonRecordCorrection } from "../scripts/uk-prison-record-corrections.mjs";

const cookham = ukPrisonsGenerated.find((p) => p.slug === "hmyoi-cookham-wood");

test("Cookham Wood keeps its slug and shows the adult men's prison identity", () => {
  assert.ok(cookham);
  assert.equal(cookham!.slug, "hmyoi-cookham-wood");
  assert.equal(cookham!.name, "HMP Cookham Wood");
  assert.equal(cookham!.overview, "Cookham Wood is a men's prison in Rochester, Kent.");
  assert.equal(cookham!.cohort, "Adult male");
  assert.equal(cookham!.predominantFunction, undefined);
  assert.equal(cookham!.prisonSubGroup1, undefined);
  assert.doesNotMatch(JSON.stringify({ ...cookham, sourceRaw: undefined }), /YOUTH CUSTODY|YJB|young offender|Young People|15 to 18/i);
});

test("Cookham Wood keeps its sourced contact data and upstream audit text", () => {
  assert.equal(cookham!.phone, "(01634) 202 500");
  assert.equal(cookham!.postcode, "ME1 3LU");
  assert.match(cookham!.sourceRaw!.description, /YOUTH CUSTODY SERVICE/);
});

test("record corrections only touch listed ids", () => {
  const p = { Information: "x" };
  assert.equal(applyUkPrisonRecordCorrection("hmp-birmingham", p), p);
});

test("Cookham Wood region follows HMPPS Workforce Statistics (Kent, Surrey & Sussex), same as HMP/YOI Rochester", () => {
  const rochester = ukPrisonsGenerated.find((p) => p.slug === "hmp-yoi-rochester");
  assert.ok(rochester);
  assert.equal(cookham!.stateOrRegion, "KENT, SURREY & SUSSEX");
  assert.equal(cookham!.regionSlug, "kent-surrey-and-sussex");
  assert.equal(cookham!.regionSlug, rochester!.regionSlug);
  assert.equal(cookham!.securityLevel, "Multi");
});

test("YJB function hub falls below the hub threshold; no profile links to it (no dead internal links)", () => {
  assert.equal(resolveUkFunctionHub("yjb"), null);
  assert.ok(!listUkHubSitemapPaths().some((e) => e.path === "/prisons/uk/function/yjb"));
  for (const p of ukPrisonsGenerated.filter((x) => x.countrySlug === "uk")) {
    assert.notEqual(ukFunctionHubHref(p as never), "/prisons/uk/function/yjb", p.slug);
  }
});
