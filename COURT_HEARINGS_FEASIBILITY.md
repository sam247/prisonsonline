# Court Hearings Feasibility Investigation

**Date:** 12 September 2026  
**Scope:** Investigation only. No application code, migrations, routes, packages, or deploys were created.  
**Subject:** Whether PrisonsOnline.com can legally and usefully add UK court listings / hearing schedules, potentially using HMCTS Court and Tribunal Hearings (CaTH) data.

---

## Executive summary

**Verdict: AMBER** — viable in principle, but **not buildable as a public SEO product until HMCTS grants a Transactional Third-Party Courts and Tribunals Data Licence** and licence conditions on retention, republication, and discoverability are clear.

Two separable products exist:

| Product | Data source | Licence posture | Build now? |
|---------|-------------|-----------------|------------|
| **Court directory / profiles** | Existing `hmcts_sites.json` + FaCT / OGL court-location data | Much clearer (OGL / directory reuse) | Yes, as a cautious MVP |
| **Hearing lists / daily cause lists** | CaTH outbound API (or scraping CaTH/CourtServe) | **Licence required** for computational reuse; scraping without licence is prohibited | **No** until Transactional licence approved |

Scraping CourtServe or CaTH without a licence is not a path. CourtServe’s own T&Cs expressly forbid republication. CaTH computational reuse requires HMCTS approval.

This report is sceptical by design. Preferring AMBER/RED now is better than building on unrepublishable data.

---

## 1. Existing PrisonsOnline architecture

### 1.1 Framework and architecture

- **Next.js 14.2 App Router**, React 18, TypeScript, Tailwind, shadcn-style UI.
- Site is primarily **static generation (SSG)** via `generateStaticParams` on prison, guide, article, UK hub, probation, and intent routes.
- **No traditional database**. Runtime data lives in committed TypeScript modules under `src/data/` and `src/data/generated/`.
- **No ISR/`revalidate` pattern** found in app routes. No cron/scheduled jobs in-repo.
- **Deployment:** Vercel (build failure notes in `ROADMAP.MD`); env uses `NEXT_PUBLIC_SITE_URL=https://prisonsonline.com`.
- Ads: AdSense unit policy in `src/lib/ads/layoutPolicy.ts` (entity/intent/guide/directory templates).

### 1.2 Data ingestion / import architecture

```text
hmpps_hmcts_json/*.json
  → scripts/build-institutional-data.mjs
  → src/data/generated/*.ts
  → src/data/prisons.ts (UK merge) + query barrels
```

- Raw JSON is authoritative; generated TS is overwritten by `npm run data:build`.
- `prebuild` runs data builds (UK, US, images, growth cohort, article prune) before `next build`.
- US prisons: separate `us_prisons_clean_bundle` → `scripts/build-us-prisons.mjs`.
- Government datasets are imported as **offline JSON snapshots**, not live API pulls.

### 1.3 Existing prison data model

`Prison` (`src/types/prison.ts`) includes name/slug/country/region/city, security, capacity, operator, opened year, **latitude/longitude**, narrative fields, address/postcode/phone, predominant function, cohort, provenance (`hmpps_import` | `manual` | `bop_import`).

**Critical gap:** in current HMPPS import JSON, **all 123 UK prisons have `latitude: null` / `longitude: null`**. UI treats `0` as “no coords”. Prison↔court proximity **cannot ship from current coords** without geocoding (README already lists geocoding as a suggested phase).

### 1.4 Programmatic SEO architecture

- UK hubs: collection / operator / category / function / subgroup under `/prisons/uk/...`.
- Threshold: `MIN_UK_HUB_GROUP_SIZE = 3` to avoid thin URLs.
- Generated articles with prune/cohort controls.
- Prison intent pages: `/prisons/[country]/[slug]/[intent]`.
- SEO helpers: `buildPageMetadata`, canonicals, breadcrumbs JSON-LD, prison JSON-LD, split sitemaps.

### 1.5 Sitemap architecture

Sitemap index at `/sitemap.xml` → child sitemaps:

- `prisons.xml`, `prison-intent.xml`, `probation.xml`, `regions.xml`, `guides.xml`, `categories.xml`

Built from `src/lib/seo/sitemapEntries.ts`. Empty hubs are gated where implemented.

### 1.6 Prison profile URLs

Canonical pattern:

- `/prisons/uk/{slug}` e.g. `/prisons/uk/hmp-birmingham`
- Prison wins over region if slug collides.

### 1.7 Existing court-related code/data (already present)

