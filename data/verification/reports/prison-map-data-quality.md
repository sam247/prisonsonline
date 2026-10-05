# Prison Map data-quality review

Generated from the canonical inventory. Coordinate refresh checked: 2026-10-05T11:43:31.462Z.

## Coverage

- UK: 122/122 postcode locations.
- US: 116 prison/facility profiles (including legacy profiles); 19 optional reentry offices, off by default.
- Coordinates are not promises of exact visitor entrances. UK coordinates are postcode locations; 7 legacy US profiles retain existing manual coordinates.

## Excluded records

- us/baltimore-ccm: No verified BOP coordinates available
- us/carswell-fmc: No verified BOP coordinates available
- us/dublin-fci: No verified BOP coordinates available
- us/forrest-city-fci: No verified BOP coordinates available
- us/fort-dix-fci: No verified BOP coordinates available
- us/fort-worth-administrative-fmc: No verified BOP coordinates available
- us/la-tuna-fci: No verified BOP coordinates available
- us/lee-usp: No verified BOP coordinates available
- us/lompoc-fci: No verified BOP coordinates available
- us/montgomery-ccm: No verified BOP coordinates available
- us/new-york-mcc: No verified BOP coordinates available
- us/pensacola-fpc: No verified BOP coordinates available
- us/petersburg-fci: No verified BOP coordinates available
- us/pollock-med-fci: No verified BOP coordinates available
- us/terminal-island-fci: No verified BOP coordinates available

## Authoritative refresh review

- us/baltimore-ccm: state mismatch — {"published":{"address":"400 FIRST STREET NW 5TH FLOOR","postcode":"20534","city":"Washington","state":"DC"},"official":{"address":"400 FIRST STREET, NW","postcode":"20534","city":"WASHINGTON","state":"MD"}}
- us/carswell-fmc: address mismatch — {"published":{"address":"NAVAL AIR STATION 1200 MEANDERING ROAD","postcode":"76114","city":"Fort Worth","state":"TX"},"official":{"address":"NAVAL AIR STATION","postcode":"76114","city":"FORT WORTH","state":"TX"}}
- us/dublin-fci: No unique match in official BOP directory
- us/forrest-city-fci: No unique match in official BOP directory
- us/fort-dix-fci: address mismatch — {"published":{"address":"5756 HARTFORD & POINTVILLE RD","postcode":"08640","city":"Joint Base Mdl","state":"NJ"},"official":{"address":"5756 HARTFORD &","postcode":"08640","city":"JOINT BASE MDL","state":"NJ"}}
- us/fort-worth-administrative-fmc: No unique match in official BOP directory
- us/guaynabo-mdc: Legacy state code RQ; official BOP uses PR (Puerto Rico) — {"published":"RQ","official":"PR"}
- us/la-tuna-fci: address mismatch — {"published":{"address":"LA TUNA FCI/SCP 8500 DONIPHAN ROAD","postcode":"79821","city":"Anthony","state":"TX"},"official":{"address":"LA TUNA FCI/SCP","postcode":"79821","city":"ANTHONY","state":"TX"}}
- us/lee-usp: address mismatch — {"published":{"address":"LEE COUNTY INDUSTRIAL PARK HICKORY FLATS ROAD","postcode":"24277","city":"Pennington Gap","state":"VA"},"official":{"address":"LEE COUNTY INDUSTRIAL PARK","postcode":"24277","city":"PENNINGTON GAP","state":"VA"}}
- us/lompoc-fci: No unique match in official BOP directory
- us/montgomery-ccm: address mismatch — {"published":{"address":"MAXWELL AFB BLDG 1209 820 WILLOW STREET","postcode":"36112","city":"Montgomery","state":"AL"},"official":{"address":"MAXWELL AFB, BLDG 1209","postcode":"36112","city":"MONTGOMERY","state":"AL"}}
- us/new-york-mcc: No unique match in official BOP directory
- us/pensacola-fpc: No unique match in official BOP directory
- us/petersburg-fci: No unique match in official BOP directory
- us/pollock-med-fci: No unique match in official BOP directory
- us/terminal-island-fci: No unique match in official BOP directory

## Shared coordinates and possible duplicate profiles

- Shared coordinates: uk/hmp-grendon, uk/hmp-spring-hill. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/allenwood-med-fci, us/allenwood-usp. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/beaumont-low-fci, us/beaumont-med-fci, us/beaumont-usp. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/butner-fmc, us/butner-low-fci, us/butner-med-i-fci, us/butner-med-ii-fci. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/coleman-i-usp, us/coleman-ii-usp, us/coleman-low-fci, us/coleman-med-fci. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/florence-admax-usp, us/florence-fci, us/florence-high-usp. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/hazelton-fci, us/hazelton-usp. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/oakdale-i-fci, us/oakdale-ii-fci. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/tucson-fci, us/tucson-usp. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/victorville-med-i-fci, us/victorville-med-ii-fci, us/victorville-usp. Review for shared sites/postcodes; records retained.
- Shared coordinates: us/yazoo-city-low-fci, us/yazoo-city-low-ii-fci, us/yazoo-city-med-fci. Review for shared sites/postcodes; records retained.
- Possible same facility: united-states/fci-terminal-island ↔ us/terminal-island-fci. Profiles retained; identity/status review needed.

## Other review notes

- uk/hmp-brixton: canonical postcode SW2 5XF was resolved by the existing postcodes.io build; included as an approximate postcode location.
- The former empty uk/prison-122 record is no longer present in the canonical inventory.
- US state code RQ is interpreted as Puerto Rico in the map projection, with the canonical address and state source unchanged.
- UK region values mix management groups with geography; no geographic UK region filter is exposed.
- Security classifications include inferred labels; no security filter is exposed.
- No general active/closed status field exists. Alcatraz is explicitly historic, evidenced by https://www.nps.gov/alca/learn/historyculture/index.htm. Missing status is not interpreted as active.

Run existing country verifier commands for review; this report does not authorize address changes, profile consolidation or database cleanup.
