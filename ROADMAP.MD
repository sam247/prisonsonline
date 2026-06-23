# Roadmap

## Recently Completed

- Synced `data/prison-images.csv` to the latest Google Sheet image rows.
- Updated `scripts/build-prison-images.mjs` to accept direct Wikimedia upload URLs as well as Commons file-page URLs.
- Added a slug alias so the Bronzefield image still resolves on the current site while the sheet uses `hmp-bronzefield`.
- Pulled Google Search Console data and correlated page/query opportunities against current Next.js route families.
- Updated prison profile metadata formulas for stronger entity targeting on high-impression prison pages.
- Updated prison intent metadata to better match visit-related search intent.
- Improved metadata for key UK browse hubs and documented the GSC-led SEO sprint in `docs/seo-gsc-2026-06-23.md`.
- Audited legacy root-level content URLs versus the current App Router structure.
- Added low-risk permanent redirects from root-level duplicate guide/article slugs to canonical `/guides/...` and `/articles/...` paths.
- Documented legacy URL findings, redirect decisions, and unresolved legacy pages in `docs/legacy-url-audit-2026-06-23.md`.
- Added a second-pass legacy decision log covering redirect-now, keep/migrate-later, and retire-candidate URL groups.
- Added direct root-level prison entity redirects for confirmed duplicates like `hmp-bullingdon` and `hmp-the-mount`.
- Migrated `can-you-get-haircuts-in-prison` and `can-you-send-pictures-in-prison-letters` into canonical guide pages under `/guides/...`.
- Added permanent redirects from those legacy root URLs to their new guide paths.
- Migrated `can-you-have-piercings-in-prison` and `can-you-wear-glasses-in-prison` into canonical guide pages under `/guides/...`.
- Added permanent redirects from those legacy root URLs to their new guide paths.

## Next Up

- Re-check GSC after reindexing to see whether CTR improves on prison entity and prison intent pages.
- Decide whether stale legacy posts should remain unhandled or move to an explicit retire/deindex layer.
- Consider a second SEO pass for the strongest prison intent templates and UK browse hubs.
- Expand image coverage and verify each sheet slug matches the current runtime prison slug set.
