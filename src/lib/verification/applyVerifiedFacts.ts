import type { Prison } from "@/types/prison";
import type { FacilityVerificationRecord } from "@/types/facilitySource";

/**
 * Narrative/prose fields that the HMPPS import can seed with the upstream telephone string
 * (e.g. visitingInfo: "contact the establishment on (020) 8334 4400").
 */
const PHONE_BEARING_TEXT_FIELDS = ["overview", "history", "prisonLife", "visitingInfo", "shortDescription"] as const;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Matches a phone number by its digit sequence regardless of spacing, dashes, dots or
 * brackets, so "(020) 8334 4400", "020 8334 4400" and "0208 334 4400" all match.
 */
export function phoneMatcher(phone: string): RegExp | null {
  const digits = digitsOnly(phone);
  if (digits.length < 6) return null;
  const body = digits.split("").join("[\\s().\\-]*");
  return new RegExp(`(?<!\\d)\\(?${body}(?!\\d)`, "g");
}

/** Replace every occurrence of `oldPhone` (by digits) in `text` with `newPhone`. */
export function replacePhoneInText(text: string, oldPhone: string, newPhone: string): string {
  const matcher = phoneMatcher(oldPhone);
  if (!matcher || digitsOnly(oldPhone) === digitsOnly(newPhone)) return text;
  return text.replace(matcher, newPhone);
}

/**
 * Apply verified contact overrides (facilitySources records merged with the UK verification
 * overlay) to the prison record itself, so every rendering path — profile contact copy,
 * visiting copy, intent pages and JSON-LD — shows the verified value instead of the stale
 * HMPPS import value. Only contact facts are applied here; `sourceRaw` is left untouched as
 * the audit copy of the upstream row.
 */
export function applyVerifiedContactFacts(prison: Prison, verification?: FacilityVerificationRecord): Prison {
  const overrides = verification?.overrides;
  if (!overrides) return prison;

  const next: Prison = { ...prison };
  const newPhone = overrides.phone?.trim();
  const oldPhone = prison.phone?.trim();

  if (newPhone) {
    next.phone = newPhone;
    if (oldPhone) {
      for (const field of PHONE_BEARING_TEXT_FIELDS) {
        const value = next[field];
        if (typeof value === "string" && value) {
          (next as Record<(typeof PHONE_BEARING_TEXT_FIELDS)[number], string | undefined>)[field] = replacePhoneInText(
            value,
            oldPhone,
            newPhone,
          );
        }
      }
    }
  }
  if (overrides.address?.trim()) next.address = overrides.address.trim();
  if (overrides.postcode?.trim()) next.postcode = overrides.postcode.trim();
  return next;
}
