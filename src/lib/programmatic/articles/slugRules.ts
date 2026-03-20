import type { UkCollectionSlug } from "@/lib/programmatic/collections";

export const GENERATED_ARTICLE_SLUG_PREFIX = "ew-";

export function slugRegionArticle(regionSlug: string): string {
  return `${GENERATED_ARTICLE_SLUG_PREFIX}directory-region-${regionSlug}`;
}

export function slugOperatorArticle(operatorSlug: string): string {
  return `${GENERATED_ARTICLE_SLUG_PREFIX}directory-operator-${operatorSlug}`;
}

export function slugSecurityArticle(categorySlug: string): string {
  return `${GENERATED_ARTICLE_SLUG_PREFIX}directory-category-${categorySlug}`;
}

export function slugCollectionArticle(collectionSlug: UkCollectionSlug): string {
  return `${GENERATED_ARTICLE_SLUG_PREFIX}directory-collection-${collectionSlug}`;
}

export function slugExplainerArticle(key: string): string {
  return `${GENERATED_ARTICLE_SLUG_PREFIX}explainer-${key}`;
}

/** Resolve hub → paired directory article slug (if that article exists). */
export function articleSlugForUkOperatorHub(operatorSlug: string): string {
  return slugOperatorArticle(operatorSlug);
}

export function articleSlugForUkSecurityHub(categorySlug: string): string {
  return slugSecurityArticle(categorySlug);
}

export function articleSlugForUkCollectionHub(collectionSlug: string): string {
  return slugCollectionArticle(collectionSlug as UkCollectionSlug);
}

export function articleSlugForUkRegionHub(regionSlug: string): string {
  return slugRegionArticle(regionSlug);
}

export function slugUsStateArticle(regionSlug: string): string {
  return `${GENERATED_ARTICLE_SLUG_PREFIX}us-state-${regionSlug}`;
}

export function slugUsFederalStateArticle(regionSlug: string): string {
  return `${GENERATED_ARTICLE_SLUG_PREFIX}us-federal-state-${regionSlug}`;
}

export function slugUsFacilityTypeExplainer(typeSlug: string): string {
  return `${GENERATED_ARTICLE_SLUG_PREFIX}us-facility-type-${typeSlug}`;
}
