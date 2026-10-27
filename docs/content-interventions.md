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
- **Commit:** https://github.com/sam247/prisonsonline/commit/825325595109f8bab12a2f3ff7da6a4e90a9e1b5

## 2026-09-21 — INTERVENTION B (shipped)

- **URL:** `/guides/what-happens-going-to-prison`
- **Decision:** EXPAND + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England/Wales reception / first days first; US high-level separate
- **Change:** Reframed as England/Wales reception, first night, and induction; softened absolute claims (clothing, biometrics) as usual/local; linked real GOV.UK prison-life and Early days in custody pages; internal links to sentences, categories, life-inside, visits, haircuts, Prison Finder; light FAQ soften/expand. No directory edits. No invented statistics.
- **GSC baseline (lookup 2026-09-21, ~90d):** clicks 0, impressions 120, CTR 0%, avg position ~65.8
- **Hypothesis:** UK-first reception clarity + official GOV.UK orientation links + related-guide internal links will improve CTR on “what happens / going to prison / induction” queries stuck at deep positions.
- **Directory records modified:** 0
- **Commit:** https://github.com/sam247/prisonsonline/commit/bae17f3e7ab7eda26315f4c1ea45e482afe1cc27

## 2026-09-28 — INTERVENTION A (PR ready)

- **URL:** `/guides/how-prison-sentences-work`
- **Decision:** EXPAND + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England/Wales first; US high-level separate
- **Change:** Reframed lead away from outdated universal “serve half” claim; clarified SDS / EDS / indeterminate differences; pointed to GOV.UK Progression Model + Sentencing Council; softened IPP headcount claim; internal links to life-inside, going-to-prison, categories, Prison Finder; FAQ expand for SDS/EDS. No directory edits.
- **GSC baseline (lookup 2026-09-28):**
  - ~28d: clicks 0, impressions 2, CTR 0%, avg position ~72
  - ~90d: clicks 0, impressions 105, CTR 0%, avg position ~82.2
- **Hypothesis:** Clearer England/Wales sentence-type answers for determinate/EDS/SDS long-tail queries plus official links will lift CTR from deep positions without inventing personal release dates.
- **Directory records modified:** 0
- **Branch:** `bot/content-manager/sentences-guide-2026-09-28`

## 2026-09-28 — INTERVENTION B (PR ready)

- **URL:** `/guides/life-inside-prison`
- **Decision:** EXPAND + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England/Wales first; US high-level separate
- **Change:** UK-first “what do prisoners do all day” lead; softened absolute unlock times and wage figures as local/typical; GOV.UK Prison life + education/work links; internal links to going-to-prison, categories, haircuts, visits/dress/bring, sentences, Prison Finder; FAQ for all-day routine. No directory edits.
- **GSC baseline (lookup 2026-09-28):**
  - ~28d: clicks 0, impressions 9, CTR 0%, avg position ~70.8
  - ~90d: clicks 0, impressions 90, CTR 0%, avg position ~68.5
- **Hypothesis:** Direct answers to daily-routine long-tail queries plus official and related-guide links will improve CTR from mid/deep pack without inventing one national timetable.
- **Directory records modified:** 0
- **Branch:** `bot/content-manager/life-inside-guide-2026-09-28`


## 2026-10-05 — INTERVENTION A (PR ready)

- **URL:** `/guides/rights-of-prisoners`
- **Decision:** EXPAND + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England/Wales first; US high-level separate
- **Change:** UK-first lead answering “what rights do prisoners have / lose”; Human Rights Act + ECHR Articles 2/3/8/9 framed as protections that can be lawfully limited; corrected voting section to RPA 1983 s.3 (convicted prisoners detained under sentence; remand not covered; Scotland local-election exception; Hirst context) instead of a blanket “serving prisoners cannot vote”; healthcare corrected to NHS in England / local health boards in Wales; GOV.UK-sourced outdoor time, punishments, visit minimums, legal-mail rules; official links (GOV.UK rights, Prison Rules 1999, RPA s.3, PPO, IMB, HMIP, Nelson Mandela Rules); internal links to visits, bring, life-inside, categories, sentences, Prison Finder; FAQ expanded for rights kept/lost, voting, Human Rights Act, healthcare, complaints. Title and slug unchanged; excerpt tightened. No directory edits.
- **GSC baseline (lookup 2026-10-05, exact URL):**
  - ~7d: clicks 0, impressions 0 (not found)
  - ~28d: clicks 0, impressions 1, CTR 0%, avg position 19
  - ~90d: clicks 0, impressions 89, CTR 0%, avg position ~84.3
