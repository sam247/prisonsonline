import type { FacilityVerificationRecord } from "@/types/facilitySource";
import { validateAiExtraction } from "./aiGuard";
import { applyUsSafeAutoChanges, type OverlayStore } from "./applyChanges";
import { compareFacts, minConfidence, overallStatus } from "./compare";
import { discoverUsAuthoritativeSource, matchedBopLocation } from "./discoverUsSource";
import { extractBopFacts } from "./extractBopFacts";
import { SourceUnavailableError, type HttpGet } from "./govukClient";
import { addDays, isoNow } from "./normalize";
import { publishedFacts } from "./publishedFacts";
import { isUkPrison, isUsPrison } from "./selectPrison";
import { authoritySummary, resolveUsAuthority, type ResolvedUsAuthority } from "./usAuthority";
import { canOverrideFromUsSourceUrl, usComparePolicy } from "./usSourcePolicy";
import type { BopLocation } from "./bopClient";
import type {
  FieldDiff,
  OfficialFacts,
  PrisonStateRecord,
  PrisonVerificationInput,
  PrisonVerificationResult,
  SourceDiscoveryResult,
  UsAuthoritySummary,
  VerificationAuditRecord,
  VerifierRunOptions,
} from "./types";
import { CURRENT_INTERVAL_DAYS, RETRY_INTERVAL_DAYS, REVIEW_INTERVAL_DAYS, VERIFIABLE_FIELDS } from "./types";

function auditCountry(prison: PrisonVerificationInput): "uk" | "us" {
  return prison.countrySlug === "uk" ? "uk" : "us";
}

function failedResult(input: {
  prison: PrisonVerificationInput;
  options: VerifierRunOptions;
  published: ReturnType<typeof publishedFacts>;
  errors: string[];
  sourceUrl?: string;
  authority?: UsAuthoritySummary;
}): PrisonVerificationResult {
  const now = input.options.now ?? new Date();
  const audit: VerificationAuditRecord = {
    prisonId: input.prison.institutionalId || input.prison.slug,
    prisonSlug: input.prison.slug,
    country: auditCountry(input.prison),
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
    authority: input.authority,
  };
}

