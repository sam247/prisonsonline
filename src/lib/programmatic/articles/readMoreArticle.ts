import { getSiteArticle } from "@/data/articles.merge";
import {
  articleSlugForUkCollectionHub,
  articleSlugForUkOperatorHub,
  articleSlugForUkSecurityHub,
  slugUsFacilityTypeExplainer,
  slugUsStateArticle,
} from "@/lib/programmatic/articles/slugRules";

export function readMoreArticleForUkOperatorHub(operatorSlug: string): {
  href: string;
  label: string;
} | null {
  const slug = articleSlugForUkOperatorHub(operatorSlug);
  if (!getSiteArticle(slug)) return null;
  return { href: `/articles/${slug}`, label: "Directory article for this operator group" };
}

export function readMoreArticleForUkSecurityHub(categorySlug: string): {
  href: string;
  label: string;
} | null {
  const slug = articleSlugForUkSecurityHub(categorySlug);
  if (!getSiteArticle(slug)) return null;
  return { href: `/articles/${slug}`, label: "Directory article for this category band" };
}

export function readMoreArticleForUkCollectionHub(collectionSlug: string): {
  href: string;
  label: string;
} | null {
  const slug = articleSlugForUkCollectionHub(collectionSlug);
  if (!getSiteArticle(slug)) return null;
  return { href: `/articles/${slug}`, label: "Directory article for this thematic list" };
}

export function readMoreArticleForUsFacilityTypeHub(typeSlug: string): {
  href: string;
  label: string;
} | null {
  const slug = slugUsFacilityTypeExplainer(typeSlug);
  if (!getSiteArticle(slug)) return null;
  return { href: `/articles/${slug}`, label: "What this facility type means (directory note)" };
}

export function readMoreArticleForUsStateRegion(regionSlug: string): {
  href: string;
  label: string;
} | null {
  const slug = slugUsStateArticle(regionSlug);
  if (!getSiteArticle(slug)) return null;
  return { href: `/articles/${slug}`, label: "Directory article for this state listing" };
}
