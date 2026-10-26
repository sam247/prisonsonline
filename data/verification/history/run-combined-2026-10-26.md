# Prison Verifier run 2026-10-26 (Mon, combined UK+US)

Worktree off origin/main 969c05e. Result: all 4 NO_CHANGE, so no branch, no PR, no Eggbot message.

- UK hmp-belmarsh: CURRENT/NO_CHANGE (UNSUPPORTED visitingTelephone/governor/gettingThere)
- UK hmp-berwyn: CURRENT/NO_CHANGE (email NO_SOURCE_VALUE; UNSUPPORTED visitingTelephone/governor/gettingThere)
- US brooklyn-mdc: CURRENT/NO_CHANGE (visitingHours NO_SOURCE_VALUE)
- US bryan-fpc: CURRENT/NO_CHANGE (visitingHours NO_SOURCE_VALUE)

Overlays intact: us/ entries 134, Birmingham 0121 598 8000 present. git status clean.
Note: the handoff's /cursor/stores/... US state path does not exist; US state is kept at /workspace/prison-verifier/us-verifier-state.json, and it only held 4 prisons, so US slugs were picked with --slugs (brooklyn-mdc,bryan-fpc). Next US: butner-fmc,butner-low-fci.

## Raw reports
# UK prison verifier report

Generated: 2026-10-26T09:14:01.404Z
Mode: **write** (writesEnabled=true)
Prisons: 2
Summary: current=2 changed=0 review=0 failed=0 productionMutations=0 completenessSafeFills=0 completenessWrites=0 completenessSuppressed=0

Write mode is active. Only SAFE_AUTO_CHANGE overlay fields may have been applied.

## HMP Belmarsh (`hmp-belmarsh`)

- Official source located: https://www.gov.uk/guidance/belmarsh-prison
- Discovery method: facility-source
- Run status: success / CURRENT
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Belmarsh" official="Belmarsh Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="Western Way, Thamesmead, London, SE28 0EB" official="HMP Belmarsh, Western Way, Thamesmead, London, SE28 0EB" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="SE28 0EB" official="SE28 0EB" | Postcode matches after normalisation.
- phone: NO_CHANGE current="020 8331 4400" official="020 8331 4400" | Telephone matches after digit normalisation.
- email: NO_CHANGE current="communications.Belmarsh@justice.gov.uk" official="communications.Belmarsh@justice.gov.uk" | Email matches.
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Category A" official="High Security" | Official wording is compatible with the published category.

### VERIFY
- Kind for auto overlay diffs: CORRECTION (SAFE_AUTO_CHANGE)
- Would auto-correct: (none)
- Corrections applied: (none)

### COMPLETENESS
- Suppressed: false
- Empty fields found: (none)
- SAFE_FILL: (none)
- Fills applied: (none)
- REVIEW_REQUIRED: (none)
- NO_SOURCE_VALUE: (none)
- UNSUPPORTED_FIELD: visitingTelephone, governor, gettingThere
- Completeness writes enabled: true
- Completeness mutated: false

### CONTACT / VISITING
- (not evaluated)

Potentially useful official fields we do not store:
- governor: Jenny Louis — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 0208 331 4760 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Belmarsh Find Belmarsh on a map The closest railway stations are Woolwich Arsenal and Plumstead. From Plumstead, you can walk to Belmarsh, or from Wo — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

## HMP Berwyn (`hmp-berwyn`)

- Official source located: https://www.gov.uk/guidance/berwyn-prison
- Discovery method: facility-source
- Run status: success / CURRENT
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Berwyn" official="Berwyn Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="Bridge Road, Wrexham Industrial Estate, Wrexham, North Wales, LL13 9QE" official="HMP Berwyn, Bridge Road, Wrexham Industrial Estate, Wrexham, North Wales, LL13 9QE" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="LL13 9QE" official="LL13 9QE" | Postcode matches after normalisation.
- phone: NO_CHANGE current="(01978) 523 000" official="01978 523 000" | Telephone matches after digit normalisation.
- email: NO_CHANGE current=(empty) official=(omitted) | GOV.UK omitted an establishment email. Existing value is not deleted.
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Category C" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

### VERIFY
- Kind for auto overlay diffs: CORRECTION (SAFE_AUTO_CHANGE)
- Would auto-correct: (none)
- Corrections applied: (none)

### COMPLETENESS
- Suppressed: false
- Empty fields found: email
- SAFE_FILL: (none)
- Fills applied: (none)
- REVIEW_REQUIRED: (none)
- NO_SOURCE_VALUE: email
- UNSUPPORTED_FIELD: visitingTelephone, governor, gettingThere
- Completeness writes enabled: true
- Completeness mutated: false

### CONTACT / VISITING
- (not evaluated)

