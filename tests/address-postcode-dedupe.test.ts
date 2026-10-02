import assert from "node:assert/strict";
import { test } from "node:test";
import { addressWithoutPostcode, joinAddressAndPostcode } from "@/lib/address";
import { buildContactBody } from "@/lib/seo/prisonProfileCopy";
import { getPrisonsByCountry } from "@/data/prisons";

test("address helpers do not repeat a postcode already in the address", () => {
  assert.equal(joinAddressAndPostcode("Western Way, Thamesmead, London, SE28 0EB", "SE28 0EB"), "Western Way, Thamesmead, London, SE28 0EB");
  assert.equal(joinAddressAndPostcode("Western Way, Thamesmead, London", "SE28 0EB"), "Western Way, Thamesmead, London, SE28 0EB");
  assert.equal(joinAddressAndPostcode("1 Road, se280eb", "SE28 0EB"), "1 Road, se280eb");
  assert.equal(joinAddressAndPostcode(undefined, "SE28 0EB"), "SE28 0EB");
  assert.equal(addressWithoutPostcode("Western Way, Thamesmead, London, SE28 0EB", "SE28 0EB"), "Western Way, Thamesmead, London");
  assert.equal(addressWithoutPostcode("5 Love Lane, Wakefield, WF2 9AG", "WF2 9AG"), "5 Love Lane, Wakefield");
  assert.equal(addressWithoutPostcode("GLEN RAY RD. BOX A", "24910"), "GLEN RAY RD. BOX A");
  assert.equal(addressWithoutPostcode("SE28 0EB", "SE28 0EB"), "SE28 0EB");
});

test("UK profile contact copy shows each postcode once", () => {
  const uk = getPrisonsByCountry("uk").filter((p) => p.postcode && p.address);
  assert.ok(uk.length > 100);
  for (const prison of uk) {
    const body = buildContactBody(prison);
    const compact = body.replace(/\s+/g, "").toUpperCase();
    const pc = prison.postcode!.replace(/\s+/g, "").toUpperCase();
    assert.equal(compact.split(pc).length - 1, 1, `${prison.slug}: postcode repeated in "${body}"`);
  }
});
