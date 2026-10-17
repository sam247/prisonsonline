import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { restorePrisonAcronyms } from "../scripts/lib/prison-acronyms.mjs";
import { usPrisonsGenerated } from "@/data/generated/usPrisons.generated";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";
import { caPrisonsGenerated } from "@/data/generated/caPrisons.generated";
import { auPrisonsGenerated } from "@/data/generated/auPrisons.generated";
import { nzPrisonsGenerated } from "@/data/generated/nzPrisons.generated";
import { iePrisonsGenerated } from "@/data/generated/iePrisons.generated";
import { zaPrisonsGenerated } from "@/data/generated/zaPrisons.generated";
import { legacyInternationalPrisons } from "@/data/prisons.legacy-international";

test("allowlist uppercases facility acronyms and leaves ordinary words alone", () => {
  assert.equal(restorePrisonAcronyms("Atlanta Fci"), "Atlanta FCI");
  assert.equal(restorePrisonAcronyms("Beaumont Usp"), "Beaumont USP");
  assert.equal(restorePrisonAcronyms("Phoenix Ccm"), "Phoenix CCM");
  assert.equal(restorePrisonAcronyms("Brooklyn Mdc"), "Brooklyn MDC");
  assert.equal(restorePrisonAcronyms("Chicago Mcc"), "Chicago MCC");
  assert.equal(restorePrisonAcronyms("Honolulu Fdc"), "Honolulu FDC");
  assert.equal(restorePrisonAcronyms("Butner Fmc"), "Butner FMC");
  assert.equal(restorePrisonAcronyms("Alderson Fpc"), "Alderson FPC");
  assert.equal(restorePrisonAcronyms("Oklahoma City Ftc"), "Oklahoma City FTC");
  assert.equal(restorePrisonAcronyms("Springfield Usmcfp"), "Springfield USMCFP");
  assert.equal(restorePrisonAcronyms("Florence Admax Usp"), "Florence ADMAX USP");
  assert.equal(restorePrisonAcronyms("Hmp Wandsworth"), "HMP Wandsworth");
  assert.equal(restorePrisonAcronyms("Hmyoi Feltham"), "HMYOI Feltham");
  assert.equal(restorePrisonAcronyms("Yoi Cookham Wood"), "YOI Cookham Wood");
  assert.equal(restorePrisonAcronyms("Example Irc"), "Example IRC");
  assert.equal(restorePrisonAcronyms("State Ci"), "State CI");
  assert.equal(restorePrisonAcronyms("County Sp"), "County SP");
  assert.equal(restorePrisonAcronyms("Camp Ccf"), "Camp CCF");
  assert.equal(restorePrisonAcronyms("State Doc"), "State DOC");
  assert.equal(restorePrisonAcronyms("Complex Fcc"), "Complex FCC");
  assert.equal(restorePrisonAcronyms("Office Rrm"), "Office RRM");
  assert.equal(restorePrisonAcronyms("Butner Med Ii Fci"), "Butner Med Ii FCI");
  assert.equal(restorePrisonAcronyms("Okimaw Ohci Healing Lodge"), "Okimaw Ohci Healing Lodge");
  assert.equal(restorePrisonAcronyms("Yazoo City Low Fci"), "Yazoo City Low FCI");
  assert.equal(restorePrisonAcronyms("Fort Worth Administrative Fmc"), "Fort Worth Administrative FMC");
});

test("shipped prison names only change allowlisted acronym case, and slugs stay put", () => {
  const source = JSON.parse(fs.readFileSync("us_prisons_clean_bundle/us_prisons_clean.json", "utf8"));
  const sourceSlugs = source.map((row: { slug: string }) => row.slug).sort();
  assert.deepEqual(
    usPrisonsGenerated.map((p) => p.slug).sort(),
    sourceSlugs,
  );
  for (const prison of usPrisonsGenerated) {
    assert.equal(prison.name, restorePrisonAcronyms(prison.name), prison.slug);
    assert.equal(prison.slug, prison.slug.toLowerCase());
    assert.ok(!/\b(Fci|Usp|Fpc|Fmc|Fdc|Mcc|Mdc|Ftc|Ccm|Usmcfp|Admax)\b/.test(prison.name), prison.name);
  }
  for (const prison of [
    ...ukPrisonsGenerated,
    ...caPrisonsGenerated,
    ...auPrisonsGenerated,
    ...nzPrisonsGenerated,
    ...iePrisonsGenerated,
    ...zaPrisonsGenerated,
    ...legacyInternationalPrisons,
  ]) {
    assert.equal(prison.name, restorePrisonAcronyms(prison.name), `${prison.countrySlug}/${prison.slug}`);
  }
});
