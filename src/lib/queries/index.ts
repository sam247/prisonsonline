export {
  prisons,
  getPrison,
  getPrisonByCountryAndSlug,
  getPrisonsByCountry,
  getPrisonsByRegion,
  getRegionsByCountry,
  getRelatedPrisons,
  searchPrisons,
  securityLevels,
  countries,
  getCountrySlug,
} from "@/data/prisons";

export { getCountry, countriesData } from "@/data/countries";
export { articles, getArticle, articleCategories } from "@/data/articles";
export {
  allArticles,
  getSiteArticle,
  generatedArticles,
  getMergedArticleCategories,
} from "@/data/articles.merge";

import { getPrison } from "@/data/prisons";
import { getGuide, guides } from "@/data/guides";
import { allArticles } from "@/data/articles.merge";
import { probationCentresGenerated } from "@/data/generated/probationCentres.generated";
import { hmctsSitesGenerated } from "@/data/generated/hmctsSites.generated";
import type { Guide } from "@/data/guides";
import type { Prison } from "@/types/prison";
import type { ProbationCentre, HmctsSite } from "@/types/institutional";
import type { SiteArticle } from "@/types/siteArticle";

export { guides, getGuide };

export const probationCentres: ProbationCentre[] = probationCentresGenerated;
export const hmctsSites: HmctsSite[] = hmctsSitesGenerated;

export function getProbationCentreBySlug(slug: string): ProbationCentre | undefined {
  return probationCentresGenerated.find((c) => c.slug === slug);
}

export function getHmctsSiteBySlug(slug: string): HmctsSite | undefined {
  return hmctsSitesGenerated.find((s) => s.slug === slug);
}

export const getPrisonBySlug = getPrison;

export function getRelatedPrisonsForArticle(article: SiteArticle) {
  return article.relatedPrisons.map((slug) => getPrison(slug)).filter(Boolean) as Prison[];
}

export function getRelatedGuidesForArticle(article: SiteArticle) {
  return article.relatedGuides.map((slug) => getGuide(slug)).filter(Boolean) as Guide[];
}

const RELATED_ARTICLES_FOR_PRISON_CAP = 18;

export function getRelatedArticlesForPrison(prison: Prison): SiteArticle[] {
  const matched = allArticles.filter((a) => a.relatedPrisons.includes(prison.slug));
  const manual = matched.filter((a) => a.sourceType === "manual");
  const generated = matched.filter((a) => a.sourceType === "generated");
  return [...manual, ...generated].slice(0, RELATED_ARTICLES_FOR_PRISON_CAP);
}

export function getRelatedGuidesForPrison(prison: Prison): Guide[] {
  const slugs = new Set<string>();
  for (const a of allArticles) {
    if (!a.relatedPrisons.includes(prison.slug)) continue;
    for (const g of a.relatedGuides) slugs.add(g);
  }
  return Array.from(slugs)
    .map((slug) => getGuide(slug))
    .filter(Boolean) as Guide[];
}

export function getRelatedGuidesFallback(limit = 3) {
  return guides.slice(0, limit);
}

export { getRelatedPrisonsForProfile } from "@/lib/queries/relatedPrisons";
