import { articles } from "@/data/articles";
import { buildGeneratedArticles, assertNoSlugCollisions } from "@/lib/programmatic/articles/buildGeneratedArticles";
import { buildUsGeneratedArticles } from "@/lib/programmatic/articles/buildUsGeneratedArticles";
import type { GeneratedArticle, ManualSiteArticle, SiteArticle } from "@/types/siteArticle";

const manualSiteArticles: ManualSiteArticle[] = articles.map((a) => ({
  ...a,
  sourceType: "manual",
}));

const ukGenerated = buildGeneratedArticles();
const usGenerated = buildUsGeneratedArticles();

function assertGeneratedArticlesUnique(all: GeneratedArticle[]): void {
  const seen = new Set<string>();
  for (const g of all) {
    if (seen.has(g.slug)) throw new Error(`Duplicate generated article slug: ${g.slug}`);
    seen.add(g.slug);
  }
}

const generatedArticlesRaw: GeneratedArticle[] = [...ukGenerated, ...usGenerated];
assertGeneratedArticlesUnique(generatedArticlesRaw);
assertNoSlugCollisions(
  articles.map((a) => a.slug),
  generatedArticlesRaw,
);

/** All programmatically generated articles (derived from prison datasets). */
export const generatedArticles: GeneratedArticle[] = generatedArticlesRaw;

/** Manual editorial articles plus generated directory articles, in stable order (manual first). */
export const allArticles: SiteArticle[] = [...manualSiteArticles, ...generatedArticles];

export function getSiteArticle(slug: string): SiteArticle | undefined {
  return allArticles.find((a) => a.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  return allArticles.map((a) => a.slug);
}

/** Distinct categories for the articles listing filter (manual + generated buckets). */
export function getMergedArticleCategories(): string[] {
  return Array.from(new Set(allArticles.map((a) => a.category))).sort();
}
