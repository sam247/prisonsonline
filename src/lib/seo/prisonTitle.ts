import type { Prison } from "@/types/prison";

function titleName(p: Pick<Prison, "name" | "slug">): string {
  if (p.slug === "florence-admax-usp") return "ADX Florence / Florence ADMAX USP";
  if (p.slug === "hmp-manchester") return "HMP Manchester (Strangeways)";
  return p.name.trim();
}

/** Entity-led profile title. Contact and visit intents belong to their dedicated URLs. */
export function buildPrisonPageTitle(
  prison: Pick<Prison, "name" | "slug" | "countrySlug" | "securityLevel">,
): string {
  const name = titleName(prison);
  const category = prison.securityLevel?.trim();
  if (prison.countrySlug === "uk" && category && category !== "Not specified") {
    return `${name} | ${category} Prison`;
  }
  if (prison.countrySlug === "us") return `${name} | Facility Information`;
  return `${name} | Prison Information`;
}
