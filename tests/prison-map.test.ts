import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validCoordinates, bopLocationConflicts, filterMapRecords } from "@/lib/prison-map/location";
import { getPrisonMapRecords, projectMapRecord } from "@/lib/prison-map/records";
import { postcodeCoordinateMatches } from "@/lib/prison-map/postcode-cache.mjs";
import { getPrisonByCountryAndSlug, prisons } from "@/data/prisons";
import { facilityVerificationRecords } from "@/data/facilitySources";
import { getPrisonOverlayCoords } from "@/lib/queries/nearbyCourtsPrisons";
import { parseBopLocations } from "@/lib/verification/bopClient";
import { matchBopLocation } from "@/lib/verification/discoverUsSource";
import { refreshPrisonCoordinates } from "../scripts/refresh-prison-coordinates";

const records = getPrisonMapRecords();
const filters = { country: "us" as const, query: "", state: "", reentryOffices: false };

test("coordinates reject sentinels, non-numbers and wrong-country locations; accept US territories", () => {
  for (const [lat, lng] of [[0, 0], [NaN, -2], [52, Infinity], [200, -2], [52, 400], ["52", -2], [37, -80]]) assert.equal(validCoordinates(lat, lng, "uk"), false);
  assert.equal(validCoordinates(51.5, 0, "uk"), true);
  assert.equal(validCoordinates(18.45, -66.1, "us"), true);
  assert.equal(validCoordinates(21.3, -157.8, "us"), true);
  assert.equal(validCoordinates(64, -149, "us"), true);
});

test("postcode cache freshness protects both map and nearby queries", () => {
  const prison = getPrisonByCountryAndSlug("uk", "hmp-bedford")!;
  const overlay = { slug: prison.slug, postcode: prison.postcode!, latitude: 52.139343, longitude: -0.470283, source: "postcodes.io" };
  assert.equal(postcodeCoordinateMatches(overlay, "mk401hg"), true);
  assert.equal(postcodeCoordinateMatches(overlay, "SW2 5XF"), false);
  assert.equal(postcodeCoordinateMatches({ ...overlay, latitude: NaN }, overlay.postcode), false);
  assert.equal(postcodeCoordinateMatches({ ...overlay, latitude: 0, longitude: 0 }, overlay.postcode), false);
  assert.equal(projectMapRecord({ ...prison, name: "" }, overlay).name, "Unnamed establishment");
  assert.equal(projectMapRecord(prison, overlay).precision, "postcode");
  assert.match(projectMapRecord({ ...prison, postcode: "SW2 5XF" }, overlay).exclusion!, /Postcode changed/);
  const authoritative = { ...prison, latitude: 52.14, longitude: -0.47, coordinateEvidence: { precision: "facility" as const, source: "official" } };
  assert.equal(projectMapRecord(authoritative, overlay).precision, "facility");
  assert.ok(getPrisonOverlayCoords(prison.slug));
  assert.equal(getPrisonOverlayCoords("prison-122"), null);
});

test("map checks effective verified postcode overrides", () => {
  const prison = getPrisonByCountryAndSlug("uk", "hmp-bedford")!;
  const verification = facilityVerificationRecords.find(v => v.countrySlug === "uk" && v.prisonSlug === prison.slug)!;
  const previous = verification.overrides;
  try {
    verification.overrides = { ...previous, postcode: "SW2 5XF" };
    assert.match(projectMapRecord(prison, { slug: prison.slug, postcode: prison.postcode!, latitude: 52.14, longitude: -0.47, source: "postcodes.io" }).exclusion!, /Postcode changed/);
    assert.equal(getPrisonOverlayCoords(prison.slug), null);
  } finally { verification.overrides = previous; }
});

test("BOP client retains numeric coordinates; matching rejects ambiguity", () => {
  const raw = { code: "ALD", name: "Alderson", nameDisplay: "Alderson FPC", nameTitle: "FPC Alderson", type: "FPC", latitude: "37.725", longitude: "-80.658" };
  const locations = parseBopLocations({ Locations: [raw] });
  assert.equal(locations[0].latitude, 37.725);
  assert.equal(locations[0].longitude, -80.658);
  const prison = getPrisonByCountryAndSlug("us", "alderson-fpc")!;
  assert.equal(matchBopLocation(prison, locations)?.code, "ALD");
  assert.equal(matchBopLocation(prison, [...locations, { ...locations[0], code: "OTHER" }]), undefined);
  assert.equal(parseBopLocations({ Locations: [{ ...raw, latitude: "" }] })[0].latitude, undefined);
});

