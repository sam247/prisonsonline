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
export { selectUkPrisonsDue, selectUsPrisonsDue, isUkPrison, isUsPrison } from "./selectPrison";
export { verifyUkPrison } from "./runVerification";
export { verifyUsPrison } from "./runUsVerification";
export { applySafeAutoChanges, applyUsSafeAutoChanges, emptyOverlay, emptyUsOverlay } from "./applyChanges";
export { buildRunReport, renderMarkdownReport } from "./report";
export { resolveUsAuthority } from "./usAuthority";
export { isBopGovUrl, canOverrideFromUsSourceUrl } from "./usSourcePolicy";
