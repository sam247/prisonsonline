import type { Prison } from "@/types/prison";
import { slugVariantIndex } from "@/lib/seo/prisonProfileCopy";
import type { PrisonIntentSlug } from "@/lib/seo/intentRollout";

function searchFacingPrisonName(prison: Prison): string {
  if (prison.slug === "florence-admax-usp") return "ADX Florence (Florence ADMAX USP)";
  if (prison.slug === "hmp-manchester") return "HMP Manchester (Strangeways)";
  return prison.name;
}

export function buildIntentPageTitle(prison: Prison, intent: PrisonIntentSlug): string {
  const name = searchFacingPrisonName(prison);
  switch (intent) {
    case "visiting-times":
      return `${name} visiting times and visitor information`;
    case "contact-details":
      return `${name} contact details, phone and address`;
    case "booking-a-visit":
      return `${name} booking a visit and visitor information`;
    case "what-to-expect":
      return `${name} visits: what to expect and visitor rules`;
    case "sending-money":
      return `${name} sending money and prison funds`;
    case "phone-calls":
      return `${name} phone calls and approved numbers`;
    case "email-a-prisoner":
      return `${name} email a prisoner and digital messaging`;
    case "legal-visits":
      return `${name} legal visits and professional access`;
  }
}

export function buildIntentMetaDescription(prison: Prison, intent: PrisonIntentSlug): string {
  const name = searchFacingPrisonName(prison);
  const loc = [prison.city, prison.stateOrRegion].filter(Boolean).join(", ");
  const op = prison.operator?.trim();
  switch (intent) {
    case "visiting-times":
      return `${name} visiting times, visitor guidance, booking context, phone and address${loc ? ` for ${loc}` : ""}. Confirm live schedules with ${op || "the operator"}.`.slice(
        0,
        160,
      );
    case "contact-details":
      return `${name} contact details, phone number, address and enquiry routes${loc ? ` for ${loc}` : ""}. Confirm current details with ${op || "the operator"}.`.slice(
        0,
        160,
      );
    case "booking-a-visit":
      return `${name} booking a visit guidance, visitor rules, phone and address${loc ? ` for ${loc}` : ""}. Confirm live booking steps with ${op || "the operator"}.`.slice(
        0,
        160,
      );
    case "what-to-expect":
      return `${name} visitor guidance covering arrival checks, visit rules, phone and address${loc ? ` for ${loc}` : ""}. Verify current requirements with ${op || "the operator"}.`.slice(
        0,
        160,
      );
    case "sending-money":
      return `${name} sending money guidance, approved payment routes and prison funds information${loc ? ` for ${loc}` : ""}. Confirm live rules with ${op || "the operator"}.`.slice(
        0,
        160,
      );
    case "phone-calls":
      return `${name} phone call guidance, approved numbers and contact context${loc ? ` for ${loc}` : ""}. Confirm current call rules with ${op || "the operator"}.`.slice(
        0,
        160,
      );
    case "email-a-prisoner":
      return `${name} email a prisoner guidance and digital messaging context${loc ? ` for ${loc}` : ""}. Confirm current availability with ${op || "the operator"}.`.slice(
        0,
        160,
      );
    case "legal-visits":
      return `${name} legal visits guidance, booking context and professional access details${loc ? ` for ${loc}` : ""}. Confirm current procedures with ${op || "the operator"}.`.slice(
        0,
        160,
      );
  }
}

/** Prefer two sibling intents to mesh the prison sub-cluster. */
export function siblingIntentsFor(intent: PrisonIntentSlug): PrisonIntentSlug[] {
  const map: Record<PrisonIntentSlug, PrisonIntentSlug[]> = {
    "visiting-times": ["booking-a-visit", "contact-details"],
    "booking-a-visit": ["visiting-times", "what-to-expect"],
    "contact-details": ["visiting-times", "what-to-expect"],
    "what-to-expect": ["booking-a-visit", "visiting-times"],
    "sending-money": ["contact-details", "phone-calls"],
    "phone-calls": ["contact-details", "email-a-prisoner"],
    "email-a-prisoner": ["contact-details", "phone-calls"],
    "legal-visits": ["booking-a-visit", "contact-details"],
  };
  return map[intent];
}

