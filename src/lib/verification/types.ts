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
}

export interface PrisonStateRecord {
  prisonSlug: string;
  countrySlug: "uk";
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  nextVerificationAt?: string;
  lastSourceUrl?: string;
  lastError?: string;
}

export interface VerificationAuditRecord {
  prisonId: string;
  prisonSlug: string;
  country: "uk";
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

export interface OverlayEntry {
  prisonSlug: string;
  countrySlug: "uk";
  appliedAt: string;
  sourceUrl: string;
  overrides: FacilityFactOverrides;
}

export interface OverlayFile {
  generatedBy: "uk-prison-verifier";
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

export interface SourceDiscoveryResult {
  ok: true;
  url: string;
  basePath: string;
  method: "facility-source" | "govuk-collection" | "slug-heuristic" | "govuk-search";
  title: string;
  withdrawn: boolean;
}

export interface SourceDiscoveryFailure {
  ok: false;
  error: string;
}

export type SourceDiscovery = SourceDiscoveryResult | SourceDiscoveryFailure;

export interface VerifierRunOptions {
  dryRun: boolean;
  writesEnabled: boolean;
  now?: Date;
  /** Optional AI extraction blob. Malformed → fail closed, zero mutations. */
  aiExtractionRaw?: unknown;
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
