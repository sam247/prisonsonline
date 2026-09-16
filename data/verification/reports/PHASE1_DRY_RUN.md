# UK prison verifier report

Generated: 2026-09-16T19:27:16.265Z
Mode: **dry-run** (writesEnabled=false)
Prisons: 10
Summary: current=6 changed=3 review=1 failed=0 productionMutations=0

Dry-run cannot mutate production prison data (HMPPS JSON, generated prison modules, or the live overlay).

## HMP Bedford (`hmp-bedford`)

- Official source located: https://www.gov.uk/guidance/bedford-prison
- Discovery method: facility-source
- Run status: success / CURRENT
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Bedford" official="Bedford Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="St Loyes Street, Bedford, MK40 1HG" official="HMP Bedford, St Loyes Street, Bedford, MK40 1HG" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="MK40 1HG" official="MK40 1HG" | Postcode matches after normalisation.
- phone: NO_CHANGE current="(01234) 373 000" official="01234 373 000" | Telephone matches after digit normalisation.
- email: NO_CHANGE current=(empty) official=(omitted) | GOV.UK omitted an establishment email. Existing value is not deleted.
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Category B" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

Potentially useful official fields we do not store:
- governor: Sarah Bott — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- gettingThere: Getting to Bedford Prison Find Bedford Prison on a map Bedford railway station is a 15-minute walk, or taxis are available at the station. The bus station is a  — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

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

Potentially useful official fields we do not store:
- governor: David Redhouse — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 01978 523 352 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Berwyn Find Berwyn on a map HMP Berwyn is located on Wrexham Industrial Estate and google maps is the easiest way to find the prison using the postco — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

## HMP Bullingdon (`hmp-bullingdon`)

- Official source located: https://www.gov.uk/guidance/bullingdon-prison
- Discovery method: facility-source
- Run status: success / CURRENT
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Bullingdon" official="Bullingdon Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="PO Box 50, Bicester, OXON, OX25 1PZ" official="HMP Bullingdon, PO Box 50, Bicester, OXON, OX25 1PZ" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="OX25 1PZ" official="OX25 1PZ" | Postcode matches after normalisation.
- phone: NO_CHANGE current="(01869) 353 100" official="01869 353 100" | Telephone matches after digit normalisation.
- email: NO_CHANGE current=(empty) official=(omitted) | GOV.UK omitted an establishment email. Existing value is not deleted.
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Multi" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

Potentially useful official fields we do not store:
- governor: Amanda Thomson — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 01869 353 154 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Bullingdon Find Bullingdon on a map Bullingdon is about 5 miles from Bicester Village station and about 6 miles from Bicester North station. A regula — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

## HMP Coldingley (`hmp-coldingley`)

- Official source located: https://www.gov.uk/guidance/coldingley-prison
- Discovery method: facility-source
- Run status: success / CURRENT
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Coldingley" official="Coldingley Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="Shaftesbury Road, Bisley, Woking, Surrey, GU24 9EX" official="HMP Coldingley, Shaftesbury Road, Bisley, Woking, Surrey, GU24 9EX" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="GU24 9EX" official="GU24 9EX" | Postcode matches after normalisation.
- phone: NO_CHANGE current="(01483) 344 300" official="01483 344 300" | Telephone matches after digit normalisation.
- email: NO_CHANGE current=(empty) official=(omitted) | GOV.UK omitted an establishment email. Existing value is not deleted.
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Category C" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

Potentially useful official fields we do not store:
- governor: Governor D Ceglowski — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 0330 016 8787 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Coldingley Find Coldingley on a map The closest railway station is Brookwood which is around 2.6 miles from Coldingley Prison. From there you can tak — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

## HMP Elmley (`hmp-elmley`)

- Official source located: https://www.gov.uk/guidance/elmley-prison
- Discovery method: facility-source
- Run status: success / CHANGED
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Elmley" official="Elmley Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="Church Road, Eastchurch, Sheerness, Kent, ME12 4DZ" official="HMP/YOI Elmley, Church Road, Eastchurch, Sheerness, Kent, ME12 4DZ" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="ME12 4DZ" official="ME12 4DZ" | Postcode matches after normalisation.
- phone: NO_CHANGE current="(01795) 802 000" official="01795 802 000" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="businesshubelmleycorrespondence@justice.gov.uk" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Multi" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

Potentially useful official fields we do not store:
- governor: Gary Price — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 01795 802 358 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Elmley Find Elmley on a map When travelling to Elmley, avoid going via Elmley Nature Reserve. If you are travelling via M2 leave the motorway at junc — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

