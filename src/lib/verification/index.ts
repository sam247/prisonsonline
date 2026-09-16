export type {
  ChangeClassification,
  FieldDiff,
  OfficialFacts,
  OverlayFile,
  PrisonVerificationInput,
  PrisonVerificationResult,
  PublishedFacts,
  VerificationAuditRecord,
  VerificationStatus,
  VerifierRunOptions,
} from "./types";
export { VERIFIABLE_FIELDS, PROTECTED_CONTENT_FIELDS } from "./types";
export { isAuthoritativeUkGovUrl, canOverrideFromSourceUrl } from "./sourcePolicy";
export { publishedFacts } from "./publishedFacts";
export { compareFacts, overallStatus, safeAutoChanges } from "./compare";
export { extractGovukFacts } from "./extractGovukFacts";
export { validateAiExtraction } from "./aiGuard";
export { selectUkPrisonsDue, isUkPrison, isUsPrison } from "./selectPrison";
export { verifyUkPrison } from "./runVerification";
export { applySafeAutoChanges, emptyOverlay } from "./applyChanges";
export { buildRunReport, renderMarkdownReport } from "./report";
