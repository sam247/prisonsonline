import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  BOP_CONTACT_VISITING_SOURCE_ID,
  INMATE_MAIL_PLACEHOLDER,
  applyUsContactVisiting,
  bopContactVisitingSource,
  bopFacilityPageUrl,
  bopPhylocUrl,
  evaluateBopContactVisiting,
  parseBopPostalAddress,
  parseBopPhyloc,
  parseBopVisitingHours,
  parseBopVisitingRulesUrl,
} from "@/lib/verification/bopContactVisiting";
import { applyUsSafeAutoChanges, emptyUsOverlay } from "@/lib/verification/applyChanges";
import { memoryOverlayStore, mergeOverlayFiles, resolveUsOverlayModuleWrite } from "@/lib/verification/stateStore";
import { verifyUsPrison } from "@/lib/verification/runUsVerification";
import type { HttpGet } from "@/lib/verification/govukClient";
import type { BopLocation } from "@/lib/verification/bopClient";
import type { OverlayFile, PrisonVerificationInput } from "@/lib/verification/types";
import { usVerificationOverlay } from "@/data/generated/usVerificationOverlay.generated";
import { getFacilityVerification } from "@/data/facilitySources";
import { getUsContactVisiting, listUsContactVisitingKeys, withUsContactVisiting } from "@/data/usContactVisiting";

// Fixtures are saved verbatim from bop.gov on 2026-10-17 (population block stripped).
// The facility page is a template filled by bop.gov's own script from /PublicInfo/execute/phyloc.
const FIX = path.join(process.cwd(), "tests", "fixtures", "bop");
const json = (name: string) => JSON.parse(fs.readFileSync(path.join(FIX, name), "utf8")) as Record<string, unknown>;
const html = (name: string) => fs.readFileSync(path.join(FIX, name), "utf8");
const SID = BOP_CONTACT_VISITING_SOURCE_ID;
const NOW = new Date("2026-10-17T20:00:00Z");

test("BOP mail: Atlanta FCI inmate address parses SAFE into PostalAddress (#77 shape)", () => {
  const phyloc = parseBopPhyloc(json("phyloc_ATL.json"), "ATL")!;
  const out = parseBopPostalAddress(phyloc, "ATL", SID, { address: "601 MCDONOUGH BLVD SE", postcode: "30315" });
  assert.equal(out.ok, true);
  if (!out.ok) return;
  assert.deepEqual(out.value, {
    lines: ["FCI Atlanta", "FEDERAL CORRECTIONAL INSTITUTION", "P.O. BOX 150160", "ATLANTA, GA"],
    postcode: "30315",
    recipientFormat: INMATE_MAIL_PLACEHOLDER,
    sourceId: SID,
  });
  assert.equal(out.value.lines.some((l) => /\b\d{5}\b/.test(l)), false, "ZIP belongs in postcode");
  // Feed lists a camp mail row but the facility row says hasCamp=false: ignored, noted.
  assert.match(out.evidence, /Camp mail row ignored/);
});

test("BOP mail: a declared camp address goes in PostalAddress.units (same sourceId pattern)", () => {
  const raw = json("phyloc_ATL.json");
  (raw.Locations as Array<Record<string, unknown>>)[0].hasCamp = true;
  const out = parseBopPostalAddress(parseBopPhyloc(raw, "ATL")!, "ATL", SID);
  assert.equal(out.ok, true);
  if (!out.ok) return;
  assert.deepEqual(out.value.units, [
    {
      label: "Camp",
      lines: ["FCI Atlanta", "FEDERAL CORRECTIONAL INSTITUTION", "SATELLITE CAMP", "P.O. BOX 150160", "ATLANTA, GA"],
      postcode: "30315",
      sourceId: SID,
    },
  ]);
  assert.deepEqual(out.value.lines, ["FCI Atlanta", "FEDERAL CORRECTIONAL INSTITUTION", "P.O. BOX 150160", "ATLANTA, GA"]);
});

