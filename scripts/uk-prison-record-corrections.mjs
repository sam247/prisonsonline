/**
 * Explicit, sourced overrides for stale HMPPS feed fields, applied in build-institutional-data.mjs to the
 * parsed labelled lines BEFORE anything is derived from them (type, overview, prison life, region, security),
 * so the generated record stays internally consistent. `sourceRaw` keeps the upstream feed text for audit.
 *
 * Keyed by the corrected upstream id (same key as prison-identity-corrections.mjs). Add entries only with an
 * official source that states the value; omit a field (or set it to "") rather than guess.
 * Labels are the feed's own: "Information", "Cohort of Prisoners Held", "Predominant Function",
 * "Prison Sub-Group 1", "Prison Region".
 */
export const UK_PRISON_RECORD_CORRECTIONS = Object.freeze({
  "hmyoi-cookham-wood": {
    sourceUrls: [
      "https://www.gov.uk/guidance/cookham-wood-prison",
      "https://www.gov.uk/government/news/young-offenders-institution-to-be-repurposed",
      "https://www.gov.uk/guidance/cookham-wood-yoi",
      "https://www.gov.uk/government/statistics/hm-prison-probation-service-workforce-quarterly-june-2026/workforce-statistics-guide",
      "https://www.gov.uk/government/statistics/prison-performance-ratings-2025-to-2026",
    ],
    note:
      "YOI closed May 2024; re-roled as an adult men's prison (MoJ 21 Mar 2024; GOV.UK withdrawal notice of the old YOI page). " +
      "GOV.UK describes it as 'a men's prison in Rochester, Kent'. " +
      "Category C: GOV.UK withdrawal notice of the old YOI page and the Workforce Statistics Guide (June 2026) both say 'repurposed as an adult prison for category C males'. " +
      "Function/cohort: HMPPS Prison Performance Ratings 2025/26 Supplementary Tables (Table_1) list Cookham Wood as 'Category C Trainer/Resettlement', same as Rochester; " +
      "so the feed strings Rochester uses are applied (Cohort 'Trainer & Resettlement', Predominant Function 'Cat C Trainer'). " +
      "Region is verified: HMPPS Workforce Statistics Guide (June 2026, Table 1, 'Prisons regional structure') lists Cookham Wood under Kent, Surrey & Sussex, next to Rochester. " +
      "Security derives to 'Category C' from the function.",
    fields: {
      Information: "Cookham Wood is a men's prison in Rochester, Kent.",
      "Cohort of Prisoners Held": "Trainer & Resettlement",
      "Predominant Function": "Cat C Trainer",
      "Prison Sub-Group 1": "",
      "Prison Region": "KENT, SURREY & SUSSEX",
    },
  },
});

/** Return `p` (parsed labelled lines) with the sourced overrides for `id` merged in; unchanged when none exist. */
export function applyUkPrisonRecordCorrection(id, p) {
  const fix = Object.prototype.hasOwnProperty.call(UK_PRISON_RECORD_CORRECTIONS, id)
    ? UK_PRISON_RECORD_CORRECTIONS[id]
    : undefined;
  return fix ? { ...p, ...fix.fields } : p;
}
