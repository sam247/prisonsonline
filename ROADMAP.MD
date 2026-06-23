# Roadmap

## Recently Completed

- Synced `data/prison-images.csv` to the latest Google Sheet image rows.
- Updated `scripts/build-prison-images.mjs` to accept direct Wikimedia upload URLs as well as Commons file-page URLs.
- Added a slug alias so the Bronzefield image still resolves on the current site while the sheet uses `hmp-bronzefield`.
- Pulled Google Search Console data and correlated page/query opportunities against current Next.js route families.
- Updated prison profile metadata formulas for stronger entity targeting on high-impression prison pages.
- Updated prison intent metadata to better match visit-related search intent.
- Improved metadata for key UK browse hubs and documented the GSC-led SEO sprint in `docs/seo-gsc-2026-06-23.md`.

## Next Up

- Re-check GSC after reindexing to see whether CTR improves on prison entity and prison intent pages.
- Decide how to handle legacy root-level article URLs still indexed on the same domain.
- Consider a second SEO pass for the strongest prison intent templates and UK browse hubs.
- Expand image coverage and verify each sheet slug matches the current runtime prison slug set.
