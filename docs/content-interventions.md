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

## CONTENT_STATE_MISMATCH — `/guides/how-to-find-a-uk-prison-address` (open, not Intervention B)

- Better Ranking memory claims shipped 2026-09-07 as complementary how-to; contact-details pages own named-prison address intent.
- Repo `src/data/guides.ts` history checked across recent commits: slug never present.
- No legacy redirect entry found for this slug in `config/legacy-root-redirects.mjs` during this pass.
- Live production: not served as a guide (bot challenge/404 behaviour).
- **Action:** Do not recreate until mismatch is resolved (memory vs repo vs production). Investigation only — not a second publication.

## Retained referrals

- ADX Florence dual URLs → eng/verifier
- Category B/C hub indexation check
- Possible `hertfordhire-essex-and-suffolk` typo slug

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