function reviewResult(input: {
  prison: PrisonVerificationInput;
  options: VerifierRunOptions;
  published: ReturnType<typeof publishedFacts>;
  evidence: string;
  authority?: UsAuthoritySummary;
  source?: SourceDiscoveryResult;
}): PrisonVerificationResult {
  const now = input.options.now ?? new Date();
  const fields: FieldDiff[] = [
    {
      field: "name",
      classification: "REVIEW_REQUIRED",
      currentValue: input.published.name,
      evidence: input.evidence,
      confidence: "high",
      wouldAutoApply: false,
    },
  ];
  const audit: VerificationAuditRecord = {
    prisonId: input.prison.institutionalId || input.prison.slug,
    prisonSlug: input.prison.slug,
    country: auditCountry(input.prison),
    verifiedAt: isoNow(now),
    dryRun: input.options.dryRun,
    writesEnabled: false,
    runStatus: "success",
    verificationStatus: "REVIEW_REQUIRED",
    authoritativeSourceUrls: input.source?.url ? [input.source.url] : [],
    fieldsChecked: [...VERIFIABLE_FIELDS],
    differences: fields,
    changesApplied: [],
    wouldHaveAutoApplied: [],
    missingOfficialFields: [],
    reviewRequired: true,
    confidence: "high",
    evidence: input.evidence,
    errors: [],
    previousValues: input.published,
  };
  return {
    prisonSlug: input.prison.slug,
    countrySlug: input.prison.countrySlug,
    dryRun: input.options.dryRun,
    writesEnabled: false,
    source: input.source,
    published: input.published,
    fields,
    missingOfficialFields: [],
    audit,
    overlayWritten: false,
    productionMutated: false,
    authority: input.authority,
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

export function nextUsStateFromResult(result: PrisonVerificationResult, now: Date): PrisonStateRecord {
  const countrySlug = result.countrySlug === "united-states" ? "united-states" : "us";
  return {
    prisonSlug: result.prisonSlug,
    countrySlug,
    verificationStatus: result.audit.verificationStatus,
    lastVerifiedAt: result.audit.verifiedAt,
    nextVerificationAt: nextStamp(result.audit.verificationStatus, now),
    lastSourceUrl: result.source?.url,
    lastError: result.audit.errors[0],
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
    country: "us",
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

export async function verifyUsPrison(input: {
  prison: PrisonVerificationInput;
  verification?: FacilityVerificationRecord;
  bopLocations?: BopLocation[];
  http?: HttpGet;
  overlayStore: OverlayStore;
  options: VerifierRunOptions;
}): Promise<PrisonVerificationResult> {
  const now = input.options.now ?? new Date();
  const published = publishedFacts(input.prison, input.verification);
  const writesWanted = Boolean(input.options.writesEnabled) && !input.options.dryRun;

  if (isUkPrison(input.prison) || !isUsPrison(input.prison)) {
    return failedResult({
      prison: input.prison,
      options: { ...input.options, dryRun: true, writesEnabled: false },
      published,
      errors: ["US prison verifier refuses to run against non-US records. Zero mutations."],
    });
  }

  const resolved = resolveUsAuthority(input.prison);
  const authority = authoritySummary(resolved);
  if (!resolved.ok) {
    return reviewResult({
      prison: input.prison,
      options: input.options,
      published,
      evidence: resolved.reason,
      authority,
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
        authority,
      });
    }
    if (ai.value.sourceUrl && !canOverrideFromUsSourceUrl(ai.value.sourceUrl, resolved)) {
      return failedResult({
        prison: input.prison,
        options: input.options,
        published,
        errors: [
          "AI cited a source URL that is not the identified official US authority. Non-government or wrong-authority evidence cannot override. Zero mutations.",
        ],
        authority,
      });
    }
  }

  const discovered = discoverUsAuthoritativeSource({
    prison: input.prison,
    authority: resolved,
    verification: input.verification,
    bopLocations: input.bopLocations,
  });
  if (!discovered.ok) {
    return reviewResult({
      prison: input.prison,
      options: input.options,
      published,
      evidence: `${discovered.error} REVIEW_REQUIRED — not guessing from general web consensus.`,
      authority,
    });
  }
  if (!canOverrideFromUsSourceUrl(discovered.url, resolved)) {
    return reviewResult({
      prison: input.prison,
      options: input.options,
      published,
      evidence: `Discovered URL is not the identified official authority (${resolved.name}): ${discovered.url}`,
      authority,
      source: discovered,
    });
  }

  let official: OfficialFacts | undefined;
  let sourceUrl = discovered.url;

  if (resolved.kind === "federal-bop") {
    const loc = matchedBopLocation(input.prison, input.bopLocations);
    if (!loc) {
      return reviewResult({
        prison: input.prison,
        options: input.options,
        published,
        evidence:
          "BOP authority identified but the directory match was lost before extraction. REVIEW_REQUIRED — zero mutations.",
        authority,
        source: discovered,
      });
    }
    official = extractBopFacts(loc);
    sourceUrl = discovered.url;
  } else {
    if (!input.http) {
      return failedResult({
        prison: input.prison,
        options: input.options,
        published,
        errors: ["No HTTP client configured; cannot fetch the official state/local page. Fail closed — zero mutations."],
        sourceUrl: discovered.url,
        authority,
      });
    }
    try {
      const res = await input.http(discovered.url);
      if (!res.ok) {
        throw new SourceUnavailableError(`HTTP ${res.status} for ${discovered.url}`, res.status);
      }
      if (!res.text || res.text.length < 40) {
        return failedResult({
          prison: input.prison,
          options: input.options,
          published,
          errors: ["Official state/local page parsed empty. Fail closed — zero mutations."],
          sourceUrl: discovered.url,
          authority,
        });
      }
      official = {
        officialName: input.prison.name,
        withdrawn: false,
      };
      return reviewResult({
        prison: input.prison,
        options: input.options,
        published,
        evidence: `${resolved.name} facility page was located, but Phase 1 does not auto-extract unstructured state HTML. REVIEW_REQUIRED — zero mutations.`,
        authority,
        source: discovered,
      });
    } catch (error) {
      const message =
        error instanceof SourceUnavailableError
          ? `Official source unreachable: ${error.message}`
          : error instanceof Error
            ? error.message
            : "Unknown fetch error";
      return failedResult({
        prison: input.prison,
        options: input.options,
        published,
        errors: [`${message} Fail closed — zero mutations.`],
        sourceUrl: discovered.url,
        authority,
      });
    }
  }

  if (!official || (!official.officialName && !official.address && !official.phone && !official.postcode)) {
    return failedResult({
      prison: input.prison,
      options: input.options,
      published,
      errors: ["Official BOP record parsed empty. Fail closed — zero mutations."],
      sourceUrl,
      authority,
    });
  }

  if (input.options.aiExtractionRaw !== undefined) {
    const ai = validateAiExtraction(input.options.aiExtractionRaw);
    if (ai.ok) {
      official = mergeOfficialWithAi(official, ai.value);
    }
  }

  const compared = compareFacts({
    published,
    official,
    sourceUrl,
    policy: usComparePolicy((url) => canOverrideFromUsSourceUrl(url, resolved)),
  });
  const apply = applyUsSafeAutoChanges({
    countrySlug: input.prison.countrySlug,
    prisonSlug: input.prison.slug,
    sourceUrl,
    fields: compared.fields,
    writesEnabled: writesWanted,
    now,
    store: input.overlayStore,
  });

  const audit = compareAndAudit({
    prison: input.prison,
    published,
    official,
    sourceUrl,
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
    countrySlug: input.prison.countrySlug,
    dryRun: audit.dryRun,
    writesEnabled: writesWanted,
    source: { ...discovered, url: sourceUrl },
    published,
    official,
    fields: compared.fields,
    missingOfficialFields: compared.missingOfficialFields,
    audit,
    overlayWritten: apply.overlayWritten,
    productionMutated: apply.overlayWritten,
    authority,
  };
}

export type { ResolvedUsAuthority };
