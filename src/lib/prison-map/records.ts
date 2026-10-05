import { prisons } from "@/data/prisons";
import { getFacilityVerification } from "@/data/facilitySources";
import { prisonCoordsGenerated, type PrisonCoordOverlay } from "@/data/generated/prisonCoords.generated";
import { publishedFacts } from "@/lib/verification/publishedFacts";
import type { Prison } from "@/types/prison";
import { postcodeCoordinateMatches } from "./postcode-cache.mjs";
import { bopLocationConflicts, validCoordinates, type MapRecord } from "./location";

export function projectMapRecord(prison: Prison, overlay?: PrisonCoordOverlay): MapRecord {
  const facts = publishedFacts(prison, getFacilityVerification(prison.countrySlug, prison.slug));
  const country = prison.countrySlug === "uk" ? "uk" : "us";
  const evidence = prison.coordinateEvidence;
  const reentryOffice = evidence?.facilityType?.toUpperCase() === "RRM" || /-(ccm|rrm)$/.test(prison.slug);
  let latitude = prison.latitude;
  let longitude = prison.longitude;
  let precision = evidence?.precision ?? (prison.dataProvenance === "manual" ? "legacy" : undefined);
  let exclusion: string | undefined;
  if (country === "uk") {
    if (validCoordinates(latitude, longitude, country) && precision === "facility") {
      // Authoritative facility locations can replace postcode locations in the same model.
    } else if (postcodeCoordinateMatches(overlay, facts.postcode)) {
      latitude = overlay!.latitude;
      longitude = overlay!.longitude;
      precision = "postcode";
    } else {
      exclusion = overlay ? "Postcode changed since coordinates were resolved" : "No postcode coordinates available";
    }
  } else if (prison.dataProvenance === "bop_import") {
    if (!evidence || evidence.precision !== "facility") exclusion = "No verified BOP coordinates available";
    else {
      const conflicts = bopLocationConflicts({ ...prison, address: facts.address, postcode: facts.postcode }, {
        address: evidence.address ?? "", zipCode: evidence.postcode ?? "", city: evidence.city ?? "", state: evidence.stateCode ?? "",
      });
      if (conflicts.length) exclusion = `Coordinate evidence conflicts: ${conflicts.join(", ")}`;
    }
  }
  if (!exclusion && !validCoordinates(latitude, longitude, country)) exclusion = "Missing or invalid coordinates";
  if (!exclusion && !precision) exclusion = "Coordinate provenance unavailable";
  if (!facts.address && country === "uk") exclusion = "Missing address and postcode";
  return {
    id: `${prison.countrySlug}/${prison.slug}`, name: prison.name.trim() || "Unnamed establishment", country,
    href: `/prisons/${prison.countrySlug}/${prison.slug}`, city: prison.city,
    // Never present UK administrative/management groups as geographic regions.
    state: country === "us" ? (prison.sourceRaw?.state === "RQ" ? "Puerto Rico" : prison.stateOrRegion) : "",
    type: reentryOffice ? "Reentry management office" : prison.predominantFunction ?? prison.type,
    status: prison.status, reentryOffice, exclusion,
    ...(!exclusion ? { latitude, longitude, precision } : {}),
  };
}

export function getPrisonMapRecords(): MapRecord[] {
  const overlay = new Map(prisonCoordsGenerated.map(p => [p.slug, p]));
  return prisons.filter(p => ["uk", "us", "united-states"].includes(p.countrySlug))
    .map(p => projectMapRecord(p, p.countrySlug === "uk" ? overlay.get(p.slug) : undefined));
}
