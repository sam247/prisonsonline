# Prisons Online (Next.js)

Next.js 14 **App Router** site: Lovable/Vite parity from [`../global-prison-insights`](../global-prison-insights), extended with an **HMPPS/HMCTS data pipeline**, **UK programmatic hubs**, and **template upgrades** for reference-style prison pages.

**Quick source note:** see [SOURCE.md](./SOURCE.md) — `LOVABLE_BUILD/` in this repo is **unrelated** (different product). Do not use it as the prison site reference.

---

## 1. Purpose for external agents / strategists

This README summarises **what is implemented**, **constraints**, **nuances**, and **where to change things** so you can plan SEO, content, product, or engineering work without rediscovering the codebase.

| If you need… | Start here |
|--------------|------------|
| Raw data rules, merge, security mapping | [docs/data-pipeline.md](./docs/data-pipeline.md) |
| Article ↔ prison slug conventions | [docs/guides-articles-linking.md](./docs/guides-articles-linking.md) |
| Dataset-backed (programmatic) articles | [docs/programmatic-articles.md](./docs/programmatic-articles.md) |
| Regenerating UK/probation/HMCTS TS from JSON | `npm run data:build` → `scripts/build-institutional-data.mjs` |
| Regenerating US federal prisons TS | `npm run data:build:us` → `scripts/build-us-prisons.mjs` (`us_prisons_clean_bundle/us_prisons_clean.json`) |
| Public URL inventory | §4 Routes below + `src/app/sitemap.ts` |

---

## 2. Tech stack

- **Next.js 14.2** (App Router), **React 18**, **TypeScript**, **Tailwind**, **shadcn-style UI** under `src/components/ui/`.
- **Static / SSG** for prison, guide, article, and UK hub routes (`generateStaticParams` where applicable).
- **`tsconfig`** scopes compilation to `src/` so stray folders (e.g. `LOVABLE_BUILD/`) do not break the build.
- **Env:** `NEXT_PUBLIC_SITE_URL` (no trailing slash) for canonical URLs and sitemap base — copy from `.env.example` to `.env.local`.

---

## 3. Data architecture (critical)

### 3.1 Flow

```text
hmpps_hmcts_json/*.json  →  scripts/build-institutional-data.mjs  →  src/data/generated/*.ts
                                                                    ↘
prisons.legacy-international.ts (US manual)  →  src/data/prisons.ts merges UK generated + legacy
```

- **Raw JSON is never edited by the app**; regeneration overwrites generated modules.
- **`prebuild`** runs `data:build` then **`data:build:us`** before `next build`, so generated UK and US prison modules stay in sync with the JSON sources.

### 3.2 Raw files (`hmpps_hmcts_json/`)

| File | Records (typical) | Use |
|------|-------------------|-----|
| `hmpps_prisons_only.json` | 123 | **Authoritative UK prisons** → `ukPrisons.generated.ts` |
| `hmpps_probation_centres.json` | 311 | Generated `probationCentres.generated.ts` — **queriable, no public routes** |
| `hmcts_sites.json` | 332 | Generated `hmctsSites.generated.ts` — **queriable, no public routes** |
| `hmpps_sites_map.json` | 766 | **Validation only** (count vs 123+311+332); not rendered |

### 3.3 Merged prison list (`src/data/prisons.ts`)

- **`prisons`** = `[...ukPrisonsGenerated, ...legacyInternationalPrisons]`.
- **UK:** all from import (synthesised narrative fields where JSON has none).
- **Non-UK:** hand-maintained in `src/data/prisons.legacy-international.ts` so article slugs like `adx-florence` stay stable.

**Important nuance — two slug lookups:**

- **`getPrison(slug)`** — slug-only, **first match** (used by articles / `relatedPrisons` arrays). Works because UK and US slugs do not collide in practice.
- **`getPrisonByCountryAndSlug(countrySlug, slug)`** — canonical for **`/prisons/[country]/[slug]`**.

### 3.4 Controlled imagery

- **`facilityImage`** on `Prison` (`RealFacilityImage` in `src/types/media.ts`): use only for **sourced, named-facility** photography. Omit on import rows unless rights are explicit. Profiles otherwise show a factual **fallback** (no generic “fake” facility photo).
- **Editorial** thumbnails and hub banners use `EditorialImage` plus **`src/lib/media/resolvers.ts`** (and optional `coverImage` on guides, articles, countries). **`PrisonCard`** shows an image only when `facilityImage.type === "real"`.

### 3.5 Inferred vs missing fields (UK import)

- **`securityLevel`** is **inferred** from HMPPS text (predominant function, cohort, operator) — not a direct MOJ category field. See mapping table in [docs/data-pipeline.md](./docs/data-pipeline.md).
- **Capacity / opened year / coordinates** are usually **absent** in source; UI uses **0** or “Not listed” and honest copy where needed.
- **Long copy** (overview, history, prison life, visiting) is **generated boilerplate** in the build script from parsed fields + `Information` line — not independent editorial.

