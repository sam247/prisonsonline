/**
 * Explicit UK prison address-string corrections, applied in build-institutional-data.mjs
 * AFTER the address is normalised from the HMPPS feed so they win over feed typos.
 *
 * Keyed by the generated prison slug (post identity-correction). Each entry is verified against
 * an official UK government page; add entries only with a source that states the address.
 * Only the `address` display value is corrected — city, postcode and upstream sourceRaw are untouched
 * (city typos are handled separately in uk-city-corrections.mjs).
 */
export const UK_ADDRESS_CORRECTIONS = Object.freeze({
  "hmp-holme-house": {
    address: "Holme House Road, Stockton on Tees, TS18 2QU",
    sourceUrl: "https://www.gov.uk/guidance/holme-house-prison",
    note: "GOV.UK Contact address 'Holme House Road Stockton on Tees TS18 2QU'; HMPPS feed misspells the town as 'Stickton on Tees'. Spelling matches GOV.UK ('Stockton on Tees', no hyphens).",
  },
  "hmyoi-cookham-wood": {
    address: "Sir Evelyn Road, Rochester, ME1 3LU",
    sourceUrl: "https://www.gov.uk/guidance/cookham-wood-prison",
    note: "GOV.UK Contact address 'Sir Evelyn Road Rochester Kent ME1 3LU'; HMPPS feed misspells the town as 'Rochaester'. Keep existing comma-separated layout; only fix the misspelling.",
  },
});

/** Return the corrected address for `slug`, or `address` unchanged when no correction exists. */
export function applyUkAddressCorrection(slug, address) {
  const fix = Object.prototype.hasOwnProperty.call(UK_ADDRESS_CORRECTIONS, slug)
    ? UK_ADDRESS_CORRECTIONS[slug]
    : undefined;
  return fix ? fix.address : address;
}