test("BOP mail: camp + FSL units in bop.gov page order; undeclared units are not guessed", () => {
  const raw = json("phyloc_ATL.json");
  const loc = (raw.Locations as Array<Record<string, unknown>>)[0];
  loc.hasCamp = true;
  loc.hasFsl = true;
  const camp = (raw.Addresses as Array<Record<string, unknown>>).find((a) => a.addressType === "6")!;
  (raw.Addresses as unknown[]).push({ ...camp, addressType: "9", addressTypeName: "Inmate Mail/Parcels - FSL", street: "P.O. BOX 150170", zipCode: "30316" });
  const out = parseBopPostalAddress(parseBopPhyloc(raw, "ATL")!, "ATL", SID);
  assert.equal(out.ok, true);
  if (!out.ok) return;
  assert.deepEqual(out.value.units?.map((u) => [u.label, u.lines[2], u.lines[3], u.postcode]), [
    ["Camp", "SATELLITE CAMP", "P.O. BOX 150160", "30315"],
    ["FSL", "FEDERAL SATELLITE LOW", "P.O. BOX 150170", "30316"],
  ]);
  for (const u of out.value.units ?? []) assert.equal(u.lines.some((l) => /\b\d{5}\b/.test(l)), false, "ZIP belongs in postcode");
  // Real Atlanta feed today: camp row but hasCamp=false -> no units at all.
  const real = parseBopPostalAddress(parseBopPhyloc(json("phyloc_ATL.json"), "ATL")!, "ATL", SID);
  assert.equal(real.ok && real.value.units, undefined);
});

test("BOP mail: duplicated or invalid unit rows make the whole block REVIEW_REQUIRED", () => {
  const raw = json("phyloc_ATL.json");
  (raw.Locations as Array<Record<string, unknown>>)[0].hasCamp = true;
  const camp = (raw.Addresses as Array<Record<string, unknown>>).find((a) => a.addressType === "6")!;
  const dup = { ...raw, Addresses: [...(raw.Addresses as unknown[]), { ...camp, street: "PO BOX 9" }] };
  const outDup = parseBopPostalAddress(parseBopPhyloc(dup, "ATL")!, "ATL", SID);
  assert.equal(outDup.ok, false);
  if (!outDup.ok) assert.equal(outDup.classification, "REVIEW_REQUIRED");
  const bad = {
    ...raw,
    Addresses: (raw.Addresses as Array<Record<string, unknown>>).map((a) => (a.addressType === "6" ? { ...a, zipCode: "3031" } : a)),
  };
  const outBad = parseBopPostalAddress(parseBopPhyloc(bad, "ATL")!, "ATL", SID);
  assert.equal(outBad.ok, false);
  if (!outBad.ok) assert.equal(outBad.classification, "REVIEW_REQUIRED");
});

test("BOP mail: Guaynabo MDC uses BOP state code RQ, so it is REVIEW_REQUIRED, not rewritten", () => {
  const out = parseBopPostalAddress(parseBopPhyloc(json("phyloc_GUA.json"), "GUA")!, "GUA", SID);
  assert.equal(out.ok, false);
  if (out.ok) return;
  assert.equal(out.classification, "REVIEW_REQUIRED");
  assert.match(out.evidence, /RQ/);
});

test("BOP mail: Danbury (camp declared, no camp mail row) parses main address only", () => {
  const out = parseBopPostalAddress(parseBopPhyloc(json("phyloc_DAN.json"), "DAN")!, "DAN", SID, {
    address: "33 1/2 PEMBROKE STATION",
    postcode: "06811",
  });
  assert.equal(out.ok, true);
  if (!out.ok) return;
  assert.deepEqual(out.value.lines.slice(2), ["ROUTE 37", "DANBURY, CT"]);
  assert.equal(out.value.postcode, "06811");
});

test("BOP mail: same street + ZIP as the site address is not stored (#77 postalAddress rule)", () => {
  const out = parseBopPostalAddress(parseBopPhyloc(json("phyloc_ALD.json"), "ALD")!, "ALD", SID, {
    address: "GLEN RAY RD. BOX A",
    postcode: "24910",
  });
  assert.equal(out.ok, false);
  if (!out.ok) assert.equal(out.classification, "UNSUPPORTED");
});

test("BOP mail: missing or duplicated inmate mail rows never produce a value", () => {
  const raw = json("phyloc_ALD.json");
  const none = { ...raw, Addresses: (raw.Addresses as Array<Record<string, unknown>>).filter((a) => a.addressType !== "3") };
  const outNone = parseBopPostalAddress(parseBopPhyloc(none, "ALD")!, "ALD", SID);
  assert.equal(outNone.ok, false);
  if (!outNone.ok) assert.equal(outNone.classification, "NO_SOURCE_VALUE");
  const main = (raw.Addresses as Array<Record<string, unknown>>).find((a) => a.addressType === "3")!;
  const dup = { ...raw, Addresses: [...(raw.Addresses as unknown[]), { ...main, street: "PO BOX 1" }] };
  const outDup = parseBopPostalAddress(parseBopPhyloc(dup, "ALD")!, "ALD", SID);
  assert.equal(outDup.ok, false);
  if (!outDup.ok) assert.equal(outDup.classification, "REVIEW_REQUIRED");
  assert.equal(parseBopPostalAddress(parseBopPhyloc(raw, "ALD")!, "ATL", SID).ok, false);
});

