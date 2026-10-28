# Verification queue (`queue.json`)

One entry per prison profile (UK and US, 272 in total), keyed by slug. It replaces three fragile things:
the gitignored `state.json` (empty in every fresh worktree, so the selector fell back to alphabetical and re-checked
Belmarsh/Berwyn), the hand-kept `us-next-slugs.txt`, and the `/cursor/stores/...` copy-in/copy-out. **Do not hand-edit
`lastVerified`, `nextDue` or `status`**: they are derived from `checkHistory` every time the file is loaded or written.

## Entry fields

| Field | Meaning |
|---|---|
| `tier`, `tierBasis` | 1, 2 or 3, and why (see below). |
| `selection` | `auto` (picked by the selectors), `manual-only` (only via `--slugs=`), `excluded` (never checked, kept for the record). |
| `lastVerified` | Latest full verifier pass that did not fail. `null` = never fully verified. Partial evidence never counts. |
| `lastAttempt` | Latest attempt of any kind, including `VERIFICATION_FAILED`. |
| `nextDue` | `lastVerified` + tier interval (30/60/90 days). After a failure: `lastAttempt` + 1 day. Never-verified entries stay due. |
| `status` | Status of the latest attempt (`CURRENT`, `CHANGED`, `REVIEW_REQUIRED`, `VERIFICATION_FAILED`, `UNVERIFIED`). |
| `discrepancyHistory` | Every CHANGED / REVIEW_REQUIRED / correction ever seen, with the fields. |
| `dataReliabilityFlags` | Short strings (below). Flags are only ever added, never removed by the tooling. |
| `checkHistory` | Every check with `at`, `status`, `basis` (where the evidence came from), `mode`, `partial`, `alsoSeenIn`. Append-only. |
| `sourceUpdatedAt` | GOV.UK `public_updated_at` last seen (UK only). |

Raw evidence the seed was built from is copied (never moved) into `history/`: audit logs, state files, run reports,
the retired `us-next-slugs.txt`, and `uk-tier-basis-traffic-2026-10-26.csv` (impressions behind the tier 1 pick).

## Persistence: repo copy + working copy

Runs start from a fresh checkout of `origin/main`, and the repo copy only changes when a PR merges. So there are two copies:

- repo copy: `data/verification/queue.json` (tracked, reviewed in PRs)
- working copy: `/workspace/prison-verifier/queue.json` (override with `--queue-working=PATH` or `PRISON_VERIFIER_QUEUE_PATH`)

Every selector run loads **both**, merges per slug, and after the run writes the merged result to **both**
(atomic write). Merge rule per slug: the entry with the latest `lastVerified` wins, then the latest attempt, then the
working copy. Tier, `tierBasis` and `selection` come from the repo copy (so a tier change merged in a PR takes effect).
Check history, discrepancy history and flags are unioned, so a stale repo copy can never erase a newer check and vice
versa. Loading fails closed: with neither copy present the selectors throw, they never fall back to alphabetical.
New site prisons the queue has not seen are added as due (`added-after-seed`).

Write-back happens for runs with writes on. A dry-run does not update the queue (it may have detected a SAFE change it
did not apply, and marking it verified would hide that for 30+ days); add `--queue-update` to record one anyway, or
`--no-queue-update` to skip it. The legacy `state.json` / `audit.jsonl` / `latest.json` are still written as before.

## Tiers

| Tier | Members | Recheck | Early recheck |
|---|---|---|---|
| 1 | 40 UK prisons | 30 days | none |
| 2 | other 82 UK prisons | 60 days | when GOV.UK `public_updated_at` is later than `lastVerified` (one collection API call per run) |
| 3 | 143 US federal (BOP) | 90 days | none |

Seven legacy US profiles are not in the 143 (decisions below). Overdue order is: tier, then oldest successful
verification (never-verified first), then GOV.UK source changed, then past discrepancies, then more data-reliability flags.

### Tier 1 selection basis (UK, 40)

- 6 Category A / high security (Belmarsh, Frankland, Full Sutton, Long Lartin, Wakefield, Whitemoor)
- 10 with a past discrepancy (CHANGED, REVIEW_REQUIRED, or a correction made outside a run): Birmingham, Cookham Wood,
  Elmley, Holme House, Leeds, Liverpool, Manchester, Preston, Wandsworth, Wormwood Scrubs
