import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applySafeFills,
  attachSuppressedCompleteness,
  evaluateCompleteness,
  productionCompletenessWritesEnabled,
  productionUsCompletenessWritesEnabled,
} from "@/lib/verification/completeness";
import { emptyOverlay, emptyUsOverlay, type OverlayStore } from "@/lib/verification/applyChanges";
import type { OfficialFacts, PublishedFacts } from "@/lib/verification/types";

function memoryStore(initial = emptyOverlay()): OverlayStore & { snapshot: () => ReturnType<OverlayStore["read"]> } {
  let file = initial;
  return {
    read: () => file,
    write: (next) => {
      file = next;
    },
    snapshot: () => file,
  };
}

const publishedEmptyEmail: PublishedFacts = {
  name: "HMP Example",
  address: "1 Test Road",
  postcode: "AB1 2CD",
  phone: "01234 567890",
};

const officialWithEmail: OfficialFacts = {
  officialName: "Example Prison",
  address: "1 Test Road",
  postcode: "AB1 2CD",
  phone: "01234 567890",
  email: "example@justice.gov.uk",
  visitingTelephone: "01234 000000",
  governor: "A Governor",
  withdrawn: false,
};

test("empty + explicit authoritative value → SAFE_FILL", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: true,
  });
  assert.equal(report.suppressed, false);
  assert.ok(report.emptyFieldsFound.includes("email"));
  assert.equal(report.safeFills.length, 1);
  assert.equal(report.safeFills[0]?.field, "email");
  assert.equal(report.safeFills[0]?.classification, "SAFE_FILL");
  assert.equal(report.safeFills[0]?.kind, "SAFE_FILL");
  assert.equal(report.safeFills[0]?.wouldWrite, false);
});

test("populated field → no completeness mutation", () => {
  const report = evaluateCompleteness({
    published: { ...publishedEmptyEmail, email: "already@example.com", phone: "01234 567890" },
    official: officialWithEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: true,
    completenessWritesEnabled: true,
  });
  assert.equal(report.safeFills.length, 0);
  const store = memoryStore();
  const applied = applySafeFills({
    countrySlug: "uk",
    prisonSlug: "hmp-example",
    sourceUrl: "https://www.gov.uk/guidance/example-prison",
    published: { ...publishedEmptyEmail, email: "already@example.com" },
    report,
    writesEnabled: true,
    now: new Date("2026-09-17T10:00:00Z"),
    store,
    market: "uk",
  });
  assert.equal(applied.completenessMutated, false);
  assert.deepEqual(store.snapshot().entries, {});
});

test("empty + no official value → NO_SOURCE_VALUE", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: { ...officialWithEmail, email: undefined },
    verificationStatus: "CURRENT",
    sourceAvailable: true,
  });
  assert.ok(report.noSourceValues.some((row) => row.field === "email" && row.classification === "NO_SOURCE_VALUE"));
  assert.equal(report.safeFills.length, 0);
});

test("ambiguous address fill → REVIEW_REQUIRED", () => {
  const report = evaluateCompleteness({
    published: { name: "HMP Example" },
    official: { ...officialWithEmail, address: "Official House, Official Street" },
    verificationStatus: "CURRENT",
    sourceAvailable: true,
  });
  assert.ok(
    report.completenessReviewRequired.some(
      (row) => row.field === "address" && row.classification === "REVIEW_REQUIRED",
    ),
  );
  assert.equal(report.safeFills.some((row) => row.field === "address"), false);
});

test("unsupported official fields → report only", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: true,
  });
  const unsupported = report.unsupportedFieldsFound.map((row) => row.field).sort();
  assert.ok(unsupported.includes("visitingTelephone"));
  assert.ok(unsupported.includes("governor"));
  assert.ok(report.unsupportedFieldsFound.every((row) => row.wouldWrite === false));
});

test("facility REVIEW_REQUIRED → suppress completeness writes", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "REVIEW_REQUIRED",
    sourceAvailable: true,
    completenessWritesEnabled: true,
  });
  assert.equal(report.suppressed, true);
  assert.equal(report.safeFills.length, 0);
  const store = memoryStore();
  const applied = applySafeFills({
    countrySlug: "uk",
    prisonSlug: "hmp-example",
    sourceUrl: "https://www.gov.uk/guidance/example-prison",
    published: publishedEmptyEmail,
    report,
    writesEnabled: true,
    now: new Date("2026-09-17T10:00:00Z"),
    store,
    market: "uk",
  });
  assert.equal(applied.completenessMutated, false);
  assert.deepEqual(store.snapshot().entries, {});
});

