import type { Prison } from "@/types/prison";

/** Stable variant index from slug (deterministic across SSR/build). */
export function slugVariantIndex(slug: string, modulo: number): number {
  if (modulo <= 0) return 0;
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

function cleanSpace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function isNoneLike(v: string | undefined | null): boolean {
  if (v == null) return true;
  const t = v.trim();
  return t.length === 0 || /^none$/i.test(t);
}

function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+/).map((s) => cleanSpace(s)).filter(Boolean);
  return parts.length > 0 ? parts : text.split(/\n+/).map((s) => cleanSpace(s)).filter(Boolean);
}

const VISITING_GENERIC_REGEX =
  /^(always follow the latest official|for visits and bookings, contact|visiting rules change|confirm all operational detail)/i;

function isGenericVisitingSentence(s: string): boolean {
  const t = cleanSpace(s);
  if (t.length < 12) return false;
  return (
    VISITING_GENERIC_REGEX.test(t) ||
    /rules vary|vary by (state|facility|jurisdiction)/i.test(t) ||
    /^contact the establishment\b/i.test(t) ||
    /^always follow\b/i.test(t)
  );
}

const VISIT_APPEND_VARIANTS = [
  "Visit arrangements vary by facility, so always confirm directly before booking.",
  "Policies differ between sites—check the official visitor information before you travel.",
  "Booking steps and ID rules are not universal; verify the latest instructions with the establishment.",
];

const VISIT_FALLBACKS = [
  "This directory listing does not include visit booking details for this site. Use the official prison finder or establishment contact route for your jurisdiction to confirm eligibility, times, and ID requirements.",
  "Visiting hours and booking methods are not shown in our import for this profile. Refer to the operator’s published visitor guidance and confirm requirements before arranging a visit.",
  "We do not list visit slots or visitor rules here. Contact the establishment through official channels for your country or region to arrange a visit safely and legally.",
];

const CONTACT_FALLBACKS = [
  "Postal address and telephone lines for this profile were not included in the dataset used for this build. Use the official establishment or government prison finder for up-to-date contact details.",
  "Our current import does not provide a reliable mailing address or switchboard number for this listing. Check the authority that operates the site for the correct contact points.",
  "Contact channels are unavailable in this record. Look up the facility through official prison directories rather than relying on third-party summaries alone.",
];

const LOCATION_OPENINGS = [
  "{name} is based in {city}, in the {region} area of {country}.",
  "You will find {name} in {city}, within {region}, {country}.",
  "{name} sits in {city}, {region}, {country}.",
];

export function buildHowToVisitHeading(name: string): string {
  return `How to visit ${name}`;
}

export function buildHowToVisitBody(p: Prison): string {
  const raw = p.visitingInfo?.trim();
  const appendIdx = slugVariantIndex(p.slug, VISIT_APPEND_VARIANTS.length);
  const append = VISIT_APPEND_VARIANTS[appendIdx];

  if (!raw) {
    const fb = VISIT_FALLBACKS[slugVariantIndex(p.slug, VISIT_FALLBACKS.length)];
    return `${fb} ${append}`;
  }

  const sentences = splitSentences(raw);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const s of sentences) {
    if (isGenericVisitingSentence(s)) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(s);
    if (unique.length >= 2) break;
  }

  const core =
    unique.length > 0
      ? unique.join(" ")
      : (() => {
          const first = sentences[0] ? cleanSpace(sentences[0]) : cleanSpace(raw);
          return first.length > 220 ? `${first.slice(0, 217).replace(/\s+\S*$/, "")}…` : first;
        })();

  const limited =
    core.length > 220 ? `${core.slice(0, 217).replace(/\s+\S*$/, "")}…` : core;

  return `${limited} ${append}`;
}

export function buildContactHeading(name: string): string {
  return `Contact details for ${name}`;
}

