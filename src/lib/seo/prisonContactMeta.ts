import type { Prison } from "@/types/prison";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";

/**
 * Contact-details <meta name="description"> only.
 * Contact pages keep address, postcode, telephone and contact intent.
 * JSON-LD keeps buildIntentMetaDescription.
 */

const PADS = [
  "Visit.",
  "To visit.",
  "For a visit.",
  "How to visit.",
  "And how to visit.",
  "How to contact or visit.",
  "How to contact or visit this prison.",
  "Visit details are on this contact page.",
  "Use these official contact details.",
];

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

/** Same display names as the contact-details title. */
function contactName(p: Prison): string {
  if (p.slug === "florence-admax-usp") return "ADX Florence (Florence ADMAX USP)";
  if (p.slug === "hmp-manchester") return "HMP Manchester (Strangeways)";
  return p.name.trim();
}

function readableGeographicRegion(p: Prison): string {
  const raw = geographicRegion(p).replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const letters = raw.replace(/[^A-Za-z]/g, "");
  if (!letters || letters !== letters.toUpperCase()) return raw;
  return raw
    .replace(/\s*,\s*/g, ", ")
    .replace(/[A-Za-z]+/g, (word) => word.charAt(0) + word.slice(1).toLowerCase());
}

function leaksRawRegion(p: Prison, text: string): boolean {
  const raw = geographicRegion(p).replace(/\s+/g, " ").trim();
  if (!raw) return false;
  const letters = raw.replace(/[^A-Za-z]/g, "");
  if (!letters || letters !== letters.toUpperCase()) return false;
  return text.includes(raw);
}

function alreadySaid(base: string, pad: string): boolean {
  const token = pad.replace(/\.$/, "").toLowerCase();
  const haystack = base.toLowerCase();
  if (haystack.includes(token)) return true;
  const head = token.split(" ").slice(0, 4).join(" ");
  return head.length > 10 && haystack.includes(head);
}

function padToBand(text: string): string {
  let best = sentence(text);
  if (best.length > 160) return best;
  for (let pass = 0; pass < 2 && best.length < 150; pass++) {
    let nextBest = best;
    for (const pad of PADS) {
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

function keepsContactIntent(value: string, postcode: string, phone: string): boolean {
  if (value.length > 160) return false;
  if (!/\baddress\b/i.test(value)) return false;
  if (!/\bpostcode\b/i.test(value)) return false;
  if (!/\btelephone\b/i.test(value)) return false;
  if (!/\bcontact\b/i.test(value)) return false;
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
  const city = clean(p.city);
  const region = readableGeographicRegion(p);
  const regionOut = region && region.toLowerCase() !== city.toLowerCase() ? region : "";
  const where = [city, regionOut].filter(Boolean).join(", ");
  const tails = [
    "Official contact routes.",
    where ? `Official contact routes for ${where}.` : "",
    "Official contact routes. How to contact or visit.",
    where ? `Official contact routes for ${where}. How to contact or visit.` : "",
  ].filter((tail): tail is string => Boolean(tail));

  const candidates: string[] = [];
  if (street) {
    for (const tail of tails) {
      const phoneBit = phone ? ` Telephone ${phone}.` : "";
      const postcodeBit = postcode ? ` Postcode ${postcode}.` : "";
      candidates.push(sentence(`${name} address: ${street}.${postcodeBit}${phoneBit} ${tail}`));
    }
  }
  for (const tail of tails) {
    const postcodeBit = postcode ? ` ${postcode}` : "";
    const phoneBit = phone ? ` ${phone}` : "";
    candidates.push(sentence(`${name} address, postcode${postcodeBit} and telephone${phoneBit}. ${tail}`));
  }

  const usable = candidates
    .filter((value) => value.length <= 160 && keepsContactIntent(value, postcode, phone) && !leaksRawRegion(p, value))
    .map((value) => padToBand(value))
    .filter((value) => value.length <= 160 && keepsContactIntent(value, postcode, phone) && !leaksRawRegion(p, value));

  if (!usable.length) {
    throw new Error(`No contact meta description for ${p.countrySlug}/${p.slug}`);
  }

  return choose(usable, (value) => {
    const hasStreet = street && value.includes(street) ? 1 : 0;
    const inBand = value.length >= 150 && value.length <= 160 ? 1 : 0;
    const hasRegion = regionOut ? (value.includes(regionOut) ? 1 : 0) : 1;
    const hasCity = city ? (value.includes(city) ? 1 : 0) : 1;
    const hasVisit = /\b(visit|visiting)\b/i.test(value) ? 1 : 0;
    return [hasStreet, inBand, hasRegion, hasCity, hasVisit, value.length];
  });
}
