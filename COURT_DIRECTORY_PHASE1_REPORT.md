# Court Directory Phase 1 — Implementation Report

**Date:** 12 September 2026  
**Deploy:** Not deployed (build verified locally only)

---

## Phase 0 baseline (before coding)

| Vertical | URL count |
|----------|----------:|
| Prison profiles | 275 |
| Prison intents | 523 |
| Probation | 328 |
| Regions | 71 |
| Guides | 12 |
| Categories | 137 |
| **Existing total** | **1346** |

---

## 1. Files changed (high level)

**New**

- `scripts/build-court-directory.mjs`
- `src/types/court.ts`
- `src/data/generated/courts.generated.ts`
- `src/data/generated/prisonCoords.generated.ts`
- `src/lib/queries/courts.ts`
- `src/lib/queries/nearbyCourtsPrisons.ts`
- `src/lib/seo/courtJsonLd.ts`
- `src/components/pages/CourtsDirectoryViews.tsx`
- `src/app/courts/page.tsx`
- `src/app/courts/[slug]/page.tsx`
- `src/app/courts/courts-finder-client.tsx`
- `src/app/sitemaps/courts.xml/route.ts`
- `tests/courts-directory.test.ts`
- `COURT_DIRECTORY_PHASE1_REPORT.md` (this file)

**Modified**

- `package.json` — `data:build:courts` + `prebuild` wire-up
- `.gitignore` — `.cache/`
- `src/app/sitemap.xml/route.ts` — courts sitemap child
- `src/lib/seo/sitemapEntries.ts` — `buildCourtsEntries` only (existing builders unchanged in behaviour)
- `scripts/check-sitemaps.ts` — regression asserts + courts
- `src/components/layout/Header.tsx` — Courts nav item
- `src/components/pages/PrisonProfileView.tsx` — additive “Courts near …” block only (+26 lines)
- `src/data/generated/generatedIndex.ts` — export courts/coords

**Prison SEO modules (confirmed untouched via `git diff`):**

- `src/lib/seo/prisonJsonLd.ts`, `prisonTitle.ts`, `prisonProfileCopy.ts`, `prisonIntentCopy.ts`, `prisonIntentJsonLd.ts`, `intentRollout.ts`, `prisonLastModified.ts`
- `src/lib/seo/metadata.ts`, `canonical.ts`
- `src/app/robots.ts`

---

## 2. Routes created

| Route | Purpose |
|-------|---------|
| `/courts` | Directory index + client search/filter |
| `/courts/crown-courts` | Type hub |
| `/courts/magistrates-courts` | Type hub |
| `/courts/county-courts` | Type hub |
| `/courts/combined-courts` | Type hub |
| `/courts/tribunals` | Type hub |
| `/courts/[court-slug]` | Court profile (canonical) |

No routes under `/prisons/`. No hearing/listing pages. No city/region permutations.

---

## 3–5. Records / profiles / exclusions

| Metric | Count |
|--------|------:|
| HMCTS records discovered | **332** |
| Court profiles generated | **332** |
| Indexable / sitemap profiles | **332** |
| Excluded from generation | **0** |
| Closed (FaCT `open=false`) but retained | **5** (still indexable where address present) |

**Closed policy used**

- FaCT closed flag does **not** delete HMCTS rows.
- Closed locations show a “Closed location” badge / status line.
- DX is suppressed when closed.
- Still indexable if address+postcode exist (`closed_with_address`).
- Not presented as currently operating.

**Ambiguous match (1):** `central-london-county-court-in-rcj` → candidates `central-london-county-court`, `central-london-county-court-bankruptcy` — shipped **without** FaCT contact/coords/official URL enrichment.

**Unmatched (157):** shipped on HMCTS address/postcode/jurisdiction only; no FaCT coords/official URL/areas of law.

---

## 6. Court types represented (hub inventory)

| Hub | Count |
|-----|------:|
| Crown Courts | 72 |
| Magistrates' Courts | 145 |
| County Courts | 101 |
| Combined Courts | 47 |
| Tribunals | 46 |

Multi-hub membership allowed; one canonical profile URL each.

---

## 7. Data sources used

1. **HMCTS snapshot** — `hmpps_hmcts_json/hmcts_sites.json` (existing import)
2. **FaCT / MoJ Court locations CSV (OGL)** — `https://factprod.blob.core.windows.net/csv/courts-and-tribunals-data.csv` cached at `.cache/fact-courts.csv`
3. **postcodes.io** — build-time only, batched POST `/postcodes`, cached at `.cache/postcodes-io-prisons.json` → `prisonCoords.generated.ts` overlay (**does not** write `Prison.latitude` / `longitude`)

**Not used:** CaTH hearings, CourtServe, runtime geocoding, FaCT HTML scrape.

---

## 8. Licensing / attribution

On court directory + profile pages:

