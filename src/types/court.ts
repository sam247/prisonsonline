export type CourtMatchStatus = "exact" | "strong" | "unmatched" | "ambiguous";

/**
 * Enriched UK court directory record (HMCTS snapshot + optional FaCT/OGL enrichment).
 */
export interface Court {
  institutionalId: string;
  slug: string;
  name: string;
  address?: string;
  postcode?: string;
  town?: string;
  courtRegion?: string;
  /** MDS jurisdiction label from HMCTS snapshot (e.g. Crown, Magistrates). */
  jurisdiction?: string;
  /** Reserved type-hub slugs this court belongs to (may be multiple). */
  hubSlugs: string[];
  matchStatus: CourtMatchStatus;
  matchReason?: string;
  sources: string[];
  factSlug?: string;
  officialUrl?: string;
  isClosed: boolean;
  factTypes?: string[];
  areasOfLaw?: string[];
  dxNumber?: string;
  latitude?: number;
  longitude?: number;
  indexable: boolean;
  indexReason?: string;
}

export type CourtTypeHubSlug =
  | "crown-courts"
  | "magistrates-courts"
  | "county-courts"
  | "combined-courts"
  | "tribunals";
