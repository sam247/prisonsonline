const UK_POSTCODE = /([A-Z]{1,2}\d[A-Z0-9]?\s*\d[A-Z]{2})\b/i;

export function collapseSpace(value: string | undefined | null): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function extractPostcode(text: string | undefined | null): string {
  if (!text) return "";
  const match = String(text).match(UK_POSTCODE);
  return match ? match[1].toUpperCase().replace(/\s+/g, " ") : "";
}

export function normalizePostcode(value: string | undefined | null): string {
  const extracted = extractPostcode(value) || collapseSpace(value).toUpperCase();
  return extracted.replace(/\s+/g, "");
}

export function postcodesEqual(a?: string, b?: string): boolean {
  const left = normalizePostcode(a);
  const right = normalizePostcode(b);
  return Boolean(left) && left === right;
}

/** National-number comparison: +44 / leading 0 / spacing / brackets ignored. */
export function normalizePhoneDigits(value: string | undefined | null): string {
  const digits = collapseSpace(value).replace(/\D/g, "");
  if (!digits) return "";
  let n = digits;
  if (n.startsWith("44") && n.length >= 12) n = n.slice(2);
  if (!n.startsWith("0") && (n.length === 10 || n.length === 9)) n = `0${n}`;
  return n;
}

export function phonesEqual(a?: string, b?: string): boolean {
  const left = normalizePhoneDigits(a);
  const right = normalizePhoneDigits(b);
  return Boolean(left) && left === right;
}

export function normalizeEmail(value: string | undefined | null): string {
  return collapseSpace(value).toLowerCase();
}

export function emailsEqual(a?: string, b?: string): boolean {
  const left = normalizeEmail(a);
  const right = normalizeEmail(b);
  return Boolean(left) && left === right;
}

/**
 * Compare establishment names after stripping HMP / YOI / Prison suffixes.
 * "HMP Belmarsh" and "Belmarsh Prison" are the same official name.
 */
export function coreEstablishmentName(value: string | undefined | null): string {
  return collapseSpace(value)
    .toLowerCase()
    .replace(/\bhm\s*prison\b/g, " ")
    .replace(/\bhmp\s*\/\s*yoi\b/g, " ")
    .replace(/\bhmp\s*yoi\b/g, " ")
    .replace(/\bhmyoi\b/g, " ")
    .replace(/\bhmp\b/g, " ")
    .replace(/\byoi\b/g, " ")
    .replace(/\byoung offender institutions?\b/g, " ")
    .replace(/\byoung offender institutes?\b/g, " ")
    .replace(/\band young offender\b/g, " ")
    .replace(/\bsecure training centre\b/g, " ")
    .replace(/\bprisons?\b/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function namesEquivalent(a?: string, b?: string): boolean {
  const left = coreEstablishmentName(a);
  const right = coreEstablishmentName(b);
  return Boolean(left) && left === right;
}

export function tokenizeAddress(value: string | undefined | null): string[] {
  const postcode = extractPostcode(value);
  let text = collapseSpace(value).toLowerCase();
  if (postcode) text = text.replace(postcode.toLowerCase(), " ");
  text = text
    .replace(/\bhmp\b/g, " ")
    .replace(/\bhmyoi\b/g, " ")
    .replace(/\bprison\b/g, " ")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ");
  return text
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

export function addressTokensOverlap(current?: string, official?: string): { overlap: number; union: number } {
  const a = new Set(tokenizeAddress(current));
  const b = new Set(tokenizeAddress(official));
  if (a.size === 0 || b.size === 0) return { overlap: 0, union: a.size + b.size };
  let overlap = 0;
  a.forEach((token) => {
    if (b.has(token)) overlap += 1;
  });
  const union = new Set(tokenizeAddress(current).concat(tokenizeAddress(official))).size;
  return { overlap, union };
}

export function addressesEquivalent(current?: string, official?: string): boolean {
  const cur = collapseSpace(current);
  const off = collapseSpace(official);
  if (!cur || !off) return false;
  if (cur.toLowerCase() === off.toLowerCase()) return true;
  const { overlap, union } = addressTokensOverlap(cur, off);
  if (union === 0) return false;
  const ratio = overlap / union;
  // Same street tokens in a different order / with the establishment name prefixed.
  return ratio >= 0.6 && overlap >= 2;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cur = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = cur;
    }
  }
  return row[b.length];
}

export function addDays(from: Date, days: number): Date {
  const next = new Date(from.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isoNow(now: Date): string {
  return now.toISOString();
}

export function isoDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

const US_FACILITY_TYPE_WORDS =
  /\b(fpc|fci|usp|fdc|fmc|mcc|mdc|fcc|rrm|ccm|mcfp|usmcfp|ftc|scp|adx|admax|federal|prison|camp|correctional|institution|penitentiary|detention|center|centre|complex|bureau|prisons)\b/g;

/** "Alderson Fpc" and "FPC Alderson" are the same facility name. Does not strip Low/Medium/High. */
export function coreUsFacilityName(value: string | undefined | null): string {
  return collapseSpace(value)
    .toLowerCase()
    .replace(US_FACILITY_TYPE_WORDS, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function usNamesEquivalent(a?: string, b?: string): boolean {
  const left = coreUsFacilityName(a);
  const right = coreUsFacilityName(b);
  return Boolean(left) && left === right;
}

/** NANP comparison: +1 / formatting ignored; compare 10-digit national numbers. */
export function normalizeUsPhoneDigits(value: string | undefined | null): string {
  let digits = collapseSpace(value).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits;
}

export function usPhonesEqual(a?: string, b?: string): boolean {
  const left = normalizeUsPhoneDigits(a);
  const right = normalizeUsPhoneDigits(b);
  return Boolean(left) && left.length === 10 && left === right;
}

export function normalizeUsZip(value: string | undefined | null): string {
  const digits = collapseSpace(value).replace(/\D/g, "");
  return digits.length >= 5 ? digits.slice(0, 5) : digits;
}

export function usZipsEqual(a?: string, b?: string): boolean {
  const left = normalizeUsZip(a);
  const right = normalizeUsZip(b);
  return Boolean(left) && left.length === 5 && left === right;
}
