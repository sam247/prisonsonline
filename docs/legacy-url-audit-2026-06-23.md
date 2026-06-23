# Legacy URL Audit

Date: 2026-06-23

## Goal

Document the current legacy URL situation on `prisonsonline.com`, capture what was implemented, and leave a clear backlog for later consolidation work.

## What Was Confirmed

- The live site sitemap index is served by the Next.js app and currently includes:
  - `/sitemaps/prisons.xml`
  - `/sitemaps/prison-intent.xml`
  - `/sitemaps/probation.xml`
  - `/sitemaps/regions.xml`
  - `/sitemaps/guides.xml`
  - `/sitemaps/categories.xml`
- The current App Router owns canonical article paths under `/articles/[articleSlug]`.
- The current App Router owns canonical guide paths under `/guides/[guideSlug]`.
- Google Search Console and live URL checks previously showed legacy root-level article-style URLs still appearing on the domain.

## Interpretation

- Some legacy root-level content is still discoverable or indexed outside the canonical `/articles/...` and `/guides/...` path structure.
- Not every legacy URL has a confident one-to-one replacement in the current repo.
- The safest first consolidation step is to redirect only root-level slugs where the current canonical replacement is unambiguous.

## Implemented

- Added explicit permanent redirects for root-level guide slugs to `/guides/...`.
- Added explicit permanent redirects for root-level manual article slugs to `/articles/...`.
- Redirect definitions live in `config/legacy-root-redirects.mjs`.
- Redirects are wired into `next.config.mjs`.

## Redirected Canonical Pairs

### Guides

- `/how-prison-visits-work` → `/guides/how-prison-visits-work`
- `/what-to-wear-to-a-prison-visit` → `/guides/what-to-wear-to-a-prison-visit`
- `/what-can-you-bring-to-prison` → `/guides/what-can-you-bring-to-prison`
- `/what-happens-going-to-prison` → `/guides/what-happens-going-to-prison`
- `/how-prison-sentences-work` → `/guides/how-prison-sentences-work`
- `/life-inside-prison` → `/guides/life-inside-prison`
- `/prison-categories-explained` → `/guides/prison-categories-explained`
- `/rights-of-prisoners` → `/guides/rights-of-prisoners`

### Articles

- `/most-dangerous-prisons-world` → `/articles/most-dangerous-prisons-world`
- `/famous-prison-escapes` → `/articles/famous-prison-escapes`
- `/prison-overcrowding-england-wales` → `/articles/prison-overcrowding-england-wales`
- `/rehabilitation-reduces-reoffending` → `/articles/rehabilitation-reduces-reoffending`
- `/history-supermax-prisons` → `/articles/history-supermax-prisons`
- `/worst-prison-riots` → `/articles/worst-prison-riots`
- `/mental-health-in-prisons` → `/articles/mental-health-in-prisons`
- `/women-in-prison` → `/articles/women-in-prison`
- `/prison-systems-worldwide` → `/articles/prison-systems-worldwide`

## Still Open

These legacy URLs were observed earlier and do not yet have a confident replacement in the current repo:

- `/can-you-get-haircuts-in-prison`
- `/behind-bars-in-japan-a-look-inside-the-countrys-prison-system`
- `/a-guide-to-the-pre-sentence-investigation-psi-report`

## Recommendation For Next Pass

- Pull a broader GSC export of root-level non-canonical URLs.
- Decide one of:
  - keep and migrate content into the Next.js architecture
  - redirect to a clearly relevant replacement
  - intentionally retire with a stronger deindex strategy
- Only add redirects when the target is materially equivalent to the old intent.

## Notes

- Header checks via `curl -I` hit Vercel bot mitigation (`429 challenge`) during audit, so sitemap output and page fetches were used as the main validation sources.
- This phase intentionally avoided broad catch-all legacy routing so unknown live content is not accidentally retired without review.