export function buildContactBody(p: Prison): string {
  const addr = !isNoneLike(p.address) ? cleanSpace(p.address!) : "";
  const post = !isNoneLike(p.postcode) ? cleanSpace(p.postcode!) : "";
  const phone = !isNoneLike(p.phone) ? cleanSpace(p.phone!) : "";

  if (!addr && !post && !phone) {
    return CONTACT_FALLBACKS[slugVariantIndex(p.slug, CONTACT_FALLBACKS.length)];
  }

  const addressLine = [addr, post].filter(Boolean).join(", ");
  const v = slugVariantIndex(p.slug, 3);

  if (v === 0 && addressLine && phone) {
    return `Located at ${addressLine}, ${p.name} can be contacted on ${phone}.`;
  }
  if (v === 1 && phone && addressLine) {
    return `For enquiries, contact ${p.name} on ${phone}. The prison is based at ${addressLine}.`;
  }
  if (v === 2 && addressLine && phone) {
    return `${p.name} lists ${phone} as a contact number, with the site at ${addressLine}.`;
  }
  if (addressLine && phone) {
    return `Located at ${addressLine}, ${p.name} can be contacted on ${phone}.`;
  }
  if (addressLine) {
    return `The establishment’s listed address is ${addressLine}.`;
  }
  return `For telephone enquiries, ${p.name} can be reached on ${phone}.`;
}

export function buildLocationHeading(name: string): string {
  return `Where is ${name} located?`;
}

export function buildLocationBody(p: Prison): string {
  const city = cleanSpace(p.city) || "this location";
  const region = cleanSpace(p.stateOrRegion) || "the listed region";
  const country = cleanSpace(p.country) || "the listed country";
  const tpl = LOCATION_OPENINGS[slugVariantIndex(p.slug, LOCATION_OPENINGS.length)];
  let body = tpl.replace("{name}", p.name).replace("{city}", city).replace("{region}", region).replace("{country}", country);
  const hasCoords = p.latitude !== 0 || p.longitude !== 0;
  if (hasCoords) {
    body += ` Coordinates: ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}.`;
  }
  return body;
}

export function buildPrisonTypeHeading(name: string): string {
  return `What type of prison is ${name}?`;
}

export function buildPrisonTypeBody(p: Prison): string {
  const sec = !isNoneLike(p.securityLevel) ? cleanSpace(p.securityLevel) : "";
  const typ = !isNoneLike(p.type) ? cleanSpace(p.type) : "";
  const gen = !isNoneLike(p.gender) && p.gender ? cleanSpace(p.gender) : "";
  const fn = !isNoneLike(p.predominantFunction) && p.predominantFunction ? cleanSpace(p.predominantFunction) : "";

  if (!sec && !typ && !gen && !fn) {
    return "";
  }

  const idx = slugVariantIndex(p.slug, 4);
  const parts: string[] = [];

  if (idx === 0) {
    if (sec && typ && gen) parts.push(`This is a ${sec} ${typ} facility for ${gen} prisoners.`);
    else if (sec && typ) parts.push(`This is a ${sec} ${typ} establishment.`);
    else if (typ && gen) parts.push(`This site is listed as a ${typ} facility for ${gen} prisoners.`);
    else if (sec && gen) parts.push(`The listing shows a ${sec} facility for ${gen} prisoners.`);
    else if (sec) parts.push(`The establishment is recorded at ${sec} security level.`);
    else if (typ) parts.push(`The directory classifies this site as ${typ}.`);
    else if (gen) parts.push(`The population provision is listed as ${gen}.`);
  } else if (idx === 1) {
    if (typ && sec) parts.push(`Official listing data describes ${p.name} as ${typ} under ${sec} security.`);
    else if (typ) parts.push(`The facility type is recorded as ${typ}.`);
    if (gen) parts.push(`Gender provision in the listing is ${gen}.`);
    if (fn) parts.push(`The predominant function is noted as ${fn}.`);
  } else if (idx === 2) {
    if (fn && sec) parts.push(`Predominant function is ${fn}, with ${sec} security in the import.`);
    else if (fn) parts.push(`The import records predominant function as ${fn}.`);
    if (typ && !parts.length) parts.push(`Type in the listing: ${typ}.`);
    if (gen) parts.push(`Gender listing: ${gen}.`);
  } else {
    if (sec && typ) parts.push(`${p.name} appears in the dataset as a ${sec} ${typ} site.`);
    else if (sec) parts.push(`Security level in the listing: ${sec}.`);
    if (gen) parts.push(`It is listed as holding ${gen}.`);
    if (fn && !parts.some((s) => s.includes(fn))) parts.push(`Function: ${fn}.`);
  }

  let out = parts.map(cleanSpace).filter(Boolean).join(" ");
  if (!out) {
    const bits: string[] = [];
    if (sec) bits.push(`security ${sec}`);
    if (typ) bits.push(`type ${typ}`);
    if (gen) bits.push(`population ${gen}`);
    if (fn) bits.push(`function ${fn}`);
    out = `Listing fields for this site include ${bits.join(", ")}.`;
  }
  return out;
}
