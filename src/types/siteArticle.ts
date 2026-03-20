import type { Article } from "@/data/articles";
import type { UkCollectionSlug } from "@/lib/programmatic/collections";

export type ArticleSourceType = "manual" | "generated";

export type GeneratedArticleKind =
  | "uk_region"
  | "uk_operator"
  | "uk_security"
  | "uk_collection"
  | "uk_explainer"
  | "us_state"
  | "us_federal_state"
  | "us_facility_type_explainer";

export interface GeneratedHubLink {
  label: string;
  href: string;
}

export interface GeneratedArticleBodySection {
  id: string;
  heading?: string;
  paragraphs: string[];
}

export interface GeneratedArticleFaq {
  question: string;
  answer: string;
}

export interface GeneratedArticle {
  id: string;
  slug: string;
  title: string;
  /** Meta description / listing excerpt */
  description: string;
  intro: string;
  bodySections: GeneratedArticleBodySection[];
  countrySlug: "uk" | "us";
  articleKind: GeneratedArticleKind;
  /** Listing filter bucket */
  category: string;
  date: string;
  /** Every prison in this article’s grouping (for reverse links); UI may cap display. */
  relatedPrisons: string[];
  relatedGuides: string[];
  relatedArticleSlugs: string[];
  relatedCollections: UkCollectionSlug[];
  hubLinks: GeneratedHubLink[];
  faqs?: GeneratedArticleFaq[];
  sourceType: "generated";
  regionSlug?: string;
  operatorSlug?: string;
  categorySlug?: string;
  collectionSlug?: UkCollectionSlug;
  explainerKey?: string;
  /** US federal facility-type hub slug (e.g. fci, usp). */
  facilityTypeSlug?: string;
}

export type ManualSiteArticle = Article & { sourceType: "manual" };

export type SiteArticle = ManualSiteArticle | GeneratedArticle;

export function isGeneratedArticle(a: SiteArticle): a is GeneratedArticle {
  return a.sourceType === "generated";
}

export function isManualSiteArticle(a: SiteArticle): a is ManualSiteArticle {
  return a.sourceType === "manual";
}
