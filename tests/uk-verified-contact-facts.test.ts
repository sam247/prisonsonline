import assert from "node:assert/strict";
import { test } from "node:test";
import { prisons } from "@/data/prisons";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";
import { getFacilityVerification } from "@/data/facilitySources";
import { applyVerifiedContactFacts, phoneMatcher, replacePhoneInText } from "@/lib/verification/applyVerifiedFacts";
import { buildContactBody, buildHowToVisitBody } from "@/lib/seo/prisonProfileCopy";
import { prisonProfileJsonLdGraph } from "@/lib/seo/prisonJsonLd";

function renderedRecordText(slug: string): string {
  const prison = prisons.find((p) => p.countrySlug === "uk" && p.slug === slug);
  assert.ok(prison, `missing uk/${slug}`);
  const { sourceRaw: _audit, ...rendered } = prison;
  const jsonLd = prisonProfileJsonLdGraph({ prison, path: `/prisons/uk/${slug}`, description: prison.overview });
  return [
    JSON.stringify(rendered),
    buildContactBody(prison),
    buildHowToVisitBody(prison),
    JSON.stringify(jsonLd),
  ].join("\n");
}

test("phone matcher ignores spacing and brackets", () => {
  const re = phoneMatcher("(020) 8334 4400");
  assert.ok(re);
  assert.equal(replacePhoneInText("call (020) 8334 4400 now", "(020) 8334 4400", "020 8331 4400"), "call 020 8331 4400 now");
  assert.equal(replacePhoneInText("call 0208 334 4400.", "(020) 8334 4400", "020 8331 4400"), "call 020 8331 4400.");
  assert.equal(replacePhoneInText("ref 1020833344001", "(020) 8334 4400", "020 8331 4400"), "ref 1020833344001");
});

test("Belmarsh renders only the verified GOV.UK phone 020 8331 4400", () => {
  const text = renderedRecordText("hmp-belmarsh");
  assert.equal(text.includes("8334 4400"), false, "stale HMPPS phone leaked into rendered Belmarsh record");
  assert.ok(text.includes("020 8331 4400"));
  const prison = prisons.find((p) => p.slug === "hmp-belmarsh")!;
  assert.equal(prison.phone, "020 8331 4400");
  assert.match(prison.visitingInfo, /020 8331 4400/);
});

test("every UK phone override replaces the upstream phone in all rendered fields", () => {
  const overridden = ukPrisonsGenerated.filter((p) => getFacilityVerification("uk", p.slug)?.overrides?.phone);
  assert.ok(overridden.length >= 3, "expected Belmarsh, Birmingham and Littlehey overrides at minimum");
  for (const raw of overridden) {
    const verifiedPhone = getFacilityVerification("uk", raw.slug)!.overrides!.phone!;
    const text = renderedRecordText(raw.slug);
    assert.ok(text.includes(verifiedPhone), `${raw.slug}: verified phone missing`);
    const upstream = raw.phone?.trim();
    if (!upstream || upstream.replace(/\D/g, "") === verifiedPhone.replace(/\D/g, "")) continue;
    assert.equal(phoneMatcher(upstream)!.test(text), false, `${raw.slug}: upstream phone ${upstream} still rendered`);
  }
});

test("records without overrides are returned unchanged", () => {
  const raw = ukPrisonsGenerated.find((p) => p.slug === "hmp-gartree")!;
  assert.equal(applyVerifiedContactFacts(raw, undefined), raw);
});
