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
- A broader GSC page export also surfaced root-level legacy URLs beyond the first sample, including:
  - prison entity duplicates such as `/hmp-bullingdon` and `/hmp-the-mount`
  - old question-style posts such as `/can-you-get-haircuts-in-prison`
  - stale or off-architecture posts such as `/how-to-become-a-prison-officer`

## Interpretation

- Some legacy root-level content is still discoverable or indexed outside the canonical `/articles/...` and `/guides/...` path structure.
- Not every legacy URL has a confident one-to-one replacement in the current repo.
- The safest first consolidation step is to redirect only root-level slugs where the current canonical replacement is unambiguous.

## Implemented

- Added explicit permanent redirects for root-level guide slugs to `/guides/...`.
- Added explicit permanent redirects for root-level manual article slugs to `/articles/...`.
- Added explicit permanent redirects for confirmed root-level prison entity duplicates where the canonical prison profile already exists.
- Redirect definitions live in `config/legacy-root-redirects.mjs`.
- Redirects are wired into `next.config.mjs`.

## Redirected Canonical Pairs

### Guides

- `/how-prison-visits-work` → `/guides/how-prison-visits-work`
- `/what-to-wear-to-a-prison-visit` → `/guides/what-to-wear-to-a-prison-visit`
- `/what-can-you-bring-to-prison` → `/guides/what-can-you-bring-to-prison`
- `/can-you-get-haircuts-in-prison` → `/guides/can-you-get-haircuts-in-prison`
- `/can-you-send-pictures-in-prison-letters` → `/guides/can-you-send-pictures-in-prison-letters`
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

### Prison Entity Duplicates

- `/hmp-bullingdon` → `/prisons/uk/hmp-bullingdon`
- `/hmp-the-mount` → `/prisons/uk/hmp-the-mount`

## Decision Log

### Redirect Now

- `/hmp-bullingdon`
  - Reason: exact prison entity already exists at a canonical App Router URL.
- `/hmp-the-mount`
  - Reason: exact prison entity already exists at a canonical App Router URL.

### Keep / Migrate Later

- `/can-you-have-piercings-in-prison`
  - Reason: same as above; query-led informational intent with some topical relevance.
- `/can-you-wear-glasses-in-prison`
  - Reason: prison-life informational intent; no confident replacement exists today.

### Migrated This Phase

- `/can-you-get-haircuts-in-prison`
  - Action: created `/guides/can-you-get-haircuts-in-prison` and redirected the legacy root URL.
- `/can-you-send-pictures-in-prison-letters`
  - Action: created `/guides/can-you-send-pictures-in-prison-letters` and redirected the legacy root URL.

### Retire Candidate

- `/behind-bars-in-japan-a-look-inside-the-countrys-prison-system`
  - Reason: no current canonical equivalent, weak fit with the present UK/US directory architecture, and not worth a blind redirect.
- `/a-guide-to-the-pre-sentence-investigation-psi-report`
  - Reason: legal/probation-adjacent but no strong in-repo equivalent; should only survive if deliberately migrated into a new guide.
- `/how-to-become-a-prison-officer`
  - Reason: employment/careers intent sits outside the current directory and family-guidance focus.
- `/the-uks-most-dangerous-prisoners-2023`
  - Reason: date-stamped / stale news-style framing with no clean canonical replacement.

## Still Open

These legacy URLs were observed in GSC and remain unresolved in code because they need an explicit product decision first:

- `/can-you-have-piercings-in-prison`
- `/can-you-wear-glasses-in-prison`
- `/behind-bars-in-japan-a-look-inside-the-countrys-prison-system`
- `/a-guide-to-the-pre-sentence-investigation-psi-report`
- `/how-to-become-a-prison-officer`
- `/the-uks-most-dangerous-prisoners-2023`

## Recommendation For Next Pass

- For the remaining `keep / migrate later` URLs, decide whether to create fresh guides under `/guides/...` with updated copy and then redirect the old roots.
- For `retire candidate` URLs, decide whether to:
  - leave them as 404 / soft-removed if they are already gone
  - add an explicit legacy-retire handling layer later if they keep showing in GSC
- Only add redirects when the target is materially equivalent to the old intent.

## Notes

- Header checks via `curl -I` hit Vercel bot mitigation (`429 challenge`) during audit, so sitemap output and page fetches were used as the main validation sources.
- This phase intentionally avoided broad catch-all legacy routing so unknown live content is not accidentally retired without review.
