# Prison intent URL audit

Date: 2026-08-20
Audit population: 516 pre-existing intent URLs (129 prisons × four base intents).

| Classification | Count |
|---|---:|
| KEEP | 228 |
| ENRICH | 36 |
| REVIEW | 252 |
| REMOVE/NOINDEX CANDIDATE | 0 |

## Evidence

- Bing page statistics: 90 days ending 2026-08-20.
- Google Search Console top-page export: 90 days ending 2026-08-20. The connector returned clicks but not impressions in this export.
- GA4 organic-search sessions by landing page: 2026-05-23 to 2026-08-20.
- Facility specificity and primary-source coverage: current repository data and verification registry.

## Safety decision

No URL is classified as a removal/noindex candidate in this implementation. REVIEW means that the page requires a later evidence and content decision; it remains indexable and in the sitemap. The seven newly enabled legal-visit URLs are outside this 516-URL baseline and are source-qualified separately.
