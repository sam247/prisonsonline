# US prison verifier (Phase 1)

VERIFY, DON'T OPTIMISE. This job answers one question: **is the information we currently publish about this US prison still correct?**

Dry-run is the default. Production prison data is not mutated unless both `--write` and `US_PRISON_VERIFIER_WRITE=1` are set.

## Authority is a safety boundary

US corrections authority is fragmented. Source identification happens **before** extraction, from the published record only (operator / BOP import provenance). Geography is never enough.

| Identified authority | Allowed override hosts |
|---|---|
| Federal Bureau of Prisons (BOP import, or operator is BOP) | `bop.gov` only |
| State DOC (curated operator match, e.g. CDCR) | that state's official `.gov` host only |
| Local DOC (e.g. NYC Department of Correction) | that city's official `.gov` path only |

If the correct authority cannot be identified confidently — mixed federal/state signals, closed facilities, operator missing, or an unmatched operator — the classification is **`REVIEW_REQUIRED`**. Wikipedia, commercial directories, and AI knowledge must not fill the gap.

Federal BOP facilities are matched against the official BOP locations directory. There is **no** open-web search and **no** guessed URL heuristic. Ambiguous or missing directory matches are `REVIEW_REQUIRED`, not a web scrape.

## How to dry-run ≥10 US prisons

From the repo root (after `npm install`):

```bash
npx tsx scripts/verify-us-prisons.ts --limit=10
```

Or a named set:

```bash
npx tsx scripts/verify-us-prisons.ts --slugs=alderson-fpc,aliceville-fci,allenwood-low-fci,allenwood-usp,ashland-fci,atlanta-fci,atwater-usp,bastrop-fci,beaumont-low-fci,beckley-fci
```

npm aliases:

```bash
npm run verify:us              # one due US prison, dry-run
npm run verify:us:dry-run      # ten due US prisons, dry-run
```

The command prints a TSV summary and writes:

- `data/verification/us/reports/run-<timestamp>.md` — field-by-field report
- `data/verification/reports/PHASE1_US_DRY_RUN.md` — checked-in sample from a 10-prison run
- `data/verification/us/reports/run-<timestamp>.json` — machine-readable copy
- `data/verification/us/latest.json` — what ran, success, authority, source, changes, review, next check, failures
- `data/verification/us/audit.jsonl` — append-only audit trail
- `data/verification/us/state.json` — internal `last_verified_at` / `next_verification_at` / status (not public)

Dry-run **does not** write `us_prisons_clean_bundle/`, `src/data/generated/usPrisons.generated.ts`, `src/data/generated/usVerificationOverlay.generated.ts`, or any UK files.

## Daily routine (later enablement)

```bash
npm run verify:us
```

Selects **one** due US prison: never verified → failed/retry → oldest verification. Raise throughput later with `--limit=N` — same worker.

## Enabling writes (off by default)

Writes still only apply `SAFE_AUTO_CHANGE` values onto the existing **facility overlay** (`phone`, `postcode`, `email`). They do not rewrite prose, titles, slugs, BOP import JSON, generated modules, or UK records.

```bash
US_PRISON_VERIFIER_WRITE=1 npx tsx scripts/verify-us-prisons.ts --limit=1 --write
```

`--write` without the env var is ignored. The UK write env var cannot enable US writes.

## Tests

```bash
npm test
```