- 1 with an open operating-status review (Dartmoor)
- 23 more by Bing + GSC impressions over 28 days (`/workspace/prisons-ci/ctr_baseline_2026-10-17.csv`, profile plus
  contact-details pages), highest first, until 40. Ranks used: 1, 3, 4, 5, 7, 9-18, 20-24, 26-28 (rank is in each `tierBasis`).

GSC data for the profile pages was not re-pulled; the 17 Oct baseline is the traffic evidence. Re-rank by editing `tier`
in the repo copy via a PR (the merge takes tier from the repo copy).

### Legacy US profiles (7)

| Slug | Decision | Why |
|---|---|---|
| `fci-terminal-island` | `excluded`, tier 3 | Duplicate of `terminal-island-fci` (BOP import). The existing exclusion map missed it. |
| `alcatraz` | `excluded` | Historical museum site, no live facility. |
| `san-quentin`, `folsom-state-prison`, `angola`, `sing-sing`, `rikers-island` | `manual-only` | State/city sources are not automatable (verifier always returns REVIEW_REQUIRED); check by hand with `--slugs=`. |

Duplicates are never auto-included: the only duplicate pair is `fci-terminal-island` / `terminal-island-fci`.
The overlay also holds an orphan key, `united-states/adx-florence`, which has no profile (the live profile is
`florence-admax-usp`). It was not touched; it stays in the overlay count.

## Seed method and caveats

Seeded on 26 Oct 2026 by `scripts/seed-verification-queue.ts` from: both overlays' `appliedAt`, the audit logs and state
files (shared checkout, `/workspace/uk-verifier-state`, `/workspace/prison-verifier`), the written run reports, and the
UK routine's run summaries (18 Sep to 22 Oct; times are the 09:00 London slot, so marked estimated). Records for the same
prison within 2 hours are merged into the best-evidenced one with `alsoSeenIn` noting the others.

**The 20 Oct bop.gov bulk backfill is stored as partial evidence, not a verification.** About 113 US prisons share one
`appliedAt` timestamp from a contact/visiting backfill (email, postal address, visiting rules URL). Name, address, phone and
category were not re-verified, so these entries have `lastVerified: null` and the `contact-backfill-only` flag. Counting
them as verified would have hidden about 113 prisons from the queue.

## Flag vocabulary

`contact-backfill-only`, `source-omits:<field>`, `visiting-hours-no-structured-source`,
`category-conflict:site-Medium-vs-bop-Low`, `parked-sam-decision` (REVIEW item waiting on Sam), `sam-decision:...`,
`bop-directory-no-unique-match`, `closure-official-source-pending`, `duplicate-of:<slug>`, `added-after-seed`,
`state-doc-source-not-automatable`, `cdcr-403-from-box`, `operating-status-review-open`, plus short free-text notes.

## Routine commands (each run, from a fresh `origin/main` worktree)

```bash
npx tsx scripts/queue-status.ts --source-changes --next=4        # before: overdue counts by tier + what is due next
UK_PRISON_VERIFIER_WRITE=1 UK_PRISON_COMPLETENESS_WRITE=1 \
  npx tsx scripts/verify-uk-prisons.ts --write --completeness-write --limit=2
US_PRISON_VERIFIER_WRITE=1 US_PRISON_COMPLETENESS_WRITE=1 \
  npx tsx scripts/verify-us-prisons.ts --write --completeness-write --limit=2
npx tsx scripts/queue-status.ts --log-row --processing-seconds=<n> --est-usage="<text>"   # append the throughput row
```

The selectors write the queue to both copies themselves; commit `data/verification/queue.json` with the run's PR if the
worktree copy changed. Throughput log: `/workspace/prison-verifier/throughput-log.csv`
(`date,unique_prisons,repeat_checks,overdue_by_tier,processing_time,failed_runs,estimated_usage,notes`).

## Known limits

At 2 UK + 2 US per run (6 UK/week) tier 1 alone needs about 9 UK checks per week at 30 days, so tier 2 is starved once
tier 1 is fully caught up unless the batch grows or tier 1 shrinks. The queue reports this honestly through the overdue
counts rather than hiding it.