| Asset | Status |
|-------|--------|
| `hmpps_hmcts_json/hmcts_sites.json` | **332** HMCTS sites (Crown, Magistrates, County, Combined, Tribunals, etc.) |
| `src/types/institutional.ts` → `HmctsSite` | Typed model |
| `src/data/generated/hmctsSites.generated.ts` | Generated |
| `getHmctsSiteBySlug` in `src/lib/queries/index.ts` | Queryable |
| Public court routes | **None** (same posture as early probation: data ready, routes optional) |
| Probation directory | **Already public** (`/probation`, `/probation/uk/...`) — best template for court profiles |

HMCTS site sample fields: id/slug/name, address, postcode, court region (LON/MID/NW/SE/SW/Wales/NE), jurisdiction (Crown/Magistrates/County/Combined/Tribunal/…). **Coordinates are also null** for all 332 HMCTS rows.

Jurisdiction mix in current snapshot (approx.): Magistrates 114, County 49, Combined 47, Tribunal 42, Crown 38, plus smaller categories.

### 1.8 Cron / scheduled jobs

**None in this repo.** A hearing ingestion product would be a **new operational architecture** (webhook receiver + persistence + expiry jobs), not an extension of the current SSG JSON pipeline.

### 1.9 Reusable components

Strong reuse candidates for a **court directory** (not live hearings):

- `ProbationDirectoryViews` / probation SSG + sitemap pattern
- `PrisonListingTemplate` / `UkHubListingPage`
- `buildPageMetadata`, breadcrumbs, FAQ section patterns
- Thresholded hub logic (`ukPrisonHubs.ts`)
- Ad “directory” template slot

Weak reuse for **daily hearing lists**: current stack has no DB, no webhook intake, no short-TTL content lifecycle.

---

## 2. HMCTS Court and Tribunal Hearings (CaTH)

### 2.1 What CaTH is

CaTH is HMCTS’s modern publication platform for court/tribunal hearing lists and related publications. Public service:

- https://www.court-tribunal-hearings.service.gov.uk/

Official overview of where lists appear:

- https://www.gov.uk/government/collections/hmcts-hearing-lists

### 2.2 Current coverage (as of HMCTS hearing-lists collection, updated 9 April 2026)

CaTH / the Court and Tribunal Hearings service is documented as covering:

| Jurisdiction | On CaTH (per GOV.UK collection) | Notes |
|--------------|----------------------------------|-------|
| Civil (County) & Family Courts (E&W) | Yes | National rollout completed Dec 2025 |
| First-tier & Upper Tribunals | Yes (excl. Employment Tribunals) | Employment still via other channels / CourtServe |
| RCJ & Rolls Building | Yes | Also still has some GOV.UK diary pages |
| Crown Courts (E&W) | Yes | Added to CaTH 17 Mar 2026 |
| Magistrates’ courts (E&W) | Yes | Collection updated 9 Apr 2026 to include magistrates |
| Single Justice Procedure | Yes | TV licensing / minor traffic etc. |

Also still referenced elsewhere:

- CourtServe for Crown, magistrates, civil/county, Employment Tribunal lists
- XHIBIT for Crown Court lists
- Some specialised GOV.UK diary pages (Commercial Court, Patents Court, etc.)

CaTH homepage copy sometimes lags the collection page (homepage text observed without explicit magistrates bullet while the collection page includes them). Treat the **collection page as the authoritative coverage list**.

Scotland / Northern Ireland: CaTH points users to Scottish Courts / NICTS — not in scope for E&W CaTH reuse.

### 2.3 Official access mechanisms — verified

| Mechanism | Exists? | Public? | Notes |
|-----------|---------|---------|-------|
| Public website (CaTH) | **Yes** | Yes | Human browsing; registration for some flows |
| **Outbound push API** to approved licensees | **Yes** | **No** | Documented; HMCTS POSTs to your endpoints |
| Public pull API / open JSON feed for lists | **Not found** | — | Do not assume one exists |
| Bulk open download of hearing lists | **Not found** | — | — |
| RSS | **Not found** | — | — |
| Unauthenticated scrape-friendly dump | **Not authorised** for computational reuse | — | Licence required |

Primary technical documentation:

- https://www.gov.uk/government/publications/hmcts-third-party-courts-and-tribunals-data-licence/court-and-tribunal-hearings-service-application-programming-interface-api-requirements

### 2.4 Outbound API — how it actually works

This is **not** “call HMCTS and GET lists”. After onboarding, **CaTH sends publications to you**.

You must expose:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `BaseURL` | Health check |
| POST | `BaseURL` | New publication |
| PUT | `BaseURL/{PublicationID}` | Superseding update |
| DELETE | `BaseURL/{PublicationID}` | Manual deletion notification |

