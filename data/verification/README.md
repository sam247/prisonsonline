# Internal UK verification artifacts

This directory is **not** a public route. Prison pages do not read `state.json`.

- `reports/` — dry-run / job output for inspection
- `audit.jsonl` — append-only audit trail (gitignored)
- `state.json` — internal verification stamps (gitignored)
- `overlay.json` — live overlay snapshot when writes are enabled (gitignored)
- `latest.json` — last run observability summary (gitignored)
