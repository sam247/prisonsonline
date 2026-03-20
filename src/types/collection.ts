/**
 * Programmatic collection metadata for filter-based hub pages.
 */
export type ProgrammaticCollectionKind =
  | "operator"
  | "gender"
  | "security"
  | "function"
  | "region"
  | "subgroup"
  | "custom_allowlist";

export interface ProgrammaticCollection {
  kind: ProgrammaticCollectionKind;
  /** URL segments after /prisons/uk/collection/ */
  slug: string;
  title: string;
  subtitle?: string;
  /** Short body copy shown above the grid (plain text). */
  intro?: string;
  /** Label for JSON-LD / analytics; defaults to title when omitted. */
  breadcrumbLabel?: string;
  metaDescription: string;
  canonicalPath: string;
  /** Sitemap priority 0–1 */
  priority: number;
}

/**
 * @deprecated Legacy placeholder types; prefer ProgrammaticCollection for new routes.
 */
export type CollectionKind =
  | "prisons_by_city"
  | "prisons_by_country"
  | "prisons_by_type"
  | "custom_filter";

export interface CollectionPageSpec {
  kind: CollectionKind;
  slug: string;
  title: string;
  metaDescription: string;
}
