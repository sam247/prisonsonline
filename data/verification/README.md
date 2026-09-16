# Internal verification artifacts

This directory is **not** a public route. Prison pages do not read `state.json`.

UK worker (`scripts/verify-uk-prisons.ts`) writes here:

- `reports/` — dry-run / job output for inspection
- `audit.jsonl` — append-only audit trail (gitignored)
- `state.json` — internal verification stamps (gitignored)
- `overlay.json` — live overlay snapshot when writes are enabled (gitignored)
- `latest.json` — last run observability summary (gitignored)

US worker (`scripts/verify-us-prisons.ts`) writes under `us/` with the same filenames so the two verifiers cannot clobber each other.

