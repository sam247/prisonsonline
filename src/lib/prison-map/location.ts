import type { Prison, PrisonStatus } from "@/types/prison";
import type { BopLocation } from "@/lib/verification/bopClient";
import { addressesEquivalent, collapseSpace, usZipsEqual } from "@/lib/verification/normalize";

export type MapCountry = "uk" | "us" | "ca" | "au";

export type MapCountryConfig = {
  label: string;
  /** Label for the region filter; omitted where the map offers no region filter (UK). */
  regionLabel?: string;
  regionAllLabel?: string;
  center: [number, number];
  zoom: number;
  /** Inclusive [minLat, maxLat, minLng, maxLng] sanity bounds for plotted coordinates. */
  bounds: [number, number, number, number];
};

/** Display order is the key order. */
export const MAP_COUNTRIES: Record<MapCountry, MapCountryConfig> = {
  // UK inventory is England/Wales; US bounds also cover Alaska, Hawaii and Puerto Rico.
  uk: { label: "United Kingdom", center: [54, -2], zoom: 6, bounds: [49, 61, -9, 3] },
  us: { label: "United States", regionLabel: "State or territory", regionAllLabel: "All states and territories", center: [38, -98], zoom: 4, bounds: [18, 72, -180, -64] },
  ca: { label: "Canada", regionLabel: "Province or territory", regionAllLabel: "All provinces and territories", center: [56, -96], zoom: 3, bounds: [41.6, 83.2, -141.1, -52.5] },
  au: { label: "Australia", regionLabel: "State or territory", regionAllLabel: "All states and territories", center: [-27, 134], zoom: 4, bounds: [-44, -9, 112, 154] },
};

export const MAP_COUNTRY_ORDER = Object.keys(MAP_COUNTRIES) as MapCountry[];

/**
 * Explicit countrySlug → map country. Unknown countries return null and must be
 * excluded from the map; never default to "us".
 */
export function mapCountryForSlug(countrySlug: string): MapCountry | null {
  if (countrySlug === "uk") return "uk";
  if (countrySlug === "us" || countrySlug === "united-states") return "us";
  if (countrySlug === "ca") return "ca";
  if (countrySlug === "au") return "au";
  return null;
}

export function validCoordinates(latitude: unknown, longitude: unknown, country: MapCountry): boolean {
  if (typeof latitude !== "number" || typeof longitude !== "number" || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  const [minLat, maxLat, minLng, maxLng] = MAP_COUNTRIES[country].bounds;
  return latitude >= minLat && latitude <= maxLat && longitude >= minLng && longitude <= maxLng;
}

export function bopLocationConflicts(
  prison: Pick<Prison, "address" | "postcode" | "city" | "sourceRaw">,
  location: Pick<BopLocation, "address" | "zipCode" | "city" | "state">,
): string[] {
  const conflicts: string[] = [];
  if (!addressesEquivalent(prison.address, location.address)) conflicts.push("address mismatch");
  const currentNumber = prison.address?.match(/^\s*(\d+)\b/)?.[1];
  const officialNumber = location.address.match(/^\s*(\d+)\b/)?.[1];
  if (currentNumber && officialNumber && currentNumber !== officialNumber && !conflicts.includes("address mismatch")) conflicts.push("street number mismatch");
  if (!usZipsEqual(prison.postcode, location.zipCode)) conflicts.push("ZIP mismatch");
  if (collapseSpace(prison.city).toLowerCase() !== collapseSpace(location.city).toLowerCase()) conflicts.push("city mismatch");
  // RQ is the historical source code for Puerto Rico; report it during refresh.
  const state = String(prison.sourceRaw?.state ?? "").toUpperCase();
  if ((state === "RQ" ? "PR" : state) !== location.state.toUpperCase()) conflicts.push("state mismatch");
  return conflicts;
}

export type MapRecord = {
  id: string;
  name: string;
  /** null when the prison's country has no map support; such records always carry an exclusion. */
  country: MapCountry | null;
  href: string;
  city: string;
  state: string;
  type: string;
  status?: PrisonStatus;
  latitude?: number;
  longitude?: number;
  precision?: "facility" | "postcode" | "legacy";
  reentryOffice: boolean;
  exclusion?: string;
};

export type MapFilters = { country: MapCountry; query: string; state: string; reentryOffices: boolean };
export function filterMapRecords(records: MapRecord[], filters: MapFilters): MapRecord[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return records.filter(p => p.country === filters.country && (!p.reentryOffice || filters.reentryOffices)
    && (!filters.state || p.state === filters.state)
    && (!query || `${p.name} ${p.city} ${p.state}`.toLocaleLowerCase().includes(query)));
}
