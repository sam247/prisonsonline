import type { Prison } from "@/types/prison";
import { formatIntlSecurity } from "@/lib/intl/profileCopy";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";
import {
  hasUkHmppsTypeFields,
  ukCohortSentence,
  ukPrisonTypeLabel,
  withIndefiniteArticle,
} from "@/lib/seo/ukPrisonTypeLabel";

/**
 * Profile <meta name="description"> and the profile JSON-LD description.
 * Facts only: name, type, town, county taken from the verified address, operator.
 * HMPPS group and area names are not treated as counties.
 * Address, phone, postcode and visit wording stay on the contact-details page.
 */

const PROFILE_INTENT =
  /\b(address|addresses|phone|phones|telephone|telephones|postcode|postcodes|postal|contact|contacts|visit|visits|visiting|visitor|visitors)\b/i;

const FILLER =
  /Profile of this establishment|Directory profile|Official contact routes|And how to visit|How to visit|For a visit|To visit|As recorded|Visiting and contact details/i;

const UK_POSTCODE = /,?\s*[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\s*$/i;

function clean(value: string | undefined | null): string {
  if (!value) return "";
  const text = value.replace(/\s+/g, " ").trim();
  return /^none$/i.test(text) || /^not specified$/i.test(text) ? "" : text;
}

function samePlace(a: string, b: string): boolean {
  return a.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ") === b.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ");
}

function titleCaseIfShouted(value: string): string {
  const letters = value.replace(/[^A-Za-z]/g, "");
  if (!letters || letters !== letters.toUpperCase()) return value;
  return value.replace(/[A-Za-z]+/g, (word) => word.charAt(0) + word.slice(1).toLowerCase());
}

/** County (or the address's own county word) after the town. Empty when the address does not name one. */
export function countyFromVerifiedAddress(p: Prison): string {
  if (p.countrySlug !== "uk") return "";
  const city = clean(p.city);
  const withoutPostcode = clean(p.address).replace(/\s+,/g, ",").replace(/,\s*/g, ", ").replace(UK_POSTCODE, "").replace(/,\s*$/, "");
  const parts = withoutPostcode.split(",").map((part) => part.trim()).filter(Boolean);
  if (!city || parts.length < 2) return "";
  const idx = parts.findIndex((part) => samePlace(part, city));
  if (idx < 0 || idx >= parts.length - 1) return "";
  const county = titleCaseIfShouted(parts[parts.length - 1]);
  return samePlace(county, city) ? "" : county;
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

function facilityNoun(label: string): string {
  if (!label) return "";
  if (/\b(prison|jail|centre|center|institution|penitentiary|facility|camp|complex|gaol|museum|establishment)\b/i.test(label)) {
    return label;
  }
  return `${label} prison`;
}

function typeLabels(p: Prison): string[] {
  if (hasUkHmppsTypeFields(p)) return [facilityNoun(ukPrisonTypeLabel(p))];
  const adjective = securityAdjective(p);
  let base = "";
  if (p.countrySlug === "us" || p.dataProvenance === "bop_import") {
    const listed = clean(p.predominantFunction);
    base = listed && !/^other\b/i.test(listed) ? listed : "federal prison";
  } else {
    base = clean(p.type) || "prison";
  }
  const short = facilityNoun(base);
  const full = facilityNoun(adjective ? `${adjective} ${base}` : base);
  const securityOnly = adjective ? facilityNoun(`${adjective} prison`) : "";
  return [full, securityOnly, short].filter((label, index, all) => label && all.indexOf(label) === index);
}

function placeLine(parts: string[]): string {
  const out: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (out.some((existing) => samePlace(existing, part))) continue;
    out.push(part);
  }
  return out.join(", ");
}

/** Town, plus the county from the verified address for UK rows. State and country otherwise. */
export function profilePlace(p: Prison): string {
  const city = clean(p.city);
  if (p.countrySlug === "uk") return placeLine([city, countyFromVerifiedAddress(p)]);
  const region = geographicRegion(p).replace(/\s+/g, " ").trim();
  const country = p.dataProvenance === "official_source" ? clean(p.country) : "";
  return placeLine([city, region, country]);
}

