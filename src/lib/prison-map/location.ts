import type { Prison } from "@/types/prison";
import type { BopLocation } from "@/lib/verification/bopClient";
import { addressesEquivalent, collapseSpace, usZipsEqual } from "@/lib/verification/normalize";

export type MapCountry = "uk" | "us";

export function validCoordinates(latitude: unknown, longitude: unknown, country: MapCountry): boolean {
  if (typeof latitude !== "number" || typeof longitude !== "number" || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  // UK inventory is England/Wales; US bounds also cover Alaska, Hawaii and Puerto Rico.
  return country === "uk"
    ? latitude >= 49 && latitude <= 61 && longitude >= -9 && longitude <= 3
    : latitude >= 18 && latitude <= 72 && longitude >= -180 && longitude <= -64;
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
  country: MapCountry;
  href: string;
  city: string;
  state: string;
  type: string;
  status?: "historic";
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