test("BOP visiting hours: empty structured schedule is NO_SOURCE_VALUE (PDF prose is not auto-extracted)", () => {
  const out = parseBopVisitingHours(parseBopPhyloc(json("phyloc_DAN.json"), "DAN")!, SID);
  assert.equal(out.ok, false);
  if (!out.ok) assert.equal(out.classification, "NO_SOURCE_VALUE");
});

test("BOP visiting hours: structured visitDays (bop.gov script format) parse; lockdown blocks", () => {
  const raw = json("phyloc_ATL.json");
  const visiting = raw.Visiting as Array<Record<string, unknown>>;
  visiting[0].visitDays = [
    { day: 6, startTime: "8:00 AM", endTime: "3:00 PM", camp: 0, fsl: 0, fdc: 0, sff: 0 },
    { day: 0, startTime: "8:00 AM", endTime: "3:00 PM", camp: 0, fsl: 0, fdc: 0, sff: 0 },
    { day: 7, startTime: "8:00 AM", endTime: "3:00 PM", camp: 0, fsl: 0, fdc: 0, sff: 0 },
    { day: 5, startTime: "5:00 PM", endTime: "8:00 PM", camp: 1, fsl: 0, fdc: 0, sff: 0 },
  ];
  const out = parseBopVisitingHours(parseBopPhyloc(raw, "ATL")!, SID);
  assert.equal(out.ok, true);
  if (out.ok) {
    assert.deepEqual(out.value.schedule, [
      "FCI — Sun: 8:00 AM - 3:00 PM",
      "FCI — Sat: 8:00 AM - 3:00 PM",
      "FCI — Federal holidays: 8:00 AM - 3:00 PM",
      "Camp — Fri: 5:00 PM - 8:00 PM",
    ]);
    assert.equal(out.value.sourceId, SID);
    assert.match(out.value.note ?? "", /typical visiting hours/);
  }
  const locked = parseBopVisitingHours(parseBopPhyloc({ ...raw, Lockdown: [{ areaClosed: "all" }] }, "ATL")!, SID);
  assert.equal(locked.ok, false);
  if (!locked.ok) assert.equal(locked.classification, "REVIEW_REQUIRED");
});

test("BOP visiting rules URL: single English PDF from the facility page; identity + ambiguity guarded", () => {
  const page = html("atl.html");
  const out = parseBopVisitingRulesUrl(page, "ATL", SID);
  assert.equal(out.ok, true);
  if (out.ok) assert.deepEqual(out.value, { url: "https://www.bop.gov/locations/institutions/atl/atl_visit.pdf", sourceId: SID });
  const wrong = parseBopVisitingRulesUrl(page, "ALD", SID);
  assert.equal(wrong.ok, false);
  if (!wrong.ok) assert.equal(wrong.classification, "REVIEW_REQUIRED");
  const ambiguous = page.replace("</body>", '<a href="/locations/institutions/atl/atl_visit_camp.pdf?v=1">x</a></body>');
  const amb = parseBopVisitingRulesUrl(ambiguous, "ATL", SID);
  assert.equal(amb.ok, false);
  if (!amb.ok) assert.equal(amb.classification, "REVIEW_REQUIRED");
});

const ALD_LOC: BopLocation = {
  code: "ALD",
  name: "Alderson",
  nameTitle: "FPC Alderson",
  nameDisplay: "Alderson FPC",
  type: "FPC",
  securityLevel: "Minimum",
  url: "/locations/institutions/ald/",
  address: "GLEN RAY RD. BOX A",
  city: "ALDERSON",
  state: "WV",
  zipCode: "24910",
  phoneNumber: "304-445-3300",
  contactEmail: "ALD-ExecAssistant-S@bop.gov",
  locationtype: "inst",
  privateFacl: "f",
  faclTypeDescription: "Federal Prison Camp",
  gender: "female",
};

