import type { OfficialFacts } from "./types";
import { collapseSpace, extractPostcode } from "./normalize";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+44\s?\(?0?\)?|0)\s?\d(?:[\d\s().-]{7,16}\d)/;

function sectionAfter(body: string, heading: RegExp): string {
  const match = heading.exec(body);
  if (!match || match.index == null) return "";
  return body.slice(match.index, match.index + 1800);
}

/**
 * The GOV.UK contact block is near the end and includes Governor / Telephone / Email / Address.
 * Visiting booking numbers appear earlier and must not be treated as the establishment switchboard.
 */
export function extractContactBlock(body: string): string {
  const governor = body.search(/\bGovernor:\s*/i);
  if (governor >= 0) {
    const start = Math.max(0, body.lastIndexOf("Contact", governor));
    return body.slice(start, governor + 1200);
  }

  const addressHeadingMatches = Array.from(body.matchAll(/\n\s*Address\s*\n/gi));
  const addressHeading = addressHeadingMatches[addressHeadingMatches.length - 1];
  if (addressHeading && addressHeading.index != null) {
    const start = Math.max(0, body.lastIndexOf("Contact", addressHeading.index));
    return body.slice(start, addressHeading.index + 500);
  }

  const contacts = Array.from(body.matchAll(/\bContact [A-Z][A-Za-z0-9' -]{1,40}/g));
  const last = contacts[contacts.length - 1];
  if (last && last.index != null) return body.slice(last.index, last.index + 1500);
  return "";
}

function firstCapture(block: string, re: RegExp): string | undefined {
  const match = block.match(re);
  const value = match?.[1] ? collapseSpace(match[1]) : "";
  return value || undefined;
}

function firstPhone(block: string): string | undefined {
  const labelled = firstCapture(block, /Telephone:\s*([+\d][\d\s().-]{8,20})/i);
  if (labelled) return labelled;
  const generic = block.match(PHONE_RE);
  return generic ? collapseSpace(generic[0]) : undefined;
}

function firstEmail(block: string): string | undefined {
  const labelled = firstCapture(block, /Email:\s*(\S+@\S+)/i);
  if (labelled) return labelled.replace(/[>,;]+$/g, "");
  const generic = block.match(EMAIL_RE);
  return generic ? generic[0] : undefined;
}

function extractAddress(contactBlock: string, fallbackBody: string): string | undefined {
  const labelled = firstCapture(contactBlock, /Address\s+([\s\S]{10,240}?)(?:See map|Follow |Updates to this page|$)/i);
  if (labelled) {
    return collapseSpace(labelled.replace(/See map.*/i, ""));
  }
  const afterHeading = sectionAfter(contactBlock, /\bAddress\b/i);
  if (afterHeading) {
    const line = collapseSpace(
      afterHeading
        .replace(/^Address/i, "")
        .replace(/See map[\s\S]*/i, "")
        .split("\n")
        .slice(0, 6)
        .join(" "),
    );
    if (line.length >= 8) return line;
  }
  const postcode = extractPostcode(fallbackBody);
  return postcode ? undefined : undefined;
}

function extractVisitingTelephone(body: string): string | undefined {
  const booking = sectionAfter(body, /How to book family and friends visits/i);
  if (!booking) return undefined;
  const labelled = booking.match(/telephone,?\s*([+\d][\d\s().-]{8,20})/i);
  if (labelled?.[1]) return collapseSpace(labelled[1]);
  return undefined;
}

function extractCategoryHint(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/\bcategory\s*a\b|\bcat\s*a\b/.test(t)) return "Category A";
  if (/\bhigh security\b/.test(t)) return "High Security";
  if (/\bcategory\s*b\b|\bcat\s*b\b/.test(t)) return "Category B";
  if (/\bcategory\s*c\b|\bcat\s*c\b/.test(t)) return "Category C";
  if (/\bcategory\s*d\b|\bcat\s*d\b|\bopen prison\b/.test(t)) return "Category D";
  return undefined;
}

function extractOperatorHint(text: string): string | undefined {
  const privateRun = text.match(
    /privately\s+(?:run|managed|operated)(?:\s+adult)?(?:\s+\w+)?(?:\s+\w+)?(?:\s+prison)?\s+by\s+([A-Z][A-Za-z0-9& ]{2,40})/i,
  );
  if (privateRun?.[1]) return collapseSpace(privateRun[1]);
  if (/\bserco\b/i.test(text) && /privat/i.test(text)) return "Serco";
  if (/\bg4s\b/i.test(text) && /privat/i.test(text)) return "G4S";
  if (/\bsodexo\b/i.test(text) && /privat/i.test(text)) return "Sodexo";
  return undefined;
}

export function extractGovukFacts(input: {
  title: string;
  description?: string;
  body: string;
  withdrawn?: boolean;
  publicUpdatedAt?: string;
}): OfficialFacts {
  const body = input.body || "";
  const contact = extractContactBlock(body);
  const phone = firstPhone(contact);
  const email = firstEmail(contact);
  const governor = firstCapture(contact, /Governor:\s*([^\n]+)/i);
  const address = extractAddress(contact, body);
  const postcode = extractPostcode(address) || extractPostcode(contact) || extractPostcode(body);
  const visitingTelephone = extractVisitingTelephone(body);
  const category = extractCategoryHint(`${input.title} ${input.description ?? ""} ${body.slice(0, 500)}`);
  const operator = extractOperatorHint(`${input.description ?? ""}\n${body}`);
  const getting = sectionAfter(body, /Getting to [A-Z]/i);

  return {
    officialName: collapseSpace(input.title) || undefined,
    address: address || undefined,
    postcode: postcode || undefined,
    phone,
    email: email && /\.gov\.uk$/i.test((email.split("@")[1] || "").replace(/[>,;]+$/g, "")) ? email : undefined,
    visitingTelephone,
    governor,
    operator,
    category,
    gettingThere: getting ? collapseSpace(getting).slice(0, 280) : undefined,
    withdrawn: Boolean(input.withdrawn),
    sourceUpdatedAt: input.publicUpdatedAt,
  };
}