function provenancePhrase(p: Prison): string {
  if (p.dataProvenance === "hmpps_import") {
    return "Fields on this profile summarise the HMPPS-derived listing used in this site build, not independent inspection reports.";
  }
  if (p.dataProvenance === "bop_import") {
    return "Fields here reflect the Federal Bureau of Prisons–derived listing in this build; operational detail can change without notice.";
  }
  return "This page is directory context only; it does not replace notices, contracts, or instructions from the custodial operator.";
}

function disclaimerVariants(p: Prison): string[] {
  const op = p.operator?.trim() || "the official operator";
  return [
    `Always confirm visiting rules, contact channels, and schedules with ${op} before you rely on them. This site is a directory, not an official service.`,
    `Policies and published hours change. Treat ${op} as the source of truth for ${p.name}, and double-check dates and requirements shortly before a visit or call.`,
    `Nothing here constitutes legal advice or a guarantee of access. ${provenancePhrase(p)}`,
  ];
}

function ctaVariants(p: Prison): string[] {
  return [
    `Start from the main profile for ${p.name} to see listing fields, then follow official links from the operator for live procedures.`,
    `Use the region hub to compare nearby establishments, and read the guides linked below for general visiting context that applies across many sites.`,
    `If you are planning travel, build in time for identity checks, booking cut-offs, and any approval steps your jurisdiction requires.`,
  ];
}

export function intentTopicLabel(intent: PrisonIntentSlug): string {
  switch (intent) {
    case "visiting-times":
      return "Visiting times";
    case "contact-details":
      return "Contact details";
    case "booking-a-visit":
      return "Booking a visit";
    case "what-to-expect":
      return "What to expect";
    case "sending-money":
      return "Sending money";
    case "phone-calls":
      return "Phone calls";
    case "email-a-prisoner":
      return "Email a prisoner";
    case "legal-visits":
      return "Legal visits";
  }
}

