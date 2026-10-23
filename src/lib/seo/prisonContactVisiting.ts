import { getGuide } from "@/data/guides";
import type { FacilityFactField, FacilityVerificationRecord } from "@/types/facilitySource";
import type { Prison } from "@/types/prison";
import { joinAddressAndPostcode } from "@/lib/address";
import { intentHref } from "@/lib/seo/prisonIntentCopy";
import { isIntentEnabledForPrison } from "@/lib/seo/intentRollout";
import { withContactVisiting } from "@/data/ukContactVisiting";
import { withUsContactVisiting } from "@/data/usContactVisiting";
import { provenanceForField, type FactProvenance } from "@/lib/verification/factProvenance";

/**
 * "Contacting and visiting" block on UK and US (BOP) prison profiles (2026-10-17).
 * Display-only. It READS existing published values (prison row with verified overlays already
 * applied, plus the facility verification record) and never invents or edits facts:
 * - address / phone come from the published prison record (the same values the profile's
 *   contact section already shows); email only from a verified overlay override.
 * - Official GOV.UK / BOP links are fixed, fetched-and-checked URLs (see OFFICIAL_URLS), shown
 *   only on the matching facility type (UK HMPPS establishments; BOP-managed institutions).
 * - Any row without data is omitted. No schema, title, meta, H1 or breadcrumb is affected.
 */

/** Each URL fetched 2026-10-17 and returned HTTP 200 with matching content. */
export const OFFICIAL_URLS = {
  ukVisits: "https://www.gov.uk/prison-visits",
  ukSendMoney: "https://www.gov.uk/send-prisoner-money",
  ukEmailAPrisoner: "https://www.gov.uk/staying-in-touch-with-someone-in-prison/email-and-social-media",
  ukLettersAndCalls: "https://www.gov.uk/staying-in-touch-with-someone-in-prison/letters-and-telephone-calls",
  bopVisiting: "https://www.bop.gov/inmates/visiting.jsp",
  bopCommunications: "https://www.bop.gov/inmates/communications.jsp",
} as const;

export type ContactLink = { href: string; label: string; kind: "official" | "guide" | "internal" };

export type ContactRowKey =
  | "address"
  | "phone"
  | "email"
  | "booking"
  | "visit-booking-phone"
  | "visit-booking-email"
  | "visiting-hours"
  | "visiting-rules"
  | "mailing-address"
  | "send-money"
  | "post"
  | "email-a-prisoner"
  | "phone-calls"
  | "contact-federal-inmate"
  | "official-page";

export type ContactRow = {
  key: ContactRowKey;
  label: string;
  text?: string;
  /** Extra plain-text lines shown under text (verbatim official values, e.g. address lines or schedule). */
  lines?: string[];
  /** Short verbatim qualifier shown after the value. */
  note?: string;
  tel?: string;
  mailto?: string;
  links?: ContactLink[];
  /** Set only when this row's value comes from a verified field source. */
  provenance?: FactProvenance;
};

function clean(v?: string | null): string {
  const s = (v ?? "").replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
  return /^(none|n\/a|null|undefined|-)$/i.test(s) ? "" : s;
}

export function isUkHmppsEstablishment(p: Prison): boolean {
  return p.countrySlug === "uk" && p.dataProvenance === "hmpps_import";
}

export function isBopListed(p: Prison): boolean {
  return p.countrySlug === "us" && p.dataProvenance === "bop_import" && p.operator?.trim() === "Federal Bureau of Prisons";
}

/**
 * BOP-managed institutions that hold people in custody. Community Corrections Management (CCM)
 * field offices are excluded: BOP's visiting and sending-money pages describe BOP-managed
 * facilities, not CCM offices or contract residential re-entry centres.
 */
export function isBopInstitution(p: Prison): boolean {
  return isBopListed(p) && !/\bccm\b/i.test(p.name);
}

/** Profiles that get the block at all: UK HMPPS rows and US BOP rows. Never international or legacy rows. */
export function isContactVisitingEligible(p: Prison): boolean {
  return isUkHmppsEstablishment(p) || isBopListed(p);
}

function guideLink(slug: string, label: string): ContactLink[] {
  return getGuide(slug) ? [{ href: `/guides/${slug}`, label, kind: "guide" }] : [];
}

function displayAddress(p: Prison): string {
  const address = clean(p.address);
  const postcode = clean(p.postcode);
  if (p.countrySlug === "us") {
    if (!address) return "";
    const city = clean(p.city);
    const state = clean(p.stateOrRegion);
    const tail = [state, postcode].filter(Boolean).join(" ");
    return [address, city, tail].filter(Boolean).join(", ");
  }
  return address ? joinAddressAndPostcode(address, postcode) : "";
}

