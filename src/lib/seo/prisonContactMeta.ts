import type { Prison } from "@/types/prison";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";
import { countyFromVerifiedAddress, normalizePostalCounty, operatorSentence, textUsesHmppsAreaName } from "@/lib/seo/prisonProfileMeta";

/**
 * Contact-details <meta name="description"> and that page's JSON-LD description.
 * These pages keep address, postcode, telephone and contact intent.
 * The town and county come from the verified address, not the HMPPS area name.
 */

const CLOSER = "Visiting and contact details.";

const FILLER =
  /Official contact routes|And how to visit|How to visit|For a visit|To visit|Profile of this establishment|Directory profile|Visit details are on this contact page/i;

function clean(value: string | undefined | null): string {
  if (!value) return "";
  const text = value.replace(/\s+/g, " ").trim();
  return /^none$/i.test(text) ? "" : text;
}

function sentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanAddress(value: string | undefined): string {
  return clean(value).replace(/\s+,/g, ",").replace(/,\s*/g, ", ");
}

function stripTrailingPostcode(street: string, postcode: string): string {
  let out = street;
  if (postcode) {
    const escaped = postcode.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    out = out.replace(new RegExp(`,?\\s*${escaped}\\s*$`, "i"), "");
  }
  return out.replace(/,?\s*[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\s*$/i, "").replace(/,\s*$/, "").trim();
}

/** Address line with the postcode removed and a postal county written out in full. */
function displayStreet(p: Prison): string {
  const street = stripTrailingPostcode(cleanAddress(p.address), clean(p.postcode));
  if (p.countrySlug !== "uk") return street;
  const parts = street.split(",").map((part) => part.trim()).filter(Boolean);
  const city = clean(p.city);
  const idx = city ? parts.findIndex((part) => samePlace(part, city)) : -1;
  if (idx >= 0 && idx < parts.length - 1) {
    const county = normalizePostalCounty(parts[parts.length - 1]);
    if (county) parts[parts.length - 1] = county;
    else parts.pop();
  }
  return parts.join(", ");
}

function samePlace(a: string, b: string): boolean {
  return a.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ") === b.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ");
}

/** Same display names as the contact-details title. */
function contactName(p: Prison): string {
  if (p.slug === "florence-admax-usp") return "ADX Florence (Florence ADMAX USP)";
  if (p.slug === "hmp-manchester") return "HMP Manchester (Strangeways)";
  return p.name.trim();
}

function contactPlace(p: Prison): string {
  const city = clean(p.city);
  if (p.countrySlug === "uk") {
    const county = countyFromVerifiedAddress(p);
    return [city, county && !samePlace(county, city) ? county : ""].filter(Boolean).join(", ");
  }
  const region = geographicRegion(p).replace(/\s+/g, " ").trim();
  return [city, region && !samePlace(region, city) ? region : ""].filter(Boolean).join(", ");
}

function keepsContactIntent(value: string, postcode: string, phone: string): boolean {
  if (value.length < 150 || value.length > 160) return false;
  if (!value.endsWith(CLOSER)) return false;
  if (FILLER.test(value) || /\brecorded\b/i.test(value) || /address and postcode/i.test(value)) return false;
  if (!/\baddress\b/i.test(value)) return false;
  if (!/\bpostcode\b/i.test(value)) return false;
  if (!/\btelephone\b/i.test(value)) return false;
  if (!/\bcontact\b/i.test(value)) return false;
  if (!/\bvisiting\b/i.test(value)) return false;
  if (postcode && value.split(postcode).length - 1 !== 1) return false;
  if (phone && !value.includes(phone)) return false;
  return true;
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

export function formatContactDetailsMetaDescription(p: Prison): string {
  const name = contactName(p);
  const postcode = clean(p.postcode);
  const phone = clean(p.phone);
  const street = displayStreet(p);
  const place = contactPlace(p);
  const city = clean(p.city);
  const county = p.countrySlug === "uk" ? countyFromVerifiedAddress(p) : "";
  const operator = operatorSentence(p);
  const phoneForms = phone ? [`Telephone ${phone}.`, `The telephone is ${phone}.`, `Telephone number ${phone}.`] : ["Telephone."];
  const postcodeForms = postcode ? [`Postcode ${postcode}.`, `The postcode is ${postcode}.`] : ["Postcode."];
  const placeForms = [
    "",
    place ? `In ${place}.` : "",
    city ? `The town is ${city}.` : "",
    county ? `County: ${county}.` : "",
    county ? `The county is ${county}.` : "",
  ].filter((value, index, all) => all.indexOf(value) === index);
  const operatorForms = operator ? ["", operator] : [""];
  const countryForms =
    p.countrySlug === "uk" ? ["", "In the United Kingdom."] : p.countrySlug === "us" ? ["", "In the United States."] : [""];
  const telephoneWords = ["telephone", "the telephone"];
  const cores: string[] = [];

  if (street) {
    for (const postcodeForm of postcodeForms) {
      for (const phoneForm of phoneForms) {
        for (const placeForm of placeForms) {
          for (const operatorForm of operatorForms) {
            for (const countryForm of countryForms) {
              cores.push(sentence(`${name} address: ${street}. ${postcodeForm} ${phoneForm} ${placeForm} ${operatorForm} ${countryForm} ${CLOSER}`));
              cores.push(sentence(`${name} address: ${street}. ${phoneForm} ${postcodeForm} ${placeForm} ${operatorForm} ${countryForm} ${CLOSER}`));
            }
          }
        }
      }
    }
  }

  for (const telephoneWord of telephoneWords) {
    for (const placeForm of placeForms) {
      for (const operatorForm of operatorForms) {
        for (const countryForm of countryForms) {
          const where = place ? ` in ${place}` : "";
          cores.push(
            sentence(
              `${name} address, postcode${postcode ? ` ${postcode}` : ""} and ${telephoneWord}${phone ? ` ${phone}` : ""}${where}. ${placeForm} ${operatorForm} ${countryForm} ${CLOSER}`,
            ),
          );
        }
      }
    }
  }

  const usable = Array.from(new Set(cores)).filter((value) => keepsContactIntent(value, postcode, phone) && !textUsesHmppsAreaName(p, value));
  if (!usable.length) {
    throw new Error(`No contact meta description for ${p.countrySlug}/${p.slug}`);
  }

  return choose(usable, (value) => {
    const hasStreet = street && value.includes(street) ? 1 : 0;
    const hasPlace = place ? (value.includes(place) ? 1 : 0) : 1;
    const hasCounty = county ? (value.includes(county) ? 1 : 0) : 1;
    const postcodeOnce = postcode ? (value.split(postcode).length - 1 <= 1 ? 1 : 0) : 1;
    const placeOnce = place ? (value.split(place).length - 1 <= 1 ? 1 : 0) : 1;
    const countyOnce = county ? (value.split(county).length - 1 <= 1 ? 1 : 0) : 1;
    const withoutTownSentence = value.replace(/\b[Tt]own: [^.]+\.|\btown is [^.]+\./g, "");
    const townRepeat = city && withoutTownSentence.includes(city) && withoutTownSentence.length !== value.length ? 0 : 1;
    const hasOperator = operator && value.includes(operator) ? 1 : 0;
    const naturalPhone = /The telephone is |Telephone \d|Telephone \(/.test(value) ? 2 : /the telephone /.test(value) ? 1 : 0;
    return [hasStreet, hasPlace, hasCounty, postcodeOnce, placeOnce, countyOnce, townRepeat, hasOperator, naturalPhone, 160 - value.length];
  });
}
