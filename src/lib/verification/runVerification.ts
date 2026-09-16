import type { FacilityVerificationRecord } from "@/types/facilitySource";
import { validateAiExtraction } from "./aiGuard";
import { applySafeAutoChanges, type OverlayStore } from "./applyChanges";
import { compareFacts, minConfidence, overallStatus } from "./compare";
import { discoverAuthoritativeSource } from "./discoverSource";
import { extractGovukFacts } from "./extractGovukFacts";
import { fetchGovukContent, SourceUnavailableError, type HttpGet } from "./govukClient";
import { addDays, isoNow } from "./normalize";
import { publishedFacts } from "./publishedFacts";
import { isUkPrison, isUsPrison } from "./selectPrison";
import { canOverrideFromSourceUrl } from "./sourcePolicy";
import type {
  FieldDiff,
  GovukCollectionEntry,
  OfficialFacts,
  PrisonStateRecord,
  PrisonVerificationInput,
  PrisonVerificationResult,
  VerificationAuditRecord,
  VerifierRunOptions,
} from "./types";
import { CURRENT_INTERVAL_DAYS, RETRY_INTERVAL_DAYS, REVIEW_INTERVAL_DAYS, VERIFIABLE_FIELDS } from "./types";

function failedResult(input: {
  prison: PrisonVerificationInput;
  options: VerifierRunOptions;
  published: ReturnType<typeof publishedFacts>;
  errors: string[];
  sourceUrl?: string;
}): PrisonVerificationResult {
  const now = input.options.now ?? new Date();
  const audit: VerificationAuditRecord = {
    prisonId: input.prison.institutionalId || input.prison.slug,
    prisonSlug: input.prison.slug,
    country: "uk",
    verifiedAt: isoNow(now),
    dryRun: input.options.dryRun,
    writesEnabled: false,
    runStatus: "failed",
    verificationStatus: "VERIFICATION_FAILED",
    authoritativeSourceUrls: input.sourceUrl ? [input.sourceUrl] : [],
    fieldsChecked: [...VERIFIABLE_FIELDS],
    differences: [],
    changesApplied: [],
    wouldHaveAutoApplied: [],
    missingOfficialFields: [],
    reviewRequired: false,
    confidence: "none",
    evidence: input.errors.join(" "),
    errors: input.errors,
  };
  return {
    prisonSlug: input.prison.slug,
    countrySlug: input.prison.countrySlug,
    dryRun: input.options.dryRun,
    writesEnabled: false,
    published: input.published,
    fields: [],
    missingOfficialFields: [],
    audit,
    overlayWritten: false,
    productionMutated: false,
  };
}

function nextStamp(status: PrisonStateRecord["verificationStatus"], now: Date): string {
  const days =
    status === "VERIFICATION_FAILED"
      ? RETRY_INTERVAL_DAYS
      : status === "REVIEW_REQUIRED"
        ? REVIEW_INTERVAL_DAYS
        : CURRENT_INTERVAL_DAYS;
  return addDays(now, days).toISOString();
}

function mergeOfficialWithAi(official: OfficialFacts, ai: OfficialFacts | Partial<OfficialFacts>): OfficialFacts {
  return {
    ...official,
    officialName: official.officialName ?? ai.officialName,
    address: official.address ?? ai.address,
    postcode: official.postcode ?? ai.postcode,
    phone: official.phone ?? ai.phone,
    email: official.email ?? ai.email,
    visitingTelephone: official.visitingTelephone ?? ai.visitingTelephone,
    governor: official.governor ?? ai.governor,
    operator: official.operator ?? ai.operator,
    category: official.category ?? ai.category,
  };
}

export function nextStateFromResult(result: PrisonVerificationResult, now: Date): PrisonStateRecord {
  return {
    prisonSlug: result.prisonSlug,
    countrySlug: "uk",
    verificationStatus: result.audit.verificationStatus,
    lastVerifiedAt: result.audit.verifiedAt,
    nextVerificationAt: nextStamp(result.audit.verificationStatus, now),
    lastSourceUrl: result.source?.url,
    lastError: result.audit.errors[0],
  };
}

