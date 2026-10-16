#!/usr/bin/env node
/** intl_prisons_bundles/za/za_prisons.json → src/data/generated/zaPrisons.generated.ts */
import { buildCountry } from "./lib/intl-prisons.mjs";
buildCountry("za");
