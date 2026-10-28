import type { Prison } from "@/types/prison";
import { formatIntlSecurity } from "@/lib/intl/profileCopy";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";
import {
  hasUkHmppsTypeFields,
  ukCohortSentence,
  ukEstablishmentNoun,
  ukPrisonTypeLabel,
  withIndefiniteArticle,
} from "@/lib/seo/ukPrisonTypeLabel";

/**
 * Profile <meta name="description"> and the profile JSON-LD description.
 * Facts only: name, type, town, county taken from the verified address, operator.
 * Postal-county abbreviations are expanded. HMPPS group and area names are not counties.
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
  const small = new Set(["of", "and", "the"]);
  return value.replace(/[A-Za-z]+/g, (word, offset) => {
    const lower = word.toLowerCase();
    if (offset > 0 && small.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

/**
 * Postal-county forms and city names used in that slot, mapped to the county
 * (or country, for North Wales and South Wales) we actually name.
 */
const POSTAL_COUNTY_NAMES: Record<string, string> = {
  beds: "Bedfordshire",
  berks: "Berkshire",
  bucks: "Buckinghamshire",
  cambs: "Cambridgeshire",
  "co durham": "County Durham",
  "e sussex": "East Sussex",
  "east yorks": "East Yorkshire",
  "e yorks": "East Yorkshire",
  glos: "Gloucestershire",
  gloucester: "Gloucestershire",
  hants: "Hampshire",
  herts: "Hertfordshire",
  lancs: "Lancashire",
  leics: "Leicestershire",
  lincs: "Lincolnshire",
  "mid wales": "Wales",
  "n yorks": "North Yorkshire",
  "north wales": "Wales",
  "north yorks": "North Yorkshire",
  northants: "Northamptonshire",
  nottingham: "Nottinghamshire",
  notts: "Nottinghamshire",
  oxon: "Oxfordshire",
  "s yorks": "South Yorkshire",
  salop: "Shropshire",
  shrops: "Shropshire",
  "south wales": "Wales",
  "south yorks": "South Yorkshire",
  staffs: "Staffordshire",
  "w mids": "West Midlands",
  "w sussex": "West Sussex",
  "w yorks": "West Yorkshire",
  warks: "Warwickshire",
  "west mids": "West Midlands",
  "west yorks": "West Yorkshire",
  wilts: "Wiltshire",
  worcs: "Worcestershire",
};

/** Full county names kept as written. Anything else in the county slot is dropped. */
const PROPER_COUNTY_NAMES: Record<string, string> = {
  bedfordshire: "Bedfordshire",
  berkshire: "Berkshire",
  bristol: "Bristol",
  buckinghamshire: "Buckinghamshire",
  cambridgeshire: "Cambridgeshire",
  cheshire: "Cheshire",
  "city of london": "City of London",
  cornwall: "Cornwall",
  "county durham": "County Durham",
  cumbria: "Cumbria",
  derbyshire: "Derbyshire",
  devon: "Devon",
  dorset: "Dorset",
  "east riding of yorkshire": "East Riding of Yorkshire",
  "east sussex": "East Sussex",
  "east yorkshire": "East Yorkshire",
  essex: "Essex",
  gloucestershire: "Gloucestershire",
  "greater london": "Greater London",
  "greater manchester": "Greater Manchester",
  hampshire: "Hampshire",
  herefordshire: "Herefordshire",
  hertfordshire: "Hertfordshire",
  "isle of wight": "Isle of Wight",
  kent: "Kent",
  lancashire: "Lancashire",
  leicestershire: "Leicestershire",
  lincolnshire: "Lincolnshire",
  merseyside: "Merseyside",
  norfolk: "Norfolk",
  "north yorkshire": "North Yorkshire",
  northamptonshire: "Northamptonshire",
  northumberland: "Northumberland",
  nottinghamshire: "Nottinghamshire",
  oxfordshire: "Oxfordshire",
  rutland: "Rutland",
  shropshire: "Shropshire",
  somerset: "Somerset",
  "south yorkshire": "South Yorkshire",
  staffordshire: "Staffordshire",
  suffolk: "Suffolk",
  surrey: "Surrey",
  "tyne and wear": "Tyne and Wear",
  warwickshire: "Warwickshire",
  "west midlands": "West Midlands",
  "west sussex": "West Sussex",
  "west yorkshire": "West Yorkshire",
  wiltshire: "Wiltshire",
  worcestershire: "Worcestershire",
  anglesey: "Anglesey",
  "blaenau gwent": "Blaenau Gwent",
  bridgend: "Bridgend",
  caerphilly: "Caerphilly",
  cardiff: "Cardiff",
  carmarthenshire: "Carmarthenshire",
  ceredigion: "Ceredigion",
  conwy: "Conwy",
  denbighshire: "Denbighshire",
  flintshire: "Flintshire",
  gwynedd: "Gwynedd",
  "isle of anglesey": "Isle of Anglesey",
  "merthyr tydfil": "Merthyr Tydfil",
  monmouthshire: "Monmouthshire",
  "neath port talbot": "Neath Port Talbot",
  newport: "Newport",
  pembrokeshire: "Pembrokeshire",
  powys: "Powys",
  "rhondda cynon taf": "Rhondda Cynon Taf",
  swansea: "Swansea",
  torfaen: "Torfaen",
  "vale of glamorgan": "Vale of Glamorgan",
  wales: "Wales",
  wrexham: "Wrexham",
};

function countyKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\./g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Proper county name for a postal-county token. Empty when the token is not a county we will name. */
export function normalizePostalCounty(raw: string): string {
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  const key = countyKey(titleCaseIfShouted(trimmed));
  return POSTAL_COUNTY_NAMES[key] ?? PROPER_COUNTY_NAMES[key] ?? "";
}

function addressParts(address: string): string[] {
  return clean(address)
    .replace(/\s+,/g, ",")
    .replace(/,\s*/g, ", ")
    .replace(UK_POSTCODE, "")
    .replace(/,\s*$/, "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function countySlot(p: Prison): string {
  if (p.countrySlug !== "uk") return "";
  const city = clean(p.city);
  const parts = addressParts(p.address ?? "");
  if (!city || parts.length < 2) return "";
  const idx = parts.findIndex((part) => samePlace(part, city));
  if (idx < 0 || idx >= parts.length - 1) return "";
  return parts[parts.length - 1];
}

/** County after the town in the verified address. Empty when that slot is missing or not a county we will name. */
export function countyFromVerifiedAddress(p: Prison): string {
  const raw = countySlot(p);
  if (!raw) return "";
  const county = normalizePostalCounty(raw);
  return county && !samePlace(county, clean(p.city)) ? county : "";
}

/** Same display names as the profile heading. */
function profileName(p: Prison): string {
  const base =
    p.slug === "florence-admax-usp"
      ? "ADX Florence"
      : p.slug === "hmp-manchester"
        ? "HMP Manchester (Strangeways)"
        : p.name.trim();
  if (p.status === "closed") return `${clean(p.statusLabel) || "Closed"}: ${base}`;
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
  if (hasUkHmppsTypeFields(p)) {
    const full = facilityNoun(ukPrisonTypeLabel(p));
    const noun = facilityNoun(ukEstablishmentNoun(p));
    return [full, noun].filter((label, index, all) => label && all.indexOf(label) === index);
  }
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

const WELSH_PLACE_NAMES = new Set([
  "Anglesey",
  "Blaenau Gwent",
  "Bridgend",
  "Caerphilly",
  "Cardiff",
  "Carmarthenshire",
  "Ceredigion",
  "Conwy",
  "Denbighshire",
  "Flintshire",
  "Gwynedd",
  "Isle of Anglesey",
  "Merthyr Tydfil",
  "Monmouthshire",
  "Neath Port Talbot",
  "Newport",
  "Pembrokeshire",
  "Powys",
  "Rhondda Cynon Taf",
  "Swansea",
  "Torfaen",
  "Vale of Glamorgan",
  "Wales",
  "Wrexham",
]);

function isWelshPrison(p: Prison): boolean {
  if (p.countrySlug !== "uk") return false;
  if (/^hmpps wales$/i.test(clean(p.stateOrRegion))) return true;
  return WELSH_PLACE_NAMES.has(countyFromVerifiedAddress(p));
}

/** One operator sentence. Public-sector prisons name HMPPS; private prisons name the operator. */
export function operatorSentence(p: Prison): string {
  const operator = clean(p.operator);
  if (!operator) return "";
  if (/^public sector prison$/i.test(operator)) {
    return isWelshPrison(p) ? "Run by HMPPS Wales." : "Run by HM Prison and Probation Service.";
  }
  return `Operated by ${operator}.`;
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
  const sentence = operatorSentence(p);
  const checked = sentence ? text.split(sentence).join("") : text;
  const letters = region.replace(/[^A-Za-z]/g, "");
  const readable =
    letters && letters === letters.toUpperCase()
      ? region.replace(/\s*,\s*/g, ", ").replace(/[A-Za-z]+/g, (word) => word.charAt(0) + word.slice(1).toLowerCase())
      : region;
  const allowed = [clean(p.city), countyFromVerifiedAddress(p)].filter(Boolean);
  if (allowed.some((place) => samePlace(place, readable) || place.toLowerCase().includes(readable.toLowerCase()))) return false;
  return mentionsPhrase(checked, readable) || mentionsPhrase(checked, region);
}

function uniqueFacts(facts: string[]): string[] {
  return facts.filter((fact, index) => fact && facts.indexOf(fact) === index);
}

function cohortFacts(p: Prison): string[] {
  if (!hasUkHmppsTypeFields(p)) return [];
  const base = ukCohortSentence(p).trim();
  if (!base || PROFILE_INTENT.test(base) || /\brecorded\b/i.test(base)) return [];
  const cohortLine = base.replace(/^It also has/, "The cohort also has").replace(/^It has/, "The cohort has");
  return uniqueFacts([base, cohortLine]);
}

function operatorFacts(p: Prison): string[] {
  const sentence = operatorSentence(p);
  return sentence ? [sentence] : [];
}

function countyFacts(county: string): string[] {
  if (!county || PROFILE_INTENT.test(county)) return [];
  return [`County: ${county}.`, `The county is ${county}.`];
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
  return [`Security: ${usable}.`, `Security level: ${usable}.`, `The security level is ${usable}.`];
}

function capacityFacts(capacity: number): string[] {
  if (!(capacity > 0)) return [];
  return [`Capacity ${capacity}.`, `Listed capacity ${capacity}.`, `The listed capacity is ${capacity}.`];
}

function yearFacts(year: number): string[] {
  if (!(year > 0)) return [];
  return [`Opened in ${year}.`, `It opened in ${year}.`, `Opening year: ${year}.`];
}

function countryFacts(country: string): string[] {
  if (!country || PROFILE_INTENT.test(country)) return [];
  const inCountry =
    country === "United Kingdom" ? "the United Kingdom" : country === "United States (Federal)" ? "the United States" : country;
  return [`In ${inCountry}.`, `Country: ${country}.`, `It is in ${inCountry}.`];
}

function operatorTypeFacts(p: Prison): string[] {
  if (p.operatorType === "public") return ["Publicly operated.", "It is publicly operated.", "The operator type is public."];
  if (p.operatorType === "private") return ["Privately operated.", "It is privately operated.", "The operator type is private."];
  return [];
}

function scrubCountyAlias(p: Prison, text: string): string {
  const raw = countySlot(p);
  if (!raw) return text;
  const named = normalizePostalCounty(raw);
  if (samePlace(raw, named)) return text;
  const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!named) {
    return text
      .replace(new RegExp(`,\\s*${escaped}\\b`, "ig"), "")
      .replace(new RegExp(`\\b${escaped}\\b`, "ig"), "")
      .replace(/\s+,/g, ",")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([.,])/g, "$1")
      .trim();
  }
  return text.replace(new RegExp(`\\b${escaped}\\b`, "ig"), named);
}

