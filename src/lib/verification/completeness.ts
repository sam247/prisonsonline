import type { FacilityFactOverrides } from "@/types/facilitySource";
import { emptyOverlay, emptyUsOverlay, overlayKey, type OverlayStore } from "./applyChanges";
import { collapseSpace, isoNow } from "./normalize";
import { isUkPrison, isUsPrison } from "./selectPrison";
import type {
  CompletenessFieldResult,
  CompletenessFillField,
  CompletenessReport,
  OfficialFacts,
  PublishedFacts,
  VerificationStatus,
} from "./types";

/** Additive whitelist: phone, official email, postcode/ZIP only. */
export const SAFE_FILL_FIELDS: readonly CompletenessFillField[] = ["phone", "email", "postcode"];

/** Official facts observed but not written onto the prison schema. */
export const UNSUPPORTED_OFFICIAL_FIELDS = [
  "visitingTelephone",
  "governor",
  "gettingThere",
  "fax",
] as const;

function isBlank(value?: string | null): boolean {
  return !collapseSpace(value ?? undefined);
}

function present(value?: string | null): string | undefined {
  const v = collapseSpace(value ?? undefined);
  return v ? v : undefined;
}

function publishedField(published: PublishedFacts, field: string): string | undefined {
  if (field === "phone") return published.phone;
  if (field === "email") return published.email;
  if (field === "postcode") return published.postcode;
  if (field === "address") return published.address;
  return undefined;
}

function officialField(official: OfficialFacts, field: string): string | undefined {
  if (field === "phone") return present(official.phone);
  if (field === "email") return present(official.email);
  if (field === "postcode") return present(official.postcode);
  if (field === "address") return present(official.address);
  if (field === "visitingTelephone") return present(official.visitingTelephone);
  if (field === "governor") return present(official.governor);
  if (field === "gettingThere") return present(official.gettingThere);
  if (field === "fax") return present(official.fax);
  return undefined;
}

/** Both CLI --completeness-write and UK_PRISON_COMPLETENESS_WRITE=1 required. Default off. */
export function productionCompletenessWritesEnabled(input: {
  writeFlag?: boolean;
  env?: Record<string, string | undefined>;
}): boolean {
  return Boolean(input.writeFlag) && input.env?.UK_PRISON_COMPLETENESS_WRITE === "1";
}

/** Both CLI --completeness-write and US_PRISON_COMPLETENESS_WRITE=1 required. Default off. */
export function productionUsCompletenessWritesEnabled(input: {
  writeFlag?: boolean;
  env?: Record<string, string | undefined>;
}): boolean {
  return Boolean(input.writeFlag) && input.env?.US_PRISON_COMPLETENESS_WRITE === "1";
}

function blankReport(writesEnabled: boolean, suppressed: boolean, reason?: string): CompletenessReport {
  return {
    suppressed,
    suppressReason: reason,
    emptyFieldsFound: [],
    safeFills: [],
    fillsApplied: [],
    unsupportedFieldsFound: [],
    completenessReviewRequired: [],
    noSourceValues: [],
    completenessWritesEnabled: writesEnabled,
    completenessMutated: false,
  };
}

export function collectEmptySupportedFields(published: PublishedFacts): string[] {
  const empty: string[] = [];
  for (const field of [...SAFE_FILL_FIELDS, "address"] as const) {
    if (isBlank(publishedField(published, field))) empty.push(field);
  }
  return empty;
}

/**
 * EMPTY FIELD COMPLETENESS — additive only.
 * Never overwrites populated values. NO_SOURCE_VALUE / REVIEW_REQUIRED /
 * UNSUPPORTED_FIELD never mutate schema.
 */
export function evaluateCompleteness(input: {
  published: PublishedFacts;
  official?: OfficialFacts;
  verificationStatus: VerificationStatus;
  sourceAvailable: boolean;
  completenessWritesEnabled?: boolean;
  historicalExcluded?: boolean;
}): CompletenessReport {
  const writesEnabled = Boolean(input.completenessWritesEnabled);
  const emptyFieldsFound = collectEmptySupportedFields(input.published);

  if (input.historicalExcluded) {
    return {
      ...blankReport(writesEnabled, true, "Historical/closed facility excluded from active completeness."),
      emptyFieldsFound,
    };
  }

  if (!input.sourceAvailable || !input.official) {
    return {
      ...blankReport(writesEnabled, true, "Authoritative source unavailable — zero completeness mutations."),
      emptyFieldsFound,
    };
  }

  if (input.verificationStatus === "VERIFICATION_FAILED") {
    return {
      ...blankReport(writesEnabled, true, "VERIFY failed — completeness writes suppressed."),
      emptyFieldsFound,
    };
  }

  if (input.verificationStatus === "REVIEW_REQUIRED") {
    return {
      ...blankReport(
        writesEnabled,
        true,
        "Facility/identity-level REVIEW_REQUIRED — completeness writes suppressed.",
      ),
      emptyFieldsFound,
    };
  }

  const official = input.official;
  const safeFills: CompletenessFieldResult[] = [];
  const noSourceValues: CompletenessFieldResult[] = [];
  const completenessReviewRequired: CompletenessFieldResult[] = [];
  const unsupportedFieldsFound: CompletenessFieldResult[] = [];

  for (const field of SAFE_FILL_FIELDS) {
    if (!isBlank(publishedField(input.published, field))) continue;

    const officialValue = officialField(official, field);
    if (officialValue) {
      safeFills.push({
        field,
        classification: "SAFE_FILL",
        kind: "SAFE_FILL",
        publishedValue: undefined,
        officialValue,
        evidence: `Empty published ${field}; authoritative source provides an explicit value. Additive SAFE_FILL only (not a VERIFY correction).`,
        wouldWrite: writesEnabled,
      });
    } else {
      noSourceValues.push({
        field,
        classification: "NO_SOURCE_VALUE",
        publishedValue: undefined,
        evidence: `Empty published ${field}; authoritative source did not provide a value. No schema mutation.`,
        wouldWrite: false,
      });
    }
  }

  if (isBlank(input.published.address)) {
    const officialAddress = officialField(official, "address");
    if (officialAddress) {
      completenessReviewRequired.push({
        field: "address",
        classification: "REVIEW_REQUIRED",
        officialValue: officialAddress,
        evidence:
          "Empty published address with an official address present. Address fills require review — not SAFE_FILL.",
        wouldWrite: false,
      });
    } else {
      noSourceValues.push({
        field: "address",
        classification: "NO_SOURCE_VALUE",
        evidence: "Empty published address; authoritative source omitted address. No schema mutation.",
        wouldWrite: false,
      });
    }
  }

  for (const field of UNSUPPORTED_OFFICIAL_FIELDS) {
    const value = officialField(official, field);
    if (!value) continue;
    unsupportedFieldsFound.push({
      field,
      classification: "UNSUPPORTED_FIELD",
      officialValue: value,
      evidence: `Authoritative source exposes ${field}, but the prison schema has no supported write path. Report only.`,
      wouldWrite: false,
    });
  }

  return {
    suppressed: false,
    emptyFieldsFound,
    safeFills,
    fillsApplied: [],
    unsupportedFieldsFound,
    completenessReviewRequired,
    noSourceValues,
    completenessWritesEnabled: writesEnabled,
    completenessMutated: false,
  };
}