function mentionsPhrase(text: string, phrase: string): boolean {
  if (!phrase) return false;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^A-Za-z])${escaped}(?:[^A-Za-z]|$)`, "i").test(text);
}

/** True when copy uses an HMPPS group or area name as if it were the county. */
export function textUsesHmppsAreaName(p: Prison, text: string): boolean {
  if (p.countrySlug !== "uk") return false;
  const region = geographicRegion(p).replace(/\s+/g, " ").trim();
  if (!region) return false;
  const letters = region.replace(/[^A-Za-z]/g, "");
  const readable =
    letters && letters === letters.toUpperCase()
      ? region.replace(/\s*,\s*/g, ", ").replace(/[A-Za-z]+/g, (word) => word.charAt(0) + word.slice(1).toLowerCase())
      : region;
  const allowed = [clean(p.city), countyFromVerifiedAddress(p)].filter(Boolean);
  if (allowed.some((place) => samePlace(place, readable) || place.toLowerCase().includes(readable.toLowerCase()))) return false;
  return mentionsPhrase(text, readable) || mentionsPhrase(text, region);
}

function uniqueFacts(facts: string[]): string[] {
  return facts.filter((fact, index) => fact && facts.indexOf(fact) === index);
}

function cohortFacts(p: Prison): string[] {
  if (!hasUkHmppsTypeFields(p)) return [];
  const base = ukCohortSentence(p).trim();
  if (!base || PROFILE_INTENT.test(base)) return [];
  const expanded = base.replace(/^It also has/, "The recorded cohort also has").replace(/^It has/, "The recorded cohort has");
  return uniqueFacts([base, expanded]);
}

function operatorFacts(operator: string): string[] {
  if (!operator) return [];
  return [
    `Operator: ${operator}.`,
    `Operated by ${operator}.`,
    `The operator is ${operator}.`,
    `Operator recorded: ${operator}.`,
    `The recorded operator is ${operator}.`,
    `The operator on record is ${operator}.`,
  ];
}

function countyFacts(county: string): string[] {
  if (!county || PROFILE_INTENT.test(county)) return [];
  return [`County: ${county}.`, `The county is ${county}.`, `Recorded county: ${county}.`, `The recorded county is ${county}.`];
}

function securityFacts(p: Prison): string[] {
  const described = clean(p.securityDescription);
  const level = clean(p.securityLevel);
  const usable = described
    ? (formatIntlSecurity(described) ?? "")
    : level && !/^(not specified|multi)$/i.test(level)
      ? level
      : "";
  if (!usable || PROFILE_INTENT.test(usable)) return [];
  return [
    `Security: ${usable}.`,
    `Recorded security: ${usable}.`,
    `Security level: ${usable}.`,
    `The security level is ${usable}.`,
    `Recorded security level: ${usable}.`,
    `The recorded security level is ${usable}.`,
  ];
}

function capacityFacts(capacity: number): string[] {
  if (!(capacity > 0)) return [];
  return [
    `Capacity ${capacity}.`,
    `Listed capacity ${capacity}.`,
    `Recorded capacity: ${capacity}.`,
    `The listed capacity is ${capacity}.`,
    `The recorded capacity is ${capacity}.`,
  ];
}

function yearFacts(year: number): string[] {
  if (!(year > 0)) return [];
  return [`Opened in ${year}.`, `It opened in ${year}.`, `Opening year: ${year}.`, `The recorded opening year is ${year}.`];
}

function countryFacts(country: string): string[] {
  if (!country || PROFILE_INTENT.test(country)) return [];
  const inCountry =
    country === "United Kingdom" ? "the United Kingdom" : country === "United States (Federal)" ? "the United States" : country;
  return [`In ${inCountry}.`, `Country: ${country}.`, `The recorded country is ${country}.`];
}

function operatorTypeFacts(p: Prison): string[] {
  if (p.operatorType === "public") return ["Publicly operated.", "It is publicly operated.", "The operator type is public."];
  if (p.operatorType === "private") return ["Privately operated.", "It is privately operated.", "The operator type is private."];
  return [];
}

function blurbFacts(p: Prison): string[] {
  const postcode = clean(p.postcode);
  const phone = clean(p.phone);
  const out: string[] = [];
  for (const raw of [p.facilityDescription, p.shortDescription, p.overview]) {
    const text = clean(raw);
    if (!text) continue;
    const one = text.split(/(?<=[.!?])\s+/)[0] ?? "";
    if (!one || one.length > 110) continue;
    if (PROFILE_INTENT.test(one) || FILLER.test(one)) continue;
    if (/imported dataset|this site build|directory label|not part of the imported/i.test(one)) continue;
    if (postcode && one.includes(postcode)) continue;
    if (phone && one.includes(phone)) continue;
    out.push(one.endsWith(".") || one.endsWith("!") || one.endsWith("?") ? one : `${one}.`);
  }
  return uniqueFacts(out);
}

function choose(candidates: string[], score: (value: string) => number[]): string {
  return [...candidates].sort((a, b) => {
    const left = score(a);
    const right = score(b);
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) return right[i] - left[i];
    }
    return a.length - b.length;
  })[0];
}

function inBand(value: string, p: Prison): boolean {
  if (value.length < 150 || value.length > 160) return false;
  if (PROFILE_INTENT.test(value) || FILLER.test(value) || textUsesHmppsAreaName(p, value)) return false;
  const postcode = clean(p.postcode);
  const phone = clean(p.phone);
  if (postcode && value.includes(postcode)) return false;
  if (phone && value.includes(phone)) return false;
  return true;
}

const profileDescriptionCache = new Map<string, string>();

export function formatPrisonProfileMetaDescription(p: Prison): string {
  const cacheKey = `${p.countrySlug}/${p.slug}`;
  const cached = profileDescriptionCache.get(cacheKey);
  if (cached) return cached;
  const value = composeProfileMetaDescription(p);
  profileDescriptionCache.set(cacheKey, value);
  return value;
}

function composeProfileMetaDescription(p: Prison): string {
  const name = profileName(p);
  const city = clean(p.city);
  const county = countyFromVerifiedAddress(p);
  const country = p.dataProvenance === "official_source" ? clean(p.country) : "";
  const region = p.countrySlug === "uk" ? "" : geographicRegion(p).replace(/\s+/g, " ").trim();
  const fullPlace = p.countrySlug === "uk" ? placeLine([city, county]) : placeLine([city, region, country]);
  const places = [fullPlace, placeLine([city, country]), placeLine([city, region]), placeLine([city]), placeLine([country])].filter(
    (place, index, all) => place && all.indexOf(place) === index,
  );
  const leads = typeLabels(p).flatMap((type) => {
    const typed = places.map((place) => `${name} is ${articleFor(type)} in ${place}.`);
    typed.push(`${name} is ${articleFor(type)}.`);
    return typed;
  });
  const groups = [
    operatorFacts(clean(p.operator)),
    cohortFacts(p),
    countyFacts(county),
    securityFacts(p),
    capacityFacts(p.capacity),
    yearFacts(p.openedYear),
    countryFacts(clean(p.country)),
    operatorTypeFacts(p),
    blurbFacts(p),
    city ? [`Town: ${city}.`, `The town is ${city}.`, `Recorded town: ${city}.`] : [],
  ]
    .map((facts) => uniqueFacts(facts).map((text) => ({ text, length: text.length })))
    .filter((facts) => facts.length > 0);

  const candidates: string[] = [];
  const seen = new Set<string>();
  const keep = (value: string) => {
    if (seen.has(value) || !inBand(value, p)) return;
    seen.add(value);
    candidates.push(value);
  };

  for (const lead of leads) {
    if (lead.length > 160) continue;
    keep(lead);
    const extras = groups.flatMap((group, groupIndex) => group.map((fact) => ({ ...fact, groupIndex })));
    for (const first of extras) {
      const len1 = lead.length + 1 + first.length;
      if (len1 > 160) continue;
      const withFirst = `${lead} ${first.text}`;
      keep(withFirst);
      for (const second of extras) {
        if (second.groupIndex <= first.groupIndex) continue;
        const len2 = len1 + 1 + second.length;
        if (len2 > 160) continue;
        const withSecond = `${withFirst} ${second.text}`;
        keep(withSecond);
        if (len2 < 150) {
          for (const third of extras) {
            if (third.groupIndex <= second.groupIndex) continue;
            const len3 = len2 + 1 + third.length;
            if (len3 < 150 || len3 > 160) continue;
            keep(`${withSecond} ${third.text}`);
          }
        }
      }
    }
  }

  if (!candidates.length) {
    throw new Error(`No profile meta description for ${p.countrySlug}/${p.slug}`);
  }

  const fullType = typeLabels(p)[0] ?? "";
  const cohort = ukCohortSentence(p).trim();
  return choose(candidates, (value) => {
    const hasCity = city ? (mentionsPhrase(value, `in ${city}`) ? 1 : 0) : 1;
    const operator = clean(p.operator);
    const asideFromOperator = operator ? value.split(operator).join("") : value;
    const hasRegion = p.countrySlug === "uk" || !region ? 1 : mentionsPhrase(asideFromOperator, region) ? 1 : 0;
    const countyInPlace = county && city ? (value.includes(`in ${city}, ${county}`) ? 1 : 0) : 1;
    const hasCounty = county ? (mentionsPhrase(value, county) ? 1 : 0) : 1;
    const hasOperator = operator ? (value.includes(operator) ? 1 : 0) : 1;
    const hasFullType = fullType ? (value.includes(fullType) ? 1 : 0) : 1;
    const adjective = securityAdjective(p);
    const hasSecurityWord = adjective ? (value.includes(adjective) ? 1 : 0) : 1;
    const hasCountry = country && p.dataProvenance === "official_source" ? (value.includes(country) ? 1 : 0) : 1;
    const hasCohort = cohort ? (value.includes(cohort) || /recorded cohort/i.test(value) ? 1 : 0) : 1;
    const countyMentions = county ? value.split(county).length - 1 : 0;
    const countyOnce = countyMentions <= 1 ? 1 : 0;
    const townPattern = city ? city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
    const townRepeat =
      city && mentionsPhrase(value, `in ${city}`) && new RegExp(`\\b[Tt]own: ${townPattern}\\b|\\btown is ${townPattern}\\b`).test(value) ? 0 : 1;
    const naturalOperator = operator ? (/Operated by |The operator is |The recorded operator is |The operator on record is /.test(value) ? 1 : 0) : 1;
    return [hasCity, hasRegion, countyInPlace, hasCounty, hasOperator, hasFullType, hasSecurityWord, hasCountry, hasCohort, countyOnce, townRepeat, naturalOperator, 160 - value.length];
  });
}