## HMP Leeds (`hmp-leeds`)

- Official source located: https://www.gov.uk/guidance/leeds-prison
- Discovery method: facility-source
- Run status: success / CHANGED
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Leeds" official="Leeds Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="2 Gloucester Terrace, Stanningley Road, Leeds, West Yorkshire, LS12 2TJ" official="HMP Leeds, 2 Gloucester Terrace, Stanningley Road, Leeds, West Yorkshire, LS12 2TJ" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="LS12 2TJ" official="LS12 2TJ" | Postcode matches after normalisation.
- phone: NO_CHANGE current="(0113) 203 2600" official="0113 203 2600" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="complaintscorrespondenceleeds@justice.gov.uk" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Category B" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

Potentially useful official fields we do not store:
- governor: Diane Lewis — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 0113 203 2570 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Leeds Find Leeds on a map The closest railway station is Leeds and buses and taxis run from there. It’s a 30-minute walk or about ten minutes in a ta — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

## HMP Liverpool (`hmp-liverpool`)

- Official source located: https://www.gov.uk/guidance/liverpool-prison
- Discovery method: facility-source
- Run status: success / CHANGED
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Liverpool" official="Liverpool Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="68 Hornby Road, Liverpool, L9 3DF" official="HMP Liverpool, 68 Hornby Road, Liverpool, L9 3DF" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="L9 3DF" official="L9 3DF" | Postcode matches after normalisation.
- phone: NO_CHANGE current="(0151) 530 4000" official="0151 530 4000" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="bsuliverpool@justice.gov.uk" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Category B" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

Potentially useful official fields we do not store:
- governor: Rob Luxford — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- gettingThere: Getting to Liverpool Prison Find Liverpool Prison on a map The closest railway stations are Walton and Rice Lane. Liverpool Prison is about a 5-minute walk from — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

## HMP Preston (`hmp-preston`)

- Official source located: https://www.gov.uk/guidance/preston-prison
- Discovery method: facility-source
- Run status: success / CURRENT
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Preston" official="Preston Prison" | Official name matches after HMP/Prison normalisation.
- address: NO_CHANGE current="2 Ribbleton Lane, Preston, Lancashire , PR1 5AB" official="HMP Preston, 2 Ribbleton Lane, Preston, Lancashire, PR1 5AB" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="PR1 5AB" official="PR1 5AB" | Postcode matches after normalisation.
- phone: NO_CHANGE current="(01772) 444 550" official="01772 444 550" | Telephone matches after digit normalisation.
- email: NO_CHANGE current=(empty) official=(omitted) | GOV.UK omitted an establishment email. Existing value is not deleted.
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Category B" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

Potentially useful official fields we do not store:
- governor: Dave McGurrell — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 0330 058 8224 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Preston Prison Find Preston Prison on a map Preston Prison is about a mile from Preston station and half a mile from the bus station. To plan your jo — GOV.UK publishes getting-there notes. We do not add this as a new schema field.

## HMP Wandsworth (`hmp-wandsworth`)

- Official source located: https://www.gov.uk/guidance/wandsworth-prison
- Discovery method: facility-source
- Run status: success / REVIEW_REQUIRED
- Review required: true
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="HMP Wandsworth" official="Wandsworth Prison" | Official name matches after HMP/Prison normalisation.
- address: REVIEW_REQUIRED current="Heathfield Road, London, SW18 3HU" official="HMP Wandsworth, PO Box 757, Heathfield Road, Wandsworth, London, SW18 3HS" | Address strings differ enough to risk a destructive edit. Queued for review.
- postcode: SAFE_AUTO_CHANGE current="SW18 3HU" official="SW18 3HS" | Clear postcode replacement from the official GOV.UK contact address. | WOULD have been auto-applied
- phone: NO_CHANGE current="(020) 8588 4000" official="020 8588 4000" | Telephone matches after digit normalisation.
- email: NO_CHANGE current=(empty) official=(omitted) | GOV.UK omitted an establishment email. Existing value is not deleted.
- operator: NO_CHANGE current="Public Sector Prison" official=(omitted) | GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.
- category: NO_CHANGE current="Category B" official=(omitted) | GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.

Potentially useful official fields we do not store:
- governor: Andy Davy — GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.
- visitingTelephone: 0300 060 6509 — GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.
- gettingThere: Getting to Wandsworth Find Wandsworth on a map The closest railways stations to Wandsworth are Wandsworth Town, Wandsworth Common and Earlsfield which are all a — GOV.UK publishes getting-there notes. We do not add this as a new schema field.