Auth: OAuth2 **client credentials**; CaTH obtains a bearer token using credentials **you** provide (Client ID/Secret/Scope/Token URL), then calls your endpoints. Credentials exchanged via GPG-encrypted email.

Request body for POST/PUT: `multipart/form-data` with:

- `metadata` (JSON, mandatory)
- `payload` (JSON list body, optional)
- `file` (pdf/csv/doc/docx/html, optional)

Metadata fields include: `publicationId` (UUID), `listType`, `locationName`, `contentDate`, `sensitivity` (`PUBLIC` | `PRIVATE` | `CLASSIFIED`), `language`, `displayFrom`, `displayTo`.

Schemas / list types:

- Schemas: https://github.com/hmcts/pip-data-management/tree/master/src/main/resources/schemas
- List types enum: https://github.com/hmcts/pip-data-models/blob/master/src/main/java/uk/gov/hmcts/reform/pip/model/publication/ListType.java

Observed list types include (non-exhaustive): `CROWN_DAILY_PDDA_LIST`, `CROWN_FIRM_PDDA_LIST`, `CROWN_WARNED_PDDA_LIST`, `MAGISTRATES_PUBLIC_LIST`, `MAGISTRATES_PUBLIC_ADULT_COURT_LIST_DAILY`, `CIVIL_DAILY_CAUSE_LIST`, `FAMILY_DAILY_CAUSE_LIST`, many RCJ/tribunal lists, SJP public/press lists, etc. Some older `CROWN_DAILY_LIST` variants are marked deprecated in code.

Other API behaviour (documented):

- Retries: up to **3** further attempts on non-2xx
- Deletion: DELETE notified for **manual** removals; **no** notification when `displayTo` expires
- Future-dated pubs: forwarded at **1AM UTC** on first active morning
- Rate limits: **not publicly documented** as numeric limits (push model)

### 2.5 Update frequency / history / mutability

From licence application guidance:

- Default pattern: publish **next day’s** lists at **23:59**, remove at **23:59** on the content date.
- Jurisdictions may publish earlier / keep longer.
- Lists can be **updated or removed** after initial publish; HMCTS publishes latest authorised version.
- Supersession keys: provenance, list type, location ID, language, content date.
- Criminal Procedure Rules 2025 r.5.11: court officer must publish hearing info for public hearings for **no longer than 5 business days** (electronic arrangements as directed by the Lord Chancellor). Source: https://www.legislation.gov.uk/uksi/2025/909/part/5

**Historical archives are not a public CaTH feature for general reuse.** Any retention beyond display windows is a **licence-condition** question, not a default right.

### 2.6 Stable identifiers

| Entity | Stable ID? |
|--------|------------|
| Publication | UUID `publicationId` — yes for API lifecycle |
| Court / location | `locationName` in metadata; location IDs used for supersession — need onboarding docs for stable location IDs |
| Individual hearing/defendant | Depends on payload schema per `listType`; **do not assume** permanent person-level IDs |

Existing PrisonsOnline HMCTS slugs (e.g. `birmingham-crown-court`-style ids in `hmcts_sites.json`) may align with FaCT slugs but **must be validated** against CaTH location identifiers during onboarding — do not assume 1:1.

---

## 3. Licensing and republication (critical)

### 3.1 Controlling framework (current as of July–Aug 2026)

HMCTS + MoJ + National Archives + Judiciary introduced the **Third-Party Courts and Tribunals Data Licence**.

Key pages:

- Overview: https://www.gov.uk/government/publications/hmcts-third-party-courts-and-tribunals-data-licence
- Apply: https://www.gov.uk/guidance/apply-for-an-hmcts-third-party-courts-and-tribunals-data-licence
- Full guidance: https://www.gov.uk/government/publications/hmcts-third-party-courts-and-tribunals-data-licence/hmcts-third-party-courts-and-tribunals-data-licence-application-guidance
- Parallel/service page: https://www.gov.uk/government/publications/hm-courts-and-tribunals-service-hmcts-third-party-courts-and-tribunals-data-licence
- API requirements: (linked above)

Contact: **thirdpartydatalicence@justice.gov.uk**  
Publications issues: **publicationsinformation@justice.gov.uk**

### 3.2 What requires a licence

Guidance defines **computational analysis** as bulk machine processing, including:

- parsing non-machine-readable information
- **programmatic scanning and searching** of published information
- algorithms

And states that because of **Crown database rights** in court/tribunal lists:

> if you wish to re-use and undertake computational analysis of the data available, you must apply for a Third-Party Courts and Tribunals Data Licence.

