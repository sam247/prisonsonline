# Guides, articles, and prison slugs

## Prison slugs

- **`Article.relatedPrisons`** and any future **`Guide.relatedPrisonSlugs`** use the **URL slug** from the merged prison list (`getPrison(slug)`), not the raw HMPPS `id`, except where they match (e.g. `hmp-belmarsh`).
- UK prisons come from the generated HMPPS import; non-UK profiles live in `src/data/prisons.legacy-international.ts`. Slugs there (e.g. `adx-florence`) must stay stable for SEO and inbound links.

## Resolvers

- **`getPrison(slug)`** — slug-only; used by articles and legacy code paths.
- **`getPrisonByCountryAndSlug(countrySlug, slug)`** — use for country-scoped URLs when you need to avoid ambiguity.
- **`getSiteArticle(slug)`** — resolves **manual + generated** articles from [`src/data/articles.merge.ts`](../src/data/articles.merge.ts). Prefer this for `/articles/[slug]`, sitemap, and merged listings.
- **`getArticle(slug)`** — manual-only (`src/data/articles.ts`); kept for backwards compatibility.
- **`getRelatedArticlesForPrison(prison)`** — scans **merged** `allArticles`; matches when `relatedPrisons` includes `prison.slug` (manual **or** generated directory articles).
- **`getRelatedGuidesForPrison(prison)`** — union of `relatedGuides` from those articles (indirect linking without editing every guide).

## Generated articles

Dataset-backed articles use slugs prefixed with `ew-` and `sourceType: "generated"`. They are built from UK prison aggregates; see [`programmatic-articles.md`](./programmatic-articles.md).

Re-run **`npm run data:build`** after changing raw JSON under `hmpps_hmcts_json/` so generated slugs stay in sync.

See also [`data-pipeline.md`](./data-pipeline.md).