---

## 4. Routes (public)

**Core (Lovable parity + fix)**

| Path | Behaviour |
|------|-----------|
| `/` | Homepage |
| `/prisons` | Prison finder (client filters) |
| `/prisons/[country]` | Country hub |
| `/prisons/[country]/[slug]` | **Prison profile** if `slug` matches a prison in that country; else **region listing** if `slug` is a known region for that country — **prison wins on collision** |
| `/countries`, `/guides`, `/guides/[guideSlug]`, `/articles`, `/articles/[articleSlug]`, `/prison-map`, `/about` | As named |

**UK programmatic (additive; all under `/prisons/uk/…`)**

| Pattern | Role |
|---------|------|
| `/prisons/uk/collection/[collectionSlug]` | **Allowlist** thematic filters (7 slugs: womens/mens/high-security/private/training/reception/open prisons) |
| `/prisons/uk/operator/[operatorSlug]` | Operator hubs (slug from same rules as data build) |
| `/prisons/uk/category/[categorySlug]` | Security **band** hubs (`category-a`, `category-b`, `category-c`, `multi`, … — whatever passes min count) |
| `/prisons/uk/function/[functionSlug]` | Predominant-function hubs (slugified **exact** function label) |
| `/prisons/uk/subgroup/[subgroupSlug]` | `prisonSubGroup1` hubs |

**Deliberate omission:** **`/prisons/uk/region/[regionSlug]`** is **not** a separate route family — **region browse already exists** as `/prisons/uk/[regionSlug]` via the prison-or-region resolver above (duplicate URLs avoided).

**US federal (additive; `countrySlug` `us`, separate from legacy `united-states` narrative profiles)**

| Pattern | Role |
|---------|------|
| `/prisons/us` | Country hub for BOP-import federal sites |
| `/prisons/us/[stateSlug]` | State listing (e.g. `texas`) — same second-segment resolver as UK |
| `/prisons/us/facility-type/[typeSlug]` | Facility-type hubs (`fci`, `usp`, …) when **≥3** sites share the type |

Static params + sitemap are driven from merged `prisons` and hub helpers; **empty collection lists are omitted from sitemap** where implemented. US facility-type hub paths are added via `listUsFederalSitemapPaths()`.

---

## 5. Programmatic system — nuances

### 5.1 Thresholds

- **`MIN_UK_HUB_GROUP_SIZE = 3`** in `src/lib/programmatic/ukPrisonHubs.ts` — operator, category, function, and subgroup **hub pages** only exist for groups with **≥ 3** UK prisons (avoids thin URLs).
- **Thematic collections** under `/collection/` use **allowlist + filters**; sitemap skips collections with **zero** prisons after filter.

### 5.2 Slug stability

- **Operator slugs** must match **`slugifyKey` / `operatorSlugFromLabel`** in `src/lib/programmatic/slugify.ts`, aligned with `scripts/build-institutional-data.mjs` — drift breaks hub matching.
- **Function hubs** key on **slugified predominant function string** — typos or label changes in source create **new** hub URLs.

### 5.3 Key modules

| Module | Responsibility |
|--------|------------------|
| `src/lib/programmatic/collections.ts` | Allowlist collection slugs, filters, metadata, `listMatchingCollectionHubsForPrison`, `getProgrammaticCollection` |
| `src/lib/programmatic/ukPrisonHubs.ts` | Dynamic hub lists, resolvers, **`uk*HubHref` helpers** (only return hrefs when hub exists — **no dead links on profiles**) |
| `src/lib/generated/prisonAggregates.ts` | Grouping helpers over **generated UK** array (e.g. private-operator flag) |
| `src/lib/routes/resolveCountrySecondSegment.ts` | Prison-vs-region resolution + `allCountrySecondSegmentParams` for SSG/sitemap |

---

## 6. Query & content relationships

- **Barrel:** `src/lib/queries/index.ts` re-exports prison helpers from `src/data/prisons.ts` plus articles/guides/probation/HMCTS.
- **Articles (merged):** manual list in `src/data/articles.ts`; generated directory articles built in `src/lib/programmatic/articles/buildGeneratedArticles.ts` and merged in `src/data/articles.merge.ts` as `allArticles` / `getSiteArticle`. See [docs/programmatic-articles.md](./docs/programmatic-articles.md).
- **Related prisons on profile:** `getRelatedPrisonsForProfile` in `src/lib/queries/relatedPrisons.ts` — priority: **same region → same operator → same security → same predominant function → rest of country**, with legacy fallback if the list is still short.
- **Articles → prisons:** `relatedPrisons: string[]` slugs → `getPrison(slug)`.
- **Prison → articles:** `getRelatedArticlesForPrison` (manual + generated when the prison is in the article’s `relatedPrisons` list).
- **Prison → guides:** `getRelatedGuidesForPrison` (via articles’ `relatedGuides`) + explicit **“General guides”** fallback copy when none match.

