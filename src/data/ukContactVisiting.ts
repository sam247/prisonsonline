import type { FacilitySource, FacilityVerificationRecord } from "@/types/facilitySource";

/**
 * Official UK contact & visiting facts (Sam approved the fields on 17 Oct 2026): postal/PO Box address,
 * visit booking and prisoner-contact routes. GOV.UK/MoJ sources only, every block carries a sourceId.
 *
 * Kept in its own slug-keyed file (not inline in facilitySources.ts govRecord calls) so it can merge
 * independently of concurrent facilitySources.ts edits. It is deliberately NOT wired into
 * getFacilityVerification(): doing so would change rendered fact blocks, JSON-LD and lastmod, which the
 * Content Manager owns. Display code should call getContactVisiting() / withContactVisiting().
 *
 * Rules: omit values the official page does not publish (never store placeholders); the canonical site
 * address/postcode stay on the prison record — postalAddress is only for a separate official postal address.
 */

export const CONTACT_VISITING_SOURCE_ID = "govuk-contact-visiting";
const GOV = "GOV.UK — HM Prison and Probation Service";
const CHECKED_AT = "2026-10-17";

export const GOVUK_PRISON_VISITS_URL = "https://www.gov.uk/prison-visits";
export const EMAIL_A_PRISONER_URL = "https://www.emailaprisoner.com/";
export const SEND_PRISONER_MONEY_URL = "https://www.gov.uk/send-prisoner-money";

export type ContactVisitingRecord = Pick<
  FacilityVerificationRecord,
  "countrySlug" | "prisonSlug" | "sources" | "fieldSources" | "postalAddress" | "visitBooking" | "prisonerContact"
>;

type Blocks = Pick<FacilityVerificationRecord, "postalAddress" | "visitBooking" | "prisonerContact">;

function govContact(
  prisonSlug: string,
  guidanceSlug: string,
  sourceModifiedAt: string,
  blocks: Blocks,
): ContactVisitingRecord {
  const fieldSources: FacilityVerificationRecord["fieldSources"] = {};
  if (blocks.postalAddress) fieldSources.postalAddress = [CONTACT_VISITING_SOURCE_ID];
  if (blocks.visitBooking) fieldSources.visitBooking = [CONTACT_VISITING_SOURCE_ID];
  if (blocks.prisonerContact) fieldSources.prisonerContact = [CONTACT_VISITING_SOURCE_ID];
  return {
    countrySlug: "uk",
    prisonSlug,
    sources: [
      {
        id: CONTACT_VISITING_SOURCE_ID,
        name: GOV,
        url: `https://www.gov.uk/guidance/${guidanceSlug}`,
        checkedAt: CHECKED_AT,
        sourceModifiedAt,
      },
    ],
    fieldSources,
    ...blocks,
  };
}

const S = CONTACT_VISITING_SOURCE_ID;

export const ukContactVisitingRecords: ContactVisitingRecord[] = [
  govContact("hmp-preston", "preston-prison", "2026-09-03", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0330 058 8224",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
];

const byKey = new Map(ukContactVisitingRecords.map((r) => [`${r.countrySlug}/${r.prisonSlug}`, r]));

export function getContactVisiting(countrySlug: string, prisonSlug: string): ContactVisitingRecord | undefined {
  return byKey.get(`${countrySlug}/${prisonSlug}`);
}

/** Merge the contact & visiting blocks (and their provenance) into a facility verification record. */
export function withContactVisiting(
  countrySlug: string,
  prisonSlug: string,
  record: FacilityVerificationRecord | undefined,
): FacilityVerificationRecord | undefined {
  const contact = getContactVisiting(countrySlug, prisonSlug);
  if (!contact) return record;
  if (!record) return { ...contact };
  const ids = new Set(record.sources.map((s) => s.id));
  const extra: FacilitySource[] = contact.sources.filter((s) => !ids.has(s.id));
  return {
    ...record,
    sources: [...record.sources, ...extra],
    fieldSources: { ...record.fieldSources, ...contact.fieldSources },
    ...(contact.postalAddress ? { postalAddress: contact.postalAddress } : {}),
    ...(contact.visitBooking ? { visitBooking: contact.visitBooking } : {}),
    ...(contact.prisonerContact ? { prisonerContact: contact.prisonerContact } : {}),
  };
}
