import type { FacilityFactOverrides } from "@/types/facilitySource";
import type { FieldDiff, OverlayEntry, OverlayFile } from "./types";
import { isSafeAutoField } from "./compare";
import { isoNow } from "./normalize";
import { isUkPrison, isUsPrison } from "./selectPrison";

export interface OverlayStore {
  read(): OverlayFile;
  write(file: OverlayFile): void;
}

export function emptyOverlay(): OverlayFile {
  return { generatedBy: "uk-prison-verifier", updatedAt: "", entries: {} };
}

export function overlayKey(countrySlug: string, prisonSlug: string): string {
  return `${countrySlug}/${prisonSlug}`;
}

/** Both the CLI --write flag and UK_PRISON_VERIFIER_WRITE=1 are required. Default is off. */
export function productionWritesEnabled(input: {
  writeFlag?: boolean;
  env?: Record<string, string | undefined>;
}): boolean {
  return Boolean(input.writeFlag) && input.env?.UK_PRISON_VERIFIER_WRITE === "1";
}

/**
 * Production prison mutations go only to the facility overlay (existing
 * FacilityFactOverrides path). HMPPS JSON, generated prison modules, prose,
 * titles, slugs, and US records are never written here.
 */
export function applySafeAutoChanges(input: {
  countrySlug: string;
  prisonSlug: string;
  sourceUrl: string;
  fields: FieldDiff[];
  writesEnabled: boolean;
  now: Date;
  store: OverlayStore;
}): { applied: FieldDiff[]; overlayWritten: boolean } {
  if (!input.writesEnabled) return { applied: [], overlayWritten: false };
  if (isUsPrison({ countrySlug: input.countrySlug }) || !isUkPrison({ countrySlug: input.countrySlug })) {
    return { applied: [], overlayWritten: false };
  }

  const safe = input.fields.filter(
    (field) => field.classification === "SAFE_AUTO_CHANGE" && isSafeAutoField(field.field) && field.officialValue,
  );
  if (safe.length === 0) return { applied: [], overlayWritten: false };

  const overrides: FacilityFactOverrides = {};
  for (const field of safe) {
    if (field.field === "phone") overrides.phone = field.officialValue;
    if (field.field === "postcode") overrides.postcode = field.officialValue;
    if (field.field === "email") overrides.email = field.officialValue;
  }
  if (Object.keys(overrides).length === 0) return { applied: [], overlayWritten: false };

  const current = input.store.read() ?? emptyOverlay();
  const key = overlayKey("uk", input.prisonSlug);
  const previous = current.entries[key];
  const entry: OverlayEntry = {
    prisonSlug: input.prisonSlug,
    countrySlug: "uk",
    appliedAt: isoNow(input.now),
    sourceUrl: input.sourceUrl,
    overrides: { ...previous?.overrides, ...overrides },
  };
  current.entries[key] = entry;
  current.updatedAt = entry.appliedAt;
  input.store.write(current);
  return { applied: safe, overlayWritten: true };
}
