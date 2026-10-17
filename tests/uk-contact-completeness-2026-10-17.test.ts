import assert from "node:assert/strict";
import { test } from "node:test";
import { ukVerificationOverlay } from "@/data/generated/ukVerificationOverlay.generated";
import { getFacilityVerification } from "@/data/facilitySources";

const EMAILS: Record<string, [string, string]> = {
  "hmp-leeds": ["complaintscorrespondenceleeds@justice.gov.uk", "https://www.gov.uk/guidance/leeds-prison"],
  "hmp-liverpool": ["bsuliverpool@justice.gov.uk", "https://www.gov.uk/guidance/liverpool-prison"],
  "hmp-wakefield": ["correspondencewakefield@justice.gov.uk", "https://www.gov.uk/guidance/wakefield-prison"],
};

test("verifier SAFE email fills are in the overlay with their GOV.UK source", () => {
  for (const [slug, [email, url]] of Object.entries(EMAILS)) {
    const entry = ukVerificationOverlay.entries[`uk/${slug}`];
    assert.equal(entry?.overrides?.email, email, slug);
    assert.equal(entry?.sourceUrl, url, slug);
    assert.equal(getFacilityVerification("uk", slug)?.fieldSources.email?.[0], "official", slug);
  }
});

test("existing overlay entries are retained and REVIEW prisons are untouched", () => {
  assert.equal(ukVerificationOverlay.entries["uk/hmp-birmingham"]?.overrides?.phone, "0121 598 8000");
  assert.equal(ukVerificationOverlay.entries["uk/hmp-elmley"]?.overrides?.email, "businesshubelmleycorrespondence@justice.gov.uk");
  assert.equal(ukVerificationOverlay.entries["uk/hmp-wormwood-scrubs"], undefined);
  assert.equal(ukVerificationOverlay.entries["uk/hmp-manchester"], undefined);
});
