import type { FacilitySource, FacilityVerificationRecord } from "@/types/facilitySource";
import { usVerificationOverlay } from "./generated/usVerificationOverlay.generated";

/**
 * Verified US contact & visiting blocks (Sam approved the fields on 17 Oct 2026): inmate mail
 * address (postalAddress, with recipientFormat), visitingHours and visitingRulesUrl. Values come
 * only from bop.gov (or an official state DOC .gov page) via the US verifier and live on the
 * committed US overlay. Shape mirrors src/data/ukContactVisiting.ts (#77): sources[] +
 * fieldSources, and every block carries a sourceId.
 *
 * Like the UK file, this is deliberately NOT wired into getFacilityVerification(): that would
 * change the rendered "Official information" list, JSON-LD and lastmod, which the Content Manager
 * owns. Display code should call getUsContactVisiting() / withUsContactVisiting().
 *
 * Verified emails / phone / ZIP are already exposed by getFacilityVerification() as
 * overrides.email|phone|postcode with fieldSources[field] = ["official"] (the bop.gov source).
 */

export type UsContactVisitingRecord = Pick<
  FacilityVerificationRecord,
  "countrySlug" | "prisonSlug" | "sources" | "fieldSources" | "postalAddress" | "visitingHours" | "visitingRulesUrl"
>;

const BLOCKS = ["postalAddress", "visitingHours", "visitingRulesUrl"] as const;

export function getUsContactVisiting(countrySlug: string, prisonSlug: string): UsContactVisitingRecord | undefined {
  if (countrySlug !== "us" && countrySlug !== "united-states") return undefined;
  const cv = usVerificationOverlay.entries?.[`${countrySlug}/${prisonSlug}`]?.contactVisiting;
  if (!cv || !BLOCKS.some((field) => cv[field])) return undefined;
  const record: UsContactVisitingRecord = { countrySlug, prisonSlug, sources: [], fieldSources: {} };
  const ids = new Set<string>();
  for (const field of BLOCKS) {
    const block = cv[field];
    if (!block) continue;
    (record as Record<string, unknown>)[field] = block;
    record.fieldSources[field] = cv.fieldSources[field] ?? [block.sourceId];
    for (const id of record.fieldSources[field]!) ids.add(id);
    ids.add(block.sourceId);
    if (field === "postalAddress") for (const unit of cv.postalAddress?.units ?? []) ids.add(unit.sourceId);
  }
  record.sources = cv.sources.filter((source) => ids.has(source.id));
  return record;
}

/** Every US profile key ("us/<slug>") that has at least one verified contact/visiting block. */
export function listUsContactVisitingKeys(): string[] {
  return Object.keys(usVerificationOverlay.entries ?? {}).filter((key) => {
    const [countrySlug, prisonSlug] = key.split("/");
    return Boolean(getUsContactVisiting(countrySlug, prisonSlug));
  });
}

/** Merge the US contact & visiting blocks (and their provenance) into a facility verification record. */
export function withUsContactVisiting(
  countrySlug: string,
  prisonSlug: string,
  record: FacilityVerificationRecord | undefined,
): FacilityVerificationRecord | undefined {
  const contact = getUsContactVisiting(countrySlug, prisonSlug);
  if (!contact) return record;
  if (!record) return { ...contact };
  const ids = new Set(record.sources.map((s) => s.id));
  const extra: FacilitySource[] = contact.sources.filter((s) => !ids.has(s.id));
  return {
    ...record,
    sources: [...record.sources, ...extra],
    fieldSources: { ...record.fieldSources, ...contact.fieldSources },
    ...(contact.postalAddress ? { postalAddress: contact.postalAddress } : {}),
    ...(contact.visitingHours ? { visitingHours: contact.visitingHours } : {}),
    ...(contact.visitingRulesUrl ? { visitingRulesUrl: contact.visitingRulesUrl } : {}),
  };
}