const ALD_PRISON: PrisonVerificationInput = {
  slug: "alderson-fpc",
  countrySlug: "us",
  country: "United States (Federal)",
  institutionalId: "bop:alderson-fpc",
  dataProvenance: "bop_import",
  name: "Alderson Fpc",
  address: "GLEN RAY RD. BOX A",
  postcode: "24910",
  phone: "304-445-3300",
  operator: "Federal Bureau of Prisons",
  securityLevel: "Minimum",
  facilityType: "fpc",
  city: "Alderson",
  stateOrRegion: "West Virginia",
};

function aldHttp(overrides: Record<string, { ok: boolean; status: number; text: string }> = {}): HttpGet & { calls: string[] } {
  const calls: string[] = [];
  const fn = (async (url: string) => {
    calls.push(url);
    if (overrides[url]) return overrides[url];
    if (url === bopPhylocUrl("ALD")) return { ok: true, status: 200, text: fs.readFileSync(path.join(FIX, "phyloc_ALD.json"), "utf8") };
    if (url === bopFacilityPageUrl("ALD")) return { ok: true, status: 200, text: html("ald.html") };
    if (url === "https://www.bop.gov/locations/institutions/ald/ald_visit.pdf") return { ok: true, status: 200, text: "%PDF-1.4" };
    return { ok: false, status: 404, text: "" };
  }) as HttpGet & { calls: string[] };
  fn.calls = calls;
  return fn;
}

const ALD_VERIFICATION = {
  countrySlug: "us",
  prisonSlug: "alderson-fpc",
  sources: [],
  fieldSources: { email: ["official"] },
  overrides: { email: "ALD-ExecAssistant-S@bop.gov" },
};

function seededAld(): OverlayFile {
  return {
    generatedBy: "us-prison-verifier",
    updatedAt: "2026-09-28T08:23:23.669Z",
    entries: {
      "us/alderson-fpc": {
        prisonSlug: "alderson-fpc",
        countrySlug: "us",
        appliedAt: "2026-09-28T08:23:23.669Z",
        sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
        overrides: { email: "ALD-ExecAssistant-S@bop.gov" },
      },
    },
  };
}

test("verifyUsPrison: contact/visiting is recorded in dry-run and never written", async () => {
  const store = memoryOverlayStore(seededAld());
  const result = await verifyUsPrison({
    prison: ALD_PRISON,
    verification: ALD_VERIFICATION,
    bopLocations: [ALD_LOC],
    http: aldHttp(),
    overlayStore: store,
    options: { dryRun: true, writesEnabled: false, now: NOW },
  });
  const cv = result.contactVisiting!;
  assert.equal(cv.suppressed, false);
  // Alderson's inmate mail street/ZIP equal the site address → not stored (#77 postalAddress rule).
  assert.equal(cv.fields.find((f) => f.field === "postalAddress")?.classification, "UNSUPPORTED");
  assert.equal(cv.fields.find((f) => f.field === "visitingRulesUrl")?.classification, "SAFE_AUTO_CHANGE");
  assert.equal(cv.fields.find((f) => f.field === "visitingHours")?.classification, "NO_SOURCE_VALUE");
  assert.equal(cv.mutated, false);
  assert.deepEqual(store.snapshot(), seededAld());
});

function aldFeedWithPoBox(): string {
  const raw = json("phyloc_ALD.json");
  for (const a of raw.Addresses as Array<Record<string, unknown>>) if (a.addressType === "3") a.street = "P.O. BOX 100";
  return JSON.stringify(raw);
}