export async function verifyUkPrison(input: {
  prison: PrisonVerificationInput;
  verification?: FacilityVerificationRecord;
  collection?: GovukCollectionEntry[];
  http?: HttpGet;
  overlayStore: OverlayStore;
  options: VerifierRunOptions;
}): Promise<PrisonVerificationResult> {
  const now = input.options.now ?? new Date();
  const published = publishedFacts(input.prison, input.verification);
  const writesWanted = Boolean(input.options.writesEnabled) && !input.options.dryRun;

  if (isUsPrison(input.prison) || !isUkPrison(input.prison)) {
    return failedResult({
      prison: input.prison,
      options: { ...input.options, dryRun: true, writesEnabled: false },
      published,
      errors: ["UK prison verifier refuses to run against non-UK records. Zero mutations."],
    });
  }

  if (input.options.aiExtractionRaw !== undefined) {
    const ai = validateAiExtraction(input.options.aiExtractionRaw);
    if (!ai.ok) {
      return failedResult({
        prison: input.prison,
        options: input.options,
        published,
        errors: [`Malformed AI response: ${ai.error} Fail closed — zero mutations.`],
      });
    }
    if (ai.value.sourceUrl && !canOverrideFromSourceUrl(ai.value.sourceUrl)) {
      return failedResult({
        prison: input.prison,
        options: input.options,
        published,
        errors: ["AI cited a non-government source URL. Non-government evidence cannot override. Zero mutations."],
      });
    }
  }

  const discovered = await discoverAuthoritativeSource({
    prison: input.prison,
    verification: input.verification,
    collection: input.collection,
    http: input.http,
  });
  if (!discovered.ok) {
    return failedResult({
      prison: input.prison,
      options: input.options,
      published,
      errors: [discovered.error, "Source unidentified. Fail closed — zero mutations."],
    });
  }
  if (!canOverrideFromSourceUrl(discovered.url)) {
    return failedResult({
      prison: input.prison,
      options: input.options,
      published,
      errors: [`Discovered URL is not an authoritative UK government source: ${discovered.url}`],
      sourceUrl: discovered.url,
    });
  }

  if (!input.http) {
    return failedResult({
      prison: input.prison,
      options: input.options,
      published,
      errors: ["No HTTP client configured; cannot fetch GOV.UK. Fail closed — zero mutations."],
      sourceUrl: discovered.url,
    });
  }

  let document;
  try {
    document = await fetchGovukContent(input.http, discovered.basePath || discovered.url);
  } catch (error) {
    const message =
      error instanceof SourceUnavailableError
        ? `GOV.UK unreachable: ${error.message}`
        : error instanceof Error
          ? error.message
          : "Unknown fetch error";
    return failedResult({
      prison: input.prison,
      options: input.options,
      published,
      errors: [`${message} Fail closed — zero mutations.`],
      sourceUrl: discovered.url,
    });
  }

  if (!document.body || !document.title) {
    return failedResult({
      prison: input.prison,
      options: input.options,
      published,
      errors: ["GOV.UK content parsed empty. Fail closed — zero mutations."],
      sourceUrl: document.webUrl,
    });
  }

  let official = extractGovukFacts({
    title: document.title,
    description: document.description,
    body: document.body,
    withdrawn: document.withdrawn || discovered.withdrawn,
    publicUpdatedAt: document.publicUpdatedAt,
  });

  if (input.options.aiExtractionRaw !== undefined) {
    const ai = validateAiExtraction(input.options.aiExtractionRaw);
    if (ai.ok) {
      official = mergeOfficialWithAi(official, ai.value);
    }
  }

  if (official.withdrawn) {
    const audit = compareAndAudit({
      prison: input.prison,
      published,
      official,
      sourceUrl: document.webUrl,
      discovered,
      fields: [
        {
          field: "name",
          classification: "REVIEW_REQUIRED",
          currentValue: published.name,
          officialValue: official.officialName,
          evidence: "GOV.UK page is withdrawn. Possible closure or replacement — review required, no mutation.",
          confidence: "high",
          wouldAutoApply: false,
        },
      ],
      missingOfficialFields: [],
      now,
      dryRun: input.options.dryRun,
      writesEnabled: false,
      applied: [],
      extraErrors: [],
    });
    return {
      prisonSlug: input.prison.slug,
      countrySlug: "uk",
      dryRun: input.options.dryRun,
      writesEnabled: false,
      source: { ...discovered, url: document.webUrl, withdrawn: true },
      published,
      official,
      fields: audit.differences,
      missingOfficialFields: [],
      audit,
      overlayWritten: false,
      productionMutated: false,
    };
  }

  const compared = compareFacts({ published, official, sourceUrl: document.webUrl });
  const apply = applySafeAutoChanges({
    countrySlug: "uk",
    prisonSlug: input.prison.slug,
    sourceUrl: document.webUrl,
    fields: compared.fields,
    writesEnabled: writesWanted,
    now,
    store: input.overlayStore,
  });

  const audit = compareAndAudit({
    prison: input.prison,
    published,
    official,
    sourceUrl: document.webUrl,
    discovered: { method: discovered.method },
    fields: compared.fields,
    missingOfficialFields: compared.missingOfficialFields,
    now,
    dryRun: input.options.dryRun || !writesWanted,
    writesEnabled: writesWanted,
    applied: apply.applied,
    extraErrors: [],
  });

  return {
    prisonSlug: input.prison.slug,
    countrySlug: "uk",
    dryRun: audit.dryRun,
    writesEnabled: writesWanted,
    source: { ...discovered, url: document.webUrl, title: document.title, withdrawn: document.withdrawn },
    published,
    official,
    fields: compared.fields,
    missingOfficialFields: compared.missingOfficialFields,
    audit,
    overlayWritten: apply.overlayWritten,
    productionMutated: apply.overlayWritten,
  };
}

