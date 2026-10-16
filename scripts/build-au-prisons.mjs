#!/usr/bin/env node
/** intl_prisons_bundles/au/au_prisons.json → src/data/generated/auPrisons.generated.ts */
import { buildCountry } from "./lib/intl-prisons.mjs";
buildCountry("au");
