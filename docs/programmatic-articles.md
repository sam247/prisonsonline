# Programmatic (dataset-backed) articles

## Overview

Manual editorial articles live in [`src/data/articles.ts`](../src/data/articles.ts). **Generated articles** are derived at build time from the merged prison list and the same UK hub/collection rules as programmatic listing pages. They are merged in [`src/data/articles.merge.ts`](../src/data/articles.merge.ts) and served on the **same routes** as manual articles: `/articles/[slug]`.

## Source modules

| Piece | Location |
|-------|-----------|
| Merge + collision assert | [`src/data/articles.merge.ts`](../src/data/articles.merge.ts) |
| Generation (UK) | [`src/lib/programmatic/articles/buildGeneratedArticles.ts`](../src/lib/programmatic/articles/buildGeneratedArticles.ts) |
| Generation (US federal) | [`src/lib/programmatic/articles/buildUsGeneratedArticles.ts`](../src/lib/programmatic/articles/buildUsGeneratedArticles.ts) |
| US federal hubs (thresholds) | [`src/lib/programmatic/usFederalHubs.ts`](../src/lib/programmatic/usFederalHubs.ts) |
| Copy templates | [`src/lib/programmatic/articles/copyTemplates.ts`](../src/lib/programmatic/articles/copyTemplates.ts) |
| Slug builders + hub pairing | [`src/lib/programmatic/articles/slugRules.ts`](../src/lib/programmatic/articles/slugRules.ts) |
| “Read more” on hubs | [`src/lib/programmatic/articles/readMoreArticle.ts`](../src/lib/programmatic/articles/readMoreArticle.ts) |
| Types | [`src/types/siteArticle.ts`](../src/types/siteArticle.ts) |

## Slug rules

All generated slugs use the `ew-` prefix to avoid clashing with manual slugs:

- `ew-directory-region-{regionSlug}`
- `ew-directory-operator-{operatorSlug}`
- `ew-directory-category-{categorySlug}`
- `ew-directory-collection-{collectionSlug}`
- `ew-explainer-{key}` (fixed keys for explainer family)

`assertNoSlugCollisions` runs on startup: generated slugs must not appear in `articles[].slug`. Combined UK + US generated slugs must also be unique (`assertGeneratedArticlesUnique` in the merge module).

### US federal (BOP import) slugs

- `ew-us-state-{regionSlug}` — directory note for federal sites in that state (≥3 sites).
- `ew-us-federal-state-{regionSlug}` — companion article emphasising federal-only scope.
- `ew-us-facility-type-{typeSlug}` — “what is a …” note per facility type with ≥3 sites (pairs with `/prisons/us/facility-type/{typeSlug}`).

## Thresholds and families (phase 1)

| Family | Rule |
|--------|------|
| **UK region** | `getPrisonsByRegion('uk', regionSlug).length >= MIN_UK_HUB_GROUP_SIZE` (3); skip unknown/empty region names. |
| **UK operator** | One article per `listUkOperatorHubSlugs()` entry (already ≥3 prisons). |
| **UK security** | One article per `listUkSecurityHubSlugs()` entry. |
| **UK collection** | One article per `UkCollectionSlug` with **non-empty** `getPrisonsForUkCollection(slug)`. |
| **Explainers** | Fixed small set (5 keys) filled only with aggregates and dataset-safe wording. |

We **do not** mirror every `listUkFunctionHubSlugs()` entry in phase 1 (avoids hundreds of thin pages).

| US family | Rule |
|-----------|------|
| **State pair** | For each US `regionSlug` with `≥ MIN_US_STATE_ARTICLE` (3) federal sites: two articles (state + federal-state). |
| **Facility type explainer** | One per `listUsFacilityTypeHubSlugs()` entry (`≥ MIN_US_FACILITY_TYPE_HUB`, 3). |

## Queries and reverse links

- **`allArticles` / `getSiteArticle`** — use these for listing, sitemap, and detail resolution.
- **`getRelatedArticlesForPrison`** — scans `allArticles` where `relatedPrisons` includes the prison slug. Generated directory articles include **every** prison in the group (not a capped subset), so profiles link back correctly. The UI on the prison profile caps how many titles are shown (`RELATED_ARTICLES_FOR_PRISON_CAP` in [`src/lib/queries/index.ts`](../src/lib/queries/index.ts)).
- **Article detail** caps **prison cards** at 24; overflow links to the primary hub URL in `hubLinks[0]` when present.

## Internal linking

- Generated articles include `hubLinks` to the matching region browse URL, operator/category/collection hub, or `/prisons/uk` for explainers.
- Operator, category, and collection hub pages show an optional **directory article** link when the paired slug exists (`readMoreArticle.ts`).

## SEO

- Metadata uses manual `excerpt` or generated `description`.
- Sitemap emits all `allArticles` slugs.
- Article detail includes `BreadcrumbList` and `Article` JSON-LD.

## Extending

1. Add a new **family** in `buildGeneratedArticles.ts` (respect thresholds).
2. Add **copy** in `copyTemplates.ts` (keep factual caveats).
3. Add **slug builder** in `slugRules.ts` and extend `assignRelatedArticleSlugs` if needed.
4. Wire **hub read-more** if a new hub type gains a 1:1 article.
5. Run `npm run build` — collision assert and TypeScript must pass.

Probation centres and HMCTS are **out of scope** for this article layer until product explicitly adds them.
