export type FacilityFactField =
  | "address"
  | "postcode"
  | "phone"
  | "email"
  | "operator"
  | "category"
  | "legalVisits"
  | "postalAddress"
  | "visitBooking"
  | "prisonerContact"
  | "visitingHours"
  | "visitingRulesUrl";

export interface FacilitySource {
  id: string;
  name: string;
  url: string;
  /** Date this source was actually opened and compared with the displayed facts. */
  checkedAt: string;
  /** Source publisher's own update date, when the page exposes one. */
  sourceModifiedAt?: string;
}

export type FacilityFieldSources = Partial<Record<FacilityFactField, readonly string[]>>;

export interface FacilityFactOverrides {
  address?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  operator?: string;
  category?: string;
}

export interface LegalVisitContact {
  label: string;
  email?: string;
  phone?: string;
  schedule?: string[];
  sourceId: string;
}

export interface LegalVisitDetails {
  summary: string;
  contacts: LegalVisitContact[];
}

/**
 * Official postal (e.g. PO Box) address, kept separately from the canonical site address/postcode.
 * Only set when the official source publishes an address that differs from the site address.
 */
export interface PostalAddress {
  /** Address lines exactly as the official source lists them, excluding the postcode. */
  lines: string[];
  /** Postcode as the official source gives it for this postal address (may differ from the site postcode). */
  postcode: string;
  /**
   * Recipient line the official source tells senders to put first, verbatim
   * (US BOP inmate mail: "INMATE NAME & REGISTER NUMBER"). Not part of lines.
   */
  recipientFormat?: string;
  /**
   * Additional per-unit postal addresses the official source publishes alongside this one
   * (US BOP complexes: e.g. "Camp" satellite camp, "FSL" federal satellite low). Additive; omitted when none.
   */
  units?: PostalAddressUnit[];
  sourceId: string;
}

/** One per-unit postal address inside a PostalAddress block. Same lines/postcode/sourceId pattern. */
export interface PostalAddressUnit {
  /** Unit label as the official source names it (e.g. "Camp", "FSL"). */
  label: string;
  /** Address lines exactly as the official source lists them for this unit, excluding the postcode. */
  lines: string[];
  postcode: string;
  sourceId: string;
}

/** How the official source says family and friends book a visit. */
export type VisitBookingMethod = "online" | "phone" | "email" | "prisoner-led";

export interface VisitBooking {
  /** Booking routes the official source gives for family and friends visits, primary route first. */
  methods: VisitBookingMethod[];
  /** Official online booking URL exactly as the source links it (e.g. https://www.gov.uk/prison-visits). */
  url?: string;
  phone?: string;
  /** Booking-line hours, verbatim from the source. */
  phoneHours?: string;
  email?: string;
  /** True when the source says the email is for enquiries only (no bookings). */
  emailEnquiriesOnly?: boolean;
  /** Short verbatim qualifier from the source (e.g. which visits can be booked), when it limits the routes above. */
  note?: string;
  sourceId: string;
}

/** Official routes for contacting someone held at the prison. */
export interface PrisonerContactRoutes {
  /** Email a Prisoner URL exactly as the official source links it. */
  emailAPrisonerUrl?: string;
  /** Send-money URL exactly as the official source links it. */
  sendMoneyUrl?: string;
  /** Letter/envelope instruction, verbatim from the source. */
  postInstructions?: string;
  sourceId: string;
}

/** Typical visiting schedule exactly as the official source publishes it. */
export interface VisitingHours {
  /** One entry per day/slot as published, e.g. "Sat: 8:00 AM - 3:00 PM" (unit-prefixed when the source splits by unit). */
  schedule: string[];
  /** Short verbatim qualifier from the source. */
  note?: string;
  sourceId: string;
}

/** Official visiting rules / regulations document or page. */
export interface VisitingRulesLink {
  /** URL exactly as the official source links it (cache-busting query removed). */
  url: string;
  sourceId: string;
}

export interface FacilityVerificationRecord {
  countrySlug: string;
  prisonSlug: string;
  sources: FacilitySource[];
  fieldSources: FacilityFieldSources;
  overrides?: FacilityFactOverrides;
  legalVisits?: LegalVisitDetails;
  postalAddress?: PostalAddress;
  visitBooking?: VisitBooking;
  prisonerContact?: PrisonerContactRoutes;
  visitingHours?: VisitingHours;
  visitingRulesUrl?: VisitingRulesLink;
}
