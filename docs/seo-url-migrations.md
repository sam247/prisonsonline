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