test("source unavailable → zero mutations", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: false,
    completenessWritesEnabled: true,
  });
  assert.equal(report.suppressed, true);
  assert.equal(report.safeFills.length, 0);
});

test("malformed / failed verify → zero completeness mutations", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "VERIFICATION_FAILED",
    sourceAvailable: true,
    completenessWritesEnabled: true,
  });
  assert.equal(report.suppressed, true);
  assert.equal(report.safeFills.length, 0);
});

test("non-authoritative path does not create SAFE_FILL when official omitted", () => {
  const report = attachSuppressedCompleteness(
    publishedEmptyEmail,
    "Non-authoritative evidence cannot drive SAFE_FILL.",
    true,
  );
  assert.equal(report.suppressed, true);
  assert.equal(report.safeFills.length, 0);
});

test("UK completeness writer refuses US records", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: true,
    completenessWritesEnabled: true,
  });
  const store = memoryStore();
  const applied = applySafeFills({
    countrySlug: "us",
    prisonSlug: "alderson-fpc",
    sourceUrl: "https://www.bop.gov/locations/institutions/ald/",
    published: publishedEmptyEmail,
    report,
    writesEnabled: true,
    now: new Date("2026-09-17T10:00:00Z"),
    store,
    market: "uk",
  });
  assert.equal(applied.completenessMutated, false);
});

test("US completeness writer refuses UK records", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: true,
    completenessWritesEnabled: true,
  });
  const store = memoryStore(emptyUsOverlay());
  const applied = applySafeFills({
    countrySlug: "uk",
    prisonSlug: "hmp-belmarsh",
    sourceUrl: "https://www.gov.uk/guidance/belmarsh-prison",
    published: publishedEmptyEmail,
    report,
    writesEnabled: true,
    now: new Date("2026-09-17T10:00:00Z"),
    store,
    market: "us",
  });
  assert.equal(applied.completenessMutated, false);
});

test("historical excluded from active completeness", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: true,
    completenessWritesEnabled: true,
    historicalExcluded: true,
  });
  assert.equal(report.suppressed, true);
  assert.match(report.suppressReason ?? "", /Historical/i);
});

test("dry-run cannot mutate even when SAFE_FILL exists", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: true,
    completenessWritesEnabled: false,
  });
  assert.equal(report.safeFills[0]?.wouldWrite, false);
  const store = memoryStore();
  const applied = applySafeFills({
    countrySlug: "uk",
    prisonSlug: "hmp-example",
    sourceUrl: "https://www.gov.uk/guidance/example-prison",
    published: publishedEmptyEmail,
    report,
    writesEnabled: false,
    now: new Date("2026-09-17T10:00:00Z"),
    store,
    market: "uk",
  });
  assert.equal(applied.completenessMutated, false);
  assert.deepEqual(store.snapshot().entries, {});
});

test("completeness writes remain gated behind dedicated flags", () => {
  assert.equal(productionCompletenessWritesEnabled({ writeFlag: true, env: {} }), false);
  assert.equal(
    productionCompletenessWritesEnabled({ writeFlag: true, env: { UK_PRISON_COMPLETENESS_WRITE: "1" } }),
    true,
  );
  assert.equal(
    productionUsCompletenessWritesEnabled({ writeFlag: true, env: { UK_PRISON_COMPLETENESS_WRITE: "1" } }),
    false,
  );
  assert.equal(
    productionUsCompletenessWritesEnabled({ writeFlag: true, env: { US_PRISON_COMPLETENESS_WRITE: "1" } }),
    true,
  );
});

test("SAFE_FILL applies additively when completeness writes enabled", () => {
  const report = evaluateCompleteness({
    published: publishedEmptyEmail,
    official: officialWithEmail,
    verificationStatus: "CURRENT",
    sourceAvailable: true,
    completenessWritesEnabled: true,
  });
  const store = memoryStore();
  const applied = applySafeFills({
    countrySlug: "uk",
    prisonSlug: "hmp-example",
    sourceUrl: "https://www.gov.uk/guidance/example-prison",
    published: publishedEmptyEmail,
    report,
    writesEnabled: true,
    now: new Date("2026-09-17T10:00:00Z"),
    store,
    market: "uk",
  });
  assert.equal(applied.completenessMutated, true);
  assert.equal(applied.fillsApplied[0]?.field, "email");
  const entry = store.snapshot().entries["uk/hmp-example"];
  assert.equal(entry?.overrides.email, "example@justice.gov.uk");
  assert.equal(entry?.overrides.phone, undefined);
});
