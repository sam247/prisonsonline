import { courtsGenerated } from "@/data/generated/courts.generated";
import type { Court, CourtTypeHubSlug } from "@/types/court";

export const COURT_TYPE_HUBS: Array<{
  slug: CourtTypeHubSlug;
  label: string;
  description: string;
}> = [
  {
    slug: "crown-courts",
    label: "Crown Courts",
    description: "Crown Court centres in England and Wales from the current directory dataset.",
  },
  {
    slug: "magistrates-courts",
    label: "Magistrates' Courts",
    description: "Magistrates' Court locations in England and Wales from the current directory dataset.",
  },
  {
    slug: "county-courts",
    label: "County Courts",
    description: "County Court locations in England and Wales from the current directory dataset.",
  },
  {
    slug: "combined-courts",
    label: "Combined Courts",
    description: "Combined court centres in England and Wales from the current directory dataset.",
  },
  {
    slug: "tribunals",
    label: "Tribunals",
    description: "Tribunal hearing venues in the current HMCTS-derived directory dataset.",
  },
];

const RESERVED_HUB_SLUGS = new Set(COURT_TYPE_HUBS.map((h) => h.slug));

export function isCourtTypeHubSlug(slug: string): slug is CourtTypeHubSlug {
  return RESERVED_HUB_SLUGS.has(slug as CourtTypeHubSlug);
}

export function getAllCourts(): Court[] {
  return courtsGenerated;
}

export function getIndexableCourts(): Court[] {
  return courtsGenerated.filter((c) => c.indexable);
}

export function getCourtBySlug(slug: string): Court | undefined {
  return courtsGenerated.find((c) => c.slug === slug);
}

export function getCourtTypeHub(slug: string) {
  return COURT_TYPE_HUBS.find((h) => h.slug === slug);
}

export function getCourtsForTypeHub(hubSlug: CourtTypeHubSlug): Court[] {
  return getIndexableCourts()
    .filter((c) => c.hubSlugs.includes(hubSlug))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listCourtTypeHubSummaries() {
  return COURT_TYPE_HUBS.map((hub) => ({
    ...hub,
    count: getCourtsForTypeHub(hub.slug).length,
  })).filter((h) => h.count >= 3);
}

export type ResolvedCourtSlug =
  | { kind: "hub"; hub: (typeof COURT_TYPE_HUBS)[number]; courts: Court[] }
  | { kind: "court"; court: Court }
  | { kind: "not_found" };

export function resolveCourtSlug(slug: string): ResolvedCourtSlug {
  if (isCourtTypeHubSlug(slug)) {
    const hub = getCourtTypeHub(slug);
    if (!hub) return { kind: "not_found" };
    const courts = getCourtsForTypeHub(slug);
    if (courts.length < 3) return { kind: "not_found" };
    return { kind: "hub", hub, courts };
  }
  const court = getCourtBySlug(slug);
  if (!court || !court.indexable) return { kind: "not_found" };
  return { kind: "court", court };
}

export function courtJurisdictionLabel(court: Court): string | undefined {
  if (court.factTypes?.length) return court.factTypes.join(", ");
  return court.jurisdiction;
}

export function courtHasReliableCoords(court: Court): boolean {
  return (
    typeof court.latitude === "number" &&
    typeof court.longitude === "number" &&
    Number.isFinite(court.latitude) &&
    Number.isFinite(court.longitude) &&
    !(court.latitude === 0 && court.longitude === 0)
  );
}