Without a licence, guidance says you are prevented from:

- copying the information
- distributing copies (free or paid)
- renting/lending copies
- making an adaptation
- **sharing it on the internet**

**Implication for PrisonsOnline:** building programmatic hearing pages by ingesting CaTH (API **or** scrape) is squarely inside this regime.

### 3.3 Open Justice Licence v2.0 — does not unlock SEO listings

https://caselaw.nationalarchives.gov.uk/open-justice-licence/version/2

CaTH material may also be referenced under OJL v2.0, but OJL **explicitly excludes**:

> computational analysis of the Information (**including indexing by search engines**)

Also:

- Must use current version; remove when withdrawn/replaced
- Hearings data retention **maximum two years** under OJL (subject to further DP law)
- Attribution required
- Not a data-sharing / processing agreement for personal data

**You cannot rely on OJL alone to run a Google-indexable hearing-list product.**

### 3.4 Licence types

| Type | Term | Public product allowed? |
|------|------|-------------------------|
| **Experimental** | 1 year | **No** — POC only; may not be released to customers or the public |
| **Transactional** | 3 years | **Yes** — commercial services/products (subject to conditions) |

High-risk use cases are steered to Experimental only (automated legal advice, predictive analytics for clients, influencing whether to pursue justice, **personal profiling especially combined with other datasets**).

Combining hearing personal data with prison inmate content could be read as **profiling risk** — ask HMCTS explicitly.

Initial grant is **free**; charges may appear later at renewal.

### 3.5 Public vs Restricted data

- **Public Data:** available to all members of the public on CaTH
- **Restricted Data:** media / professional users only

PrisonsOnline should apply for **Public Data only** unless it becomes an accredited media/professional product with access controls.

Media protocol / professional protocols exist separately; Restricted Data must not be republished to the general public.

### 3.6 Personal data / controller status

Guidance:

- Lists include personal data (parties, judges; sometimes sensitive details)
- MoJ is controller for facilitating reuse publication on CaTH
- Successful licensees **become data controllers** and must comply with UK data protection law
- Application requires **DPIA**; possibly Appropriate Policy Document for criminal offence data; retention period must be justified
- Panel may shorten/lengthen retention; approved retention becomes licence condition
- Article 6(e) UK GDPR cited as lawful basis for providing data; Article 10 where criminal offence/conviction data applies

### 3.7 Can PrisonsOnline do A–G?

| Question | Answer (current public terms) |
|----------|-------------------------------|
| **A. Retrieve** | Only via approved outbound API after licence (or human browsing). Programmatic retrieval without licence: **no**. |
| **B. Store** | Only under licence + agreed retention. Default CaTH display windows are short. |
| **C. Republish** | Only if licence (Transactional for public) + publishing policy + conditions allow. |
| **D. Public pages** | Requires **Transactional** licence (Experimental forbids public release). |
| **E. Allow Google/Bing index** | **Ambiguous / high risk.** OJL excludes search-engine indexing for computational analysis; Third-Party panel assesses **“Discoverability”** as a principle. Must ask HMCTS whether indexable public pages (especially with names) are permitted. |
| **F. Monetise with ads** | Commercial use points to Transactional licence; not automatically forbidden, but subject to panel conditions and “dignity / administration of justice” principles. Ask explicitly. |
| **G. Retain historical lists** | Not by default. OJL max 2 years for hearings data; CaTH removes lists quickly; CPR 5.11 caps official publication windows; Third-Party retention is panel-set. Long-term public archives of defendant names are especially fraught. |

### 3.8 Publishing policy

GOV.UK notes (18 Aug 2026) that a **publishing policy** link was added for licensees sharing derived products. Exact standalone PDF content was not reliably extractable as a separate public HTML body during this investigation — **obtain and read the current publishing policy before any build**, and ask HMCTS if the linked artefact is incomplete.

### 3.9 Ambiguities — ask HMCTS

1. Is a **public, ad-supported court hearing summary site** an acceptable Transactional use case?
2. May we **index** pages in search engines? If yes: with names, or only aggregate/no-name pages?
3. Required **retention** and mandatory **deletion** after `displayTo` / CPR windows?
4. Must we mirror **withdrawals/supersessions** within a specific SLA?
5. Are **aggregate statistics** (hearing counts by court/day) treated as derived data still needing the same licence?
6. Does linking prison pages ↔ court pages create a **profiling** concern under high-risk criteria?
7. Exact **location ID** mapping and which `listType`s we will receive for Public sensitivity only.

**This report is not legal advice.** Instruct counsel before applying/building if commercial liability matters.