function compareAndAudit(input: {
  prison: PrisonVerificationInput;
  published: ReturnType<typeof publishedFacts>;
  official: OfficialFacts;
  sourceUrl: string;
  discovered: { method: string };
  fields: FieldDiff[];
  missingOfficialFields: VerificationAuditRecord["missingOfficialFields"];
  now: Date;
  dryRun: boolean;
  writesEnabled: boolean;
  applied: FieldDiff[];
  extraErrors: string[];
}): VerificationAuditRecord {
  const status = overallStatus(input.fields, false);
  const wouldHaveAutoApplied = input.fields.filter((field) => field.wouldAutoApply);
  const newValues: VerificationAuditRecord["newValues"] = {};
  for (const field of input.applied) {
    if (field.field === "phone") newValues.phone = field.officialValue;
    if (field.field === "postcode") newValues.postcode = field.officialValue;
    if (field.field === "email") newValues.email = field.officialValue;
  }
  return {
    prisonId: input.prison.institutionalId || input.prison.slug,
    prisonSlug: input.prison.slug,
    country: "uk",
    verifiedAt: isoNow(input.now),
    dryRun: input.dryRun,
    writesEnabled: input.writesEnabled,
    runStatus: "success",
    verificationStatus: status,
    authoritativeSourceUrls: [input.sourceUrl],
    fieldsChecked: [...VERIFIABLE_FIELDS],
    differences: input.fields.filter((field) => field.classification !== "NO_CHANGE"),
    changesApplied: input.applied,
    wouldHaveAutoApplied,
    missingOfficialFields: input.missingOfficialFields,
    reviewRequired: status === "REVIEW_REQUIRED",
    confidence: minConfidence(input.fields),
    evidence: `Source via ${input.discovered.method}: ${input.sourceUrl}`,
    errors: input.extraErrors,
    previousValues: input.published,
    newValues: Object.keys(newValues).length ? newValues : undefined,
  };
}
