import assert from "node:assert/strict";
import test from "node:test";
import type { FacilityVerificationRecord } from "@/types/facilitySource";
import { compareFacts, overallStatus } from "@/lib/verification/compare";
import { publishedFacts } from "@/lib/verification/publishedFacts";
import { validateAiExtraction } from "@/lib/verification/aiGuard";
import { selectUsPrisonsDue, isUkPrison, isUsPrison, isExcludedFromUsActiveQueue } from "@/lib/verification/selectPrison";
import {
  applySafeAutoChanges,
  applyUsSafeAutoChanges,
  emptyOverlay,
  emptyUsOverlay,
  productionUsWritesEnabled,
  productionWritesEnabled,
} from "@/lib/verification/applyChanges";
import { memoryOverlayStore } from "@/lib/verification/stateStore";
import { verifyUkPrison } from "@/lib/verification/runVerification";
import { verifyUsPrison } from "@/lib/verification/runUsVerification";
import { resolveUsAuthority } from "@/lib/verification/usAuthority";
import { canOverrideFromUsSourceUrl, isBopGovUrl } from "@/lib/verification/usSourcePolicy";
import { extractBopFacts } from "@/lib/verification/extractBopFacts";
import { matchBopLocation } from "@/lib/verification/discoverUsSource";
import { usNamesEquivalent, usPhonesEqual, usZipsEqual } from "@/lib/verification/normalize";
import { usComparePolicy } from "@/lib/verification/usSourcePolicy";
import type { HttpGet } from "@/lib/verification/govukClient";
import type { BopLocation } from "@/lib/verification/bopClient";
import type { PrisonVerificationInput } from "@/lib/verification/types";
import { PROTECTED_CONTENT_FIELDS } from "@/lib/verification/types";
import { facilityVerificationRecords, getFacilityVerification } from "@/data/facilitySources";

