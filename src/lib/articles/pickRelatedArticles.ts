import type { SiteArticle } from "@/types/siteArticle";
import { isGeneratedArticle } from "@/types/siteArticle";

const DEFAULT_LIMIT = 5;

/**
 * Prefer same listing category, then same generated kind, then fill from the rest.
 */
export function pickMoreArticles(
  current: SiteArticle,
  all: SiteArticle[],
  limit = DEFAULT_LIMIT,
): SiteArticle[] {
  const rest = all.filter((a) => a.slug !== current.slug);
  const out: SiteArticle[] = [];
  const used = new Set<string>();

  const take = (candidates: SiteArticle[]) => {
    for (const a of candidates) {
      if (out.length >= limit) return;
      if (used.has(a.slug)) continue;
      used.add(a.slug);
      out.push(a);
    }
  };

  take(rest.filter((a) => a.category === current.category));

  if (isGeneratedArticle(current)) {
    take(
      rest.filter(
        (a) =>
          isGeneratedArticle(a) &&
          a.articleKind === current.articleKind &&
          a.slug !== current.slug,
      ),
    );
  }

  take(rest);
  return out.slice(0, limit);
}