- **Query cluster (90d):** prisoners rights, rights of prisoners, human rights for/of prisoners, what rights do prisoners lose, inmate rights.
- **Hypothesis:** Direct UK-first answers on rights kept/lost and voting, plus official sources, will lift position and CTR on the prisoner-rights cluster from very deep positions without inventing prison-specific rules.
- **Directory records modified:** 0
- **Branch:** `bot/content-manager/prisoner-rights-guide-2026-10-05`

## 2026-10-05 — INTERVENTION B (PR ready)

- **URL:** `/guides/what-can-you-bring-to-prison`
- **Decision:** EXPAND + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England/Wales first; US high-level separate
- **Change:** Answer-first “bring accepted ID and very little else” lead; HMPPS Annex A accepted-ID lists (List A, or List B + List C; under-16s with an adult) with official link; usually-allowed vs locker items; GOV.UK banned-items / criminal-offence list and searches; food, gifts and money rules (money sent online, gifts via property process); short in-cell property handoff; help-with-visit-costs link; internal links to what-to-wear (link only — that page stays awaiting_data and is not edited), visits, life-inside, rights, Prison Finder; FAQs for ID, food, gifts, phones. Title and slug unchanged; excerpt tightened. No directory edits.
- **GSC baseline (lookup 2026-10-05, exact URL):**
  - ~7d: clicks 0, impressions 0 (not found)
  - ~28d: clicks 0, impressions 2, CTR 0%, avg position 68
  - ~90d: clicks 0, impressions 52, CTR 0%, avg position ~61.8
- **Query cluster (90d):** what can you take when visiting a prisoner, prison items allowed, can you bring food to prison visit, what id do i need for a prison visit, what are prisoners allowed to have in their cells.
- **Hypothesis:** A concrete, officially sourced ID list and clear allowed/locker/banned answers will improve relevance and CTR for visitor-property queries without inventing prison-specific rules.
- **Directory records modified:** 0
- **Branch:** `bot/content-manager/visit-bring-guide-2026-10-05`

## 2026-10-12 — INTERVENTION A (PR ready)

- **URL:** `/articles/prison-overcrowding-england-wales`
- **Decision:** EXPAND + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England/Wales first (Scotland/NI called out as separate systems)
- **Change:** Answer-first lead on overcrowding as population vs CNA/operational capacity; removed hard-dated 2024 absolute headcount/capacity claims; pointed readers to MoJ weekly/monthly population and Offender management statistics quarterly; explained CNA vs operational capacity with HMIP glossary + Certified Prisoner Accommodation Policy Framework links; durable drivers (longer sentences, remand, recalls, limited headroom) and effects (shared cells, regime/rehab strain); updated short-term response framing (ECSL ended / SDS40-style measures — check live GOV.UK); FAQ for overcrowded?, CNA vs op cap, why it happens, visits/daily life; internal links to sentences, life-inside, rights, categories, Prison Finder; relatedGuides expanded; excerpt tightened for CTR. Title/slug unchanged. ArticleBody gained HTML: paragraph support (mirrors guides) so official/internal anchors render. No directory edits.
- **GSC baseline (lookup 2026-10-12, BR/GSC):**
  - ~7d: not assessed separately (may be empty)
  - ~28d (2026-09-13→10-10 page list): URL not in top pages (~0 clicks / ~0–few impressions in recent cliff)
  - ~90d (2026-07-13→10-10): clicks 0, impressions 105, CTR 0%, avg position ~89.21