const ALDERSON_LOC: BopLocation = {
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

const ALICEVILLE_LOC: BopLocation = {
  code: "ALI",
  name: "Aliceville",
  nameTitle: "FCI Aliceville",
  nameDisplay: "Aliceville FCI",
  type: "FCI",
  securityLevel: "Low",
  url: "/locations/institutions/ali/",
  address: "11070 HIGHWAY 14",
  city: "ALICEVILLE",
  state: "AL",
  zipCode: "35442",
  phoneNumber: "205-373-9999",
  contactEmail: "ALI-ExecAssistant-S@bop.gov",
  locationtype: "inst",
  privateFacl: "f",
  faclTypeDescription: "Federal Correctional Institution",
};

const ADMAX_LOC: BopLocation = {
  code: "FLM",
  name: "Florence",
  nameTitle: "USP Florence ADMAX",
  nameDisplay: "Florence ADMAX USP",
  type: "USP",
  securityLevel: "Administrative",
  url: "/locations/institutions/flm/",
  address: "5880 HWY 67 SOUTH",
  city: "FLORENCE",
  state: "CO",
  zipCode: "81226",
  phoneNumber: "719-784-9464",
  contactEmail: "FLM-ExecAssistant-S@bop.gov",
  locationtype: "inst",
  privateFacl: "f",
  faclTypeDescription: "United States Penitentiary",
};

const BOP_DIRECTORY: BopLocation[] = [ALDERSON_LOC, ALICEVILLE_LOC, ADMAX_LOC];

function usFederal(overrides: Partial<PrisonVerificationInput> = {}): PrisonVerificationInput {
  return {
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
    securityLevel: "Low",
    facilityType: "fpc",
    city: "Alderson",
    stateOrRegion: "West Virginia",
    ...overrides,
  };
}

function ukPrison(): PrisonVerificationInput {
  return {
    slug: "hmp-belmarsh",
    countrySlug: "uk",
    country: "United Kingdom",
    dataProvenance: "hmpps_import",
    name: "HMP Belmarsh",
    address: "Western Way, Thamesmead, London, SE28 0EB",
    postcode: "SE28 0EB",
    phone: "020 8331 4400",
    operator: "Public Sector Prison",
    securityLevel: "Category A",
  };
}

function statePrison(overrides: Partial<PrisonVerificationInput> = {}): PrisonVerificationInput {
  return {
    slug: "san-quentin",
    countrySlug: "united-states",
    country: "United States",
    dataProvenance: "manual",
    name: "San Quentin State Prison",
    operator: "California Department of Corrections and Rehabilitation",
    securityLevel: "Maximum",
    city: "San Quentin",
    stateOrRegion: "California",
    ...overrides,
  };
}

function forbiddenHttp(): HttpGet {
  return async (url) => {
    throw new Error(`HTTP should not have been called for ${url}`);
  };
}

test("US name/phone/ZIP normalisation", () => {
  assert.equal(usNamesEquivalent("Alderson Fpc", "FPC Alderson"), true);
  assert.equal(usNamesEquivalent("Allenwood Low Fci", "Allenwood Usp"), false);
  assert.equal(usPhonesEqual("(304) 445-3300", "+1 304-445-3300"), true);
  assert.equal(usZipsEqual("24910-1234", "24910"), true);
});

test("federal BOP import resolves to BOP only", () => {
  const resolved = resolveUsAuthority(usFederal());
  assert.equal(resolved.ok, true);
  if (resolved.ok) {
    assert.equal(resolved.kind, "federal-bop");
    assert.equal(isBopGovUrl("https://www.bop.gov/locations/institutions/ald/"), true);
    assert.equal(canOverrideFromUsSourceUrl("https://www.cdcr.ca.gov/facility-locator/sq/", resolved), false);
    assert.equal(canOverrideFromUsSourceUrl("https://en.wikipedia.org/wiki/FPC_Alderson", resolved), false);
  }
});

test("state operator resolves to that state's official DOC, not BOP or geography", () => {
  const resolved = resolveUsAuthority(statePrison());
  assert.equal(resolved.ok, true);
  if (resolved.ok) {
    assert.equal(resolved.kind, "state-corrections");
    assert.equal(resolved.jurisdiction, "CA");
    assert.equal(canOverrideFromUsSourceUrl("https://www.bop.gov/locations/institutions/ald/", resolved), false);
    assert.equal(canOverrideFromUsSourceUrl("https://www.cdcr.ca.gov/facility-locator/sq/", resolved), true);
    assert.equal(canOverrideFromUsSourceUrl("https://en.wikipedia.org/wiki/San_Quentin_State_Prison", resolved), false);
  }
});

test("geography alone does not establish a state corrections authority", () => {
  const resolved = resolveUsAuthority({
    slug: "mystery-prison",
    countrySlug: "united-states",
    country: "United States",
    dataProvenance: "manual",
    name: "Mystery Prison",
    stateOrRegion: "California",
    city: "Sacramento",
  });
  assert.equal(resolved.ok, false);
  if (!resolved.ok) assert.match(resolved.reason, /REVIEW_REQUIRED/);
});

test("closed BOP operator is REVIEW_REQUIRED rather than assumed current BOP authority", () => {
  const resolved = resolveUsAuthority({
    slug: "alcatraz",
    countrySlug: "united-states",
    country: "United States",
    dataProvenance: "manual",
    name: "Alcatraz Federal Penitentiary",
    operator: "Federal Bureau of Prisons (Closed)",
    stateOrRegion: "California",
  });
  assert.equal(resolved.ok, false);
});

test("unchanged BOP facts produce zero mutation", async () => {
  const store = memoryOverlayStore(emptyUsOverlay());
  const verification: FacilityVerificationRecord = {
    countrySlug: "us",
    prisonSlug: "alderson-fpc",
    sources: [
      {
        id: "official",
        name: "BOP",
        url: "https://www.bop.gov/locations/institutions/ald/",
        checkedAt: "2026-09-16",
      },
    ],
    fieldSources: { phone: ["official"], email: ["official"] },
    overrides: { phone: "304-445-3300", email: "ALD-ExecAssistant-S@bop.gov" },
  };
  const result = await verifyUsPrison({
    prison: usFederal(),
    verification,
    bopLocations: BOP_DIRECTORY,
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.audit.verificationStatus, "CURRENT");
  assert.equal(result.productionMutated, false);
  assert.equal(result.overlayWritten, false);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.ok(result.fields.every((field) => field.classification === "NO_CHANGE"));
});

test("safe factual phone change is proposed and applied only when writes are enabled", async () => {
  const prison = usFederal({ slug: "aliceville-fci", name: "Aliceville Fci", facilityType: "fci", phone: "205-373-5000", postcode: "35442", address: "11070 HIGHWAY 14", securityLevel: "Low" });
  const compared = compareFacts({
    published: publishedFacts(prison),
    official: extractBopFacts(ALICEVILLE_LOC),
    sourceUrl: "https://www.bop.gov/locations/institutions/ali/",
    policy: usComparePolicy((url) => isBopGovUrl(url)),
  });
  const phone = compared.fields.find((field) => field.field === "phone");
  assert.equal(phone?.classification, "SAFE_AUTO_CHANGE");
  assert.equal(phone?.wouldAutoApply, true);

  const dryStore = memoryOverlayStore(emptyUsOverlay());
  const dry = await verifyUsPrison({
    prison,
    bopLocations: BOP_DIRECTORY,
    overlayStore: dryStore,
    options: { dryRun: true, writesEnabled: false, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(dry.audit.wouldHaveAutoApplied.some((field) => field.field === "phone"), true);
  assert.equal(dry.productionMutated, false);
  assert.equal(Object.keys(dryStore.snapshot().entries).length, 0);

  const writeStore = memoryOverlayStore(emptyUsOverlay());
  const written = await verifyUsPrison({
    prison,
    bopLocations: BOP_DIRECTORY,
    overlayStore: writeStore,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(written.productionMutated, true);
  assert.equal(writeStore.snapshot().entries["us/aliceville-fci"].overrides.phone, "205-373-9999");
});

test("ambiguous name mismatch is REVIEW_REQUIRED", () => {
  const compared = compareFacts({
    published: publishedFacts(usFederal({ name: "Aldersonn Fpc" })),
    official: { officialName: "Alderson FPC", withdrawn: false },
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    policy: usComparePolicy((url) => isBopGovUrl(url)),
  });
  const name = compared.fields.find((field) => field.field === "name");
  assert.equal(name?.classification, "REVIEW_REQUIRED");
  assert.equal(overallStatus(compared.fields, false), "REVIEW_REQUIRED");
});

test("missing official field does not auto-delete the existing value", () => {
  const compared = compareFacts({
    published: publishedFacts(usFederal()),
    official: {
      officialName: "Alderson FPC",
      address: "GLEN RAY RD. BOX A",
      postcode: "24910",
      withdrawn: false,
    },
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    policy: usComparePolicy((url) => isBopGovUrl(url)),
  });
  const phone = compared.fields.find((field) => field.field === "phone");
  assert.equal(phone?.classification, "NO_CHANGE");
  assert.equal(phone?.currentValue, "304-445-3300");
  assert.equal(phone?.wouldAutoApply, false);
});

test("unidentified BOP directory match is REVIEW_REQUIRED, not web consensus", async () => {
  const store = memoryOverlayStore(emptyUsOverlay());
  let httpCalled = false;
  const result = await verifyUsPrison({
    prison: usFederal({ slug: "dublin-fci", name: "Dublin Fci", facilityType: "fci" }),
    bopLocations: BOP_DIRECTORY,
    http: async (url) => {
      httpCalled = true;
      return { ok: true, status: 200, text: url };
    },
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.audit.verificationStatus, "REVIEW_REQUIRED");
  assert.equal(result.productionMutated, false);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.equal(httpCalled, false);
  assert.match(result.authority?.evidence ?? result.audit.evidence, /BOP|directory|authority/i);
});

test("malformed AI response yields zero mutation", async () => {
  const store = memoryOverlayStore(emptyUsOverlay());
  const result = await verifyUsPrison({
    prison: usFederal(),
    bopLocations: BOP_DIRECTORY,
    overlayStore: store,
    options: {
      dryRun: false,
      writesEnabled: true,
      now: new Date("2026-09-16T12:00:00Z"),
      aiExtractionRaw: "definitely not json {",
    },
  });
  assert.equal(result.audit.verificationStatus, "VERIFICATION_FAILED");
  assert.equal(result.productionMutated, false);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.match(result.audit.errors.join(" "), /Malformed AI/);
  assert.equal(validateAiExtraction({ extra: true, phone: "1" }).ok, false);
});

test("non-government evidence cannot override BOP data", () => {
  const compared = compareFacts({
    published: publishedFacts(usFederal()),
    official: extractBopFacts({ ...ALDERSON_LOC, phoneNumber: "999-999-9999" }),
    sourceUrl: "https://en.wikipedia.org/wiki/FPC_Alderson",
    policy: usComparePolicy((url) => isBopGovUrl(url)),
  });
  assert.ok(compared.fields.every((field) => field.classification !== "SAFE_AUTO_CHANGE"));
  const phone = compared.fields.find((field) => field.field === "phone");
  assert.equal(phone?.classification, "REVIEW_REQUIRED");
});

test("state prison is not overridden by BOP and does not scrape the open web", async () => {
  const store = memoryOverlayStore(emptyUsOverlay());
  const result = await verifyUsPrison({
    prison: statePrison(),
    bopLocations: BOP_DIRECTORY,
    http: forbiddenHttp(),
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.audit.verificationStatus, "REVIEW_REQUIRED");
  assert.equal(result.productionMutated, false);
  assert.equal(result.authority?.kind, "state-corrections");
  assert.match(result.audit.evidence, /cdcr\.ca\.gov|not searching the open web/i);
});

test("US worker cannot mutate UK records", async () => {
  assert.equal(isUkPrison(ukPrison()), true);
  const store = memoryOverlayStore(emptyUsOverlay());
  const result = await verifyUsPrison({
    prison: ukPrison(),
    bopLocations: BOP_DIRECTORY,
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.productionMutated, false);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.match(result.audit.errors.join(" "), /non-US/);

  const applied = applyUsSafeAutoChanges({
    countrySlug: "uk",
    prisonSlug: "hmp-belmarsh",
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    fields: [
      {
        field: "phone",
        classification: "SAFE_AUTO_CHANGE",
        officialValue: "304-445-3300",
        evidence: "test",
        confidence: "high",
        wouldAutoApply: true,
      },
    ],
    writesEnabled: true,
    now: new Date("2026-09-16T12:00:00Z"),
    store,
  });
  assert.equal(applied.overlayWritten, false);
});

test("UK worker still cannot mutate US records after the US verifier lands", async () => {
  const store = memoryOverlayStore();
  const result = await verifyUkPrison({
    prison: usFederal(),
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.productionMutated, false);
  const applied = applySafeAutoChanges({
    countrySlug: "us",
    prisonSlug: "alderson-fpc",
    sourceUrl: "https://www.gov.uk/guidance/belmarsh-prison",
    fields: [
      {
        field: "phone",
        classification: "SAFE_AUTO_CHANGE",
        officialValue: "020 8331 4400",
        evidence: "test",
        confidence: "high",
        wouldAutoApply: true,
      },
    ],
    writesEnabled: true,
    now: new Date("2026-09-16T12:00:00Z"),
    store,
  });
  assert.equal(applied.overlayWritten, false);
});

test("audit record is created with source, diffs, and classifications", async () => {
  const result = await verifyUsPrison({
    prison: usFederal({ phone: "304-000-0000" }),
    bopLocations: BOP_DIRECTORY,
    overlayStore: memoryOverlayStore(emptyUsOverlay()),
    options: { dryRun: true, writesEnabled: false, now: new Date("2026-09-16T12:00:00Z") },
  });
  const audit = result.audit;
  assert.equal(audit.prisonSlug, "alderson-fpc");
  assert.equal(audit.country, "us");
  assert.equal(audit.dryRun, true);
  assert.ok(audit.authoritativeSourceUrls[0]?.includes("bop.gov"));
  assert.ok(audit.fieldsChecked.includes("phone"));
  assert.ok(audit.differences.some((field) => field.field === "phone" && field.classification === "SAFE_AUTO_CHANGE"));
  assert.equal(audit.changesApplied.length, 0);
  assert.ok(audit.wouldHaveAutoApplied.some((field) => field.field === "phone"));
  assert.equal(audit.runStatus, "success");
  assert.equal(result.authority?.kind, "federal-bop");
});

test("dry-run cannot mutate production data even if writesEnabled is accidentally true", async () => {
  const store = memoryOverlayStore(emptyUsOverlay());
  const result = await verifyUsPrison({
    prison: usFederal({ phone: "304-000-0000" }),
    bopLocations: BOP_DIRECTORY,
    overlayStore: store,
    options: { dryRun: true, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.productionMutated, false);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.equal(productionUsWritesEnabled({ writeFlag: true, env: {} }), false);
  assert.equal(productionUsWritesEnabled({ writeFlag: false, env: { US_PRISON_VERIFIER_WRITE: "1" } }), false);
  assert.equal(productionUsWritesEnabled({ writeFlag: true, env: { US_PRISON_VERIFIER_WRITE: "1" } }), true);
  assert.equal(productionWritesEnabled({ writeFlag: true, env: { US_PRISON_VERIFIER_WRITE: "1" } }), false);
});

test("selection prefers never verified, then failed, then oldest, and never includes UK", () => {
  const prisons = [
    usFederal({ slug: "us-current", name: "Current" }),
    usFederal({ slug: "us-failed", name: "Failed" }),
    usFederal({ slug: "us-new", name: "New" }),
    usFederal({ slug: "us-old", name: "Old" }),
    ukPrison(),
  ];
  const selected = selectUsPrisonsDue({
    prisons,
    now: new Date("2026-09-16T12:00:00Z"),
    limit: 3,
    state: {
      "us-current": {
        prisonSlug: "us-current",
        countrySlug: "us",
        verificationStatus: "CURRENT",
        lastVerifiedAt: "2026-09-01T00:00:00Z",
        nextVerificationAt: "2026-10-01T00:00:00Z",
      },
      "us-failed": {
        prisonSlug: "us-failed",
        countrySlug: "us",
        verificationStatus: "VERIFICATION_FAILED",
        lastVerifiedAt: "2026-09-15T00:00:00Z",
        nextVerificationAt: "2026-09-16T00:00:00Z",
      },
      "us-old": {
        prisonSlug: "us-old",
        countrySlug: "us",
        verificationStatus: "CURRENT",
        lastVerifiedAt: "2026-01-01T00:00:00Z",
        nextVerificationAt: "2026-02-01T00:00:00Z",
      },
    },
  });
  assert.deepEqual(
    selected.map((p) => p.slug),
    ["us-new", "us-failed", "us-old"],
  );
  assert.ok(!selected.some((p) => p.countrySlug === "uk"));
});

test("ADX Florence uniquely matches the BOP ADMAX listing, not other Florence facilities", () => {
  const match = matchBopLocation(
    {
      slug: "adx-florence",
      countrySlug: "united-states",
      country: "United States",
      dataProvenance: "manual",
      name: "ADX Florence",
      operator: "Federal Bureau of Prisons",
    },
    BOP_DIRECTORY,
  );
  assert.equal(match?.code, "FLM");
});

test("empty US overlay leaves existing UK facility verification records unchanged", () => {
  assert.equal(facilityVerificationRecords.length, 30);
  const belmarsh = getFacilityVerification("uk", "hmp-belmarsh");
  assert.ok(belmarsh);
  assert.equal(belmarsh.overrides?.phone, "020 8331 4400");
  assert.equal(getFacilityVerification("us", "alderson-fpc"), undefined);
});

test("protected prose and URL fields are not in the compare set", () => {
  const compared = compareFacts({
    published: publishedFacts(usFederal()),
    official: extractBopFacts(ALDERSON_LOC),
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    policy: usComparePolicy((url) => isBopGovUrl(url)),
  });
  for (const protectedField of PROTECTED_CONTENT_FIELDS) {
    assert.ok(!compared.fields.some((field) => field.field === (protectedField as never)));
  }
});

test("applyUsSafeAutoChanges is a no-op without writesEnabled and will not write a UK overlay file", () => {
  const store = memoryOverlayStore(emptyUsOverlay());
  const dry = applyUsSafeAutoChanges({
    countrySlug: "us",
    prisonSlug: "alderson-fpc",
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    fields: [
      {
        field: "phone",
        classification: "SAFE_AUTO_CHANGE",
        officialValue: "304-445-3300",
        evidence: "test",
        confidence: "high",
        wouldAutoApply: true,
      },
    ],
    writesEnabled: false,
    now: new Date("2026-09-16T12:00:00Z"),
    store,
  });
  assert.equal(dry.overlayWritten, false);

  const ukStore = memoryOverlayStore(emptyOverlay());
  const mixed = applyUsSafeAutoChanges({
    countrySlug: "us",
    prisonSlug: "alderson-fpc",
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    fields: [
      {
        field: "phone",
        classification: "SAFE_AUTO_CHANGE",
        officialValue: "304-445-3300",
        evidence: "test",
        confidence: "high",
        wouldAutoApply: true,
      },
    ],
    writesEnabled: true,
    now: new Date("2026-09-16T12:00:00Z"),
    store: ukStore,
  });
  assert.equal(mixed.overlayWritten, false);
  assert.equal(ukStore.snapshot().generatedBy, "uk-prison-verifier");
});

test("isUsPrison covers BOP import and legacy united-states slugs", () => {
  assert.equal(isUsPrison(usFederal()), true);
  assert.equal(isUsPrison(statePrison()), true);
  assert.equal(isUsPrison(ukPrison()), false);
});

test("ADX Florence name matches BOP Florence ADMAX USP after normalisation", () => {
  assert.equal(usNamesEquivalent("ADX Florence", "Florence ADMAX USP"), true);
  assert.equal(usNamesEquivalent("ADX Florence", "USP Florence ADMAX"), true);
});

test("closed or historical US facilities are excluded from the active verifier queue", () => {
  const alcatraz: PrisonVerificationInput = {
    slug: "alcatraz",
    countrySlug: "united-states",
    country: "United States",
    name: "Alcatraz Federal Penitentiary",
    operator: "Federal Bureau of Prisons (Closed)",
    facilityType: "Historical / Museum",
  };
  const active: PrisonVerificationInput = {
    slug: "adx-florence",
    countrySlug: "united-states",
    country: "United States",
    name: "ADX Florence",
    operator: "Federal Bureau of Prisons",
  };
  assert.equal(isExcludedFromUsActiveQueue(alcatraz), true);
  assert.equal(isExcludedFromUsActiveQueue(active), false);

  const selected = selectUsPrisonsDue({
    prisons: [alcatraz, active],
    state: {},
    now: new Date("2026-09-16T12:00:00Z"),
    limit: 5,
  });
  assert.deepEqual(
    selected.map((p) => p.slug),
    ["adx-florence"],
  );
});
