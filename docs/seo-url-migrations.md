# SEO URL migrations

Baselines captured before redirect ships. Directory verifier overlays are not modified by these entries.

## 2026-09-17 — UK region slug spelling: Hertfordhire → Hertfordshire

- **Date (baseline captured):** 2026-09-17
- **Old URL:** `/prisons/uk/hertfordhire-essex-and-suffolk`
- **New URL:** `/prisons/uk/hertfordshire-essex-and-suffolk`
- **Change type:** Permanent 301 + generation correction (HMPPS region label misspelling)
- **GSC baseline (sc-domain:prisonsonline.com, ~90d ending 2026-09-17):**
  - Old URL: clicks **0**, impressions **1**, CTR **0%**, avg position **12**
  - New URL: not yet in GSC (`found: false`)
- **Backlinks:** no dedicated backlink connector reading available at ship time; treat GSC as primary baseline
- **Related queries/pages:** single low-volume region hub impression; no material query cluster attached in GSC sample
- **Generation fix:** `correctPrisonRegionLabel()` in `scripts/build-institutional-data.mjs` maps `HERTFORDHIRE, ESSEX & SUFFOLK` → `HERTFORDSHIRE, ESSEX & SUFFOLK` before slugify
- **Sitemap:** only corrected slug emitted after regen
- **Verifier overlays / facilitySources / completeness whitelist:** untouched
- **Commit:** https://github.com/sam247/prisonsonline/commit/98b8e3710fdb92cdea51002d694ea5306861659d

## 2026-09-28 — UK prison slug spelling: hmp-wakfield → hmp-wakefield

- **Date (baseline captured):** 2026-09-28
- **Old URLs:** `/prisons/uk/hmp-wakfield` and intent pages `/prisons/uk/hmp-wakfield/{visiting-times,contact-details,booking-a-visit,what-to-expect}`
- **New URLs:** `/prisons/uk/hmp-wakefield` (+ same intent paths)
- **Change type:** Permanent redirect (Next.js `permanent: true`, 308) + generation correction (HMPPS prison id/name misspelling "HMP Wakfield")
- **Official identity:** GOV.UK https://www.gov.uk/guidance/wakefield-prison — "Wakefield Prison"; address "HMP Wakefield, 5 Love Lane, Wakefield, West Yorkshire, WF2 9AG"
- **GSC baseline (sc-domain:prisonsonline.com, 90d 2026-06-30 → 2026-09-28):**
  - Old URL: `found: false` (clicks 0, impressions 0)
  - New URL: `found: false`
- **Backlinks:** no dedicated backlink connector reading available at ship time; treat GSC as primary baseline
- **Generation fix:** `scripts/prison-identity-corrections.mjs` (`correctPrisonIdentity()`) maps HMPPS id `hmp-wakfield` → `{ id: "hmp-wakefield", name: "HMP Wakefield" }`; used by `build-institutional-data.mjs` (slug, name, narrative, institutionalId) and `build-court-directory.mjs` (prison coordinate overlay slug) so nearby-courts stays aligned. `sourceRaw` keeps the upstream HMPPS values for audit.
- **Slug-keyed data updated:** `src/data/prisonImages.json` key and `data/prison-images.csv` path (image queue), `prisonCoords.generated.ts` slug
- **Sitemap:** only corrected slug emitted after regen
- **HMPPS JSON / verifier overlays / facilitySources:** untouched
- **Commit:** (filled after merge)
