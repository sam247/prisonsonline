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
  /** Date this record's GOV.UK page was last re-opened, when later than the batch-wide CHECKED_AT. */
  checkedAt: string = CHECKED_AT,
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
        checkedAt,
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
  govContact("hmp-berwyn", "berwyn-prison", "2026-10-19", {
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
  }, "2026-10-20"),
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
  // Coverage batch 2 (GOV.UK checked 2026-10-17), ordered by Bing impressions.
  govContact("hmp-wealstun", "wealstun-prison", "2026-06-05", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01937 444 599",
      phoneHours: "Monday to Thursday, 8:30am to 12:30pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-whitemoor", "whitemoor-prison", "2026-02-18", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01354 602 800",
      phoneHours: "Monday to Friday, 9.30am to 1.30pm",
      email: "Socialvisits.whitemoor@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-lewes", "lewes-prison", "2025-11-05", {
    visitBooking: {
      methods: ["online"],
      url: GOVUK_PRISON_VISITS_URL,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-swaleside", "swaleside-prison", "2025-11-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6604",
      phoneHours: "Monday to Friday, 9am to 5pm (excluding Bank Holidays)",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      postInstructions: "Include the Prisoners name and prisoner number on the envelope. You must also write your own name and address on the back of the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-the-mount", "the-mount-prison", "2025-10-30", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 790 0656",
      phoneHours: "Monday to Friday 10am to midday",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-exeter", "exeter-prison", "2026-08-17", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01392 415 833",
      phoneHours: "Monday and Tuesday (excl bank holidays), 9am to midday and 1:30pm to 4:30pm",
      email: "socialvisits.exeter@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-sudbury", "sudbury-prison", "2026-06-29", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01283 584 018",
      phoneHours: "Monday to Friday, 9am to 4pm",
      email: "socialvisitssudbury@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number or date of birth on the envelope. Also add your name and address on the back of the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-hatfield", "hatfield-prison", "2025-10-21", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01405 746 611",
      phoneHours: "Monday to Friday 8:30am to 11:30am",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the prisoner’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-lindholme", "lindholme-prison", "2026-09-24", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01302 524 980",
      phoneHours: "Monday, 1:30pm to 4pm; Tuesday, 8:30am to 11am; Wednesday, closed; Thursday, 1:30pm to 4pm; Friday, 8:30am to 11am",
      email: "socialvisits.lindholme@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-hindley", "hindley-prison", "2026-10-06", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01942 663 234",
      phoneHours: "Monday to Friday: 9am to midday and 1pm to 3:30pm",
      email: "socialvisits.Hindley@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-risley", "risley-prison", "2026-08-26", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01925 733285",
      phoneHours: "Monday to Thursday, 9am to 3:15pm; Friday at 9am to 2pm",
      email: "SocialVisitsRisley@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-isis", "isis-prison", "2026-03-18", {
    visitBooking: {
      methods: ["prisoner-led"],
      note: "Social and family visits can only be booked by the prisoner internally.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-holme-house", "holme-house-prison", "2026-07-22", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6602",
      phoneHours: "Monday, Tuesday, Wednesday and Friday: 8:30am to 4:30pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-wayland", "wayland-prison", "2025-10-30", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01953 804 152",
      phoneHours: "Monday to Friday: 9am to 4pm",
      email: "socialvisits.Wayland@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-lowdham-grange", "lowdham-grange-prison", "2026-09-09", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0808 168 8292",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the prisoners’ name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-featherstone", "featherstone-prison", "2026-07-07", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6502",
      phoneHours: "Monday to Friday, 9am to 3pm",
      email: "visitsbooking.westmidlands@justice.gov.uk",
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
  govContact("hmp-leyhill", "leyhill-prison", "2025-10-30", {
    visitBooking: {
      methods: ["online"],
      url: GOVUK_PRISON_VISITS_URL,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-stocken", "stocken-prison", "2026-10-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01780 795 156",
      phoneHours: "Monday to Friday, 9am to 11am",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number or date of birth on the envelope. Also add your name and address on the back of the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-brixton", "brixton-prison", "2025-10-21", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0208 678 1433",
      phoneHours: "Monday to Thursday: 1:15pm to 4pm; Friday: 9am to 11:45am",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-north-sea-camp", "north-sea-camp-prison", "2026-10-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01205 769368",
      phoneHours: "Monday to Friday, 9:30am to 11:30am and 2:30pm to 3:30pm; Saturday and Sunday, 2:30pm to 3:30pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-hull", "hull-prison", "2026-08-11", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01482 282 016",
      phoneHours: "Monday to Friday, 8am to 12:30pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-littlehey", "littlehey-prison", "2026-08-05", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01480 335 136",
      phoneHours: "Tuesday to Sunday 9:30am to 4pm",
      email: "Socialvisits.littlehey@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-whatton", "whatton-prison", "2026-10-08", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01949 803 200",
      phoneHours: "Monday to Friday 9am to midday and 1pm to 5pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-brinsford", "brinsford-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6500",
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
  // Coverage batch 3 (GOV.UK checked 2026-10-17), ordered by Bing impressions.
  govContact("hmp-full-sutton", "full-sutton-prison", "2025-12-18", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01759 475 355",
      phoneHours: "Monday to Friday, 8:30am to 4:30pm",
      email: "socialvisits.fullsutton@justice.gov.uk",
      note: "If you are visiting somebody located at Full Sutton for the first time, you must first call on the number provided above.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-drake-hall", "drake-hall-prison", "2026-09-25", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6501",
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
  govContact("hmp-maidstone", "maidstone-prison", "2025-09-18", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01622 775 621",
      phoneHours: "Monday to Friday: 9am to 12:30pm",
      email: "socialvisits.maidstone@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-haverigg", "haverigg-prison", "2025-11-01", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01229 713 016",
      phoneHours: "Monday to Friday, 1pm to 4pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-woodhill", "woodhill-prison", "2025-11-28", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01908 722 329",
      phoneHours: "Monday to Friday, 8am to 11.30am; Monday, Tuesday and Thursday, 1pm to 3.30pm; Bank holidays, closed",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the prisoners’ name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-hollesley-bay", "hollesley-bay-prison", "2026-10-19", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 790 0658",
      phoneHours: "Tuesday to Thursday, 9am to midday and 1pm to 4pm",
      email: "SocialVisits.HollesleyBay@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }, "2026-10-20"),
  govContact("hmp-yoi-new-hall", "new-hall-prison", "2026-10-19", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6515",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }, "2026-10-20"),
  govContact("hmp-bristol", "bristol-prison", "2026-08-01", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6510",
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
  govContact("hmp-yoi-chelmsford", "chelmsford-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0808 168 8248",
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
  govContact("hmp-yoi-moorland", "moorland-prison", "2026-09-15", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01302 523 289",
      phoneHours: "every Tuesday and Thursday between the hours of 9:30am and 3:30pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-kirklevington-grange", "kirklevington-grange-prison", "2026-02-12", {
    visitBooking: {
      methods: ["prisoner-led"],
      note: "Visits can only be booked by prisoner led application.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Please include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-frankland", "frankland-prison", "2025-10-21", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0191 376 5048",
      phoneHours: "Monday to Friday, 9am to midday",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-foston-hall", "foston-hall-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6516",
      phoneHours: "Monday to Friday, 9am to 3pm",
      note: "You must book your first visit by telephone.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the prisoners name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-norwich", "norwich-prison", "2026-09-24", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01603 708 790",
      phoneHours: "Monday, 1:30pm to 3:30pm; Tuesday, Wednesday and Thursday: 9:30am to midday and 1:30pm to 3:30pm; Friday, 9:30am to midday and 1:30pm to 3pm",
      email: "SocialVisits.Norwich@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-swansea", "swansea-prison", "2026-06-26", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01792 485 322",
      phoneHours: "Monday to Friday, 8:45am to 11:45am and 1pm to 3:45pm",
      email: "socvisswansea@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-lancaster-farms", "lancaster-farms-prison", "2025-10-28", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01524 563 636",
      phoneHours: "Monday to Friday, 9am to 12pm",
      email: "LancasterFarmsDomesticVisitsBooking@justice.gov.uk",
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
  govContact("hmp-the-verne", "the-verne-prison", "2026-08-10", {
    visitBooking: {
      methods: ["online"],
      url: GOVUK_PRISON_VISITS_URL,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-ford", "ford-prison", "2025-06-03", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01903 663120",
      phoneHours: "Monday to Friday, 10am to 12pm and 1pm to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-thorn-cross", "thorn-cross-prison", "2025-10-30", {
    visitBooking: {
      methods: ["phone"],
      phone: "01925 805 018",
      phoneHours: "Monday to Friday, 8:30am to midday",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-usk", "usk-prison", "2026-09-11", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01291 673 730",
      phoneHours: "Monday, Tuesday, Thursday and Friday 5pm to 7pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-warren-hill", "warren-hill-prison", "2026-10-19", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 790 0657",
      phoneHours: "Tuesday to Thursday, 9am to midday",
      email: "socialvisits.warrenhill@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }, "2026-10-20"),
  govContact("hmp-yoi-east-sutton-park", "east-sutton-park-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 303 0630",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-bure", "bure-prison", "2025-10-29", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01603 326 252",
      phoneHours: "Tuesday, 8:30am to midday; Wednesday, 8:30am to midday; Thursday, 10am to midday; Saturday and Sunday, 8:30am to midday",
      email: "socialvisits.bure@justice.gov.uk",
      emailEnquiriesOnly: true,
      note: "If you have been sent a visiting order in the post, you can also book by telephone.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-buckley-hall", "buckley-hall-prison", "2026-03-12", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01706 514 350",
      phoneHours: "Monday to Friday, 9am to 11:30am",
      email: "socialvisits.buckleyhall@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  // Coverage batch 4 (GOV.UK checked 2026-10-17), ordered by Bing impressions.
  govContact("hmp-cardiff", "cardiff-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 303 2301",
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
  govContact("hmp-leicester", "leicester-prison", "2025-09-26", {
    visitBooking: {
      methods: ["prisoner-led", "online"],
      url: GOVUK_PRISON_VISITS_URL,
      note: "Visits can be booked by: prisoner led application - prisoner submits an application form for a social visit to wing staff",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope, under the address. If you do not know their prison number, contact Leicester. Write your own name and address on the back of the envelope.",
      sourceId: S,
    },
  }, "2026-10-20"),
  govContact("hmp-onley", "onley-prison", "2026-09-09", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01788 523 402",
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
  govContact("hmp-send", "send-prison", "2026-10-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6514",
      phoneHours: "Monday to Friday, 9am to 3pm",
      note: "If you have been sent a visiting order, you can also book by telephone.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the prisoner’s name and prisoner number on the envelope. You must also write your own name and address on the back of the envelope clearly.",
      sourceId: S,
    },
  }),
  govContact("hmp-spring-hill", "spring-hill-prison", "2026-08-12", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01296 445 082",
      phoneHours: "Monday to Friday, 10am to 12pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-stafford", "stafford-prison", "2026-08-04", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6505",
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
  govContact("hmp-yoi-askham-grange", "askham-grange-prison", "2026-10-13", {
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
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-downview", "downview-prison", "2026-10-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 303 0633",
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
  govContact("hmp-yoi-eastwood-park", "eastwood-park-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 303 0631",
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
  govContact("hmp-yoi-high-down", "high-down-prison", "2026-10-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0207 147 6570",
      phoneHours: "Monday to Friday: 10am to midday",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-lincoln", "lincoln-prison", "2026-10-08", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01522 663 172",
      phoneHours: "Monday to Friday, 9:30am to midday, except bank holidays",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-low-newton", "low-newton-prison", "2026-10-02", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 303 0632",
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
  govContact("hmp-yoi-prescoed", "prescoed-prison", "2026-08-11", {
    visitBooking: {
      methods: ["prisoner-led"],
      note: "All family/friends visits are now generated internally by written application from the person you wish to visit. There is no online booking service available.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-standford-hill", "standford-hill-prison", "2026-07-06", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0330 058 8223",
      phoneHours: "Monday to Friday, 9am to 3pm",
      email: "SocialVisits.StandfordHill@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-styal", "styal-prison", "2026-10-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6512",
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
  govContact("hmp-yoi-swinfen-hall", "swinfen-hall-prison", "2026-08-14", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0300 060 6507",
      phoneHours: "Monday to Friday, 9am to 3pm",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the prisoners name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmp-yoi-winchester", "winchester-prison", "2026-07-24", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "0333 207 2489",
      phoneHours: "Monday to Friday 9am to 12pm and 1:30pm to 4pm (except public holidays)",
      email: "SocialVisits.Winchester@justice.gov.uk",
      emailEnquiriesOnly: true,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "All letters must include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmyoi-aylesbury", "aylesbury-yoi", "2026-10-05", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01296 444 102",
      phoneHours: "Monday to Friday, 9:30am to 1:30pm",
      email: "socialvisits.aylesbury@justice.gov.uk",
      emailEnquiriesOnly: true,
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number (or date of birth) on the envelope. You must also write your own name and address on the back of the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmyoi-cookham-wood", "cookham-wood-prison", "2025-10-21", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01634 202557",
      phoneHours: "Monday to Thursday: 9am to 3pm and Friday 9am to 2:30pm (Excluding Public and Bank Holidays)",
      sourceId: S,
    },
    prisonerContact: {
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the Person’s name and Prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmyoi-deerbolt", "deerbolt-prison", "2026-01-22", {
    visitBooking: {
      methods: ["online", "phone"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01833 633 349",
      phoneHours: "Monday to Friday, 9am to midday",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prisoner number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmyoi-feltham", "feltham-yoi", "2026-03-17", {
    visitBooking: {
      methods: ["prisoner-led"],
      note: "All visit bookings are arranged by the young person or adult prisoner. They submit their application to the visit department who in turn contacts the person visiting and arranges the booking.",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmyoi-werrington", "werrington-yoi", "2026-03-19", {
    visitBooking: {
      methods: ["online", "phone", "email"],
      url: GOVUK_PRISON_VISITS_URL,
      phone: "01782 463 414",
      phoneHours: "Monday to Friday, 9am to 11:30am",
      email: "socialvisits.werrington@justice.gov.uk",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmyoi-wetherby", "wetherby-yoi", "2026-09-18", {
    visitBooking: {
      methods: ["phone"],
      phone: "01937 544207",
      phoneHours: "Monday to Friday from 9am to 11:30am",
      sourceId: S,
    },
    prisonerContact: {
      emailAPrisonerUrl: EMAIL_A_PRISONER_URL,
      sendMoneyUrl: SEND_PRISONER_MONEY_URL,
      postInstructions: "Include the person’s name and prison number on the envelope.",
      sourceId: S,
    },
  }),
  govContact("hmyoi-portland", "portland-prison-and-young-offender-institution", "2025-09-18", {
    visitBooking: {
      methods: ["online"],
      url: GOVUK_PRISON_VISITS_URL,
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