/**
 * Apply SAFE_FILL overlay writes only. Never overwrites populated values.
 * Reuses the existing facility overlay path. No-op when writes disabled.
 */
export function applySafeFills(input: {
  countrySlug: string;
  prisonSlug: string;
  sourceUrl: string;
  published: PublishedFacts;
  report: CompletenessReport;
  writesEnabled: boolean;
  now: Date;
  store: OverlayStore;
  market: "uk" | "us";
}): CompletenessReport {
  const base: CompletenessReport = {
    ...input.report,
    completenessWritesEnabled: input.writesEnabled,
    fillsApplied: [],
    completenessMutated: false,
  };

  if (!input.writesEnabled || input.report.suppressed || input.report.safeFills.length === 0) {
    return base;
  }

  if (input.market === "uk") {
    if (isUsPrison({ countrySlug: input.countrySlug }) || !isUkPrison({ countrySlug: input.countrySlug })) {
      return base;
    }
  } else if (isUkPrison({ countrySlug: input.countrySlug }) || !isUsPrison({ countrySlug: input.countrySlug })) {
    return base;
  }

  const overrides: FacilityFactOverrides = {};
  const applied: CompletenessFieldResult[] = [];

  for (const fill of input.report.safeFills) {
    if (fill.classification !== "SAFE_FILL" || !fill.officialValue) continue;
    if (fill.field === "phone") {
      if (!isBlank(input.published.phone)) continue;
      overrides.phone = fill.officialValue;
      applied.push({ ...fill, wouldWrite: true });
    } else if (fill.field === "email") {
      if (!isBlank(input.published.email)) continue;
      overrides.email = fill.officialValue;
      applied.push({ ...fill, wouldWrite: true });
    } else if (fill.field === "postcode") {
      if (!isBlank(input.published.postcode)) continue;
      overrides.postcode = fill.officialValue;
      applied.push({ ...fill, wouldWrite: true });
    }
  }

  if (applied.length === 0 || Object.keys(overrides).length === 0) {
    return base;
  }

  const fallback = input.market === "uk" ? emptyOverlay() : emptyUsOverlay();
  const current = input.store.read() ?? fallback;
  if (input.market === "uk" && current.generatedBy === "us-prison-verifier") return base;
  if (input.market === "us" && current.generatedBy === "uk-prison-verifier") return base;

  const countrySlug =
    input.market === "uk" ? "uk" : input.countrySlug === "united-states" ? "united-states" : "us";
  const key = overlayKey(countrySlug, input.prisonSlug);
  const previous = current.entries[key];
  const merged: FacilityFactOverrides = { ...previous?.overrides };

  if (overrides.phone && isBlank(merged.phone) && isBlank(input.published.phone)) merged.phone = overrides.phone;
  if (overrides.email && isBlank(merged.email) && isBlank(input.published.email)) merged.email = overrides.email;
  if (overrides.postcode && isBlank(merged.postcode) && isBlank(input.published.postcode)) {
    merged.postcode = overrides.postcode;
  }

  const changed = (["phone", "email", "postcode"] as const).filter(
    (k) => overrides[k] && merged[k] === overrides[k] && previous?.overrides?.[k] !== overrides[k],
  );
  if (changed.length === 0) return base;

  current.generatedBy = input.market === "uk" ? "uk-prison-verifier" : "us-prison-verifier";
  const appliedAt = isoNow(input.now);
  current.entries[key] = {
    prisonSlug: input.prisonSlug,
    countrySlug,
    appliedAt,
    sourceUrl: input.sourceUrl,
    overrides: merged,
  };
  current.updatedAt = appliedAt;
  input.store.write(current);

  return {
    ...base,
    fillsApplied: applied.filter((row) => changed.includes(row.field as CompletenessFillField)),
    completenessMutated: true,
  };
}

export function attachSuppressedCompleteness(
  published: PublishedFacts,
  reason: string,
  writesEnabled = false,
): CompletenessReport {
  return {
    ...blankReport(writesEnabled, true, reason),
    emptyFieldsFound: collectEmptySupportedFields(published),
  };
}
