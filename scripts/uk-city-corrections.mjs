/**
 * Explicit UK prison city/town display corrections, applied in build-institutional-data.mjs
 * AFTER city derivation, so they win over whatever the address-based derivation produces.
 *
 * Keyed by the generated prison slug (post identity-correction). Each entry is verified against
 * an official UK government page; add entries only with a source that states the town.
 * Only the `city` display value is corrected — address, postcode and upstream sourceRaw are untouched.
 */
export const UK_CITY_CORRECTIONS = Object.freeze({
  "hmp-dartmoor": {
    city: "Princetown",
    sourceUrl: "https://apply-for-public-appointment.service.gov.uk/archive/announcements/925",
    note:
      "MoJ/IMB appointment page: 'HMP Dartmoor, Tavistock Road, Princetown, Yelverton PL20 6RR' and 'located in Princetown'. GOV.UK guidance/dartmoor-prison currently shows only a temporary-closure notice (no address). HMPPS address: 'Princetown, Yelverton, Devon'.",
  },
  "hmp-holme-house": {
    city: "Stockton-on-Tees",
    sourceUrl: "https://www.gov.uk/guidance/holme-house-prison",
    note: "GOV.UK address 'Holme House Road Stockton on Tees TS18 2QU'; HMPPS feed misspells the town 'Stickton on Tees'.",
  },
  "hmyoi-cookham-wood": {
    city: "Rochester",
    sourceUrl: "https://www.gov.uk/guidance/cookham-wood-prison",
    note: "GOV.UK address 'Sir Evelyn Road Rochester Kent ME1 3LU'; HMPPS feed misspells the town 'Rochaester'.",
  },
  "hmp-ranby": {
    city: "Retford",
    sourceUrl: "https://www.gov.uk/guidance/ranby-prison",
    note: "GOV.UK address 'HMP Ranby Retford Nottingham DN22 8EU'; last address part 'Nottingham' is not the town.",
  },
  "hmp-leyhill": {
    city: "Wotton-under-Edge",
    sourceUrl: "https://www.gov.uk/guidance/leyhill-prison",
    note: "GOV.UK address 'HMP Leyhill Wotton-under-Edge Gloucester GL12 8BT'; last address part 'Gloucester' is not the town.",
  },
});

/** Return the corrected city for `slug`, or `derivedCity` unchanged when no correction exists. */
export function applyUkCityCorrection(slug, derivedCity) {
  const fix = Object.prototype.hasOwnProperty.call(UK_CITY_CORRECTIONS, slug) ? UK_CITY_CORRECTIONS[slug] : undefined;
  return fix ? fix.city : derivedCity;
}
