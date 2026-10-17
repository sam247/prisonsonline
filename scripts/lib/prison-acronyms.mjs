/**
 * Whole-token facility acronyms. Title-casing turns "FCI" into "Fci".
 * Restore only these tokens. Ordinary words (Low, Med, City, Ii) and
 * names such as "Ohci" are not in the list, so they stay as written.
 */
export const PRISON_NAME_ACRONYMS = [
  "ADX",
  "ADMAX",
  "CCF",
  "CCM",
  "CI",
  "DOC",
  "FCC",
  "FCI",
  "FDC",
  "FMC",
  "FPC",
  "FTC",
  "HMP",
  "HMYOI",
  "IRC",
  "MCC",
  "MDC",
  "RRM",
  "SP",
  "STC",
  "USMCFP",
  "USP",
  "YOI",
];

const ACRONYM_SET = new Set(PRISON_NAME_ACRONYMS);

/** Uppercase allowlisted acronym tokens. Every other token is unchanged. */
export function restorePrisonAcronyms(name) {
  return String(name ?? "").replace(/[A-Za-z0-9]+/g, (token) => {
    const upper = token.toUpperCase();
    return ACRONYM_SET.has(upper) ? upper : token;
  });
}
