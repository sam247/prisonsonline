/**
 * Known HMPPS prison identity misspellings (upstream id + display name), corrected before
 * slug/name generation. Each entry is checked against the GOV.UK prison guidance page.
 * Shared by build-institutional-data.mjs and build-court-directory.mjs so prison slugs stay aligned.
 * `sourceRaw` in generated data keeps the upstream values for audit.
 */
export const PRISON_IDENTITY_CORRECTIONS = new Map([
  // https://www.gov.uk/guidance/wakefield-prison — "Wakefield Prison", address "HMP Wakefield, 5 Love Lane"
  ["hmp-wakfield", { id: "hmp-wakefield", name: "HMP Wakefield" }],
]);

export function correctPrisonIdentity(raw) {
  const fix = PRISON_IDENTITY_CORRECTIONS.get(String(raw?.id || "").trim());
  return fix ? { id: fix.id, name: fix.name } : { id: raw?.id, name: raw?.name };
}
