# US prison verifier report

Generated: 2026-09-16T20:12:25.857Z
Mode: **dry-run** (writesEnabled=false)
Prisons: 10
Summary: current=0 changed=4 review=6 failed=0 productionMutations=0

Dry-run cannot mutate production prison data (BOP import JSON, generated prison modules, UK records, or the live overlay).

## Alderson Fpc (`alderson-fpc`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/ald/
- Discovery method: bop-directory
- Run status: success / CHANGED
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Alderson Fpc" official="Alderson FPC" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="GLEN RAY RD. BOX A" official="GLEN RAY RD. BOX A" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="24910" official="24910" | Postcode matches after normalisation.
- phone: NO_CHANGE current="304-445-3300" official="304-445-3300" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="ALD-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: NO_CHANGE current="Low" official="Minimum" | Official wording is compatible with the published category.

## Aliceville Fci (`aliceville-fci`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/ali/
- Discovery method: bop-directory
- Run status: success / REVIEW_REQUIRED
- Review required: true
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Aliceville Fci" official="Aliceville FCI" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="11070 HIGHWAY 14" official="11070 HIGHWAY 14" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="35442" official="35442" | Postcode matches after normalisation.
- phone: NO_CHANGE current="205-373-5000" official="205-373-5000" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="ALI-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: REVIEW_REQUIRED current="Medium" official="Low" | Category wording conflicts. Security-level mapping is inferred and never auto-overwritten.

## Allenwood Low Fci (`allenwood-low-fci`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/alf/
- Discovery method: bop-directory
- Run status: success / REVIEW_REQUIRED
- Review required: true
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Allenwood Low Fci" official="Allenwood Low FCI" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="RT 15 2 MILES N OF ALLENWOOD" official="RT 15,2 MILES N OF ALLENWOOD" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="17810" official="17810" | Postcode matches after normalisation.
- phone: NO_CHANGE current="570-547-1990" official="570-547-1990" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="ALX-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: REVIEW_REQUIRED current="Medium" official="Low" | Category wording conflicts. Security-level mapping is inferred and never auto-overwritten.

## Allenwood Usp (`allenwood-usp`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/alp/
- Discovery method: bop-directory
- Run status: success / CHANGED
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Allenwood Usp" official="Allenwood USP" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="RT 15 2 MILES N OF ALLENWOOD" official="RT 15,2 MILES N OF ALLENWOOD" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="17810" official="17810" | Postcode matches after normalisation.
- phone: NO_CHANGE current="570-547-0963" official="570-547-0963" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="ALX-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: NO_CHANGE current="High" official="High" | Official wording is compatible with the published category.

## Ashland Fci (`ashland-fci`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/ash/
- Discovery method: bop-directory
- Run status: success / REVIEW_REQUIRED
- Review required: true
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Ashland Fci" official="Ashland FCI" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="ST. ROUTE 716" official="ST. ROUTE 716" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="41105" official="41105" | Postcode matches after normalisation.
- phone: NO_CHANGE current="606-928-6414" official="606-928-6414" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="ASH-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: REVIEW_REQUIRED current="Medium" official="Low" | Category wording conflicts. Security-level mapping is inferred and never auto-overwritten.

## Atlanta Fci (`atlanta-fci`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/atl/
- Discovery method: bop-directory
- Run status: success / REVIEW_REQUIRED
- Review required: true
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Atlanta Fci" official="Atlanta FCI" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="601 MCDONOUGH BLVD SE" official="601 MCDONOUGH BLVD SE" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="30315" official="30315" | Postcode matches after normalisation.
- phone: NO_CHANGE current="404-635-5100" official="404-635-5100" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="ATL-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: REVIEW_REQUIRED current="Medium" official="Low" | Category wording conflicts. Security-level mapping is inferred and never auto-overwritten.

## Atwater Usp (`atwater-usp`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/atw/
- Discovery method: bop-directory
- Run status: success / CHANGED
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Atwater Usp" official="Atwater USP" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="1 FEDERAL WAY" official="1 FEDERAL WAY" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="95301" official="95301" | Postcode matches after normalisation.
- phone: NO_CHANGE current="209-386-0257" official="209-386-0257" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="ATW-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: NO_CHANGE current="High" official="High" | Official wording is compatible with the published category.

## Bastrop Fci (`bastrop-fci`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/bas/
- Discovery method: bop-directory
- Run status: success / REVIEW_REQUIRED
- Review required: true
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Bastrop Fci" official="Bastrop FCI" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="1341 HIGHWAY 95 NORTH" official="1341 HIGHWAY 95 NORTH" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="78602" official="78602" | Postcode matches after normalisation.
- phone: NO_CHANGE current="512-321-3903" official="512-321-3903" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="BAS-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: REVIEW_REQUIRED current="Medium" official="Low" | Category wording conflicts. Security-level mapping is inferred and never auto-overwritten.

## Beaumont Low Fci (`beaumont-low-fci`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/bml/
- Discovery method: bop-directory
- Run status: success / REVIEW_REQUIRED
- Review required: true
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Beaumont Low Fci" official="Beaumont Low FCI" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="5560 KNAUTH ROAD" official="5560 KNAUTH ROAD" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="77705" official="77705" | Postcode matches after normalisation.
- phone: NO_CHANGE current="409-727-8172" official="409-727-8172" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="BMX-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: REVIEW_REQUIRED current="Medium" official="Low" | Category wording conflicts. Security-level mapping is inferred and never auto-overwritten.

## Beckley Fci (`beckley-fci`)

- Authority: Federal Bureau of Prisons (federal-bop) — BOP federal directory provenance. Only bop.gov may override.
- Official source located: https://www.bop.gov/locations/institutions/bec/
- Discovery method: bop-directory
- Run status: success / CHANGED
- Review required: false
- Production mutated: false
- Fields checked: name, address, postcode, phone, email, operator, category

- name: NO_CHANGE current="Beckley Fci" official="Beckley FCI" | Official name matches after facility-type normalisation.
- address: NO_CHANGE current="1600 INDUSTRIAL ROAD" official="1600 INDUSTRIAL ROAD" | Address tokens match the official contact address.
- postcode: NO_CHANGE current="25813" official="25813" | Postcode matches after normalisation.
- phone: NO_CHANGE current="304-252-9758" official="304-252-9758" | Telephone matches after digit normalisation.
- email: SAFE_AUTO_CHANGE current=(empty) official="BEC-ExecAssistant-S@bop.gov" | Official contact email can be stored on the existing facility overlay email field. | WOULD have been auto-applied
- operator: NO_CHANGE current="Federal Bureau of Prisons" official="Federal Bureau of Prisons" | Operator matches the official mention.
- category: NO_CHANGE current="Medium" official="Medium" | Official wording is compatible with the published category.