- **Query cluster (90d on URL):** prison overcrowding, overcrowded prisons uk, prison overcrowding uk/statistics, overcrowding in uk prisons, uk prison overcrowding, how full are uk prisons (deep pack ~83–100)
- **Hypothesis:** Clear CNA/capacity definitions + official MoJ links + related-guide internal links will improve relevance and CTR on overcrowding/how-full queries stuck at deep positions without inventing a live headcount.
- **Directory records modified:** 0
- **Branch:** `bot/content-manager/overcrowding-article-2026-10-12`

## 2026-10-12 — INTERVENTION B (PR ready)

- **URL:** template-wide prison intent openers (`src/lib/seo/prisonIntentCopy.ts` → `buildIntentBodyParagraphs`)
- **Decision:** UPDATE (standing follow-up after PR #24 / release 2026-10-09)
- **Jurisdiction:** UK HMPPS rows use `ukPrisonTypeLabel` / `withIndefiniteArticle` / `hasUkHmppsTypeFields`; non-UK keeps type/securityLevel wording (no forced UK category nouns)
- **Change:** Intent-page opener paragraphs no longer interpolate raw `prison.type` / `securityLevel` for UK establishments (same garbled-copy class as profile type lines fixed in #24). Unit tests assert no raw HMPPS codes in UK intent openers and that non-UK openers stay non-UK.
- **GSC baseline:** N/A page-level (template-wide opener wording). Measurement is qualitative: no raw HMPPS codes in intent openers on UK pages.
- **Hypothesis:** Cleaner UK intent openers reduce duplicate/garbled type strings and improve trust on high-volume intent URLs without directory changes.
- **Directory records modified:** 0
- **Branch:** `bot/content-manager/intent-opener-type-labels-2026-10-12`


## 2026-10-19 — INTERVENTION A (PR ready)

- **URL:** `/guides/how-to-email-a-prisoner` (new)
- **Decision:** CREATE + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England and Wales first (Email a Prisoner / eMates, GOV.UK); Scotland/NI flagged as separate services with no claims; US federal (BOP TRULINCS / CorrLinks) in its own section; state/county left to their own providers.
- **Why CREATE:** no existing page answers national “email a prisoner” intent. Content inventory only had per-prison contact blocks linking out to emailaprisoner.com. Competitive Bing UK exact-match demand (17 Jul–15 Oct 2026, recorded 17 Oct): “email a prisoner” cluster ~18k impressions (“email a prisoner” 7,972; “emates” 2,175, much of it login intent). Our own Bing email queries are prison-specific (“hmp X email”), which belong to contact-details pages and are not targeted here.
- **Change:** answer-first guide (~950 words): where to sign in (emailaprisoner.com, now eMates, run by Unilink Software Ltd); what you need (name, prisoner number, prison, ID check); delivery (paper vs kiosk/in-cell, ~2 business days, “Delivered” = reached the prison); replies and photos; prices as published by eMates on 19 Oct 2026 (dated, with “check current prices”); monitoring and no legal correspondence; alternatives via GOV.UK staying-in-touch; US federal TRULINCS/CorrLinks (invitation valid 10 days, text only, 13,000 characters, monitored, no TRULINCS in contract facilities). Six FAQs. Internal links to how-to-find-a-uk-prison-address, how-prison-visits-work, UK directory; inbound from the homepage “Common situations” list and the guides hub (new Mail icon). Guide sitemap count 13 → 14.
- **Not changed (freeze / anti-churn):** no profile or contact-details titles, meta, H1s or anchors (2026-10-17 freeze on 0e7ff462 intent shift); no edits to anti-churn guides; email-a-prisoner/sending-money intent pages are not enabled in `intentRollout.ts`, so `guideSlugsForIntent` was left alone.
- **Sources:** GOV.UK prison pages (Email section), gov.uk/staying-in-touch-with-someone-in-prison, gov.uk/find-prisoner, emailaprisoner.com FAQs (general, accounts and charges, image attachments, identity check), bop.gov/inmates/communications.jsp and bop.gov/inmates/trulincs.jsp — all checked 2026-10-19.
- **GSC baseline (lookup 2026-10-19):** new URL, so 7d/28d/90d clicks 0, impressions 0. Site-wide 28d (2026-09-21→10-19): 0 clicks / 316 impressions. No national “email a prisoner” / “emates” queries in the site’s 90d GSC query export. Measure at 7/28/90 days after the release lands: impressions, clicks, CTR, position for the URL and for queries containing “email a prisoner”, “emates”, “email prisoner”.
- **Bing baseline:** URL not present. Measure the same query cluster in Bing at 28/90 days.
- **Hypothesis:** a direct, sourced answer page for the national email-a-prisoner and eMates intent can earn impressions this site currently gets none of, without competing with per-prison contact-details pages.
- **Directory records modified:** 0
- **Branch:** `bot/content-manager/email-a-prisoner-guide-2026-10-19`

## 2026-10-19 — INTERVENTION B (PR ready, stacked on A)

- **URL:** `/guides/how-to-send-money-to-a-prisoner` (new)
- **Decision:** CREATE + INTERNAL_LINK (one bounded intervention)
- **Jurisdiction:** England and Wales first (GOV.UK Send money to someone in prison); Scotland/NI pointed to the prison directly (the GOV.UK service says it is England and Wales only); US federal (BOP MoneyGram / Western Union / USPS) in its own section; contract, state and county facilities left to their own providers.
- **Why CREATE:** no page answered national send-money intent; per-prison contact blocks only link out to GOV.UK. Competitive Bing UK exact-match demand (17 Jul–15 Oct 2026, recorded 17 Oct): send-money cluster ~5.5k impressions (“send money to a prisoner” 1,681; “pay a prisoner gov uk” 1,053). Independent intent from Intervention A (payments, not messaging).
- **Change:** answer-first guide (~850 words): official GOV.UK route (free, debit card only, all England and Wales prisons, prison name not needed); what you need (debit card, prisoner number, date of birth; new arrivals take a working day to appear); timing (usually under 3 working days, up to 5) and account slips; cancellations, transfers and releases; exemption to send by post (form, Business Hub, listed proof, exceptional circumstances, governor can withdraw, wait for the letter); paying from abroad; gifts and property handled separately; US federal deposits (register number + last name, 2–4 hour posting window, wait for arrival, wrong-account risk). Six FAQs. Internal link to what-can-you-bring-to-prison (link only, page not edited); inbound from homepage “Common situations” and the guides hub (new Wallet icon). Guide sitemap count 14 → 15.
- **Stacking:** branched from Intervention A because both PRs touch the guides array, the two icon maps, `commonSituationSlugs` and the guide-count assertion. Merge A first.
- **Not changed (freeze / anti-churn):** same as Intervention A.
- **Sources:** gov.uk/send-prisoner-money; send-money-to-prisoner.service.gov.uk help pages (making a payment, a payment I’ve already made, cannot access, apply for exemption); GOV.UK prison pages (Send money and gifts); bop.gov/inmates/communications.jsp — all checked 2026-10-19.
- **GSC baseline (lookup 2026-10-19):** new URL, so 7d/28d/90d clicks 0, impressions 0. Site-wide 28d: 0 clicks / 316 impressions. No national send-money queries in the site’s 90d GSC export. Measure at 7/28/90 days after release: URL metrics plus queries containing “send money to a prisoner”, “send prisoner money”, “pay a prisoner”.
- **Bing baseline:** URL not present; same cluster at 28/90 days.
- **Hypothesis:** a direct, sourced answer for national send-money intent earns impressions the site currently gets none of, without competing with per-prison contact-details pages.
- **Directory records modified:** 0
- **Branch:** `bot/content-manager/send-money-guide-2026-10-19`
