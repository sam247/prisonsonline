export type FacilityFactField =
  | "address"
  | "postcode"
  | "phone"
  | "email"
  | "operator"
  | "category"
  | "legalVisits";

export interface FacilitySource {
  id: string;
  name: string;
  url: string;
  /** Date this source was actually opened and compared with the displayed facts. */
  checkedAt: string;
  /** Source publisher's own update date, when the page exposes one. */
  sourceModifiedAt?: string;
}

export type FacilityFieldSources = Partial<Record<FacilityFactField, readonly string[]>>;

export interface FacilityFactOverrides {
  address?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  operator?: string;
  category?: string;
}

export interface LegalVisitContact {
  label: string;
  email?: string;
  phone?: string;
  schedule?: string[];
  sourceId: string;
}

export interface LegalVisitDetails {
  summary: string;
  contacts: LegalVisitContact[];
}

export interface FacilityVerificationRecord {
  countrySlug: string;
  prisonSlug: string;
  sources: FacilitySource[];
  fieldSources: FacilityFieldSources;
  overrides?: FacilityFactOverrides;
  legalVisits?: LegalVisitDetails;
}
