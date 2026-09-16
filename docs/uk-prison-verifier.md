# UK prison verifier (Phase 1)

VERIFY, DON'T OPTIMISE. This job answers one question: **is the information we currently publish about this UK prison still correct?**

Dry-run is the default. Production prison data is not mutated unless both `--write` and `UK_PRISON_VERIFIER_WRITE=1` are set.

## How to dry-run ≥10 UK prisons

From the repo root (after `npm install`):

```bash
npx tsx scripts/verify-uk-prisons.ts --limit=10
```

Or a named set:

```bash
npx tsx scripts/verify-uk-prisons.ts --slugs=hmp-belmarsh,hmp-bedford,hmp-berwyn,hmp-wandsworth,hmp-leeds,hmp-liverpool,hmp-elmley,hmp-bullingdon,hmp-coldingley,hmp-preston
```

npm aliases:

```bash
npm run verify:uk              # one due UK prison, dry-run
npm run verify:uk:dry-run      # ten due UK prisons, dry-run
```

The command prints a TSV summary and writes:

- `data/verification/reports/run-<timestamp>.md` — field-by-field report for Sam
- `data/verification/reports/run-<timestamp>.json` — machine-readable copy
- `data/verification/latest.json` — what ran, success, source, changes, review, next check, failures
- `data/verification/audit.jsonl` — append-only audit trail
- `data/verification/state.json` — internal `last_verified_at` / `next_verification_at` / status (not public)

Dry-run **does not** write `hmpps_hmcts_json/`, `src/data/generated/ukPrisons.generated.ts`, or `src/data/generated/ukVerificationOverlay.generated.ts`.

## Daily routine (later enablement)

```bash
npm run verify:uk
```

Selects **one** due UK prison: never verified → failed/retry → oldest verification. Raise throughput later with `--limit=N` — same worker.

## Enabling writes (off by default)

Writes still only apply `SAFE_AUTO_CHANGE` values onto the existing **facility overlay** (`phone`, `postcode`, `email`). They do not rewrite prose, titles, slugs, HMPPS JSON, or US records.

```bash
UK_PRISON_VERIFIER_WRITE=1 npx tsx scripts/verify-uk-prisons.ts --limit=1 --write
```

`--write` without the env var is ignored.

## Tests

```bash
npm test
```
