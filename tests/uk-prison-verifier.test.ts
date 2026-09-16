import assert from "node:assert/strict";
import test from "node:test";
import type { FacilityVerificationRecord } from "@/types/facilitySource";
import { extractGovukFacts } from "@/lib/verification/extractGovukFacts";
import { compareFacts, overallStatus } from "@/lib/verification/compare";
import { publishedFacts } from "@/lib/verification/publishedFacts";
import { validateAiExtraction } from "@/lib/verification/aiGuard";
import { selectUkPrisonsDue, isUsPrison } from "@/lib/verification/selectPrison";
import { applySafeAutoChanges, emptyOverlay, productionWritesEnabled } from "@/lib/verification/applyChanges";
import { memoryOverlayStore } from "@/lib/verification/stateStore";
import { verifyUkPrison } from "@/lib/verification/runVerification";
import { canOverrideFromSourceUrl, isAuthoritativeUkGovUrl } from "@/lib/verification/sourcePolicy";
import { namesEquivalent, phonesEqual, postcodesEqual } from "@/lib/verification/normalize";
import { matchCollectionEntry } from "@/lib/verification/discoverSource";
import type { HttpGet } from "@/lib/verification/govukClient";
import type { GovukCollectionEntry, PrisonVerificationInput } from "@/lib/verification/types";
import { PROTECTED_CONTENT_FIELDS } from "@/lib/verification/types";
import { facilityVerificationRecords, getFacilityVerification } from "@/data/facilitySources";

const BELMARSH_BODY = `
Book and plan your visit to Belmarsh
How to book family and friends visits
To arrange a visit you can:
book your visit online
email, belmarsh.visits@justice.gov.uk
telephone, 0208 331 4760
Getting to Belmarsh
There is a visitors car park with spaces for Blue Badge holders.
Contact Belmarsh
Governor: Jenny Louis
Telephone: 020 8331 4400
Monday to Friday, 7am to 8pm
Email: communications.Belmarsh@justice.gov.uk
Address
HMP Belmarsh Western Way Thamesmead London SE28 0EB
See map
`;

const BELMARSH_CONTENT = {
  title: "Belmarsh Prison",
  description: "Belmarsh is a high security prisoner’s prison in southeast London.",
  base_path: "/guidance/belmarsh-prison",
  public_updated_at: "2025-10-21T12:21:33Z",
  withdrawn_notice: {},
  details: { body: BELMARSH_BODY },
  links: { organisations: [{ title: "HM Prison and Probation Service", slug: "hm-prison-and-probation-service" }] },
};

function ukPrison(overrides: Partial<PrisonVerificationInput> = {}): PrisonVerificationInput {
  return {
    slug: "hmp-belmarsh",
    countrySlug: "uk",
    country: "United Kingdom",
    institutionalId: "hmpps-prison:hmp-belmarsh",
    dataProvenance: "hmpps_import",
    name: "HMP Belmarsh",
    address: "Western Way, Thamesmead, London, SE28 0EB",
    postcode: "SE28 0EB",
    phone: "(020) 8334 4400",
    operator: "Public Sector Prison",
    securityLevel: "Category A",
    ...overrides,
  };
}

function usPrison(): PrisonVerificationInput {
  return {
    slug: "florence-admax-usp",
    countrySlug: "us",
    country: "United States",
    dataProvenance: "bop_import",
    name: "ADX Florence",
    address: "5880 Hwy 67 South",
    phone: "719-784-9464",
    operator: "Federal Bureau of Prisons",
    securityLevel: "Supermax",
  };
}

function httpMap(routes: Record<string, { status?: number; json?: unknown; text?: string }>): HttpGet {
  return async (url) => {
    const hit = routes[url];
    if (!hit) return { ok: false, status: 404, text: "not found" };
    const text = hit.text ?? JSON.stringify(hit.json ?? {});
    const status = hit.status ?? 200;
    return { ok: status >= 200 && status < 400, status, text };
  };
}

const BELMARSH_ROUTES = {
  "https://www.gov.uk/api/content/guidance/belmarsh-prison": { json: BELMARSH_CONTENT },
};

const COLLECTION: GovukCollectionEntry[] = [
  {
    title: "Belmarsh Prison",
    basePath: "/guidance/belmarsh-prison",
    webUrl: "https://www.gov.uk/guidance/belmarsh-prison",
    withdrawn: false,
  },
];

test("name normalisation treats HMP Belmarsh as Belmarsh Prison", () => {
  assert.equal(namesEquivalent("HMP Belmarsh", "Belmarsh Prison"), true);
  assert.equal(phonesEqual("(020) 8331 4400", "020 8331 4400"), true);
  assert.equal(postcodesEqual("SE28 0EB", "se280eb"), true);
});