---

## 4. CourtServe (competitor / reference only)

**Do not scrape. Do not use as a data source without an explicit licence (we do not have one).**

| Topic | Finding |
|-------|---------|
| What it publishes | Public daily courtroom lists (registration); premium CourtServe 2000 / Express for near-real-time + advance/warned/firm lists |
| Origin | Courtel Communications under licence from Secretary of State / HMCTS |
| Licensing | Crown copyright lists; site T&Cs forbid copying, redistribution, derivative works, combining with other data, selling onward |
| API for third parties | No public open API for general republication found |
| Paid access | Yes (e.g. Crown Express priced per court/year on their site) |
| Google indexation | Listing pages often behind sign-in; limited deep index compared with open HTML aggregators |
| URL architecture | e.g. `/courtlists/current/crown/indexv2crowndailies.php`, view endpoints, archives behind auth |

T&Cs: https://www.courtserve.net/generic/t-and-c.php

CourtServe is proof of **demand among professionals**, not a supply path for PrisonsOnline.

---

## 5. Other official data sources (court profiles)

These are the right foundation for **permanent court pages** without CaTH hearing payloads.

### 5.1 Find a Court or Tribunal (FaCT)

- UI: https://www.find-court-tribunal.service.gov.uk/
- Example profile: https://www.find-court-tribunal.service.gov.uk/courts/birmingham-crown-court  
  Includes address, opening times, email, phone, facilities, areas handled, Crown Court location code.
- Search JSON (server-side fetch works; browser CORS locked to FaCT origin):  
  `https://www.find-court-tribunal.service.gov.uk/search/results.json?q=...`  
  Returns lat/lon, slug, addresses, types, areas of law, etc.
- GitHub: https://github.com/hmcts/fact-api (MIT code; production access/ToS still need checking for bulk reuse)

### 5.2 data.gov.uk — Court locations (OGL)

- https://www.data.gov.uk/dataset/7e62854a-2926-4f86-bdfb-b88c0800c628/court-locations  
- Licence: **UK Open Government Licence**  
- CSV observed: https://factprod.blob.core.windows.net/csv/courts-and-tribunals-data.csv (~788 rows)  
- Fields: name, lat, lon, codes, slug, types, open, dx_number, areas_of_law, addresses  
- Quality caveat: some closed/historic rows have `0.0,0.0` coords and “No address available”.

### 5.3 Existing in-repo HMCTS snapshot

`hmcts_sites.json` already gives ~332 sites with jurisdictions and regions — enough to stand up directory hubs mirroring probation, then enrich from FaCT/OGL.

### 5.4 Other MoJ / GOV.UK

- HMCTS hearing lists collection (pointers, not bulk data)
- Criminal court statistics quarterly (caseload demand context, not per-hearing SEO pages)
- Media protocol PDFs for understanding Restricted vs public list content

**No official court↔prison relationship dataset was found.**

---

## 6. SEO investigation

### 6.1 Verified: PrisonsOnline current Search Console

Property `sc-domain:prisonsonline.com` (28 days to 12 Sep 2026):

- **Clicks: 3**
- **Impressions: 3,569**

The site is early-stage. Court content would be additive growth, not amplification of a large existing base.

### 6.2 Keyword volumes

Google Ads Keyword Planner was queried (GB) with seeds such as “Birmingham Crown Court listings”, “magistrates court listings”, court address queries, etc.

**Result: all returned average monthly searches = 0** for the idea set. That is **not credible demand evidence** (tool/account limitation or zero-fill).  

**Do not invent volumes.** Treat demand as **qualitative / SERP-inferred** until a reliable volume source is obtained (different Ads account, third-party keyword tool, or GSC after launch).

### 6.3 SERP observations (representative queries)

For listings-style queries (e.g. “Birmingham Crown Court listings today”, “Manchester Crown Court listings”):

| Player type | Examples observed | Notes |
|-------------|-------------------|-------|
| Official | CaTH / GOV.UK / Find a Court | Strong for trust; CaTH UX is multi-step |
| Licensed distributor | CourtServe | Often sign-in gated |
| Niche aggregators | courtslistings.co.uk, courtlisting.co.uk, causealert.com, thelawpages.com, opencourtdata.uk | Already occupy long-tail listing SERPs |
| Local news | Sometimes for sentencing stories | Strong for newsy queries |

For **profile** queries (address / phone / opening times):

- **Find a Court or Tribunal** dominates / is the authoritative entity page.
- Aggregators and directories also rank by copying FaCT-like fields.

### 6.4 Programmatic SEO opportunity (assumption vs verified)

