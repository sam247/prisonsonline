import type { RealFacilityImage } from "@/types/media";

/**
 * App-facing prison model. UK rows are generated from HMPPS JSON; non-UK rows are legacy manual content.
 */
export type SecurityLevel =
  | "Minimum"
  | "Low"
  | "Medium"
  | "High"
  | "Maximum"
  | "Supermax"
  | "Multi"
  | "Category A"
  | "Category B"
  | "Category C"
  | "Category D"
  | "Not specified";

export type PrisonDataProvenance = "hmpps_import" | "manual" | "bop_import";

export interface Prison {
  name: string;
  slug: string;
  country: string;
  countrySlug: string;
  stateOrRegion: string;
  regionSlug: string;
  city: string;
  securityLevel: SecurityLevel;
  /** 0 or omitted when unknown (imported data). */
  capacity: number;
  operator: string;
  /** 0 when unknown. */
  openedYear: number;
  /** 0 when unknown / not geocoded. */
  latitude: number;
  longitude: number;
  type: string;
  overview: string;
  history: string;
  prisonLife: string;
  visitingInfo: string;
  /** Verified real facility photo only; omit on import rows unless sourced. */
  facilityImage?: RealFacilityImage;
  notableInmates?: string;
  inspectionNotes?: string;

  /** Stable internal id for imports and APIs. */
  institutionalId?: string;
  dataProvenance?: PrisonDataProvenance;
  address?: string;
  postcode?: string;
  phone?: string;
  gender?: string;
  predominantFunction?: string;
  cohort?: string;
  prisonSubGroup1?: string;
  prisonSubGroup2?: string;
  shortDescription?: string;
  source?: string;
  sourceType?: string;
  /** Original record fields preserved for audit. */
  sourceRaw?: Record<string, unknown>;
  /** BOP facility type code when imported from federal listing (e.g. fci, usp). */
  facilityType?: string;
}