test("verifyUsPrison: SAFE contact/visiting writes are additive in #77 shape, keep email + entry provenance, then settle", async () => {
  const store = memoryOverlayStore(seededAld());
  const http = () => aldHttp({ [bopPhylocUrl("ALD")]: { ok: true, status: 200, text: aldFeedWithPoBox() } });
  const first = await verifyUsPrison({
    prison: ALD_PRISON,
    verification: ALD_VERIFICATION,
    bopLocations: [ALD_LOC],
    http: http(),
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: NOW },
  });
  assert.deepEqual(first.contactVisiting?.applied, ["postalAddress", "visitingRulesUrl"]);
  assert.equal(first.overlayWritten, true);
  const entry = store.snapshot().entries["us/alderson-fpc"];
  assert.equal(entry.overrides.email, "ALD-ExecAssistant-S@bop.gov");
  assert.equal(entry.appliedAt, "2026-09-28T08:23:23.669Z");
  assert.equal(entry.sourceUrl, "https://www.bop.gov/locations/institutions/ald/");
  assert.deepEqual(entry.contactVisiting, {
    sources: [bopContactVisitingSource("ALD", "2026-10-17")],
    fieldSources: { postalAddress: [SID], visitingRulesUrl: [SID] },
    postalAddress: {
      lines: ["FPC Alderson", "FEDERAL PRISON CAMP", "P.O. BOX 100", "ALDERSON, WV"],
      postcode: "24910",
      recipientFormat: INMATE_MAIL_PLACEHOLDER,
      sourceId: SID,
    },
    visitingRulesUrl: { url: "https://www.bop.gov/locations/institutions/ald/ald_visit.pdf", sourceId: SID },
  });
  assert.equal(entry.contactVisiting?.sources[0].url, "https://www.bop.gov/locations/institutions/ald/");

  const second = await verifyUsPrison({
    prison: ALD_PRISON,
    verification: ALD_VERIFICATION,
    bopLocations: [ALD_LOC],
    http: http(),
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-10-20T08:00:00Z") },
  });
  assert.deepEqual(second.contactVisiting?.applied, []);
  assert.equal(second.contactVisiting?.fields.find((f) => f.field === "postalAddress")?.classification, "NO_CHANGE");
  assert.equal(second.overlayWritten, false);
  assert.equal(store.snapshot().entries["us/alderson-fpc"].contactVisiting?.sources[0].checkedAt, "2026-10-17");
});

test("verifyUsPrison: unreachable PDF or feed is REVIEW_REQUIRED and writes nothing for that field", async () => {
  const store = memoryOverlayStore(seededAld());
  const result = await verifyUsPrison({
    prison: ALD_PRISON,
    verification: ALD_VERIFICATION,
    bopLocations: [ALD_LOC],
    http: aldHttp({
      "https://www.bop.gov/locations/institutions/ald/ald_visit.pdf": { ok: false, status: 404, text: "" },
      [bopPhylocUrl("ALD")]: { ok: false, status: 503, text: "" },
    }),
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: NOW },
  });
  const cv = result.contactVisiting!;
  assert.ok(cv.fields.every((f) => f.classification === "REVIEW_REQUIRED"));
  assert.deepEqual(cv.applied, []);
  assert.deepEqual(store.snapshot(), seededAld());
});

test("verifyUsPrison: identity (name) REVIEW_REQUIRED suppresses contact/visiting", async () => {
  const http = aldHttp();
  const result = await verifyUsPrison({
    prison: { ...ALD_PRISON, name: "Aldersonn Fpc" },
    bopLocations: [ALD_LOC],
    http,
    overlayStore: memoryOverlayStore(seededAld()),
    options: { dryRun: false, writesEnabled: true, now: NOW },
  });
  assert.ok(result.fields.some((f) => f.field === "name" && f.classification === "REVIEW_REQUIRED"));
  assert.equal(result.contactVisiting?.suppressed, true);
  assert.equal(http.calls.some((url) => url.includes("phyloc")), false);
});

test("overlay merge + SAFE email writes preserve contactVisiting (never dropped)", () => {
  const cvStore = memoryOverlayStore(seededAld());
  applyUsContactVisiting({
    countrySlug: "us",
    prisonSlug: "alderson-fpc",
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    source: bopContactVisitingSource("ALD", "2026-10-17"),
    fields: [
      {
        field: "visitingRulesUrl",
        classification: "SAFE_AUTO_CHANGE",
        officialValue: { url: "https://www.bop.gov/locations/institutions/ald/ald_visit.pdf", sourceId: SID },
        evidence: "",
        wouldWrite: true,
      },
    ],
    writesEnabled: true,
    now: NOW,
    store: cvStore,
  });
  applyUsSafeAutoChanges({
    countrySlug: "us",
    prisonSlug: "alderson-fpc",
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    fields: [{ field: "phone", classification: "SAFE_AUTO_CHANGE", officialValue: "304-445-3300", evidence: "", confidence: "high", wouldAutoApply: true }],
    writesEnabled: true,
    now: NOW,
    store: cvStore,
  });
  const after = cvStore.snapshot().entries["us/alderson-fpc"];
  assert.equal(after.overrides.phone, "304-445-3300");
  assert.equal(after.contactVisiting?.visitingRulesUrl?.url, "https://www.bop.gov/locations/institutions/ald/ald_visit.pdf");

  const merged = mergeOverlayFiles(cvStore.snapshot(), seededAld());
  assert.ok(merged.entries["us/alderson-fpc"].contactVisiting?.visitingRulesUrl);
  assert.deepEqual(merged.entries["us/alderson-fpc"].contactVisiting?.fieldSources, { visitingRulesUrl: [SID] });
  // Untouched module stays byte-identical when nothing was written.
  assert.equal(resolveUsOverlayModuleWrite({ seed: usVerificationOverlay, stored: emptyUsOverlay(), overlayWritten: false }), null);
});

