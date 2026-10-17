import type { Prison } from "@/types/prison";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";
import {
  hasUkHmppsTypeFields,
  ukPrisonTypeLabel,
  withIndefiniteArticle,
} from "@/lib/seo/ukPrisonTypeLabel";

/**
 * Profile <meta name="description"> only.
 * JSON-LD keeps formatPrisonMetaDescription so this text cannot move
 * address, phone, or visit intent back onto the profile.
 */

const PROFILE_INTENT =
  /\b(address|addresses|phone|phones|telephone|telephones|postcode|postcodes|postal|contact|contacts|visit|visits|visiting|visitor|visitors)\b/i;

const PADS = [
  "Profile.",
  "Directory profile.",
  "Prison profile.",
  "Directory profile page.",
  "Prison directory profile.",
  "Profile of this establishment.",
  "Directory profile of this establishment.",
  "Prison directory profile of this establishment.",
  "Directory profile covering category and operator.",
  "Prison directory profile covering category and operator.",
  "Directory profile covering the recorded category and operator.",
  "Prison directory profile covering the recorded category and operator.",
  "Prison directory profile covering the recorded category, operator and the town.",
  "As recorded.",
];

function clean(value: string | undefined | null): string {
  if (!value) return "";
  const text = value.replace(/\s+/g, " ").trim();
  return /^none$/i.test(text) || /^not specified$/i.test(text) ? "" : text;
}

function sentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
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
    const label = facilityNoun(ukPrisonTypeLabel(p));
    return { full: label, short: label, securityOnly: "" };
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

function padToBand(text: string): string {
  let best = sentence(text);
  if (best.length > 160) return best;
  for (let pass = 0; pass < 2 && best.length < 150; pass++) {
    let nextBest = best;
    for (const pad of PADS) {
      const token = pad.replace(/\.$/, "").toLowerCase();
      if (best.toLowerCase().includes(token)) continue;
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
  const typeOptions = [types.full, types.securityOnly, types.short].filter(Boolean);
  const city = clean(p.city);
  const region = readableGeographicRegion(p);
  const country = p.dataProvenance === "official_source" ? clean(p.country) : "";
  const operator = clean(p.operator);
  const places = [
    placeLine([city, region, country]),
    placeLine([city, region]),
    placeLine([city, country]),
    placeLine([city]),
    placeLine([region, country]),
    placeLine([country]),
    "",
  ].filter((place, index, all) => all.indexOf(place) === index);

  const cores: string[] = [];
  for (const type of typeOptions.filter((type, index) => typeOptions.indexOf(type) === index)) {
    for (const place of places) {
      const lead = place
        ? `${name} is ${articleFor(type)} in ${place}.`
        : `${name} is ${articleFor(type)}.`;
      cores.push(sentence(lead));
      if (operator) cores.push(sentence(`${lead} Operated by ${operator}.`));
    }
  }

  const usable = cores
    .filter((value) => value.length <= 160 && !PROFILE_INTENT.test(value) && !leaksRawRegion(p, value))
    .map((value) => padToBand(value))
    .filter((value) => value.length <= 160 && !PROFILE_INTENT.test(value) && !leaksRawRegion(p, value));

  if (!usable.length) {
    throw new Error(`No profile meta description for ${p.countrySlug}/${p.slug}`);
  }

  return choose(usable, (value) => {
    const inBand = value.length >= 150 && value.length <= 160 ? 1 : 0;
    const hasCity = mentionsPlace(value, city) ? 1 : 0;
    const hasOperator = operator && value.includes(operator) ? 1 : 0;
    const hasRegion = mentionsPlace(value, region) ? 1 : 0;
    const hasCountry = mentionsPlace(value, country) ? 1 : 0;
    const hasFullType = types.full && value.includes(types.full) ? 1 : 0;
    return [inBand, hasCity, hasOperator, hasRegion, hasCountry, hasFullType, value.length];
  });
}
