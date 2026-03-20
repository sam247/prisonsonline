export type InstitutionalSourceType = "hmpps_probation" | "hmcts_site";

export interface ProbationCentre {
  institutionalId: string;
  slug: string;
  name: string;
  country: string;
  countrySlug: string;
  region?: string;
  regionSlug?: string;
  address?: string;
  postcode?: string;
  phone?: string;
  buildingType?: string;
  localAuthority?: string;
  type: string;
  source: string;
  sourceType: InstitutionalSourceType;
  sourceRaw: Record<string, unknown>;
}

export interface HmctsSite {
  institutionalId: string;
  slug: string;
  name: string;
  country: string;
  countrySlug: string;
  address?: string;
  postcode?: string;
  courtRegion?: string;
  jurisdiction?: string;
  type: string;
  source: string;
  sourceType: InstitutionalSourceType;
  sourceRaw: Record<string, unknown>;
}
