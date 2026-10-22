import type { Prison } from "@/types/prison";
import { getFacilityVerification } from "@/data/facilitySources";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";
import { contactVisitingRows } from "@/lib/seo/prisonContactVisiting";
import {
  hasUkHmppsTypeFields,
  ukCategoryLabel,
  ukEstablishmentNoun,
  ukPrisonTypeLabel,
  withIndefiniteArticle,
} from "@/lib/seo/ukPrisonTypeLabel";

/**
 * Profile <meta name="description"> only.
 * JSON-LD keeps formatPrisonMetaDescription.
 * The snippet may say that address, visiting or contact details are on the
 * profile when that page renders them. It never prints a street, postcode or phone.
 */

const PLACEHOLDER_VISITING = [/^the import lists\b/i, /\bimport(?:ed)? (?:lists|dataset|listing)\b/i];

const FILLERS = [
  "From the published record.",
  "Taken from the published record.",
  "Published record for this establishment.",
  "As published for this establishment.",
];

export type PrisonProfileOnPageFacts = {
  address: boolean;
  visiting: boolean;
  contact: boolean;
};

function clean(value: string | undefined | null): string {
  if (!value) return "";
  const text = value.replace(/\s+/g, " ").trim();
  return /^none$/i.test(text) || /^not specified$/i.test(text) ? "" : text;
}

function sentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function sentenceCase(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function joinAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Same display names as the profile heading. */
function profileName(p: Prison): string {
  const base =
    p.slug === "florence-admax-usp"
      ? "ADX Florence"
      : p.slug === "hmp-manchester"
        ? "HMP Manchester (Strangeways)"
        : p.name.trim();
  if (p.status === "closed") return `Closed: ${base}`;
  if (p.status === "historic") return `Historic: ${base}`;
  return base;
}

/** All-caps administrative regions become title case. Mixed-case names stay as recorded. */
function readableGeographicRegion(p: Prison): string {
  const raw = geographicRegion(p).replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const letters = raw.replace(/[^A-Za-z]/g, "");
  if (!letters || letters !== letters.toUpperCase()) return raw;
  return raw
    .replace(/\s*,\s*/g, ", ")
    .replace(/[A-Za-z]+/g, (word) => word.charAt(0) + word.slice(1).toLowerCase());
}

function securityAdjective(p: Prison): string {
  const level = clean(p.securityLevel);
  if (!level || /^multi$/i.test(level) || /^category [abcd]$/i.test(level)) return "";
  const mapped: Record<string, string> = {
    supermax: "supermax",
    maximum: "maximum-security",
    high: "high-security",
    medium: "medium-security",
    minimum: "minimum-security",
    low: "low-security",
  };
  return mapped[level.toLowerCase()] ?? "";
}

function articleFor(phrase: string): string {
  const first = phrase.split(/[\s(]/)[0] ?? "";
  const acronym = first.length > 1 && first === first.toUpperCase() && /^[A-Z]+$/.test(first);
  if (acronym && /^U/.test(first)) return `a ${phrase}`;
  if (acronym && /^[AEFHILMNRSX]/.test(first)) return `an ${phrase}`;
  return withIndefiniteArticle(phrase);
}

function mentionsPlace(text: string, place: string): boolean {
  if (!place) return false;
  const escaped = place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:in|,) ${escaped}(?:\\b|,|\\.)`, "i").test(text);
}

function facilityNoun(label: string): string {
  if (!label) return "";
  if (/\b(prison|jail|centre|center|institution|penitentiary|facility|camp|complex|gaol|museum|establishment)\b/i.test(label)) {
    return label;
  }
  return `${label} prison`;
}

function typeLabels(p: Prison): { full: string; short: string; securityOnly: string } {
  if (hasUkHmppsTypeFields(p)) {
    const full = facilityNoun(ukPrisonTypeLabel(p));
    const noun = facilityNoun(ukEstablishmentNoun(p));
    const category = ukCategoryLabel(p);
    const securityOnly = category ? facilityNoun(`${category} prison`) : "";
    return { full, short: noun === full ? securityOnly : noun, securityOnly };
  }
  const adjective = securityAdjective(p);
  let base = "";
  if (p.countrySlug === "us" || p.dataProvenance === "bop_import") {
    const listed = clean(p.predominantFunction);
    base = listed && !/^other\b/i.test(listed) ? listed : "federal prison";
  } else {
    base = clean(p.type) || "prison";
  }
  const facilityBase = /\b(prison|jail|centre|center|institution|penitentiary|facility|camp|complex|gaol|museum|establishment|fci|usp|fpc|fdc)\b/i.test(base);
  const short = facilityBase ? facilityNoun(base) : "prison";
  const full = facilityNoun(adjective ? `${adjective} ${facilityBase ? base : "prison"}` : facilityBase ? base : "prison");
  const securityOnly = adjective ? facilityNoun(`${adjective} prison`) : "";
  return { full, short, securityOnly };
}

function placeLine(parts: string[]): string {
  const out: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (out.some((existing) => existing.toLowerCase() === part.toLowerCase())) continue;
    out.push(part);
  }
  return out.join(", ");
}

function leaksRawRegion(p: Prison, text: string): boolean {
  const raw = geographicRegion(p).replace(/\s+/g, " ").trim();
  if (!raw) return false;
  const letters = raw.replace(/[^A-Za-z]/g, "");
  if (!letters || letters !== letters.toUpperCase()) return false;
  return text.includes(raw);
}

function leaksContactValue(p: Prison, text: string): boolean {
  const postcode = clean(p.postcode);
  const phone = clean(p.phone);
  if (postcode && text.includes(postcode)) return true;
  if (phone && text.includes(phone)) return true;
  const street = clean(p.address);
  if (street && street.length >= 8 && text.includes(street)) return true;
  return false;
}

function hasSpecificVisitingCopy(p: Prison): boolean {
  const raw = (p.visitingInfo ?? "").trim();
  if (!raw) return false;
  return !PLACEHOLDER_VISITING.some((pattern) => pattern.test(raw));
}

/**
 * What the rendered profile actually shows. Official-source pages list a street
 * address when the record has one, and do not render visiting rules or a contact channel.
 * UK and US profiles show the address and phone in the facility-details copy, and visiting
 * content only when the contact block or a non-placeholder visiting note is on the page.
 */
export function prisonProfileOnPageFacts(p: Prison): PrisonProfileOnPageFacts {
  if (p.dataProvenance === "official_source") {
    return { address: Boolean(clean(p.address)), visiting: false, contact: false };
  }
  const keys = new Set(contactVisitingRows(p, getFacilityVerification(p.countrySlug, p.slug)).map((row) => row.key));
  return {
    address: Boolean(clean(p.address)) || Boolean(clean(p.postcode)) || keys.has("address") || keys.has("mailing-address"),
    visiting:
      keys.has("booking") ||
      keys.has("visiting-hours") ||
      keys.has("visiting-rules") ||
      keys.has("visit-booking-phone") ||
      keys.has("visit-booking-email") ||
      hasSpecificVisitingCopy(p),
    contact: Boolean(clean(p.phone)) || keys.has("phone") || keys.has("email"),
  };
}

function matchesFacts(text: string, facts: PrisonProfileOnPageFacts): boolean {
  return (
    /\baddress\b/i.test(text) === facts.address &&
    /\bvisiting\b/i.test(text) === facts.visiting &&
    /\bcontact\b/i.test(text) === facts.contact
  );
}

function infoClauses(facts: PrisonProfileOnPageFacts): string[] {
  const specific: string[] = [];
  if (facts.address) specific.push("address");
  if (facts.visiting) specific.push("visiting information");
  if (facts.contact) specific.push("contact details");
  if (!specific.length) return [""];

  const briefParts: string[] = [];
  if (facts.address) briefParts.push("address");
  if (facts.visiting) briefParts.push("visiting");
  if (facts.contact) briefParts.push("contact");
  const spec = joinAnd(specific);
  const brief = joinAnd(briefParts);
  const plural = specific.length > 1 || specific[0] === "contact details";
  const verb = plural ? "are" : "is";
  return [
    `${sentenceCase(brief)}.`,
    `${sentenceCase(brief)} info.`,
    `${sentenceCase(brief)} details.`,
    `${sentenceCase(brief)} details are listed.`,
    `${sentenceCase(brief)} details are on this page.`,
    `See the ${spec}.`,
    `See the ${spec} here.`,
    `See the ${spec} on this page.`,
    `${sentenceCase(spec)} ${verb} on this page.`,
    `This page lists the ${spec}.`,
    `Open this page for the ${spec}.`,
  ];
}

function alreadySaid(base: string, pad: string): boolean {
  const token = pad.replace(/\.$/, "").toLowerCase();
  return base.toLowerCase().includes(token);
}

function padToBand(text: string): string {
  let best = sentence(text);
  if (best.length > 160) return best;
  for (let pass = 0; pass < 2 && best.length < 150; pass++) {
    let nextBest = best;
    for (const pad of FILLERS) {
      if (alreadySaid(best, pad)) continue;
      const next = sentence(`${best} ${pad}`);
      if (next.length > 160) continue;
      const nextInBand = next.length >= 150;
      const bestInBand = nextBest.length >= 150;
      if (nextBest === best || (nextInBand && !bestInBand) || (nextInBand === bestInBand && next.length > nextBest.length)) {
        nextBest = next;
      }
    }
    if (nextBest === best) break;
    best = nextBest;
  }
  return best;
}

function choose(candidates: string[], score: (value: string) => number[]): string {
  return [...candidates].sort((a, b) => {
    const left = score(a);
    const right = score(b);
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) return right[i] - left[i];
    }
    return 0;
  })[0];
}

export function formatPrisonProfileMetaDescription(p: Prison): string {
  const name = profileName(p);
  const types = typeLabels(p);
  const typeOptions = [types.full, types.short, types.securityOnly, "prison"].filter(
    (type, index, all): type is string => Boolean(type) && all.indexOf(type) === index,
  );
  const city = clean(p.city);
  const region = readableGeographicRegion(p);
  const country = p.dataProvenance === "official_source" ? clean(p.country) : "";
  const operator = clean(p.operator);
  const facts = prisonProfileOnPageFacts(p);
  const places = [
    placeLine([city, region, country]),
    placeLine([city, region]),
    placeLine([city, country]),
    placeLine([city]),
    placeLine([region, country]),
    placeLine([region]),
    placeLine([country]),
    "",
  ].filter((place, index, all) => all.indexOf(place) === index);
  const operators = operator ? ["", `Operated by ${operator}.`] : [""];
  const clauses = infoClauses(facts);

  const cores: string[] = [];
  for (const type of typeOptions) {
    for (const place of places) {
      const lead = place ? `${name} is ${articleFor(type)} in ${place}.` : `${name} is ${articleFor(type)}.`;
      for (const operatorSentence of operators) {
        for (const clause of clauses) {
          cores.push(sentence([lead, operatorSentence, clause].filter(Boolean).join(" ")));
        }
      }
    }
  }

  const category = ukCategoryLabel(p);
  const adjective = securityAdjective(p);
  const keepsSecurity = (value: string) =>
    (!category && !adjective) || Boolean((category && value.includes(category)) || (adjective && value.includes(adjective)));
  const usable = cores
    .filter((value) => value.length <= 160 && matchesFacts(value, facts) && keepsSecurity(value) && !leaksRawRegion(p, value) && !leaksContactValue(p, value))
    .map((value) => padToBand(value))
    .filter((value) => value.length <= 160 && matchesFacts(value, facts) && keepsSecurity(value) && !leaksRawRegion(p, value) && !leaksContactValue(p, value));

  if (!usable.length) {
    throw new Error(`No profile meta description for ${p.countrySlug}/${p.slug}`);
  }

  return choose(usable, (value) => {
    const inBand = value.length >= 150 && value.length <= 160 ? 1 : 0;
    const onPage = /on this page/i.test(value) ? 1 : 0;
    const hasCity = mentionsPlace(value, city) ? 1 : 0;
    const hasSecurity =
      !category && !adjective ? 1 : (category && value.includes(category)) || (adjective && value.includes(adjective)) ? 1 : 0;
    const hasFullType = types.full && value.includes(types.full) ? 1 : 0;
    const hasOperator = operator && value.includes(operator) ? 1 : 0;
    const hasRegion = mentionsPlace(value, region) ? 1 : 0;
    const hasCountry = mentionsPlace(value, country) ? 1 : 0;
    return [inBand, onPage, hasCity, hasSecurity, hasFullType, hasOperator, hasRegion, hasCountry, value.length];
  });
}