function officialSourceUrl(p: Prison, verification?: FacilityVerificationRecord): string | undefined {
  const want = p.countrySlug === "uk" ? "gov.uk" : "bop.gov";
  for (const s of verification?.sources ?? []) {
    try {
      const host = new URL(s.url).hostname.replace(/^www\./, "").toLowerCase();
      if (host === want) return s.url;
    } catch {
      /* ignore malformed */
    }
  }
  return undefined;
}

type VerifiedBlockField = "postalAddress" | "visitBooking" | "prisonerContact" | "visitingHours" | "visitingRulesUrl";

/**
 * A contact/visiting block counts as verified only when it is present, its fieldSources entry is
 * non-empty and its sourceId resolves to a source on the record. The verifiers never write
 * REVIEW_REQUIRED / UNSUPPORTED / unchecked values into the merged record, so those fields are
 * absent and stay hidden. Any block that carries a non-verified status marker is also hidden.
 */
export function verifiedBlock<F extends VerifiedBlockField>(
  record: FacilityVerificationRecord | undefined,
  field: F,
): NonNullable<FacilityVerificationRecord[F]> | undefined {
  const block = record?.[field] as (NonNullable<FacilityVerificationRecord[F]> & { status?: string; classification?: string }) | undefined;
  if (!block || !block.sourceId) return undefined;
  const marker = (block.status ?? block.classification ?? "").toString().toUpperCase();
  if (marker && marker !== "VERIFIED" && marker !== "MATCH") return undefined;
  const ids = record?.fieldSources?.[field] ?? [];
  if (ids.length === 0) return undefined;
  if (!record?.sources?.some((s) => s.id === block.sourceId)) return undefined;
  return block;
}

/** Facility verification record with the verified UK (#77) / US (#81/#83) contact & visiting blocks merged in. */
export function contactVisitingRecord(p: Prison, verification?: FacilityVerificationRecord): FacilityVerificationRecord | undefined {
  if (p.countrySlug === "uk") return withContactVisiting(p.countrySlug, p.slug, verification);
  if (p.countrySlug === "us") return withUsContactVisiting(p.countrySlug, p.slug, verification);
  return verification;
}

function isHttpsUrl(v?: string): v is string {
  if (!v) return false;
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
}

function withFieldProvenance(row: ContactRow, record: FacilityVerificationRecord | undefined, field: FacilityFactField): ContactRow {
  const provenance = provenanceForField(record, field);
  return provenance ? { ...row, provenance } : row;
}

function mailingAddressRow(record: FacilityVerificationRecord | undefined, uk: boolean): ContactRow | undefined {
  const pa = verifiedBlock(record, "postalAddress");
  if (!pa) return undefined;
  const lines = [...(pa.recipientFormat ? [clean(pa.recipientFormat)] : []), ...pa.lines.map(clean), clean(pa.postcode)].filter(Boolean);
  if (lines.length === 0) return undefined;
  return withFieldProvenance(
    { key: "mailing-address", label: uk ? "Postal address for letters" : "Inmate mail address", lines },
    record,
    "postalAddress",
  );
}

