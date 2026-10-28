/**
 * Known HMPPS prison identity misspellings (upstream id + display name), corrected before
 * slug/name generation. Each entry is checked against the GOV.UK prison guidance page.
 * Shared by build-institutional-data.mjs and build-court-directory.mjs so prison slugs stay aligned.
 * `sourceRaw` in generated data keeps the upstream values for audit.
 */
export const PRISON_IDENTITY_CORRECTIONS = new Map([
  // https://www.gov.uk/guidance/wakefield-prison — "Wakefield Prison", address "HMP Wakefield, 5 Love Lane"
  ["hmp-wakfield", { id: "hmp-wakefield", name: "HMP Wakefield" }],
  // Slug stays hmyoi-cookham-wood (id unchanged; no rename or redirect). The YOI closed in May 2024 and the site
  // re-roled as an adult men's prison. https://www.gov.uk/guidance/cookham-wood-prison: "HMP Cookham Wood",
  // page title "Cookham Wood Prison".
  ["hmyoi-cookham-wood", { id: "hmyoi-cookham-wood", name: "HMP Cookham Wood" }],
]);

export function correctPrisonIdentity(raw) {
  const fix = PRISON_IDENTITY_CORRECTIONS.get(String(raw?.id || "").trim());
  return fix ? { id: fix.id, name: fix.name } : { id: raw?.id, name: raw?.name };
}
