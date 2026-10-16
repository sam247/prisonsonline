#!/usr/bin/env node
/**
 * One-off, idempotent normalisation of the ZA source bundle (intl_prisons_bundles/za/za_prisons.json):
 * - country code lowercased to "za";
 * - the inferred province (`region`, and `jurisdiction` which repeated it) is dropped. DCS does not
 *   publish a province per centre, so nothing inferred is kept. The region level is `dcsRegion`,
 *   spelled exactly as on the DCS facility list; `managementArea` is the official DCS management area;
 * - jurisdiction is the national department, which is what DCS publishes;
 * - the "Province inferred…" note is removed along with the inferred value;
 * - excluded.json: DCS lists "ZEERUST CORRECTIONAL CENTRE" twice under Rooigrond, once headed "ZEERUST"
 *   (custodial, published) and once headed "ZEERUST COMMCORR" (community corrections, excluded). The excluded
 *   entry is renamed so it names the community-corrections listing rather than colliding with the centre.
 */
import fs from "fs";
import { bundlePaths } from "./lib/intl-prisons.mjs";

const { rows: file } = bundlePaths("za");
const rows = JSON.parse(fs.readFileSync(file, "utf8")).map((r) => {
  const { region: _inferredProvince, ...rest } = r;
  const notes = (rest.notes ?? "").replace(/Province inferred from DCS region\/management area\.\s*/, "").trim();
  const out = { ...rest, country: "za", jurisdiction: "Department of Correctional Services" };
  if (notes) out.notes = notes;
  else delete out.notes;
  return out;
});
fs.writeFileSync(file, JSON.stringify(rows, null, 2) + "\n");
const { excluded: exFile } = bundlePaths("za");
const excluded = JSON.parse(fs.readFileSync(exFile, "utf8")).map((e) =>
  e.name === "Zeerust Correctional Centre" ? { ...e, name: "Zeerust Correctional Centre (DCS listing headed ZEERUST COMMCORR)" } : e,
);
fs.writeFileSync(exFile, JSON.stringify(excluded, null, 2) + "\n");
console.log(`[normalize:za] ${rows.length} rows`);