/** Body copy only (links rendered in the view). Target ~250–450 words total with intro + disclaimer + sections. */
export function buildIntentBodyParagraphs(prison: Prison, intent: PrisonIntentSlug): string[] {
  const idxOpen = slugVariantIndex(prison.slug, 4);
  const idxDisc = slugVariantIndex(prison.slug, disclaimerVariants(prison).length);
  const idxCta = slugVariantIndex(prison.slug, ctaVariants(prison).length);
  const type = prison.type?.trim() || prison.securityLevel;
  const loc = [prison.city, prison.stateOrRegion, prison.country].filter(Boolean).join(", ");
  const openers = [
    `${prison.name} is listed in this directory as a ${type} establishment in ${loc}, operated where shown by ${prison.operator?.trim() || "the relevant authority"}.`,
    `This profile covers ${prison.name} in ${loc}; the listing describes it as ${type} for navigation purposes within this dataset.`,
    `Readers looking up ${prison.name} will see ${type} metadata and ${loc} as recorded in the import behind this build.`,
    `${prison.name} appears here with ${type} labelling and a ${loc} address context drawn from the same structured import as the main prison page.`,
  ];
  const intro = openers[idxOpen];

  const midVisiting = [
    `Published visiting schedules often depend on wing, security level, and staff availability. What appears on third-party sites can lag behind changes made by the prison service or federal agency.`,
    `Weekend and evening sessions may be limited, and some sites rotate sessions by surname or by the person in custody. Expect to book in advance where the jurisdiction requires it.`,
    `Visitor capacity, child policies, and the number of adults allowed per session are set locally. If you need reasonable adjustments, request them through official channels as early as possible.`,
  ];
  const midContact = [
    `General enquiry numbers may not be the same as visit booking lines. Some institutions route mail, legal correspondence, and family enquiries through different desks.`,
    `Post can be delayed by screening. If you are sending items, use only approved categories; prohibited articles cause returns or disposal.`,
    `Email and web forms are increasingly common, but not universal. Where only post is listed, allow processing time and keep copies of anything time-sensitive.`,
  ];
  const midBooking = [
    `Booking usually requires verified identity for visitors and may need the person in custody to nominate you. Some systems use online portals; others use phone queues with limited hours.`,
    `Cancellations can free slots for others, but no-show policies vary. If you cannot attend, cancel through the official route so someone else can use the time.`,
    `International visitors should confirm visa implications and any documentation the establishment expects beyond standard photo ID.`,
  ];
  const midExpect = [
    `Arrival procedures typically include identity checks and searches of permitted belongings. Dress codes and items allowed in the visiting hall are not standardised across all sites.`,
    `Visitor centres sometimes run separately from the main gate; follow signage and staff instructions. Photography and phones are usually restricted.`,
    `Children may need guardians present and extra identification. If a visit cannot proceed, staff should explain the reason and what to do next under local rules.`,
  ];
  const midMoney = [
    `Money transfer options differ between jurisdictions and providers. Some establishments use card-based systems, while others permit approved bank routes or operator portals.`,
    `Payment processing and account posting times can vary. If funds are urgent for essentials, check published cut-off times and any restrictions tied to status or sanctions.`,
    `Never send cash by unapproved routes. Use official methods only, and keep transaction references in case tracing is needed.`,
  ];
  const midCalls = [
    `Telephone access is usually controlled by approved numbers and account balances. People in custody may have restricted call windows based on wing routines and status.`,
    `Calls are commonly monitored and recorded except where legal privilege applies. Remind family members not to discuss sensitive legal matters on standard lines.`,
    `If a number is blocked or changed, the update process may take time. Confirm identity and relationship requirements before requesting amendments.`,
  ];
  const midEmail = [
    `Some systems provide secure email-style messaging, while others rely only on post and phone. Availability can differ even within the same country or agency.`,
    `Message delivery is often screened and may not be immediate. Avoid sending urgent legal or medical requests through channels that do not guarantee rapid handling.`,
    `Attachment rules are strict. Use plain text where possible and confirm what formats are accepted before you send anything important.`,
  ];
  const midLegal = [
    `Legal visits and professional appointments usually follow separate booking routes from social visits, with additional checks for representation and confidentiality.`,
    `Bring professional identification and case references when required. Many establishments require advance notice and may limit last-minute access windows.`,
    `For time-critical hearings, confirm escalation routes with the operator and maintain a written record of requests and responses.`,
  ];

  let mid: string[];
  switch (intent) {
    case "visiting-times":
      mid = midVisiting;
      break;
    case "contact-details":
      mid = midContact;
      break;
    case "booking-a-visit":
      mid = midBooking;
      break;
    case "what-to-expect":
      mid = midExpect;
      break;
    case "sending-money":
      mid = midMoney;
      break;
    case "phone-calls":
      mid = midCalls;
      break;
    case "email-a-prisoner":
      mid = midEmail;
      break;
    case "legal-visits":
      mid = midLegal;
      break;
  }

  const guideBridge = [
    `For wider context, read how prison visits usually work in the UK framing used on this site, and the rights overview for people in custody and their families.`,
    `Guides here explain typical steps and vocabulary; they do not replace establishment-specific instructions or statutory guidance from the responsible ministry or agency.`,
    `Use guides to prepare questions and documents, then confirm every material fact with the operator responsible for ${prison.name}.`,
  ];
  const bridge = guideBridge[slugVariantIndex(prison.slug, guideBridge.length)];

  const internal = [
    `Related pages for this establishment include the full profile for ${prison.name}, the “${intentTopicLabel(siblingIntentsFor(intent)[0])}” and “${intentTopicLabel(siblingIntentsFor(intent)[1])}” intent pages for the same site, and the region hub listing other prisons in ${prison.stateOrRegion}.`,
    `You can move between the main ${prison.name} profile, sibling topics on this site, and prisons in ${prison.stateOrRegion} without losing the directory context.`,
  ];
  const internalPara = internal[slugVariantIndex(prison.slug, internal.length)];

  const disclaimer = disclaimerVariants(prison)[idxDisc];
  const cta = ctaVariants(prison)[idxCta];

  return [intro, ...mid, bridge, internalPara, disclaimer, cta, provenancePhrase(prison)];
}

export function guideSlugsForIntent(intent: PrisonIntentSlug): string[] {
  if (intent === "sending-money") return ["rights-of-prisoners", "how-prison-sentences-work"];
  if (intent === "phone-calls") return ["how-prison-visits-work", "rights-of-prisoners"];
  if (intent === "email-a-prisoner") return ["how-prison-visits-work", "life-inside-prison"];
  if (intent === "legal-visits") return ["rights-of-prisoners", "how-prison-sentences-work"];
  if (intent === "contact-details") return ["rights-of-prisoners", "life-inside-prison"];
  if (intent === "what-to-expect") return ["how-prison-visits-work", "rights-of-prisoners"];
  return ["how-prison-visits-work", "rights-of-prisoners"];
}

export function intentHref(countrySlug: string, slug: string, intent: PrisonIntentSlug): string {
  return `/prisons/${countrySlug}/${slug}/${intent}`;
}
