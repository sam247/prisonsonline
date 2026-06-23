import type { Prison } from "@/types/prison";
import { slugVariantIndex } from "@/lib/seo/prisonProfileCopy";

const TITLE_OVERRIDES: Record<string, string> = {
  "hmp-wandsworth": "HMP Wandsworth prison: visits, contact",
  "hmp-leicester": "HMP Leicester prison: visits, contact",
  "hmp-manchester": "HMP Manchester (Strangeways): visits, contact",
  "florence-admax-usp": "ADX Florence / Florence ADMAX USP: visits",
};

const UK_TITLE_SUFFIXES = [
  "prison: visits, contact, address",
  "prison visiting and contact information",
  "visiting times, contact and prison information",
  "prison visits, contact and address",
] as const;

const US_TITLE_SUFFIXES = [
  "prison: visits, address and contact",
  "BOP facility: visits, address and contact",
  "prison visiting and contact information",
  "facility visits, address and contact",
] as const;

const GENERIC_TITLE_SUFFIXES = [
  "prison information and contact details",
  "prison visits, address and contact",
  "prison profile and visiting information",
  "prison contact and practical information",
] as const;

const MAX_TITLE_LEN = 60;

function truncateNameAtWord(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  if (maxLen <= 1) return "…";
  const slice = name.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLen * 0.4 ? slice.slice(0, lastSpace) : slice.trimEnd();
  return `${base}…`;
}

function titleName(p: Pick<Prison, "name" | "slug">): string {
  if (p.slug === "florence-admax-usp") return "ADX Florence / Florence ADMAX USP";
  if (p.slug === "hmp-manchester") return "HMP Manchester (Strangeways)";
  return p.name.trim();
}

function suffixesForCountry(countrySlug: string): readonly string[] {
  if (countrySlug === "uk") return UK_TITLE_SUFFIXES;
  if (countrySlug === "us") return US_TITLE_SUFFIXES;
  return GENERIC_TITLE_SUFFIXES;
}

/** Query-aligned title for prison profile pages. */
export function buildPrisonPageTitle(prison: Pick<Prison, "name" | "slug" | "countrySlug">): string {
  const override = TITLE_OVERRIDES[prison.slug];
  if (override) return override;
  const suffixes = suffixesForCountry(prison.countrySlug);
  const suffix = suffixes[slugVariantIndex(prison.slug, suffixes.length)];
  const sep = " ";
  const name = titleName(prison);
  const suffixPart = `${sep}${suffix}`;
  const full = `${name}${suffixPart}`;
  if (full.length <= MAX_TITLE_LEN) return full;
  const maxNameLen = MAX_TITLE_LEN - suffixPart.length;
  if (maxNameLen < 2) return `${name.slice(0, 1)}…${suffixPart}`;
  return `${truncateNameAtWord(name, maxNameLen)}${suffixPart}`;
}
