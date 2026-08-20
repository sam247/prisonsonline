# Entity search growth implementation

Date: 2026-08-20
Status: SUCCESS

## Implemented

- Separated prison-profile and contact-page query ownership without changing existing URLs or canonicals.
- Added a complete-title budget, sourced contact fact blocks, a 30-facility provenance registry, stable facility entity IDs, official-source links, and contact/source analytics.
- Enabled seven independently controlled, source-specific legal-visit pages. Oakwood remains disabled.
- Strengthened the proven UK, Category B/C, women’s, private, high-security, and long-term/high-security hub paths with definitions, counts, methodology, sources, related navigation, and visible-list schema.
- Added editorial trust fields and conditional Article JSON-LD/UI output without inventing authors, dates, reviewers, or citations.
- Removed request-time sitemap freshness, validated the probation sitemap, and hardened optional generators against destructive empty-input rewrites.
- Generated the full 516-URL intent audit in `docs/seo/prison-intent-audit-2026-08-20.csv`.

## Representative URL behaviour

| URL | Before | After |
|---|---|---|
| `/prisons/uk/hmp-berwyn` | Title targeted visiting/contact; H1 `HMP Berwyn`; profile schema | Title `HMP Berwyn \| Category C Prison \| Prisons Online`; H1/canonical/indexability unchanged; `GovernmentBuilding` has stable `@id`; primary intent is entity/category information |
| `/prisons/uk/hmp-berwyn/contact-details` | Title/H1 `HMP Berwyn contact details, phone and address`; generic prose first | Title `HMP Berwyn Address, Postcode & Phone \| Prisons Online`; H1 `HMP Berwyn Contact Details`; canonical/indexability unchanged; fact block first; `WebPage` is about the profile facility entity |
| `/prisons/uk/category/category-c` | Thin directory and breadcrumbs only | Title/H1/canonical preserved; answer-first definition, methodology and official source added; `CollectionPage` + visible `ItemList`; primary intent is the Category C reference list |
| `/prisons/uk/hmp-preston/legal-visits` | Not published | Title/H1 `HMP Preston Legal Visits`; self-canonical and indexable; source-specific booking content; `WebPage` about the Preston facility entity |

## Cannibalisation decision

Profiles retain useful address and telephone values but no longer target address/contact/visit phrases in the title, meta description, profile heading, or intent-link anchor. Contact URLs own address, postcode, telephone, email, and contact-source presentation. No canonical or indexability changes were made to existing URLs.

## Intent audit

| Classification | Count |
|---|---:|
| KEEP | 228 |
| ENRICH | 36 |
| REVIEW | 252 |
| REMOVE/NOINDEX candidate | 0 |

The seven new legal pages are not part of the 516 pre-existing URL baseline. REVIEW pages remain indexable and in the sitemap.

## Validation

- Typecheck: passed.
- Lint: passed with no warnings.
- Tests: 6/6 passed.
- Production build: passed; 1,357 static pages generated.
- Sitemaps: 328 probation URLs and 523 intent URLs; probation is present in the root index.
- Schema: rendered profile, contact, category, and legal pages inspected successfully.
- Canonicals/indexability: representative pages are self-canonical and indexable.
- Generated files: direct Next production build caused no tracked generated-data rewrites.

## External actions

1. In Bing Webmaster Tools, submit `https://prisonsonline.com/sitemaps/probation.xml` or resubmit the root `https://prisonsonline.com/sitemap.xml`; the repository already generates and references the child sitemap correctly.
2. In GA4, register useful reporting dimensions for `page_family`, `entity_slug`, `intent_slug`, `action_type`, and `source_domain`. Do not mark routine contact/source clicks as key events unless a commercial decision says they represent a conversion.
3. Link the active AdSense property to GA4 and confirm ad-revenue data sharing; this cannot be completed in repository code.
4. Recheck the 30 source records when an official page changes and record a new `checkedAt` only after another comparison.

## Next source-verification cohort

Prioritised from current Bing/GA4 visibility and contact-page opportunity, excluding the initial 30:

1. Nottingham
2. The Mount
3. Exeter
4. Lindholme
5. Wealstun
6. Durham
7. Bronzefield
8. Wormwood Scrubs
9. Usk
10. Moorland
11. Hatfield
12. Forest Bank
13. Northumberland
14. Lowdham Grange
15. Featherstone
16. Lewes
17. Altcourse
18. Brixton
19. Leicester
20. Frankland
21. Full Sutton
22. Kirklevington Grange
23. Birmingham
24. Bure
25. Dovegate
26. Ashfield
27. Cardiff
28. Whatton
29. Morton Hall
30. Chelmsford

## Remaining risks

- Search engines may temporarily retest profile/contact rankings after title and description changes; URLs and canonicals were preserved to limit this risk.
- Imported contact values can become stale. The UI explicitly distinguishes fields supported by a checked source from unverified import values.
- Two long-term/high-security administrative views remain live because both have existing architecture/visibility; they are distinguished and cross-linked rather than consolidated without stronger evidence.
- REVIEW intent pages remain generic. They require a later evidence/content pass, not automatic removal.
- The legacy PSI URL remains a sourced decision log and `410 Gone`; no equivalent current page exists for a defensible redirect.