test("BOP location checks reject address, ZIP, city, state and street-number conflicts", () => {
  const prison = { address: "123 MAIN STREET ROAD", postcode: "90210", city: "Example", sourceRaw: { state: "CA" } };
  const loc = { address: prison.address, zipCode: "90210-1234", city: "EXAMPLE", state: "CA" };
  assert.deepEqual(bopLocationConflicts(prison, loc), []);
  assert.ok(bopLocationConflicts(prison, { ...loc, address: "999 MAIN STREET ROAD" }).length);
  assert.ok(bopLocationConflicts(prison, { ...loc, zipCode: "10001", city: "Other", state: "NY" }).length >= 3);
  assert.deepEqual(bopLocationConflicts({ ...prison, sourceRaw: { state: "RQ" } }, { ...loc, state: "PR" }), []);
  const actual = getPrisonByCountryAndSlug("us", "alderson-fpc")!;
  assert.equal(projectMapRecord(actual).precision, "facility");
  assert.ok(projectMapRecord({ ...actual, address: "Wrong address" }).exclusion);
});

test("country grouping, office default, search, canonical links and missing records", () => {
  const us = filterMapRecords(records, filters);
  assert.ok(us.some(p => p.id.startsWith("us/")));
  assert.ok(us.some(p => p.id.startsWith("united-states/")));
  assert.equal(us.some(p => p.reentryOffice), false);
  assert.ok(filterMapRecords(records, { ...filters, reentryOffices: true }).some(p => p.reentryOffice));
  assert.ok(filterMapRecords(records, { ...filters, query: "  alcatraz  " }).some(p => p.status === "historic"));
  assert.equal(filterMapRecords(records, { ...filters, query: "no-such-prison-xyz" }).length, 0);
  assert.ok(filterMapRecords(records, { ...filters, state: "California" }).every(p => p.state === "California"));
  for (const record of records) {
    const [country, slug] = record.id.split("/");
    assert.ok(getPrisonByCountryAndSlug(country, slug));
    assert.equal(record.href, `/prisons/${country}/${slug}`);
    if (!record.exclusion) assert.ok(validCoordinates(record.latitude, record.longitude, record.country));
  }
  assert.ok(projectMapRecord({ ...prisons[0], address: undefined, postcode: undefined }).exclusion);
  assert.equal(records.length, prisons.filter(p => ["uk", "us", "united-states"].includes(p.countrySlug)).length);
});

test("overlapping locations keep both canonical records", () => {
  const grendon = records.find(p => p.id === "uk/hmp-grendon")!;
  const springHill = records.find(p => p.id === "uk/hmp-spring-hill")!;
  assert.equal(grendon.latitude, springHill.latitude);
  assert.equal(grendon.longitude, springHill.longitude);
  assert.notEqual(grendon.href, springHill.href);
});

test("failed or malformed refresh preserves the canonical source and writes a review report", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "prison-map-"));
  const inputPath = path.join(dir, "canonical.json");
  const reportFile = path.join(dir, "report.json");
  const original = "canonical source must be preserved\n";
  await fs.writeFile(inputPath, original);
  try {
    for (const httpGet of [async () => { throw new Error("offline"); }, async () => ({ ok: true, status: 200, text: "not json" }), async () => ({ ok: true, status: 200, text: JSON.stringify({ Locations: [{ code: "ONE" }] }) })]) {
      const report = await refreshPrisonCoordinates({ inputPath, reportFile, httpGet });
      assert.ok(report.error);
      assert.equal(await fs.readFile(inputPath, "utf8"), original);
      assert.ok(JSON.parse(await fs.readFile(reportFile, "utf8")).error);
    }
    const raw = JSON.parse(await fs.readFile("us_prisons_clean_bundle/us_prisons_clean.json", "utf8"));
    raw[0].address = "Changed canonical address";
    const staleSource = JSON.stringify(raw);
    await fs.writeFile(inputPath, staleSource);
    const locations = Array.from({ length: 50 }, (_, i) => ({ code: `X${i}`, latitude: "37", longitude: "-80" }));
    const staleReport = await refreshPrisonCoordinates({ inputPath, reportFile, httpGet: async () => ({ ok: true, status: 200, text: JSON.stringify({ Locations: locations }) }) });
    assert.match(staleReport.error!, /stale generated facts/);
    assert.equal(await fs.readFile(inputPath, "utf8"), staleSource);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