> Court information is based on public information from HM Courts & Tribunals Service and other public sector data licensed under the Open Government Licence v3.0.

- Official FaCT link only when match status is `exact` or `strong`
- No HMCTS/MoJ affiliation claim
- Hearing lists linked externally to CaTH with explicit “PrisonsOnline does not host live court listings”

---

## 9. Sitemap changes

**Additive only:** `sitemaps/courts.xml` + index entry.

### Before / after existing verticals

| Vertical | Before | After |
|----------|-------:|------:|
| Prison profiles | 275 | **275** |
| Prison intents | 523 | **523** |
| Probation | 328 | **328** |
| Regions | 71 | **71** |
| Guides | 12 | **12** |
| Categories | 137 | **137** |
| Existing total | 1346 | **1346** |
| **New courts URLs** | 0 | **338** (1 index + 5 hubs + 332 profiles) |

---

## 10. Internal linking

- Court profile → up to 3 nearby prisons (Haversine, when coords reliable)
- UK prison profile → up to 3 nearby courts (additive block only)
- Type hubs → court profiles
- Court profiles → primary type hub via breadcrumbs
- Header: Courts after Probation
- Homepage: unchanged (conservative)

Disclaimer used:

> Nearby locations are shown by geographic distance only and do not indicate an operational relationship.

---

## 11. Coordinates / proximity

| Dataset | Resolved | Notes |
|---------|---------:|-------|
| Courts with FaCT coords | 174 / 332 | Only exact/strong matches |
| UK prison overlay coords | 121 / 122 usable | Unresolved: `hmp-brixton` postcode `SW2 5XF` (postcodes.io null) |
| `Prison.latitude/longitude` | unchanged | Map behaviour unchanged |

---

## 12. SEO implementation

- Unique titles: `{Name}: Address, Contact Details & Information`
- Descriptions from factual fields only — no “listings today / hearings / cases today”
- `schema.org/Courthouse` + PostalAddress + geo when available (`courtJsonLd.ts`)
- Breadcrumbs on profiles/hubs
- Client search filters are not separate indexed URLs

---

## 13. Performance / build impact

- Static generation only (SSG), same architecture as probation
- `npm run data:build:courts` in `prebuild` after institutional build
- Cache fail-closed: no FaCT cache → exit 1; network fail with cache → warn + continue
- Local `npm run build` succeeded; `/sitemaps/courts.xml` and court HTML pages present under `.next`

---

## 14. Before/after prison URL regression

All existing vertical counts unchanged (table above). Prison SEO module diffs empty. Prison template change limited to additive nearby-courts section.

---

## 15. Unresolved data quality issues

- **157 unmatched** HMCTS↔FaCT (slug/name divergence, e.g. shortened HMCTS names)
- **1 ambiguous** Central London County Court in RCJ
- **No phone/opening hours/facilities** in OGL CSV — cannot show those fields without additional licensed sources
- **HMP Brixton** postcode unresolved for proximity
- Some HMCTS jurisdiction labels disagree with FaCT types historically (mitigated by preferring FaCT types when matched, e.g. Aylesbury Crown Court)
- Title-case heuristics may still imperfectly capitalise uncommon acronyms

---

## 16. Recommended next improvements

1. Manual override table for high-value unmatched/ambiguous FaCT links
2. Optional homepage Courts card (still conservative)
3. Geographic hubs (`/courts/london/` etc.) only after inventory analysis
4. Revisit HMCTS third-party licence for **hearing summaries** (separate from this directory)
5. Retry Brixton / odd postcodes; consider Code-Point Open as offline coords source
6. Footer Courts link if desired

---

## Match stats (build)

| Status | Count |
|--------|------:|
| exact | 113 |
| strong | 61 |
| unmatched | 157 |
| ambiguous | 1 |

---

## Representative QA

| Court | Result |
|-------|--------|
| Birmingham Crown Court | exact, coords, crown hub, areas of law |
| Manchester Crown Court (Crown Square) | exact, coords |
| Inner London Crown Court | exact, coords |
| Aylesbury Crown Court | exact, FaCT type → crown hub |
| Luton Crown Court | exact, coords |
| St Albans Crown Court | exact, coords |
| Luton & South Bedfordshire Mags | unmatched HMCTS-only (still profiled) |
| Kingston upon Thames County | strong via name+postcode prefix |
| Victory House ET | unmatched tribunal (still profiled) |
| Closed FaCT locations (5) | retained, flagged closed |

Tests: `npm test` (incl. `courts-directory.test.ts`) pass; `scripts/check-sitemaps.ts` pass; `tsc --noEmit` pass.

---

## COURT DIRECTORY STATUS: SAFE TO DEPLOY

Additive courts vertical with frozen prison/probation SEO counts, reproducible cached enrichment, and reciprocal geographic links only where coordinates are reliable. No hearing data. Not deployed by this work.
