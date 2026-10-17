import { getGuide } from "@/data/guides";
import type { FacilityVerificationRecord } from "@/types/facilitySource";
import type { Prison } from "@/types/prison";
import { joinAddressAndPostcode } from "@/lib/address";
import { intentHref } from "@/lib/seo/prisonIntentCopy";
import { isIntentEnabledForPrison } from "@/lib/seo/intentRollout";

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
  tel?: string;
  mailto?: string;
  links?: ContactLink[];
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

export function contactVisitingRows(p: Prison, verification?: FacilityVerificationRecord): ContactRow[] {
  if (!isContactVisitingEligible(p)) return [];
  const rows: ContactRow[] = [];
  const uk = isUkHmppsEstablishment(p);
  const bopInst = isBopInstitution(p);

  const address = displayAddress(p);
  if (address) rows.push({ key: "address", label: "Address", text: address });

  const phone = clean(p.phone);
  if (phone) rows.push({ key: "phone", label: "Phone", text: phone, tel: phone.replace(/[^+\d]/g, "") });

  const email = clean(verification?.overrides?.email);
  if (email && verification?.fieldSources?.email?.length) {
    rows.push({ key: "email", label: "Email", text: email, mailto: email });
  }

  if (uk) {
    const booking: ContactLink[] = [
      { href: OFFICIAL_URLS.ukVisits, label: "Request a social visit on GOV.UK", kind: "official" },
    ];
    if (isIntentEnabledForPrison(p, "booking-a-visit")) {
      booking.push({ href: intentHref(p.countrySlug, p.slug, "booking-a-visit"), label: `${p.name} booking a visit`, kind: "internal" });
    }
    booking.push(...guideLink("how-prison-visits-work", "How prison visits work"));
    rows.push({ key: "booking", label: "Booking a visit", links: booking });
    rows.push({
      key: "send-money",
      label: "Sending money",
      links: [{ href: OFFICIAL_URLS.ukSendMoney, label: "Send money to someone in prison on GOV.UK", kind: "official" }],
    });
    rows.push({
      key: "post",
      label: "Post and letters",
      links: [
        ...guideLink("how-to-find-a-uk-prison-address", "How to address a letter to a UK prison"),
        ...guideLink("can-you-send-pictures-in-prison-letters", "Can you send pictures in prison letters?"),
      ],
    });
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
    rows.push({
      key: "booking",
      label: "Visiting",
      links: [{ href: OFFICIAL_URLS.bopVisiting, label: "How to visit a federal inmate (bop.gov)", kind: "official" }],
    });
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

  const official = officialSourceUrl(p, verification);
  if (official) {
    rows.push({
      key: "official-page",
      label: "Official page",
      links: [{ href: official, label: uk ? "Official prison page (GOV.UK)" : "Official facility page (bop.gov)", kind: "official" }],
    });
  }

  return rows.filter((r) => r.text || (r.links && r.links.length > 0));
}
