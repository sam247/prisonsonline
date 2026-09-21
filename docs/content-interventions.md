# Content interventions log

Baselines for 7 / 28 / 90-day measurement. Directory records are never modified by this log.

## 2026-09-17 — INTERVENTION A (shipped)

- **URL:** `/guides/prison-categories-explained`
- **Decision:** INTERNAL_LINK + light UK FAQ EXPAND (one bounded intervention)
- **Jurisdiction:** UK-primary (US sections preserved)
- **Change:** Added internal links to `/prisons/uk/category/category-a|b|c|d` hubs; light UK FAQ expand; GOV.UK/HMPPS categorisation source links; preserved existing correct material (no wholesale rewrite).
- **GSC baseline (lookup 2026-09-17, ~90d window):** clicks 0, impressions 742, CTR 0%, avg position ~75.8
- **Hypothesis:** Clearer definition vs list ownership plus hub internal links will improve CTR and help category-list queries resolve to directory hubs while the guide keeps definitional intent.
- **Directory records modified:** 0
- **Commit:** https://github.com/sam247/prisonsonline/commit/e95f926c367bb1848e9f8c1dddd6a2ec19de6eb3


## RESOLVED — `/guides/how-to-find-a-uk-prison-address` (2026-09-17)

**Decision (Sam via CoS):** Review PR #1 against current main; rebase/adapt if sound; do not blind-merge; do not create a second guide; abandon if below standard.

**Review:** PR #1 draft remained factually sound and useful — UK-first, defers named-address intent to `/prisons/uk/{slug}/contact-details`, category browse to category hubs, points readers to GOV.UK for confirmation, safe subject, ~complete how-to without padding. Architecture had drifted (guide migrations, discovery hooks, GOV.UK Find-a-prison now 301 → collections URL).

**Action:** CREATE adapted from PR #1 (not a blind merge). Shipped to `main` with discovery on homepage Common situations + footer; MapPin icon wiring; sitemap count 13; growth test asserting winner links and unchanged `guideSlugsForIntent("contact-details")`.

**Intent ownership preserved:** named-prison address → contact-details pages; category browse → category hubs; this guide is complementary how-to only.

**Directory / verifier overlays:** 0 touched.

**PR #1:** close as superseded by direct main ship (adapted).


## SUPERSEDED LOG — was CONTENT_STATE_MISMATCH `/guides/how-to-find-a-uk-prison-address` (open, not Intervention B)

### Root cause (investigated 2026-09-17)

**False “shipped” signal.** Better Ranking memory + growth experiment `3397deea-3be5-4107-b00d-28c660e42ac8` claim the guide shipped 2026-09-07. What actually happened:

1. **PR opened, never merged:** https://github.com/sam247/prisonsonline/pull/1 (`cursor/uk-prison-address-guide-54e9`, state **OPEN**, `mergedAt: null`). Cursor agent PR body says the guide was added and tested locally; it was never landed on `main`.
2. **Registry:** `src/data/guides.ts` on `main` has 12 guides; slug `how-to-find-a-uk-prison-address` is **absent**. Full `path=src/data/guides.ts` commit history on GitHub also never introduces that slug on `main`.
3. **Routes:** `/guides/[guideSlug]` is generated only from the `guides` array (`generateStaticParams`). No registry entry ⇒ no static page.
4. **Sitemap:** guide sitemap emits the same 12 registry slugs; address how-to not included.
5. **GSC (~90d lookup 2026-09-17):** URL variants `found: false` (0 clicks / 0 impressions).
6. **Redirects:** no legacy redirect for this slug.
7. **Intent ownership (still valid):** named-prison address queries remain owned by `/prisons/uk/{slug}/contact-details`; category browse by category hubs. A complementary how-to is optional adjacent content — not a directory change.

### Branch artifact

PR #1 patch touches `src/data/guides.ts` (+ guide), homepage/footer discovery links, and a growth test. It may be stale vs later guide migrations on `main` and would need rebase/review before any publish decision.

### Action

- **Do not recreate** and **do not merge PR #1** without an explicit Sam publish decision (would be a CREATE).
- Correct Better Ranking “shipped” memory/experiment notes to **drafted-in-PR-not-merged**.
- Keep mismatch ticket open until Sam decides: merge/rebase PR #1, rewrite fresh, or abandon.

## Retained referrals

- ADX Florence dual URLs → eng/verifier
- Category B/C hub indexation check
- ~~Possible `hertfordhire-essex-and-suffolk` typo slug~~ → migrated 2026-09-17 to `hertfordshire-essex-and-suffolk` (see `docs/seo-url-migrations.md`)

## 2026-09-17 — INTERVENTION B (shipped)

- **URL:** `/guides/how-prison-visits-work`
- **Decision:** EXPAND + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** UK-first (US called out separately; no US guide created)
- **Change:** England/Wales process first; GOV.UK prison-visits booking link; timetable intent deferred to prison profiles / official pages; internal links to dress and property guides; light FAQ expand. No directory edits.
- **GSC baseline (lookup 2026-09-17, ~90d):** clicks 0, impressions 251, CTR 0%, avg position ~61.9
- **Hypothesis:** UK-first process clarity + official booking link + profile handoff for times will improve CTR on book/visit queries and reduce US/UK confusion.
- **Skipped instead of address how-to:** CONTENT_STATE_MISMATCH unresolved (see above).
- **Haircuts consolidate:** already covered by legacy root→`/guides/` redirects; residual root impressions only — not a new ship.
- **Directory records modified:** 0
- **Commit:** https://github.com/sam247/prisonsonline/commit/416b3042138c94e6e8aced588c0fccf3e60880a5

## 2026-09-17 — ADX Florence URL canonicalisation (Sam-approved)

- **301:** `/prisons/united-states/adx-florence` → `/prisons/us/florence-admax-usp` (and nested paths)
- **Removed** legacy international duplicate profile `adx-florence` so sitemap only lists the BOP destination
- **Display:** destination H1/title lead with **ADX Florence**; BOP listing name retained as secondary when different
- **Links:** article `relatedPrisons` slugs updated `adx-florence` → `florence-admax-usp`
- **Search aliases:** content-layer only (not verifier overlays)
- **Verifier / facilitySources / completeness whitelist:** untouched

## 2026-09-21 — INTERVENTION A (shipped)

- **URL:** `/guides/can-you-get-haircuts-in-prison`
- **Decision:** EXPAND + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England/Wales first; US high-level separate (no invented prison-specific rules)
- **Change:** Lead with clear yes + UK/US framing; answer barbers / do-you-have-to-cut / how haircuts work / frequency-payment caveats as local; internal links to piercings, glasses, life-inside, going-to-prison, Prison Finder; add demand FAQs for barbers and mandatory cuts; tighten excerpt for CTR. Slug unchanged. No directory edits.
- **GSC baseline (lookup 2026-09-21, ~90d):** clicks 0, impressions 133, CTR 0%, avg position ~39.7
- **Hypothesis:** Direct answers to high-impression long-tail queries (barbers, must you cut hair, how haircuts work) plus related-guide internal links will lift CTR from mid-pack impressions without inventing local rules.
- **Directory records modified:** 0
- **Commit:** PENDING_AFTER_PUSH
