# Completeness dry-run (10 UK + 10 US)

Generated: 2026-09-17 09:22:20 UTC

## Guardrails

- VERIFY behaviour unchanged (`UK_PRISON_VERIFIER_WRITE=1` / `US_PRISON_VERIFIER_WRITE=1` + `--write` for `SAFE_AUTO_CHANGE` only).
- Completeness production writes **OFF** by default (`--completeness-write` + `UK_PRISON_COMPLETENESS_WRITE=1` / `US_PRISON_COMPLETENESS_WRITE=1`).
- This dry-run: `productionMutations = 0`, `completenessWrites = 0`.
- Authoritative sources only: GOV.UK/HMPPS (UK), BOP locations directory (US). No Wikipedia/directories/AI guessing.
- Historical/closed facilities excluded from active completeness (Alcatraz not in sample).
- Facility/identity-level `REVIEW_REQUIRED` or VERIFY failure suppresses all completeness writes.

## Summary

- Rows: 20 (10 UK + 10 US)
- VERIFY REVIEW_REQUIRED (completeness suppressed): 4
- Completeness SAFE_FILL candidates: 10
- productionMutations: 0
- completenessWrites: 0

## Table

| Prison | Country | Empty supported fields | Authoritative values found | SAFE_FILL | REVIEW_REQUIRED | UNSUPPORTED_FIELD | Would write |
| --- | --- | --- | --- | --- | --- | --- | --- |
| hmp-bedford | UK | email | email=(none) | — | — | governor, gettingThere | — |
| hmp-belmarsh | UK | — | — | — | — | visitingTelephone, governor, gettingThere | — |
| hmp-berwyn | UK | email | email=(none) | — | — | visitingTelephone, governor, gettingThere | — |
| hmp-bullingdon | UK | email | email=(none) | — | — | visitingTelephone, governor, gettingThere | — |
| hmp-coldingley | UK | email | email=(none) | — | — | visitingTelephone, governor, gettingThere | — |
| hmp-elmley | UK | email | email=businesshubelmleycorrespondence@justice.gov.uk | email | — | visitingTelephone, governor, gettingThere | email (not written; completeness OFF) |
| hmp-leeds | UK | email | email=complaintscorrespondenceleeds@justice.gov.uk | email | — | visitingTelephone, governor, gettingThere | email (not written; completeness OFF) |
| hmp-liverpool | UK | email | email=bsuliverpool@justice.gov.uk | email | — | governor, gettingThere | email (not written; completeness OFF) |
| hmp-preston | UK | email | email=(none) | — | — | visitingTelephone, governor, gettingThere | — |
| hmp-wandsworth | UK | email | suppressed — Facility/identity-level REVIEW_REQUIRED — completeness writes suppressed. | — | (facility REVIEW_REQUIRED) | — | SUPPRESSED |
| alderson-fpc | US | email | email=ALD-ExecAssistant-S@bop.gov | email | — | — | email (not written; completeness OFF) |
| allenwood-usp | US | email | email=ALX-ExecAssistant-S@bop.gov | email | — | — | email (not written; completeness OFF) |
| atwater-usp | US | email | email=ATW-ExecAssistant-S@bop.gov | email | — | — | email (not written; completeness OFF) |
| beckley-fci | US | email | email=BEC-ExecAssistant-S@bop.gov | email | — | — | email (not written; completeness OFF) |
| bryan-fpc | US | email | email=BRY-PublicInformation-S@bop.gov | email | — | — | email (not written; completeness OFF) |
| berlin-fci | US | email | email=BER-Execassistant-S@bop.gov | email | — | — | email (not written; completeness OFF) |
| allenwood-med-fci | US | email | suppressed — Facility/identity-level REVIEW_REQUIRED — completeness writes suppressed. | — | (facility REVIEW_REQUIRED) | — | SUPPRESSED |
| beaumont-usp | US | email | email=BMX-ExecAssistant-S@bop.gov | email | — | — | email (not written; completeness OFF) |
| aliceville-fci | US | email | suppressed — Facility/identity-level REVIEW_REQUIRED — completeness writes suppressed. | — | (facility REVIEW_REQUIRED) | — | SUPPRESSED |
| atlanta-fci | US | email | suppressed — Facility/identity-level REVIEW_REQUIRED — completeness writes suppressed. | — | (facility REVIEW_REQUIRED) | — | SUPPRESSED |

## Per-row VERIFY status

| Prison | Country | VERIFY status |
| --- | --- | --- |
| hmp-bedford | UK | CURRENT |
| hmp-belmarsh | UK | CURRENT |
| hmp-berwyn | UK | CURRENT |
| hmp-bullingdon | UK | CURRENT |
| hmp-coldingley | UK | CURRENT |
| hmp-elmley | UK | CHANGED |
| hmp-leeds | UK | CHANGED |
| hmp-liverpool | UK | CHANGED |
| hmp-preston | UK | CURRENT |
| hmp-wandsworth | UK | REVIEW_REQUIRED |
| alderson-fpc | US | CHANGED |
| allenwood-usp | US | CHANGED |
| atwater-usp | US | CHANGED |
| beckley-fci | US | CHANGED |
| bryan-fpc | US | CHANGED |
| berlin-fci | US | CHANGED |
| allenwood-med-fci | US | REVIEW_REQUIRED |
| beaumont-usp | US | CHANGED |
| aliceville-fci | US | REVIEW_REQUIRED |
| atlanta-fci | US | REVIEW_REQUIRED |

## Notes

- VERIFY empty→official email is a **CORRECTION** (`SAFE_AUTO_CHANGE`). Completeness records the same empty field separately as **SAFE_FILL**.
- UK rows with empty email and no GOV.UK email → `NO_SOURCE_VALUE`.
- Suppressed rows: `hmp-wandsworth`, `allenwood-med-fci`, `aliceville-fci`, `atlanta-fci` (facility-level VERIFY `REVIEW_REQUIRED`).
- Parent locked US #7 as `allenwood-medium-fci`; repository slug is `allenwood-med-fci`.
- `allenwood-med-fci` was expected clean by coordination note but VERIFY currently returns category `REVIEW_REQUIRED` (Medium vs Low); completeness correctly suppresses.
- Unsupported official fields (governor / visitingTelephone / gettingThere / fax) are reported only.

## Enabling completeness writes later (Sam approval)

```bash
# UK
UK_PRISON_COMPLETENESS_WRITE=1 npx tsx scripts/verify-uk-prisons.ts --slugs=... --completeness-write
# US
US_PRISON_COMPLETENESS_WRITE=1 npx tsx scripts/verify-us-prisons.ts --slugs=... --completeness-write
```

VERIFY write flags remain separate and are not implied by completeness flags.

