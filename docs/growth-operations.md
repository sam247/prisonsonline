# Growth Operations

This project now includes two build-time growth controls so expansion remains measurable and maintainable.

## 1) Top entity cohort (top 100)

- Input directory: `data/growth/*.csv`
- Build command: `npm run data:build:growth-cohort`
- Output: `src/data/generated/topPrisonEntityCohort.generated.ts`

Expected CSV columns (case-insensitive):

- `page` (or `url` / `path`) with prison URL, e.g. `/prisons/uk/hmp-belmarsh`
- Optional metrics used for scoring: `impressions`, `clicks`, `users`, `active_users`, `sessions`, `rpm`, `adsense_rpm`

The script scores candidates and keeps the top 100 distinct prison entities. The intent rollout reads this cohort to decide where expanded intent pages are published.

## 2) Generated article pruning

- Input file: `data/growth/generated_article_prune.csv`
- Build command: `npm run data:build:article-prune`
- Output: `src/data/generated/articlePrune.generated.ts`

Expected columns:

- `slug`
- `prune` (`yes` to remove that generated slug from output)

This allows month-by-month pruning of low-value generated article families without editing source generators.

