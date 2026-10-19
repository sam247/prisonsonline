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
  | "countrySlug"
  | "prisonSlug"
  | "sources"
  | "fieldSources"
  | "postalAddress"
  | "visitBooking"
  | "prisonerContact"
  // Optional keys shared with the US record type (usContactVisiting.ts); no UK values are stored for them.
  | "visitingHours"
  | "visitingRulesUrl"
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
  govContact("hmp-wandsworth", "wandsworth-prison", "2026-08-12", {
    postalAddress: {
      lines: ["HMP Wandsworth", "PO Box 757", "Heathfield Road", "Wandsworth", "London"],
      postcode: "SW18 3HS",
      sourceId: S,
    },
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6509",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-belmarsh", "belmarsh-prison", "2025-10-21", {
    visitBooking: {
      methods: ["online", "email", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      email: "belmarsh.visits@justice.gov.uk",
      phone: "0208 331 4760",
      phoneHours: "Monday to Friday, 9:30am to 3pm",
      note: "book in person after a visit, in the enrolment centre",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number (or date of birth) on the envelope. You must also write your own name and address on the back of the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-pentonville", "pentonville-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6504",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-wormwood-scrubs", "wormwood-scrubs-prison", "2026-07-06", {
    postalAddress: {
      lines: ["HMP Wormwood Scrubs", "PO Box 757", "Du Cane Road", "London"],
      postcode: "W12 0AE",
      sourceId: S,
    },
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6511",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-birmingham", "birmingham-prison", "2026-08-26", {
    visitBooking: {
      methods: ["phone", "email"],
      phone: "0333 207 2490",
      phoneHours: "Monday to Friday 10am to 3pm",
      email: "visits.birmingham@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the prisoners name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-manchester", "manchester-prison", "2026-06-02", {
    visitBooking: {
      methods: ["prisoner-led", "phone", "email"],
      phone: "0161 817 5655",
      phoneHours: "Monday to Thursday 8am to 4pm, and Friday 8am to midday",
      email: "Visitsbookingmanchester@justice.gov.uk",
      note: "Reception visits take place during a prisoner’s first few weeks in Manchester Prison at the times shown below. All other visits are booked by prisoner-led application.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-leeds", "leeds-prison", "2026-07-01", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0113 203 2570",
      phoneHours: "Monday to Friday, 8am to 10am and 12pm to 2pm",
      email: "socialvisits.leeds@justice.gov.uk",
      emailEnquiriesOnly: true,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-liverpool", "liverpool-prison", "2025-12-02", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0151 530 4050",
      phoneHours: "Monday to Friday, 8:30am to 4:30pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-durham", "durham-prison", "2026-07-31", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 303 2300",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-wakefield", "wakefield-prison", "2026-02-04", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01924 612 274",
      phoneHours: "Monday, 9am to midday; Tuesday, 9am to midday and 2:30pm to 4:30pm; Wednesday, 9am to midday and 2:30pm to 4:30pm; Thursday, 9am to midday and 2:30pm to 4:30pm; Friday, 9am to midday",
      email: "SocialVisits.Wakefield@justice.gov.uk",
      emailEnquiriesOnly: true,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
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
