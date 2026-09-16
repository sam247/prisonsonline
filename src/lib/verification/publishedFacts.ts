import type { FacilityVerificationRecord } from "@/types/facilitySource";
import type { PrisonVerificationInput, PublishedFacts } from "./types";

export function publishedFacts(
  prison: PrisonVerificationInput,
  verification?: FacilityVerificationRecord,
): PublishedFacts {
  const overrides = verification?.overrides;
  return {
    name: prison.name,
    address: overrides?.address ?? prison.address,
    postcode: overrides?.postcode ?? prison.postcode,
    phone: overrides?.phone ?? prison.phone,
    email: overrides?.email,
    operator: overrides?.operator ?? prison.operator,
    category: overrides?.category ?? prison.securityLevel,
  };
}