test("writes stay off without the VERIFY write gate", () => {
  const store = memoryOverlayStore(seededAld());
  const source = bopContactVisitingSource("ALD", "2026-10-17");
  const res = applyUsContactVisiting({
    countrySlug: "us",
    prisonSlug: "alderson-fpc",
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    source,
    fields: [{ field: "postalAddress", classification: "SAFE_AUTO_CHANGE", officialValue: { lines: ["x"], postcode: "24910", sourceId: SID }, evidence: "", wouldWrite: true }],
    writesEnabled: false,
    now: NOW,
    store,
  });
  assert.equal(res.overlayWritten, false);
  assert.deepEqual(store.snapshot(), seededAld());
  assert.equal(applyUsContactVisiting({ countrySlug: "uk", prisonSlug: "hmp-x", sourceUrl: "", source, fields: [], writesEnabled: true, now: NOW, store }).overlayWritten, false);
});

test("evaluateBopContactVisiting fetches only bop.gov URLs", async () => {
  const http = aldHttp();
  await evaluateBopContactVisiting({ code: "ALD", http, now: NOW });
  assert.ok(http.calls.length > 0);
  assert.ok(http.calls.every((url) => url.startsWith("https://www.bop.gov/")));
});

test("Content Manager API: verified emails reach getFacilityVerification exactly as #79 reads them", () => {
  const withEmail = Object.entries(usVerificationOverlay.entries).filter(([, entry]) => entry.overrides.email);
  assert.ok(withEmail.length >= 19, `expected >=19 verified emails, got ${withEmail.length}`);
  for (const [key, entry] of withEmail) {
    const [countrySlug, prisonSlug] = key.split("/");
    const v = getFacilityVerification(countrySlug, prisonSlug);
    // #79 contactVisitingRows(): email row needs overrides.email AND fieldSources.email.
    assert.equal(v?.overrides?.email, entry.overrides.email, key);
    assert.ok(v?.fieldSources.email?.length, key);
    assert.ok(v?.sources.some((s) => s.url === entry.sourceUrl && /bop\.gov/.test(s.url)), key);
  }
});

test("Content Manager API: getUsContactVisiting / withUsContactVisiting follow #77 (sources + fieldSources + sourceId)", () => {
  for (const key of listUsContactVisitingKeys()) {
    const [countrySlug, prisonSlug] = key.split("/");
    const r = getUsContactVisiting(countrySlug, prisonSlug)!;
    const ids = new Set(r.sources.map((s) => s.id));
    for (const s of r.sources) {
      assert.match(s.url, /^https:\/\/www\.bop\.gov\//);
      assert.match(s.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    }
    for (const field of ["postalAddress", "visitingHours", "visitingRulesUrl"] as const) {
      const block = r[field];
      if (!block) {
        assert.equal(r.fieldSources[field], undefined);
        continue;
      }
      assert.ok(ids.has(block.sourceId), `${key}.${field}`);
      if (field === "postalAddress") for (const u of r.postalAddress?.units ?? []) assert.ok(ids.has(u.sourceId), `${key}.unit`);
      for (const id of r.fieldSources[field]!) assert.ok(ids.has(id));
    }
    const base = getFacilityVerification(countrySlug, prisonSlug);
    const merged = withUsContactVisiting(countrySlug, prisonSlug, base)!;
    assert.deepEqual(merged.overrides, base?.overrides);
    assert.deepEqual(merged.sources.slice(0, base?.sources.length ?? 0), base?.sources ?? []);
    // Not wired into getFacilityVerification (display is Content Manager's).
    assert.equal(base?.postalAddress, undefined);
    assert.equal(base?.visitingRulesUrl, undefined);
  }
  assert.equal(getUsContactVisiting("uk", "hmp-belmarsh"), undefined);
  assert.equal(withUsContactVisiting("us", "no-such-prison", undefined), undefined);
});
