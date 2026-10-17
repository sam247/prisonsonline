import assert from "node:assert/strict";
import { test } from "node:test";
import { prisons } from "@/data/prisons";
import { prisonProfileJsonLdGraph } from "@/lib/seo/prisonJsonLd";

const EXPECTED: Record<string, [string, string]> = {
  "hmp-durham": ["https://www.gov.uk/guidance/durham-prison", "(0191) 332 3400"],
  "hmp-manchester": ["https://www.gov.uk/guidance/manchester-prison", "(0161) 817 5600"],
  "hmp-wormwood-scrubs": ["https://www.gov.uk/guidance/wormwood-scrubs-prison", "(020) 8588 3200"],
  "hmp-wakefield": ["https://www.gov.uk/guidance/wakefield-prison", "(01924) 612 000"],
};

test("GOV.UK source records give sameAs + telephone in profile schema", () => {
  for (const [slug, [url, phone]] of Object.entries(EXPECTED)) {
    const prison = prisons.find((p) => p.slug === slug)!;
    const building = prisonProfileJsonLdGraph({ prison, path: `/prisons/uk/${slug}`, description: "x" })["@graph"][0] as Record<string, unknown>;
    assert.equal(building.sameAs, url, slug);
    assert.equal(building.telephone, phone, slug);
  }
});

test("canonical site postcode and category are unchanged", () => {
  const ws = prisons.find((p) => p.slug === "hmp-wormwood-scrubs")!;
  assert.equal(ws.postcode, "W12 0AN");
  assert.equal(prisons.find((p) => p.slug === "hmp-manchester")!.securityLevel, "Category B");
});
