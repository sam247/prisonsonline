import type { OfficialFacts } from "./types";
import { collapseSpace } from "./normalize";
import type { BopLocation } from "./bopClient";

function usablePhone(raw: string | undefined): string | undefined {
  const value = collapseSpace(raw);
  if (!value) return undefined;
  if (value === "-1--1" || value === "-1") return undefined;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  return value;
}

function usableEmail(raw: string | undefined): string | undefined {
  const value = collapseSpace(raw);
  if (!value || !value.includes("@")) return undefined;
  const domain = (value.split("@")[1] || "").replace(/[>,;]+$/g, "").toLowerCase();
  if (domain !== "bop.gov") return undefined;
  return value;
}

export function extractBopFacts(loc: BopLocation): OfficialFacts {
  const address = collapseSpace(loc.address) || undefined;
  const postcode = collapseSpace(loc.zipCode) || undefined;
  const phone = usablePhone(loc.phoneNumber);
  const email = usableEmail(loc.contactEmail);
  const officialName = collapseSpace(loc.nameDisplay || loc.nameTitle || loc.name) || undefined;
  const security = collapseSpace(loc.securityLevel);
  const category = security && security.toLowerCase() !== "n/a" ? security : undefined;
  const privateFacility = (loc.privateFacl || "").toLowerCase() === "t";

  return {
    officialName,
    address,
    postcode,
    phone,
    email,
    operator: privateFacility ? "Privately managed (BOP contract)" : "Federal Bureau of Prisons",
    category,
    withdrawn: false,
  };
}
