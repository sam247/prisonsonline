#!/usr/bin/env node
/** intl_prisons_bundles/ca/ca_prisons.json → src/data/generated/caPrisons.generated.ts */
import { buildCountry } from "./lib/intl-prisons.mjs";
buildCountry("ca");
