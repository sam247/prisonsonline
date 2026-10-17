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
  // Coverage batch 1 (GOV.UK checked 2026-10-17), ordered by Bing impressions.
  govContact("hmp-hewell", "hewell-prison", "2026-08-12", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6503",
      phoneHours: "Monday to Friday, 9am to 3pm",
      email: "Visits.HMPHewell@justice.gov.uk",
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
  govContact("hmp-elmley", "elmley-prison", "2026-07-17", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01795 802 358",
      phoneHours: "Monday to Friday, 9am to 2pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-nottingham", "nottingham-prison", "2026-08-04", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0115 962 8980",
      phoneHours: "Monday, 1pm to 4pm; Tuesday, 9am to midday; Wednesday, closed; Thursday, 1pm to 4pm; Friday, closed; Saturday, 9am to midday; Sunday, closed",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-berwyn", "berwyn-prison", "2026-09-03", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01978 523 352",
      phoneHours: "Monday to Friday, 11am to midday and 1:30pm to 2:30pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-ranby", "ranby-prison", "2026-10-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0808 168 8282",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope, and your name and address on the back.",
      sourceId: S,
    },
  }),
  govContact("hmp-bullingdon", "bullingdon-prison", "2026-10-08", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01869 353 176",
      phoneHours: "Monday to Friday (except public holidays), 9:30am to 11:30am, 1:30pm to 4pm",
      email: "socialvisits.bullingdon@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-coldingley", "coldingley-prison", "2026-07-07", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0330 016 8787",
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
  govContact("hmp-erlestoke", "erlestoke-prison", "2026-08-04", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 303 0634",
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
  govContact("hmp-garth", "garth-prison", "2025-12-11", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01772 443 503",
      phoneHours: "Monday to Friday, 9am to 12:30pm and 1.30pm to 4.30pm",
      email: "socialvisits.garth@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-humber", "humber-prison", "2025-10-21", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6606",
      phoneHours: "Monday to Friday: 9am to 11:30am and 1pm to 3pm",
      note: "You can book your visit online, by telephone or in person during weekday social visit times.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-gartree", "gartree-prison", "2026-05-06", {
    visitBooking: {
      methods: ["online", "email", "phone", "prisoner-led"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01858 426 727",
      phoneHours: "Monday to Friday, 8am to midday and 1pm to 4pm",
      email: "socialvisits.gartree@justice.gov.uk",
      note: "Prisoners can also book their own visits by speaking to a wing officer and completing the application forms.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-kirkham", "kirkham-prison", "2025-11-11", {
    visitBooking: {
      methods: ["online", "prisoner-led"],
      url: GOVUK_PRISON_VISITS_URL,
      note: "Prisoners can also book a visit in the mail room.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-channings-wood", "channings-wood-prison", "2025-10-21", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01803 812060",
      phoneHours: "Monday, 10am to 2:30pm; Tuesday, 10am to 2:30pm; Wednesday, 10am to 2:30pm; Thursday, 10am to 2:30pm; Friday, 10am to 2:30pm; Saturday, closed; Sunday, closed",
      email: "socialvisits.channingswood@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-bedford", "bedford-prison", "2026-08-04", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0345 646 2277",
      phoneHours: "Monday to Friday, 9am to 3pm",
      email: "socialvisits.bedford@justice.gov.uk",
      emailEnquiriesOnly: true,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s full name and prisoner number (if you have it) on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-morton-hall", "morton-hall-prison", "2026-10-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 303 0649",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-stoke-heath", "stoke-heath-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6506",
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
  govContact("hmp-guys-marsh", "guys-marsh-prison", "2026-06-03", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01747 856 586",
      phoneHours: "Monday to Thursday, 1pm to 3pm; Friday, 11.30am to 1pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-rochester", "rochester-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6513",
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
  govContact("hmp-highpoint", "highpoint-prison", "2025-09-16", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0808 168 8200",
      phoneHours: "Monday to Friday, 8am to 2pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "You need to include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-long-lartin", "long-lartin-prison", "2026-06-08", {
    visitBooking: {
      methods: ["phone", "email"],
      phone: "01386 295 188",
      phoneHours: "Monday to Friday, 9am to 2pm",
      email: "socialvisits.longlartin@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-huntercombe", "huntercombe-prison", "2026-08-17", {
    visitBooking: {
      methods: ["online"],
      url: GOVUK_PRISON_VISITS_URL,
      email: "socialvisits.huntercombe@justice.gov.uk",
      emailEnquiriesOnly: true,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name, date of birth and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-grendon", "grendon-prison", "2026-08-12", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01296 445 243",
      phoneHours: "Monday to Friday: 10am to noon",
      email: "SocialVisits.Grendon@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-wymott", "wymott-prison", "2025-10-30", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01772 442 234",
      phoneHours: "Monday to Friday: 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-isle-of-wight", "isle-of-wight-prison", "2026-09-30", {
    visitBooking: {
      methods: ["phone"],
      phone: "01983 634 218",
      phoneHours: "Monday to Thursday: 10am to 12pm and 1pm to 4:15pm; Friday: 10am to midday and 1pm to 4pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Write the prisoners’ full name and prisoner number (if known) on the envelope.",
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
