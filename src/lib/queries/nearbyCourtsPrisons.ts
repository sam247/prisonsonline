import { prisons } from "@/data/prisons";
import { prisonCoordsGenerated } from "@/data/generated/prisonCoords.generated";
import { getIndexableCourts, courtHasReliableCoords } from "@/lib/queries/courts";
import type { Court } from "@/types/court";

const EARTH_RADIUS_MILES = 3958.7613;
export const NEARBY_DISCLAIMER =
  "Nearby locations are shown by geographic distance only and do not indicate an operational relationship.";

export type NearbyPlace = {
  slug: string;
  name: string;
  href: string;
  distanceMiles: number;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(a)));
}

const prisonCoordBySlug = new Map(prisonCoordsGenerated.map((p) => [p.slug, p]));

export function getPrisonOverlayCoords(slug: string): { latitude: number; longitude: number } | null {
  const row = prisonCoordBySlug.get(slug);
  if (!row) return null;
  if (!Number.isFinite(row.latitude) || !Number.isFinite(row.longitude)) return null;
  if (row.latitude === 0 && row.longitude === 0) return null;
  return { latitude: row.latitude, longitude: row.longitude };
}

export function getNearbyPrisonsForCourt(court: Court, limit = 3): NearbyPlace[] {
  if (!courtHasReliableCoords(court)) return [];
  const lat = court.latitude as number;
  const lon = court.longitude as number;

  const scored: NearbyPlace[] = [];
  for (const prison of prisons) {
    if (prison.countrySlug !== "uk") continue;
    const coords = getPrisonOverlayCoords(prison.slug);
    if (!coords) continue;
    const distanceMiles = haversineMiles(lat, lon, coords.latitude, coords.longitude);
    scored.push({
      slug: prison.slug,
      name: prison.name,
      href: `/prisons/${prison.countrySlug}/${prison.slug}`,
      distanceMiles,
    });
  }
  return scored.sort((a, b) => a.distanceMiles - b.distanceMiles).slice(0, limit);
}

export function getNearbyCourtsForPrison(prisonSlug: string, countrySlug: string, limit = 3): NearbyPlace[] {
  if (countrySlug !== "uk") return [];
  const coords = getPrisonOverlayCoords(prisonSlug);
  if (!coords) return [];

  const scored: NearbyPlace[] = [];
  for (const court of getIndexableCourts()) {
    if (!courtHasReliableCoords(court)) continue;
    const distanceMiles = haversineMiles(
      coords.latitude,
      coords.longitude,
      court.latitude as number,
      court.longitude as number,
    );
    scored.push({
      slug: court.slug,
      name: court.name,
      href: `/courts/${court.slug}`,
      distanceMiles,
    });
  }
  return scored.sort((a, b) => a.distanceMiles - b.distanceMiles).slice(0, limit);
}

export function formatDistanceMiles(miles: number): string {
  if (miles < 10) return `${miles.toFixed(1)} miles`;
  return `${Math.round(miles)} miles`;
}