test("HTML GOV.UK contact widget extracts a clean address, not markup", () => {
  const html = `
    <h2>Contact Bedford</h2>
    <p>Governor: Sarah Bott</p>
    <p>Telephone: 01234 373 000</p>
    <p>Email: ignored@prisonadvice.org.uk</p>
    <h3>Address</h3>
    <div class="address"><div class="adr org fn"><p> HMP Bedford<br>St Loyes Street<br>Bedford<br>MK40 1HG </p></div></div>
    <p>a passing G4S or private-visits mention must not be treated as the operator</p>
  `;
  const facts = extractGovukFacts({ title: "Bedford Prison", body: html });
  assert.equal(facts.address, "HMP Bedford, St Loyes Street, Bedford, MK40 1HG");
  assert.equal(facts.postcode, "MK40 1HG");
  assert.equal(facts.phone, "01234 373 000");
  assert.equal(facts.governor, "Sarah Bott");
  assert.equal(facts.email, undefined);
  assert.equal(facts.operator, undefined);
});

test("extractor reads the Contact switchboard, not the visits booking line", () => {
  const facts = extractGovukFacts({
    title: "Belmarsh Prison",
    description: BELMARSH_CONTENT.description,
    body: BELMARSH_BODY,
  });
  assert.equal(facts.officialName, "Belmarsh Prison");
  assert.equal(facts.phone, "020 8331 4400");
  assert.notEqual(facts.phone, "0208 331 4760");
  assert.equal(facts.visitingTelephone, "0208 331 4760");
  assert.equal(facts.email, "communications.Belmarsh@justice.gov.uk");
  assert.equal(facts.governor, "Jenny Louis");
  assert.equal(facts.postcode, "SE28 0EB");
  assert.match(facts.address ?? "", /Western Way/i);
});

