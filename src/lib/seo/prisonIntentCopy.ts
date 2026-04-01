import type { Prison } from "@/types/prison";
import { slugVariantIndex } from "@/lib/seo/prisonProfileCopy";
import type { PrisonIntentSlug } from "@/lib/seo/intentRollout";

export function buildIntentPageTitle(prison: Prison, intent: PrisonIntentSlug): string {
  switch (intent) {
    case "visiting-times":
      return `Visiting times and schedules — ${prison.name}`;
    case "contact-details":
      return `Contact details and enquiries — ${prison.name}`;
    case "booking-a-visit":
      return `How to book a visit — ${prison.name}`;
    case "what-to-expect":
      return `What to expect when visiting — ${prison.name}`;
  }
}

export function buildIntentMetaDescription(prison: Prison, intent: PrisonIntentSlug): string {
  const loc = [prison.city, prison.stateOrRegion, prison.country].filter(Boolean).join(", ");
  const op = prison.operator?.trim();
  const prov =
    prison.dataProvenance === "hmpps_import"
      ? "HMPPS listing data"
      : prison.dataProvenance === "bop_import"
        ? "BOP facility listing"
        : "directory import";
  const base = `${prison.name} (${loc}). Neutral directory context from ${prov}; confirm procedures with ${op || "the operating authority"}.`;
  switch (intent) {
    case "visiting-times":
      return `${base} Visiting hours and rotas change — use official channels for current times.`.slice(0, 160);
    case "contact-details":
      return `${base} Official phone, post, and enquiry routes are set by the operator.`.slice(0, 160);
    case "booking-a-visit":
      return `${base} Booking rules, approvals, and visitor lists differ by jurisdiction and site.`.slice(0, 160);
    case "what-to-expect":
      return `${base} Visitor expectations (ID, searches, conduct) vary; verify before you travel.`.slice(0, 160);
  }
}

/** Prefer two sibling intents to mesh the prison sub-cluster. */
export function siblingIntentsFor(intent: PrisonIntentSlug): PrisonIntentSlug[] {
  const map: Record<PrisonIntentSlug, PrisonIntentSlug[]> = {
    "visiting-times": ["booking-a-visit", "contact-details"],
    "booking-a-visit": ["visiting-times", "what-to-expect"],
    "contact-details": ["visiting-times", "what-to-expect"],
    "what-to-expect": ["booking-a-visit", "visiting-times"],
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
  if (intent === "contact-details") return ["rights-of-prisoners", "life-inside-prison"];
  if (intent === "what-to-expect") return ["how-prison-visits-work", "rights-of-prisoners"];
  return ["how-prison-visits-work", "rights-of-prisoners"];
}

export function intentHref(countrySlug: string, slug: string, intent: PrisonIntentSlug): string {
  return `/prisons/${countrySlug}/${slug}/${intent}`;
}