**Verified:**

- Many long-tail query variants exist (listings today/tomorrow, cases today, cause list, sentencing, courtserve-branded queries).
- Weak/niche sites already rank — official sources do not perfectly monopolise every long-tail SERP.
- Court **profile** queries are more “entity durable” than daily list queries.

**Assumption (label clearly):**

- Daily list pages may attract repeat intent but are short-lived and competitive.
- Court profiles + guides may be easier wins and safer legally.
- Material traffic uplift for PrisonsOnline is uncertain given current domain authority/traffic.

### 6.5 Topical relevance risk

Prisonsonline’s topical centre is **prisons**. Courts are adjacent (remand, sentencing, visiting after court) but expanding into full national court-listings competition could:

- dilute brand relevance, or
- create a sensible “justice geography” directory if framed as court↔prison navigation.

Safer SEO framing: **court information for people who also need prison information**, not “another CourtServe”.

---

## 7. Indexation / privacy risk

### 7.1 The core distinction

| Pattern | Example | Risk |
|---------|---------|------|
| Entity / aggregate | “Birmingham Crown Court — address, facilities; 37 hearings listed today” | Lower if no names; still needs licence if derived from CaTH computationally |
| Personal / case | “John Smith appears at Birmingham Crown Court today” | High: DP, rehabilitation, reporting restrictions, erasure, liability |

### 7.2 Risk inventory

- **UK GDPR / DPA 2018:** licensee becomes controller; criminal offence data may engage Art. 10 special rules.
- **Rehabilitation / spent convictions:** republishing old listings creates long-tail search harm.
- **Right to erasure / delisting:** expect removal requests; need process + technical ability to purge.
- **Stale/inaccurate lists:** lists change; supersession/deletion must be honoured (API DELETE + displayTo).
- **Contempt / reporting restrictions:** public lists may still be subject to restrictions; republishers bear responsibility (HMCTS/media materials emphasise this).
- **Safeguarding:** youth cases often excluded from public magistrates lists; must not reconstruct them.
- **Search removal / reputation:** indexed name pages are the primary hazard.
- **Licence “Discoverability” principle:** panel may refuse or condition indexable name pages.

### 7.3 Recommendation (clear)

**Do not build permanently indexed defendant/case pages.**

Recommended architecture if hearings are ever licensed:

| Page type | Index | Sitemap | Retention |
|-----------|-------|---------|-----------|
| Court profiles (address, phone, facilities, jurisdiction) | **index** | include | Permanent |
| Court type / region hubs | **index** | include if ≥ threshold | Permanent |
| Court guides (how listings work, link to CaTH) | **index** | include | Permanent |
| Aggregate “hearings today” counts without names | **ask HMCTS**; default **noindex** until cleared | exclude | Match display window |
| Daily lists with names / case numbers | **noindex, nofollow**; `X-Robots-Tag` | exclude | Delete at expiry / withdrawal |
| Person/case permalink pages | **Do not build** | — | — |

Prefer deep-linking users to **official CaTH** for authoritative name-bearing lists when unsure.

---

## 8. Product architecture (only if licensed)

### 8.1 Fit with existing design

Current site = **static JSON → SSG**. Live hearings need:

```text
CaTH outbound API
  → HTTPS receiver (Edge/API route or separate worker)
  → auth verify + multipart parse
  → normalise by listType schema
  → store publications + derived hearing rows
  → expire/delete jobs
  → court profile pages (SSG/ISR) + optional noindex daily pages (dynamic)
```

This is a **new subsystem**. Do not pretend `data:build` alone can run daily lists.

### 8.2 Suggested logical tables (if adding a DB)

Existing code has no SQL DB. If hearings proceed, introduce persistence (e.g. Postgres/Supabase) **alongside** continuing SSG for stable court profiles:

- `courts` — stable slug, FaCT id, HMCTS institutional id, lat/lon, jurisdiction flags
- `court_types` / jurisdiction enum
- `court_hearing_publications` — publicationId, listType, sensitivity, contentDate, displayFrom/To, raw payload ref, supersedes
- `court_hearings` — optional normalised rows (**prefer not exposing personally identifiable fields publicly**)
- `court_locations` — if multi-building centres
- `court_prison_nearby` — precomputed distance pairs, labelled “geographic proximity only”

### 8.3 Pipeline concerns