---

## 7. Templates & UX (current generation)

- **Profile:** `src/components/pages/PrisonProfileView.tsx` — lead summary, **At a glance** dl, unified address/contact/location, directory hub sidebar (UK), WebPage JSON-LD via `src/lib/seo/prisonJsonLd.ts`, `formatPrisonMetaDescription` for `<meta description>`.
- **Hub/listing:** `PrisonListingTemplate.tsx` + `UkHubListingPage.tsx` — eyebrow, intro band, **establishment count sentence**, footnote (`hubCopy.ts`), empty state with escape links, breadcrumb JSON-LD.
- **Cards:** `src/components/PrisonCard.tsx` — name, security badge, location line, operator, function/gender line, optional `shortDescription`, capacity only if &gt; 0.

Visual goal: **Lovable-like** shell; prison pages skew **reference/directory** with factual disclaimers, not marketing claims.

---

## 8. SEO & structured data

- **`buildPageMetadata`** in `src/lib/seo/metadata.ts` — title, description, canonical via `src/lib/seo/canonical.ts`.
- **Sitemap:** `src/app/sitemap.ts` — static routes, country pages, all prison/region second segments, UK collections (non-empty), UK hub paths from `listUkHubSitemapPaths()`, guides, articles.
- **Robots:** `src/app/robots.ts` — allow all + sitemap URL.
- **Breadcrumbs:** `breadcrumbJsonLd` in `src/lib/seo/breadcrumbs.ts`; hub pages use a **shorter breadcrumb leaf label** than the full H1 where helpful (JSON-LD aligned with visible crumbs).

---

## 9. Scripts

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL for production
npm run dev
npm run data:build            # regenerate src/data/generated/* from HMPPS JSON
npm run data:build:us         # regenerate usPrisons.generated.ts from BOP clean JSON
npm run data:build:strict     # fail on duplicate prison slugs / strict errors
npm run build                 # runs data:build + data:build:us then next build
npm run start
```

---

## 10. Repository layout (high level)

```text
src/app/                 # App Router pages
src/components/          # Pages, programmatic templates, UI primitives
src/data/                # prisons.ts merge, countries, guides, articles, generated/*.ts
src/lib/
  queries/               # relatedPrisons, re-exports, institutional getters
  programmatic/          # collections, ukPrisonHubs, slugify, hubCopy
  routes/                # resolveCountrySecondSegment
  seo/                   # metadata, canonical, breadcrumbs, prisonJsonLd
  generated/             # prisonAggregates
src/types/               # Prison, collection, institutional types
scripts/build-institutional-data.mjs
docs/                    # data-pipeline, guides-articles-linking
hmpps_hmcts_json/        # raw JSON (source of generated TS)
```

---

## 11. Strategic constraints (do not ignore)

1. **Do not break** `/prisons/[country]/[slug]` prison-first vs region behaviour without a migration plan for URLs and sitemap.
2. **Do not mix** probation/HMCTS into prison page types without an explicit product decision — data is already separate and typed.
3. **Regenerate** after JSON changes; committed `generated/*.ts` is the runtime source, not the JSON files directly.
4. **UK English** in user-facing copy; stay **truthful** — no fabricated inspection outcomes, capacity trends, or ratings unless you add a real data source.
5. **New hub routes:** keep **additive**; preserve existing paths and threshold rules unless you intentionally consolidate and redirect.

---

## 12. Suggested next phases (for strategy)

- **Geocode** UK addresses → lat/lng → real `/prison-map` and optional LocalBusiness/Place schema (careful with accuracy disclaimers).
- **Probation / HMCTS directories** — mirror prison hub pattern: thresholds, listing template, sitemap gates.
- **Content overrides** — optional `prisonContentOverrides.ts` keyed by slug for hand-edited long copy without editing raw JSON.
- **International expansion** — either more legacy rows or additional imports with explicit merge rules and slug uniqueness.
- **Search / filters** — finder is client-side on full `prisons` list; at scale consider server search or pagination.

---

## 13. Related docs

- [SOURCE.md](./SOURCE.md) — Lovable export path vs `LOVABLE_BUILD/`
- [docs/data-pipeline.md](./docs/data-pipeline.md) — pipeline, merge, security mapping, gaps
- [docs/guides-articles-linking.md](./docs/guides-articles-linking.md) — slug and resolver conventions
- [docs/programmatic-articles.md](./docs/programmatic-articles.md) — generated article families, slugs, thresholds