Potentially useful official fields we do not store:
- governor: David Redhouse — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 01978 523 352 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Berwyn Find Berwyn on a map HMP Berwyn is located on Wrexham Industrial Estate and google maps is the easiest way to find the prison using the postco — GOV.UK publishes getting-there notes. We do not add this as a new schema field.
# US prison verifier report

Generated: 2026-10-26T09:14:03.159Z
Mode: **write** (writesEnabled=true)
Prisons: 2
Summary: current=2 changed=0 review=0 failed=0 productionMutations=0 completenessSafeFills=0 completenessWrites=0 completenessSuppressed=0

Write mode is active. Only SAFE_AUTO_CHANGE overlay fields may have been applied.

## Brooklyn MDC (`brooklyn-mdc`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/bro/
- Discovery method: facility-source
- Run status: success / CURRENT
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Brooklyn MDC" official="Brooklyn MDC" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="80 29TH STREET" official="80 29TH STREET" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="11232" official="11232" | Postcode matches after normalisation.
- phone: NO_CHANGE current="718-840-4200" official="718-840-4200" | Telephone matches after digit normalisation.
- email: NO_CHANGE current="BRO-ExecAssistant-S@bop.gov" official="BRO-ExecAssistant-S@bop.gov" | Email matches.
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: NO_CHANGE current="Multi" official="Administrative" | Official wording is compatible with the published category.

### VERIFY
- Kind for auto overlay diffs: CORRECTION (SAFE_AUTO_CHANGE)
- Would auto-correct: (none)
- Corrections applied: (none)

### COMPLETENESS
- Suppressed: false
- Empty fields found: (none)
- SAFE_FILL: (none)
- Fills applied: (none)
- REVIEW_REQUIRED: (none)
- NO_SOURCE_VALUE: (none)
- UNSUPPORTED_FIELD: (none)
- Completeness writes enabled: true
- Completeness mutated: false

### CONTACT / VISITING
- postalAddress: NO_CHANGE official={"lines":["MDC Brooklyn","METROPOLITAN DETENTION CENTER","P.O. BOX 329002","BROOKLYN, NY"],"postcode":"11232","recipientFormat":"INMATE NAME & REGISTER NUMBER","sourceId":"bop-contact-visiting"} | Parsed from the bop.gov facility page inmate-mail block (Addresses type 3).
- visitingHours: NO_SOURCE_VALUE | bop.gov publishes no structured visiting schedule for this facility (empty visitDays); hours exist only as prose in the visiting-rules PDF, which is not auto-extracted.
- visitingRulesUrl: NO_CHANGE official={"url":"https://www.bop.gov/locations/institutions/bro/bro_visit.pdf","sourceId":"bop-contact-visiting"} | Single English visiting-regulations PDF linked from the bop.gov facility page.
- Applied: (none)

## Bryan FPC (`bryan-fpc`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/bry/
- Discovery method: facility-source
- Run status: success / CURRENT
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Bryan FPC" official="Bryan FPC" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="1100 URSULINE AVENUE" official="1100 URSULINE AVENUE" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="77803" official="77803" | Postcode matches after normalisation.
- phone: NO_CHANGE current="979-823-1879" official="979-823-1879" | Telephone matches after digit normalisation.
- email: NO_CHANGE current="BRY-PublicInformation-S@bop.gov" official="BRY-PublicInformation-S@bop.gov" | Email matches.
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: NO_CHANGE current="Low" official="Minimum" | Official wording is compatible with the published category.

### VERIFY
- Kind for auto overlay diffs: CORRECTION (SAFE_AUTO_CHANGE)
- Would auto-correct: (none)
- Corrections applied: (none)

### COMPLETENESS
- Suppressed: false
- Empty fields found: (none)
- SAFE_FILL: (none)
- Fills applied: (none)
- REVIEW_REQUIRED: (none)
- NO_SOURCE_VALUE: (none)
- UNSUPPORTED_FIELD: (none)
- Completeness writes enabled: true
- Completeness mutated: false

### CONTACT / VISITING
- postalAddress: NO_CHANGE official={"lines":["FPC Bryan","FEDERAL PRISON CAMP","P.O. BOX 2149","BRYAN, TX"],"postcode":"77805","recipientFormat":"INMATE NAME & REGISTER NUMBER","sourceId":"bop-contact-visiting"} | Parsed from the bop.gov facility page inmate-mail block (Addresses type 3).
- visitingHours: NO_SOURCE_VALUE | bop.gov publishes no structured visiting schedule for this facility (empty visitDays); hours exist only as prose in the visiting-rules PDF, which is not auto-extracted.
- visitingRulesUrl: NO_CHANGE official={"url":"https://www.bop.gov/locations/institutions/bry/bry_visit.pdf","sourceId":"bop-contact-visiting"} | Single English visiting-regulations PDF linked from the bop.gov facility page.
- Applied: (none)
