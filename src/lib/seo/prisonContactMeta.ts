import type { Prison } from "@/types/prison";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";
import { countyFromVerifiedAddress, textUsesHmppsAreaName } from "@/lib/seo/prisonProfileMeta";

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
  if (FILLER.test(value)) return false;
  if (!/\baddress\b/i.test(value)) return false;
  if (!/\bpostcode\b/i.test(value)) return false;
  if (!/\btelephone\b/i.test(value)) return false;
  if (!/\bcontact\b/i.test(value)) return false;
  if (!/\bvisiting\b/i.test(value)) return false;
  if (postcode && !value.includes(postcode)) return false;
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
  const street = cleanAddress(p.address);
  const place = contactPlace(p);
  const city = clean(p.city);
  const county = p.countrySlug === "uk" ? countyFromVerifiedAddress(p) : "";
  const operator = clean(p.operator);
  const phoneForms = phone
    ? [`Telephone ${phone}.`, `The telephone is ${phone}.`, `Telephone number ${phone}.`, `Recorded telephone: ${phone}.`, `The recorded telephone is ${phone}.`]
    : ["Telephone."];
  const postcodeForms = postcode
    ? [`Postcode ${postcode}.`, `The postcode is ${postcode}.`, `Recorded postcode: ${postcode}.`, `The recorded postcode is ${postcode}.`]
    : ["Postcode."];
  const placeForms = [
    "",
    place ? `In ${place}.` : "",
    city ? `The town is ${city}.` : "",
    county ? `County: ${county}.` : "",
    county ? `The county is ${county}.` : "",
  ].filter((value, index, all) => all.indexOf(value) === index);
  const operatorForms = operator
    ? ["", `Operator: ${operator}.`, `Operated by ${operator}.`, `The operator is ${operator}.`, `The recorded operator is ${operator}.`]
    : [""];
  const countryForms = p.countrySlug === "uk" ? ["", "In the United Kingdom."] : [""];
  const telephoneWords = ["telephone", "the telephone", "recorded telephone", "the recorded telephone"];
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
    for (const phoneForm of phoneForms) {
      for (const placeForm of placeForms) {
        for (const operatorForm of operatorForms) {
          for (const countryForm of countryForms) {
            cores.push(sentence(`${name} address and postcode: ${street}. ${phoneForm} ${placeForm} ${operatorForm} ${countryForm} ${CLOSER}`));
            if (postcode) {
              cores.push(sentence(`${name} address and postcode ${postcode}: ${street}. ${phoneForm} ${placeForm} ${operatorForm} ${countryForm} ${CLOSER}`));
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
    const naturalOperator =
      operator && value.includes(operator) ? (/Operated by |The operator is |The recorded operator is /.test(value) ? 1 : 0) : 1;
    const naturalPhone = /The recorded telephone is |The telephone is |Telephone \d|Telephone \(/.test(value)
      ? 2
      : /the telephone /.test(value)
        ? 1
        : 0;
    return [hasStreet, hasPlace, hasCounty, postcodeOnce, placeOnce, countyOnce, townRepeat, hasOperator, naturalOperator, naturalPhone, 160 - value.length];
  });
}