test("unchanged facts produce zero mutation", async () => {
  const store = memoryOverlayStore();
  const prison = ukPrison({ phone: "020 8331 4400" });
  const verification: FacilityVerificationRecord = {
    countrySlug: "uk",
    prisonSlug: "hmp-belmarsh",
    sources: [{ id: "official", name: "GOV.UK", url: "https://www.gov.uk/guidance/belmarsh-prison", checkedAt: "2026-08-20" }],
    fieldSources: { phone: ["official"], email: ["official"] },
    overrides: { phone: "020 8331 4400", email: "communications.Belmarsh@justice.gov.uk" },
  };
  const result = await verifyUkPrison({
    prison,
    verification,
    collection: COLLECTION,
    http: httpMap(BELMARSH_ROUTES),
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.audit.verificationStatus, "CURRENT");
  assert.equal(result.productionMutated, false);
  assert.equal(result.overlayWritten, false);
  assert.equal(result.audit.changesApplied.length, 0);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.ok(result.fields.every((field) => field.classification === "NO_CHANGE"));
});

test("safe factual phone change is proposed correctly and applied only when writes are enabled", async () => {
  const compared = compareFacts({
    published: publishedFacts(ukPrison()),
    official: extractGovukFacts({ title: "Belmarsh Prison", description: BELMARSH_CONTENT.description, body: BELMARSH_BODY }),
    sourceUrl: "https://www.gov.uk/guidance/belmarsh-prison",
  });
  const phone = compared.fields.find((field) => field.field === "phone");
  assert.equal(phone?.classification, "SAFE_AUTO_CHANGE");
  assert.equal(phone?.wouldAutoApply, true);
  assert.equal(phone?.officialValue, "020 8331 4400");

  const dryStore = memoryOverlayStore();
  const dry = await verifyUkPrison({
    prison: ukPrison(),
    collection: COLLECTION,
    http: httpMap(BELMARSH_ROUTES),
    overlayStore: dryStore,
    options: { dryRun: true, writesEnabled: false, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(dry.audit.wouldHaveAutoApplied.some((field) => field.field === "phone"), true);
  assert.equal(dry.productionMutated, false);
  assert.equal(Object.keys(dryStore.snapshot().entries).length, 0);

  const writeStore = memoryOverlayStore();
  const written = await verifyUkPrison({
    prison: ukPrison(),
    collection: COLLECTION,
    http: httpMap(BELMARSH_ROUTES),
    overlayStore: writeStore,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(written.productionMutated, true);
  assert.equal(writeStore.snapshot().entries["uk/hmp-belmarsh"].overrides.phone, "020 8331 4400");
});

test("ambiguous name mismatch is REVIEW_REQUIRED", () => {
  const compared = compareFacts({
    published: publishedFacts(ukPrison({ name: "HMP Wakfield" })),
    official: { officialName: "Wakefield Prison", withdrawn: false },
    sourceUrl: "https://www.gov.uk/guidance/wakefield-prison",
  });
  const name = compared.fields.find((field) => field.field === "name");
  assert.equal(name?.classification, "REVIEW_REQUIRED");
  assert.equal(overallStatus(compared.fields, false), "REVIEW_REQUIRED");
});

test("missing official field does not auto-delete the existing value", () => {
  const compared = compareFacts({
    published: publishedFacts(ukPrison()),
    official: {
      officialName: "Belmarsh Prison",
      address: "Western Way Thamesmead London SE28 0EB",
      postcode: "SE28 0EB",
      withdrawn: false,
    },
    sourceUrl: "https://www.gov.uk/guidance/belmarsh-prison",
  });
  const phone = compared.fields.find((field) => field.field === "phone");
  assert.equal(phone?.classification, "NO_CHANGE");
  assert.equal(phone?.currentValue, "(020) 8334 4400");
  assert.equal(phone?.wouldAutoApply, false);
});

test("source unavailable yields zero mutation", async () => {
  const store = memoryOverlayStore();
  const result = await verifyUkPrison({
    prison: ukPrison(),
    collection: COLLECTION,
    http: httpMap({}),
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.audit.verificationStatus, "VERIFICATION_FAILED");
  assert.equal(result.productionMutated, false);
  assert.equal(result.audit.changesApplied.length, 0);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.match(result.audit.errors.join(" "), /GOV\.UK unreachable|HTTP 404/i);
});

test("malformed AI response yields zero mutation", async () => {
  const store = memoryOverlayStore();
  const result = await verifyUkPrison({
    prison: ukPrison(),
    collection: COLLECTION,
    http: httpMap(BELMARSH_ROUTES),
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

test("non-government evidence cannot override government data", () => {
  assert.equal(isAuthoritativeUkGovUrl("https://en.wikipedia.org/wiki/HM_Prison_Belmarsh"), false);
  assert.equal(canOverrideFromSourceUrl("https://www.serco.com/uk/hmp-thameside"), false);
  const compared = compareFacts({
    published: publishedFacts(ukPrison()),
    official: extractGovukFacts({ title: "Belmarsh Prison", body: BELMARSH_BODY }),
    sourceUrl: "https://en.wikipedia.org/wiki/HM_Prison_Belmarsh",
  });
  assert.ok(compared.fields.every((field) => field.classification !== "SAFE_AUTO_CHANGE"));
  const phone = compared.fields.find((field) => field.field === "phone");
  assert.equal(phone?.classification, "REVIEW_REQUIRED");
});

test("UK worker cannot mutate US records", async () => {
  assert.equal(isUsPrison(usPrison()), true);
  const store = memoryOverlayStore();
  const result = await verifyUkPrison({
    prison: usPrison(),
    http: httpMap(BELMARSH_ROUTES),
    overlayStore: store,
    options: { dryRun: false, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.productionMutated, false);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.match(result.audit.errors.join(" "), /non-UK/);

  const applied = applySafeAutoChanges({
    countrySlug: "us",
    prisonSlug: "florence-admax-usp",
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
  const result = await verifyUkPrison({
    prison: ukPrison(),
    collection: COLLECTION,
    http: httpMap(BELMARSH_ROUTES),
    overlayStore: memoryOverlayStore(),
    options: { dryRun: true, writesEnabled: false, now: new Date("2026-09-16T12:00:00Z") },
  });
  const audit = result.audit;
  assert.equal(audit.prisonSlug, "hmp-belmarsh");
  assert.equal(audit.country, "uk");
  assert.equal(audit.dryRun, true);
  assert.ok(audit.authoritativeSourceUrls[0]?.includes("gov.uk/guidance/belmarsh-prison"));
  assert.ok(audit.fieldsChecked.includes("phone"));
  assert.ok(audit.differences.some((field) => field.field === "phone" && field.classification === "SAFE_AUTO_CHANGE"));
  assert.equal(audit.changesApplied.length, 0);
  assert.ok(audit.wouldHaveAutoApplied.some((field) => field.field === "phone"));
  assert.ok(audit.previousValues?.phone);
  assert.ok(audit.verifiedAt);
  assert.equal(audit.runStatus, "success");
});

test("dry-run cannot mutate production data even if writesEnabled is accidentally true", async () => {
  const store = memoryOverlayStore();
  const result = await verifyUkPrison({
    prison: ukPrison(),
    collection: COLLECTION,
    http: httpMap(BELMARSH_ROUTES),
    overlayStore: store,
    options: { dryRun: true, writesEnabled: true, now: new Date("2026-09-16T12:00:00Z") },
  });
  assert.equal(result.productionMutated, false);
  assert.equal(Object.keys(store.snapshot().entries).length, 0);
  assert.equal(productionWritesEnabled({ writeFlag: true, env: {} }), false);
  assert.equal(productionWritesEnabled({ writeFlag: false, env: { UK_PRISON_VERIFIER_WRITE: "1" } }), false);
  assert.equal(productionWritesEnabled({ writeFlag: true, env: { UK_PRISON_VERIFIER_WRITE: "1" } }), true);
});

test("selection prefers never verified, then failed, then oldest", () => {
  const prisons = [
    ukPrison({ slug: "hmp-current", name: "HMP Current" }),
    ukPrison({ slug: "hmp-failed", name: "HMP Failed" }),
    ukPrison({ slug: "hmp-new", name: "HMP New" }),
    ukPrison({ slug: "hmp-old", name: "HMP Old" }),
  ];
  const selected = selectUkPrisonsDue({
    prisons,
    now: new Date("2026-09-16T12:00:00Z"),
    limit: 3,
    state: {
      "hmp-current": {
        prisonSlug: "hmp-current",
        countrySlug: "uk",
        verificationStatus: "CURRENT",
        lastVerifiedAt: "2026-09-01T00:00:00Z",
        nextVerificationAt: "2026-10-01T00:00:00Z",
      },
      "hmp-failed": {
        prisonSlug: "hmp-failed",
        countrySlug: "uk",
        verificationStatus: "VERIFICATION_FAILED",
        lastVerifiedAt: "2026-09-15T00:00:00Z",
        nextVerificationAt: "2026-09-16T00:00:00Z",
      },
      "hmp-old": {
        prisonSlug: "hmp-old",
        countrySlug: "uk",
        verificationStatus: "CURRENT",
        lastVerifiedAt: "2026-01-01T00:00:00Z",
        nextVerificationAt: "2026-02-01T00:00:00Z",
      },
    },
  });
  assert.deepEqual(
    selected.map((p) => p.slug),
    ["hmp-new", "hmp-failed", "hmp-old"],
  );
  assert.ok(!selected.some((p) => p.slug === "hmp-current"));
});

test("selection never includes US prisons", () => {
  const selected = selectUkPrisonsDue({
    prisons: [usPrison(), ukPrison()],
    state: {},
    now: new Date("2026-09-16T12:00:00Z"),
    limit: 10,
  });
  assert.equal(selected.length, 1);
  assert.equal(selected[0].countrySlug, "uk");
});

test("collection matcher maps HMP YOI names onto GOV.UK titles", () => {
  const match = matchCollectionEntry(
    ukPrison({ slug: "hmp-yoi-pentonville", name: "HMP YOI Pentonville" }),
    [{ title: "Pentonville Prison", basePath: "/guidance/pentonville-prison", webUrl: "https://www.gov.uk/guidance/pentonville-prison", withdrawn: false }],
  );
  assert.equal(match?.basePath, "/guidance/pentonville-prison");
});

test("empty overlay leaves existing facility verification records unchanged", () => {
  assert.equal(facilityVerificationRecords.length, 30);
  const belmarsh = getFacilityVerification("uk", "hmp-belmarsh");
  assert.ok(belmarsh);
  assert.equal(belmarsh.overrides?.phone, "020 8331 4400");
  assert.equal(getFacilityVerification("us", "florence-admax-usp"), undefined);
});

test("protected prose and URL fields are not in the compare set", () => {
  const compared = compareFacts({
    published: publishedFacts(ukPrison()),
    official: extractGovukFacts({ title: "Belmarsh Prison", body: BELMARSH_BODY }),
    sourceUrl: "https://www.gov.uk/guidance/belmarsh-prison",
  });
  for (const protectedField of PROTECTED_CONTENT_FIELDS) {
    assert.ok(!compared.fields.some((field) => field.field === (protectedField as never)));
  }
});

test("published facts prefer existing facility overlay values", () => {
  const verification: FacilityVerificationRecord = {
    countrySlug: "uk",
    prisonSlug: "hmp-belmarsh",
    sources: [{ id: "official", name: "GOV.UK", url: "https://www.gov.uk/guidance/belmarsh-prison", checkedAt: "2026-08-20" }],
    fieldSources: { phone: ["official"] },
    overrides: { phone: "020 8331 4400" },
  };
  const facts = publishedFacts(ukPrison(), verification);
  assert.equal(facts.phone, "020 8331 4400");
});

test("applySafeAutoChanges is a no-op without writesEnabled", () => {
  const store = memoryOverlayStore(emptyOverlay());
  const result = applySafeAutoChanges({
    countrySlug: "uk",
    prisonSlug: "hmp-belmarsh",
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
    writesEnabled: false,
    now: new Date("2026-09-16T12:00:00Z"),
    store,
  });
  assert.equal(result.overlayWritten, false);
  assert.deepEqual(store.snapshot().entries, {});
});