| Concern | Approach |
|---------|----------|
| Dedup / supersession | Key on publicationId + listType/location/contentDate/language |
| Stable court IDs | Map CaTH location ↔ FaCT slug ↔ `hmcts_sites` slug with manual override table |
| Updates | PUT replaces; serve only latest |
| Deletion | DELETE removes; also purge when `displayTo` passed (no API notify) |
| Cron | Hourly expiry sweeper; health GET for CaTH |
| Failures | 2xx quickly; durable queue for processing; alert on retry exhaustion |
| Stale data | Show `lastUpdated`; banner “lists change; check CaTH” |
| Attribution | Visible HMCTS/CaTH attribution + licence statement |
| Caching | Short TTL for hearing views; long TTL for profiles |

### 8.4 Complexity vs current stack

**Technical difficulty is medium-high** operationally (webhooks, auth, multipart, retention) even if UI is simple — because the repo today has none of that.

---

## 9. Court ↔ prison connection

### 9.1 Official relationships

**None found** (no MoJ dataset mapping “this Crown Court remands to HMP X”).

### 9.2 Acceptable approach

**Geographic proximity only**, clearly labelled:

> “Prisons near Birmingham Crown Court (by straight-line distance). This does not mean prisoners from this court are held in these prisons.”

Requirements:

1. Geocode courts (FaCT lat/lon where valid) and prisons (currently missing — geocode HMPPS addresses).
2. Haversine / distance sort; show top N within radius (e.g. 40 miles) with distance.
3. Optional editorial links for well-known local pairs — still labelled non-official.

### 9.3 Existing coords

- UK prisons import: **0/123** with coordinates  
- HMCTS sites import: **0/332** with coordinates  
- FaCT search/CSV: **often has lat/lon** for open courts  

Geocoding is a prerequisite for “nearby” modules.

---

## 10. Proposed site structure

### 10.1 Recommended URL architecture

Align with existing `/probation` directory pattern; keep prison URLs untouched.

**Indexable (MVP-safe):**

- `/courts/`
- `/courts/crown-courts/`
- `/courts/magistrates-courts/`
- `/courts/county-courts/` (if enough quality pages)
- `/courts/{region}/` (map from FaCT county/region carefully; avoid thin pages — use ≥3 threshold)
- `/courts/{court-slug}/` e.g. `/courts/birmingham-crown-court/`

**Hearing URLs — only after Transactional licence + privacy design:**

- `/courts/{court-slug}/hearings/` → today/upcoming **summary**, default **noindex**
- `/courts/{court-slug}/hearings/{yyyy-mm-dd}/` → daily detail, **noindex**, auto-expire

Avoid `/court-hearings/...` as a parallel taxonomy unless it only hubs to court pages (duplicate URL risk).

### 10.2 What not to mint

- Millions of historical day URLs
- Per-defendant URLs
- Per-case URLs
- Duplicate region taxonomies that collide with prison regions without clear labels

### 10.3 Robots / sitemap

- Profiles + hubs: sitemap include  
- Named daily lists: sitemap exclude + noindex  
- Expired days: **410** or delete (site already uses 410+noindex for retired legacy paths in middleware — reusable pattern)

---

## 11. Commercial potential (ranges / scenarios, no fabricated revenue)

### Inventory

- ~300–800 court/tribunal location entities depending on source and open/closed filtering  
- Daily publications across Crown + magistrates + civil/family + tribunals = large **ephemeral** page churn if indexed (bad idea) or manageable **noindex** working set if only “today/tomorrow”

### Traffic scenarios (qualitative)

| Scenario | Condition | Likely outcome |
|----------|-----------|----------------|
| Court profiles only | OGL/FaCT + decent content | Modest long-tail entity traffic; supports prison internal links |
| Licensed aggregate hearings (no names, noindex) | Transactional licence | Weak SEO; possible direct/repeat utility |
| Licensed indexable named lists | Licence + panel allow discoverability | Highest traffic upside **and** highest legal/reputational risk — **not recommended** |
| Status quo competitors | Many niches already ranking | Harder than “empty SERP” narrative |

### Fit with ads

Directory/entity pages fit existing AdSense directory/entity policies better than name-bearing crime lists (brand safety / sensitive content risk).

### Topical broadening

Court **profiles + prison proximity** broaden sensibly. Becoming a national listings competitor dilutes the prison brand and picks a fight with CaTH, CourtServe, and aggressive aggregators — some of whom may themselves be on shaky licensing ground post-July 2026.

---

## 12. Final verdict

### Verdict

**AMBER** — viable but requires clarification/licensing first.

Hearing-list republication is **not** a green-light open-data scrape. Court **directory** pages are a nearer, safer product that already fits the codebase.

### Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Data accessibility | **6/10** | CaTH outbound API is real and documented, but gated; no public pull API |
| Licensing clarity | **4/10** | Clear that a licence is required; unclear on indexing, ads, retention, profiling with prison data |
| Technical difficulty | **5/10** | Court profiles easy (existing HMCTS/probation patterns). Live hearings harder (new ops stack) |
| SEO potential | **6/10** | Long-tail demand plausible; SERPs contested; Keyword Planner volumes unverified; domain still tiny |
| Commercial potential | **4/10** | Upside speculative; ads on crime lists risky; profiles modest |
| Fit with PrisonsOnline | **6/10** | Geographic + visitor journey fit; full listings product is a brand stretch |

### Biggest Opportunity

Ship an **HMCTS/FaCT court directory** (mirroring probation), geocode prisons/courts, and add **honest “nearby prisons / nearby courts”** modules — without republishing defendant lists. Optionally deep-link to CaTH for official lists.

### Biggest Risk

Computationally ingesting and SEO-indexing **named hearing lists** without a Transactional licence (or beyond licence conditions) — Crown database rights, DP controller duties, reporting restrictions, and the OJL exclusion of search-engine indexing for computational analysis.

### Recommended MVP

1. Public `/courts/` directory from existing `hmctsSites` + FaCT/OGL enrichment.  
2. Geocode prisons and courts.  
3. Nearby links both ways with proximity disclaimer.  
4. Editorial “How to find a court hearing list” guide pointing to CaTH.  
5. **In parallel (non-engineering):** prepare Transactional licence application + DPIA if hearings remain desired.

### What I Would NOT Build

- Scrapers for CaTH or CourtServe  
- Indexable defendant/case pages  
- Long-term public hearing archives  
- Restricted/media-only list content on a public site  
- Predictive “outcome” or profiling features (explicitly high-risk under the licence regime)

### Exact Next Step

**Apply for (or pre-enquire about) an HMCTS Third-Party Courts and Tribunals Data Licence — Public Data, Transactional — before writing hearing ingestion code.**

1. Read full guidance + API requirements + publishing policy:  
   - https://www.gov.uk/guidance/apply-for-an-hmcts-third-party-courts-and-tribunals-data-licence  
   - https://www.gov.uk/government/publications/hmcts-third-party-courts-and-tribunals-data-licence/hmcts-third-party-courts-and-tribunals-data-licence-application-guidance  
2. Email **thirdpartydatalicence@justice.gov.uk** with the questions in §3.9 (especially indexing, ads, retention, prison linkage / profiling).  
3. Prepare DPIA + use-case statement emphasising:  
   - Public Data only  
   - No personal profiling  
   - Prefer aggregate / noindex for personal fields  
   - Attribution to HMCTS/CaTH  
   - Deletion aligned to display windows  
4. Confirm outbound API receiver capability (public HTTPS BaseURL + OAuth client credentials + GPG exchange).  
5. Meanwhile, if product value is needed sooner: build **court profiles only** (no CaTH hearing payloads).

Online application entry point: the “Apply online” form linked from the guidance page above.

---

## Source index (primary)

| Topic | URL |
|-------|-----|
| CaTH service | https://www.court-tribunal-hearings.service.gov.uk/ |
| HMCTS hearing lists collection | https://www.gov.uk/government/collections/hmcts-hearing-lists |
| Third-Party licence hub | https://www.gov.uk/government/publications/hmcts-third-party-courts-and-tribunals-data-licence |
| Apply for licence | https://www.gov.uk/guidance/apply-for-an-hmcts-third-party-courts-and-tribunals-data-licence |
| Application guidance | https://www.gov.uk/government/publications/hmcts-third-party-courts-and-tribunals-data-licence/hmcts-third-party-courts-and-tribunals-data-licence-application-guidance |
| API requirements | https://www.gov.uk/government/publications/hmcts-third-party-courts-and-tribunals-data-licence/court-and-tribunal-hearings-service-application-programming-interface-api-requirements |
| Open Justice Licence v2.0 | https://caselaw.nationalarchives.gov.uk/open-justice-licence/version/2 |
| CPR 2025 r.5.11 | https://www.legislation.gov.uk/uksi/2025/909/part/5 |
| CourtServe T&Cs | https://www.courtserve.net/generic/t-and-c.php |
| FaCT | https://www.find-court-tribunal.service.gov.uk/ |
| Court locations OGL dataset | https://www.data.gov.uk/dataset/7e62854a-2926-4f86-bdfb-b88c0800c628/court-locations |
| ListType source | https://github.com/hmcts/pip-data-models/blob/master/src/main/java/uk/gov/hmcts/reform/pip/model/publication/ListType.java |

---

*End of investigation report.*
