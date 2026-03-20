# Data pipeline: institutional imports

## Overview

The site combines **generated UK prison data** from HMPPS JSON exports with **legacy hand-authored international prisons** so existing URLs, articles, and browse flows keep working.

## Raw inputs (do not edit)

Location: [`hmpps_hmcts_json/`](../hmpps_hmcts_json/)

| File | Role |
|------|------|
| `hmpps_prisons_only.json` | **Authoritative** UK prison list (123 establishments). |
| `hmpps_probation_centres.json` | Probation/contact centres (311). Prepared for future directory routes. |
| `hmcts_sites.json` | HMCTS / court sites (332). Prepared for future directory routes. |
| `hmpps_sites_map.json` | **Validation only** — union of records (766). Not used for rendering. |

## Build command

```bash
npm run data:build
```

Runs [`scripts/build-institutional-data.mjs`](../scripts/build-institutional-data.mjs), which:

1. Parses each record’s `description` block into structured fields.
2. Writes TypeScript modules under [`src/data/generated/`](../src/data/generated/).
3. Prints counts, duplicate slug checks, missing field warnings, and map-vs-split validation.

`npm run build` runs `data:build` first via `prebuild`.

## Merge strategy (prisons)

- **UK (`countrySlug === "uk"`):** Every prison comes from **`ukPrisonsGenerated`** (built from `hmpps_prisons_only.json`). Manual UK rows were removed from the hand list.
- **Non-UK:** **`legacyInternationalPrisons`** in [`src/data/prisons.legacy-international.ts`](../src/data/prisons.legacy-international.ts) — unchanged narrative-rich entries (e.g. US facilities referenced by articles).

Merged export: **`prisons`** in [`src/data/prisons.ts`](../src/data/prisons.ts).

## Slugs and routing

- UK prison URL slug = JSON `id` when unique and URL-safe (e.g. `hmp-belmarsh`).
- **Prison vs region** on `/prisons/uk/[slug]`: prison slug wins if it matches; otherwise the segment is treated as a **region** listing (same as before).

## Security level mapping (HMPPS → UI enum)

Imported rows do not use UK “Category A–D” directly. We **infer** `securityLevel` from *Predominant Function*, *Cohort*, and operator text:

| Source signal | Mapped level |
|---------------|----------------|
| High Security | Category A |
| Cat A / Category A | Category A |
| Cat B | Category B |
| Cat C / Trainer (Cat C) | Category C |
| Open / Cat D | Category D |
| Reception (only) | Category B |
| Privately managed / Serco / G4S / Sodexo | Multi (treat as mixed; filter “private” separately) |
| (default) | Multi |

Document changes in this table when you adjust [`scripts/build-institutional-data.mjs`](../scripts/build-institutional-data.mjs).

## Gaps in source data

| Field | HMPPS prison JSON |
|-------|-------------------|
| Capacity, opened year | Not provided — UI shows “Not available” when absent. |
| Lat / lng | Usually `null` — map page remains placeholder until geocoding. |
| Long narrative (history, prison life, visits) | Not in source — **synthesised** UK-English copy from parsed fields + `Information` line. |

## Probation & HMCTS

Normalised to **`ProbationCentre`** and **`HmctsSite`** types, exported from generated modules. Queried via [`src/lib/queries/index.ts`](../src/lib/queries/index.ts) (`probationCentres`, `hmctsSites`, `getProbationCentreBySlug`, `getHmctsSiteBySlug`). **No public routes** in this phase unless explicitly added later.

## Articles & guides

Prison slugs in article `relatedPrisons` arrays resolve with **`getPrison(slug)`** (global slug is unique across merged data). See [`docs/guides-articles-linking.md`](guides-articles-linking.md).