function blurbFacts(p: Prison): string[] {
  const postcode = clean(p.postcode);
  const phone = clean(p.phone);
  const out: string[] = [];
  for (const raw of [p.facilityDescription, p.shortDescription, p.overview]) {
    const text = scrubCountyAlias(p, clean(raw));
    if (!text) continue;
    const one = text.split(/(?<=[.!?])\s+/)[0] ?? "";
    if (!one || one.length > 110) continue;
    if (PROFILE_INTENT.test(one) || FILLER.test(one) || /\brecorded\b/i.test(one)) continue;
    if (/imported dataset|this site build|directory label|not part of the imported|public sector prison/i.test(one)) continue;
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
  if (PROFILE_INTENT.test(value) || FILLER.test(value) || /\brecorded\b/i.test(value) || textUsesHmppsAreaName(p, value)) return false;
  const rawCounty = countySlot(p);
  const namedCounty = rawCounty ? normalizePostalCounty(rawCounty) : "";
  if (rawCounty && !samePlace(rawCounty, namedCounty) && mentionsPhrase(value, rawCounty)) return false;
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
    operatorFacts(p),
    cohortFacts(p),
    countyFacts(county),
    securityFacts(p),
    capacityFacts(p.capacity),
    yearFacts(p.openedYear),
    countryFacts(clean(p.country)),
    operatorTypeFacts(p),
    blurbFacts(p),
    city ? [`Town: ${city}.`, `The town is ${city}.`] : [],
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
            if (len3 > 160) continue;
            const withThird = `${withSecond} ${third.text}`;
            keep(withThird);
            if (len3 < 150) {
              for (const fourth of extras) {
                if (fourth.groupIndex <= third.groupIndex) continue;
                const len4 = len3 + 1 + fourth.length;
                if (len4 < 150 || len4 > 160) continue;
                keep(`${withThird} ${fourth.text}`);
              }
            }
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
    const sentence = operatorSentence(p);
    const asideFromOperator = sentence ? value.split(sentence).join("") : value;
    const hasRegion = p.countrySlug === "uk" || !region ? 1 : mentionsPhrase(asideFromOperator, region) ? 1 : 0;
    const countyInPlace = county && city ? (value.includes(`in ${city}, ${county}`) ? 1 : 0) : 1;
    const hasCounty = county ? (mentionsPhrase(value, county) ? 1 : 0) : 1;
    const hasOperator = sentence ? (value.includes(sentence) ? 1 : 0) : 1;
    const hasFullType = fullType ? (value.includes(fullType) ? 1 : 0) : 1;
    const adjective = securityAdjective(p);
    const hasSecurityWord = adjective ? (value.includes(adjective) ? 1 : 0) : 1;
    const hasCountry = country && p.dataProvenance === "official_source" ? (value.includes(country) ? 1 : 0) : 1;
    const hasCohort = cohort ? (value.includes(cohort) || value.includes(cohort.replace(/^It also has/, "The cohort also has").replace(/^It has/, "The cohort has")) ? 1 : 0) : 1;
    const countyMentions = county ? asideFromOperator.split(county).length - 1 : 0;
    const countyOnce = countyMentions <= 1 ? 1 : 0;
    const townPattern = city ? city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
    const townRepeat =
      city && mentionsPhrase(value, `in ${city}`) && new RegExp(`\\b[Tt]own: ${townPattern}\\b|\\btown is ${townPattern}\\b`).test(value) ? 0 : 1;
    return [hasCity, hasRegion, countyInPlace, hasCounty, hasOperator, hasFullType, hasSecurityWord, hasCountry, hasCohort, countyOnce, townRepeat, 160 - value.length];
  });
}
