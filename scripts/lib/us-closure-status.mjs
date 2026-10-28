/**
 * Closure status for US federal facilities that are still in the BOP bundle but are no longer operating.
 * Slug -> { status, statusSource, statusNote }. Uses the existing Prison status fields only.
 * Applied by scripts/build-us-prisons.mjs so a regeneration keeps the status.
 *
 * Evidence checked 2026-10-28. Wording is deliberately conservative: do not say "permanently closed"
 * unless a Bureau of Prisons document says so for that facility.
 */
export const US_CLOSURE_STATUS = {
  "dublin-fci": {
    status: "closed",
    statusSource: "https://dublin.ca.gov/DocumentCenter/View/40932/Notification-Letter---FCI-Dublin-120425",
    statusNote:
      "Operations at FCI Dublin ceased (by April 2024, according to a Bureau of Prisons letter) and the facility was vacated by December 2024. The Bureau of Prisons is now proposing permanent deactivation (BOP notification letter, 4 December 2025). It is no longer listed in the BOP locations directory.",
  },
  "terminal-island-fci": {
    status: "closed",
    statusSource: "https://apnews.com/article/bureau-of-prisons-los-angeles-terminal-island-3829cae8a6e07441161f248d8e2428a1",
    statusNote:
      "Operations ended; permanent closure is proposed. The Bureau of Prisons suspended operations in November 2025, as reported by AP from an internal memo to staff. The statement that operations ended in June 2026 and that permanent closure is proposed comes from Los Angeles Councilmember Tim McOsker (20 August 2026), relaying the Bureau of Prisons; it is not a BOP document. It is no longer listed in the BOP locations directory.",
  },
};

/** Returns the record with status fields merged in when its slug has an entry; otherwise the record unchanged. */
export function applyClosureStatus(record, map = US_CLOSURE_STATUS) {
  const entry = map[record.slug];
  if (!entry) return record;
  return {
    ...record,
    status: entry.status,
    statusSource: entry.statusSource,
    statusNote: entry.statusNote,
  };
}