export function contactVisitingRows(p: Prison, verificationIn?: FacilityVerificationRecord): ContactRow[] {
  if (!isContactVisitingEligible(p)) return [];
  const verification = contactVisitingRecord(p, verificationIn);
  const rows: ContactRow[] = [];
  const uk = isUkHmppsEstablishment(p);
  const bopInst = isBopInstitution(p);

  const address = displayAddress(p);
  if (address) rows.push(withFieldProvenance({ key: "address", label: "Address", text: address }, verification, "address"));

  const phone = clean(p.phone);
  if (phone) {
    rows.push(withFieldProvenance({ key: "phone", label: "Phone", text: phone, tel: phone.replace(/[^+\d]/g, "") }, verification, "phone"));
  }

  const email = clean(verification?.overrides?.email);
  if (email && verification?.fieldSources?.email?.length) {
    rows.push(withFieldProvenance({ key: "email", label: "Email", text: email, mailto: email }, verification, "email"));
  }

  if (uk) {
    const vb = verifiedBlock(verification, "visitBooking");
    const bookingUrl = isHttpsUrl(vb?.url) ? vb!.url! : OFFICIAL_URLS.ukVisits;
    const booking: ContactLink[] = [
      {
        href: bookingUrl,
        label: bookingUrl === OFFICIAL_URLS.ukVisits ? "Request a social visit on GOV.UK" : "Book a visit online (official booking page)",
        kind: "official",
      },
    ];
    if (isIntentEnabledForPrison(p, "booking-a-visit")) {
      booking.push({ href: intentHref(p.countrySlug, p.slug, "booking-a-visit"), label: `${p.name} booking a visit`, kind: "internal" });
    }
    booking.push(...guideLink("how-prison-visits-work", "How prison visits work"));
    rows.push(vb ? withFieldProvenance({ key: "booking", label: "Booking a visit", links: booking }, verification, "visitBooking") : { key: "booking", label: "Booking a visit", links: booking });
    if (vb?.phone && clean(vb.phone)) {
      const tel = clean(vb.phone);
      rows.push({
        key: "visit-booking-phone",
        label: "Visits booking line",
        text: tel,
        tel: tel.replace(/[^+\d]/g, ""),
        note: clean(vb.phoneHours) || undefined,
      });
    }
    if (vb?.email && clean(vb.email)) {
      rows.push({
        key: "visit-booking-email",
        label: vb.emailEnquiriesOnly ? "Visits enquiries email" : "Visits booking email",
        text: clean(vb.email),
        mailto: clean(vb.email),
        note: vb.emailEnquiriesOnly ? "Enquiries only, not bookings" : undefined,
      });
    }
    if (vb?.note && clean(vb.note)) {
      const last = rows[rows.length - 1];
      if (last.key === "booking") last.note = clean(vb.note);
      else rows.find((r) => r.key === "booking")!.note = clean(vb.note);
    }
    rows.push({
      key: "send-money",
      label: "Sending money",
      links: [{ href: OFFICIAL_URLS.ukSendMoney, label: "Send money to someone in prison on GOV.UK", kind: "official" }],
    });
    const mailing = mailingAddressRow(verification, true);
    if (mailing) rows.push(mailing);
    const pc = verifiedBlock(verification, "prisonerContact");
    const postRow: ContactRow = {
      key: "post",
      label: "Post and letters",
      ...(pc?.postInstructions && clean(pc.postInstructions) ? { text: clean(pc.postInstructions) } : {}),
      links: [
        ...guideLink("how-to-find-a-uk-prison-address", "How to address a letter to a UK prison"),
        ...guideLink("can-you-send-pictures-in-prison-letters", "Can you send pictures in prison letters?"),
      ],
    };
    rows.push(postRow.text ? withFieldProvenance(postRow, verification, "prisonerContact") : postRow);
    rows.push({
      key: "email-a-prisoner",
      label: "Email a prisoner",
      links: [{ href: OFFICIAL_URLS.ukEmailAPrisoner, label: "Email a Prisoner service: GOV.UK guidance", kind: "official" }],
    });
    rows.push({
      key: "phone-calls",
      label: "Phone calls",
      links: [
        { href: OFFICIAL_URLS.ukLettersAndCalls, label: "Letters, video and telephone calls on GOV.UK", kind: "official" },
        ...guideLink("life-inside-prison", "Life inside prison: phone calls and family contact"),
      ],
    });
  } else if (bopInst) {
    const rules = verifiedBlock(verification, "visitingRulesUrl");
    rows.push({
      key: "booking",
      label: "Visiting",
      links: [{ href: OFFICIAL_URLS.bopVisiting, label: "How to visit a federal inmate (bop.gov)", kind: "official" }],
    });
    if (rules && isHttpsUrl(rules.url)) {
      rows.push(withFieldProvenance({
        key: "visiting-rules",
        label: "Visiting rules",
        links: [{ href: rules.url, label: `${p.name} visiting rules (official)`, kind: "official" }],
      }, verification, "visitingRulesUrl"));
    }
    const hours = verifiedBlock(verification, "visitingHours");
    const schedule = (hours?.schedule ?? []).map(clean).filter(Boolean);
    if (schedule.length > 0) {
      rows.push(withFieldProvenance({ key: "visiting-hours", label: "Visiting hours", lines: schedule, note: clean(hours?.note) || undefined }, verification, "visitingHours"));
    }
    const mailing = mailingAddressRow(verification, false);
    if (mailing) rows.push(mailing);
    rows.push({
      key: "contact-federal-inmate",
      label: "Money, mail, email and phone",
      links: [
        {
          href: OFFICIAL_URLS.bopCommunications,
          label: "Sending money, mail, TRULINCS email and phone calls (bop.gov)",
          kind: "official",
        },
      ],
    });
  }

  const official = officialSourceUrl(p, verificationIn);
  if (official) {
    rows.push({
      key: "official-page",
      label: "Official page",
      links: [{ href: official, label: uk ? "Official prison page (GOV.UK)" : "Official facility page (bop.gov)", kind: "official" }],
    });
  }

  return rows.filter((r) => r.text || (r.lines && r.lines.length > 0) || (r.links && r.links.length > 0));
}

/**
 * Rows for the /contact-details sub-page. Same verified rows as the profile block, minus the
 * address / phone / email rows (the page's FacilityFactBlock already shows those) and minus any
 * internal profile/intent links, so no anchor text moves contact or visit intent between pages.
 * Official external links and existing guide links stay.
 */
export function contactDetailsRows(p: Prison, verification?: FacilityVerificationRecord): ContactRow[] {
  const skip = new Set<ContactRowKey>(["address", "phone", "email"]);
  return contactVisitingRows(p, verification)
    .filter((r) => !skip.has(r.key))
    .map((r) => (r.links ? { ...r, links: r.links.filter((l) => l.kind !== "internal") } : r))
    .filter((r) => r.text || (r.lines && r.lines.length > 0) || (r.links && r.links.length > 0));
}
