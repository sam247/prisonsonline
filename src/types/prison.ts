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

export type PrisonDataProvenance = "hmpps_import" | "manual" | "bop_import" | "official_source";

export type PrisonStatus = "open" | "closed" | "historic";
export type JurisdictionLevel = "federal" | "provincial" | "territorial" | "territory" | "state" | "national";

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
  /** Geographic evidence; coordinates are never a promise of an exact entrance. */
  coordinateEvidence?: {
    precision: "facility" | "postcode" | "legacy";
    source: string;
    checkedAt?: string;
    address?: string;
    postcode?: string;
    city?: string;
    stateCode?: string;
    facilityType?: string;
  };
  /** Omitted means open (UK/US imports). Closed facilities are labelled and excluded from sitemaps. */
  status?: PrisonStatus;
  statusSource?: string;
  /** Qualifier from the official source, e.g. "Temporarily closed". Status stays closed. */
  statusNote?: string;
  /** Official population/role description where the source gives one instead of a facility type. */
  facilityDescription?: string;
  /** Official management area (South Africa DCS). */
  managementArea?: string;
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

  /** International official-source rows (ca, au, nz, ie, za). */
  jurisdiction?: string;
  jurisdictionLevel?: JurisdictionLevel;
  operatorType?: "public" | "private";
  /** Official page the row was confirmed against. */
  sourceUrl?: string;
  additionalSourceUrls?: string[];
  sourceCheckedAt?: string;
  /** Security classification as worded by the official source, when it does not map onto SecurityLevel. */
  securityDescription?: string;
}
