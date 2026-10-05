# Prison Map

`/prison-map` uses the canonical `prisons` export, a compact server projection and a lazy client-only Leaflet 1.9.4 renderer with Leaflet.markercluster 1.5.3. There is no second inventory, map backend, runtime geocoding or BOP fetch during normal builds/page requests.

UK locations reuse the existing postcode overlay. They are approximate postcode locations, not entrances. BOP facility coordinates are refreshed explicitly into existing canonical US source rows and retain source, checked date, address/ZIP/city/state evidence and facility type. Existing manual coordinates remain labelled as legacy directory coordinates. The model can accept authoritative UK facility coordinates later without changing the renderer.

## Refresh and review

```sh
npm run data:refresh:coordinates
npm run data:build:us
npm run audit:map
```

The first command matches existing federal profiles against the official BOP locations directory using the existing verifier matcher. It checks address, street number, ZIP, city, state and coordinate plausibility. Ambiguous/unmatched/conflicting records are excluded and reported rather than assigned guessed locations. RQ is recognized as the legacy Puerto Rico code and reported; addresses and source state values are not rewritten. A source/network/schema failure preserves the canonical source file. Successful refreshes replace the file atomically. These commands do not change phone numbers, addresses, profile URLs or prose.

Reports live in `data/verification/reports/prison-map-coordinate-refresh.json` and `prison-map-data-quality.md`; use the existing UK/US verifier workflow for their review. Run `audit:map` after canonical location changes to update coverage/exclusions/shared coordinates. Suspected same-facility legacy/import profiles remain separate canonical records. New BOP locations do not add profiles to the inventory.

Normal US generation reads persisted coordinates. The existing court build retains its existing postcode lookup behaviour, now refusing postcode cache entries from a different postcode. The map and nearby queries also reject stale effective postcodes, including verified overrides.

Reentry offices are identified from authoritative RRM types and remain off by default. Missing-coordinate source CCM/RRM entries are labelled as offices but never mapped. No active status is inferred from inventory presence. Alcatraz is labelled historic using National Park Service evidence. The map does not expose inferred security categories or UK management regions as geographic filters.

## Tiles

Default: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, with visible OpenStreetMap contributor attribution. Optional `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` allow a provider change on rebuild. These public configuration values are trusted operator configuration; attribution may contain provider-required HTML.

Follow https://operations.osmfoundation.org/policies/tiles/: keep browser Referer and caching intact; do not proxy, prefetch, bulk-download or add offline tile downloads. Standard OSM tiles have best-effort availability, no SLA and can be blocked. Tile failures leave searchable results/profile links available and show a retry control. A paid provider requires a separate decision. Automated checks should stub tiles or avoid repeated geographic sweeps; visual checks use only normal viewport requests.

## Checks

```sh
npm test
npm run typecheck
npm run build
```

`tests/prison-map.test.ts` covers coordinate validity, postcode freshness, effective verification overrides, BOP coordinate parsing/matching/conflicts, canonical URLs, country grouping, office defaults, filtering, shared locations and source preservation on refresh failure.

Browser validation covers desktop/mobile country switching, name search, state filters, office toggling, marker/cluster and result selection, keyboard navigation/Escape, canonical links, no results, excluded locations, loading/map/tile failures and no-JS content. Directory, Finder and nearby-query checks remain part of regression validation.
