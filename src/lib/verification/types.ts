import type { FacilityFactOverrides } from "@/types/facilitySource";

/** Internal prison verification state. Not rendered on public pages. */
export type VerificationStatus =
  | "UNVERIFIED"
  | "CURRENT"
  | "CHANGED"
  | "REVIEW_REQUIRED"
  | "VERIFICATION_FAILED";

export type ChangeClassification = "SAFE_AUTO_CHANGE" | "REVIEW_REQUIRED" | "NO_CHANGE";

export type VerifiableField =
  | "name"
  | "address"
  | "postcode"
  | "phone"
  | "email"
  | "operator"
  | "category";

/** Structured facts we already publish (prison row + existing facility overlay). */
export interface PublishedFacts {
  name: string;
  address?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  operator?: string;
  category?: string;
}

/** Facts extracted from an authoritative GOV.UK/HMPPS page. Missing means not found — never treat as deletion. */
export interface OfficialFacts {
  officialName?: string;
  address?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  visitingTelephone?: string;
  governor?: string;
  operator?: string;
  category?: string;
  gettingThere?: string;
  fax?: string;
  withdrawn: boolean;
  sourceUpdatedAt?: string;
}

export interface FieldDiff {
  field: VerifiableField;
  classification: ChangeClassification;
  currentValue?: string;
  officialValue?: string;
  evidence: string;
  confidence: "high" | "medium" | "low";
  wouldAutoApply: boolean;
}

export interface MissingOfficialField {
  field: string;
  officialValue: string;
  note: string;
}

export interface PrisonVerificationInput {
  slug: string;
  countrySlug: string;
  country: string;
  institutionalId?: string;
  dataProvenance?: string;
  name: string;
  address?: string;
  postcode?: string;
  phone?: string;
  operator?: string;
  securityLevel?: string;
  facilityType?: string;
  city?: string;
  stateOrRegion?: string;
}

export type VerificationCountrySlug = "uk" | "us" | "united-states";

export interface PrisonStateRecord {
  prisonSlug: string;
  countrySlug: VerificationCountrySlug;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  nextVerificationAt?: string;
  lastSourceUrl?: string;
  lastError?: string;
}

export interface VerificationAuditRecord {
  prisonId: string;
  prisonSlug: string;
  country: "uk" | "us";
  verifiedAt: string;
  dryRun: boolean;
  writesEnabled: boolean;
  runStatus: "success" | "failed";
  verificationStatus: VerificationStatus;
  authoritativeSourceUrls: string[];
  fieldsChecked: VerifiableField[];
  differences: FieldDiff[];
  changesApplied: FieldDiff[];
  wouldHaveAutoApplied: FieldDiff[];
  missingOfficialFields: MissingOfficialField[];
  reviewRequired: boolean;
  confidence: "high" | "medium" | "low" | "none";
  evidence: string;
  errors: string[];
  previousValues?: Partial<PublishedFacts>;
  newValues?: FacilityFactOverrides;
}

export type OverlayGenerator = "uk-prison-verifier" | "us-prison-verifier";

export interface OverlayEntry {
  prisonSlug: string;
  countrySlug: VerificationCountrySlug;
  appliedAt: string;
  sourceUrl: string;
  overrides: FacilityFactOverrides;
}

export interface OverlayFile {
  generatedBy: OverlayGenerator;
  updatedAt: string;
  entries: Record<string, OverlayEntry>;
}

export interface VerificationStateFile {
  prisons: Record<string, PrisonStateRecord>;
}

export interface GovukCollectionEntry {
  title: string;
  basePath: string;
  webUrl: string;
  withdrawn: boolean;
}

export interface GovukContentDocument {
  title: string;
  description?: string;
  basePath: string;
  webUrl: string;
  body: string;
  publicUpdatedAt?: string;
  withdrawn: boolean;
  organisationTitles: string[];
}

export type SourceDiscoveryMethod =
  | "facility-source"
  | "govuk-collection"
  | "slug-heuristic"
  | "govuk-search"
  | "bop-directory"
  | "state-official";

export interface SourceDiscoveryResult {
  ok: true;
  url: string;
  basePath: string;
  method: SourceDiscoveryMethod;
  title: string;
  withdrawn: boolean;
}

export type UsAuthorityKind = "federal-bop" | "state-corrections" | "local-corrections";

export interface UsAuthoritySummary {
  identified: boolean;
  kind?: UsAuthorityKind;
  name?: string;
  jurisdiction?: string;
  allowedHosts: string[];
  evidence: string;
  reviewRequired: boolean;
}

export interface SourceDiscoveryFailure {
  ok: false;
  error: string;
}

export type SourceDiscovery = SourceDiscoveryResult | SourceDiscoveryFailure;


export type CompletenessClassification =
  | "SAFE_FILL"
  | "NO_SOURCE_VALUE"
  | "REVIEW_REQUIRED"
  | "UNSUPPORTED_FIELD";

/** VERIFY corrections vs COMPLETENESS additive fills — kept distinct in reports. */
export type ChangeKind = "CORRECTION" | "SAFE_FILL";

export type CompletenessFillField = "phone" | "email" | "postcode";

export interface CompletenessFieldResult {
  field: string;
  classification: CompletenessClassification;
  kind?: ChangeKind;
  publishedValue?: string;
  officialValue?: string;
  evidence: string;
  wouldWrite: boolean;
}

export interface CompletenessReport {
  suppressed: boolean;
  suppressReason?: string;
  emptyFieldsFound: string[];
  safeFills: CompletenessFieldResult[];
  fillsApplied: CompletenessFieldResult[];
  unsupportedFieldsFound: CompletenessFieldResult[];
  completenessReviewRequired: CompletenessFieldResult[];
  noSourceValues: CompletenessFieldResult[];
  completenessWritesEnabled: boolean;
  completenessMutated: boolean;
}

export interface VerifierRunOptions {
  dryRun: boolean;
  writesEnabled: boolean;
  now?: Date;
  /** Optional AI extraction blob. Malformed → fail closed, zero mutations. */
  aiExtractionRaw?: unknown;
  /**
   * Completeness overlay writes. Default off.
   * Requires matching UK_PRISON_COMPLETENESS_WRITE=1 or US_PRISON_COMPLETENESS_WRITE=1
   * plus --completeness-write. Independent of VERIFY writesEnabled.
   */
  completenessWritesEnabled?: boolean;
}

export interface PrisonVerificationResult {
  prisonSlug: string;
  countrySlug: string;
  dryRun: boolean;
  writesEnabled: boolean;
  source?: SourceDiscoveryResult;
  published: PublishedFacts;
  official?: OfficialFacts;
  fields: FieldDiff[];
  missingOfficialFields: MissingOfficialField[];
  audit: VerificationAuditRecord;
  overlayWritten: boolean;
  productionMutated: boolean;
  authority?: UsAuthoritySummary;
  /** Empty-field completeness pass (separate from VERIFY). */
  completeness?: CompletenessReport;
}

export const VERIFIABLE_FIELDS: readonly VerifiableField[] = [
  "name",
  "address",
  "postcode",
  "phone",
  "email",
  "operator",
  "category",
];

/** Narrative / SEO fields the verifier must never rewrite. */
export const PROTECTED_CONTENT_FIELDS = [
  "overview",
  "history",
  "prisonLife",
  "visitingInfo",
  "shortDescription",
  "slug",
  "title",
  "h1",
  "meta",
  "canonical",
  "url",
] as const;

export const CURRENT_INTERVAL_DAYS = 30;
export const REVIEW_INTERVAL_DAYS = 7;
export const RETRY_INTERVAL_DAYS = 1;
