#!/usr/bin/env node
/** intl_prisons_bundles/nz/nz_prisons.json → src/data/generated/nzPrisons.generated.ts */
import { buildCountry } from "./lib/intl-prisons.mjs";
buildCountry("nz");
