import assert from "node:assert/strict";
import { test } from "node:test";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";
import { getFacilityVerification } from "@/data/facilitySources";
import {
  CONTACT_VISITING_SOURCE_ID,
  EMAIL_A_PRISONER_URL,
  GOVUK_PRISON_VISITS_URL,
  SEND_PRISONER_MONEY_URL,
  getContactVisiting,
  ukContactVisitingRecords,
  withContactVisiting,
} from "@/data/ukContactVisiting";

const BLOCKS = ["postalAddress", "visitBooking", "prisonerContact"] as const;
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

test("contact & visiting records are unique, UK and match generated prison slugs", () => {
  const keys = ukContactVisitingRecords.map((r) => `${r.countrySlug}/${r.prisonSlug}`);
  assert.equal(new Set(keys).size, keys.length, "duplicate slug");
  for (const r of ukContactVisitingRecords) {
    assert.equal(r.countrySlug, "uk");
    assert.ok(ukPrisonsGenerated.some((p) => p.slug === r.prisonSlug), `unknown slug ${r.prisonSlug}`);
  }
});

test("every block has GOV.UK provenance via sources and fieldSources", () => {
  for (const r of ukContactVisitingRecords) {
    assert.ok(r.sources.length > 0, `${r.prisonSlug}: no sources`);
    const ids = new Set(r.sources.map((s) => s.id));
    for (const s of r.sources) {
      assert.match(s.url, /^https:\/\/www\.gov\.uk\/guidance\/[a-z-]+-prison$/, `${r.prisonSlug}: non-GOV.UK source`);
      assert.match(s.checkedAt, ISO_DATE);
      if (s.sourceModifiedAt) assert.match(s.sourceModifiedAt, ISO_DATE);
    }
    let present = 0;
    for (const field of BLOCKS) {
      const block = r[field];
      if (!block) {
        assert.equal(r.fieldSources[field], undefined, `${r.prisonSlug}: fieldSources.${field} without data`);
        continue;
      }
      present += 1;
      assert.ok(ids.has(block.sourceId), `${r.prisonSlug}.${field}: unknown sourceId`);
      assert.ok(r.fieldSources[field]?.length, `${r.prisonSlug}: fieldSources.${field} missing`);
      for (const id of r.fieldSources[field]!) assert.ok(ids.has(id), `${r.prisonSlug}: fieldSources.${field} -> ${id}`);
    }
    assert.ok(present > 0, `${r.prisonSlug}: empty record`);
  }
});

test("no placeholders or out-of-scope fields are stored", () => {
  const text = JSON.stringify(ukContactVisitingRecords);
  assert.equal(/NOT_PUBLISHED|TODO|unknown/i.test(text), false);
  for (const key of ["capacity", "governor", "visitingTelephone", "gettingThere"]) {
    assert.equal(text.includes(`"${key}"`), false, `out-of-scope field ${key}`);
  }
  for (const r of ukContactVisitingRecords) {
    for (const field of BLOCKS) {
      const block = r[field] as Record<string, unknown> | undefined;
      if (!block) continue;
      for (const [k, v] of Object.entries(block)) {
        assert.notEqual(v, "", `${r.prisonSlug}.${field}.${k} is empty — omit instead`);
        if (Array.isArray(v)) assert.ok(v.length > 0, `${r.prisonSlug}.${field}.${k} is an empty array`);
      }
    }
  }
});

test("visitBooking routes are consistent and only use official URLs", () => {
  for (const r of ukContactVisitingRecords) {
    const b = r.visitBooking;
    if (!b) continue;
    assert.ok(b.methods.length > 0);
    assert.equal(new Set(b.methods).size, b.methods.length);
    assert.equal(b.methods.includes("online"), Boolean(b.url), `${r.prisonSlug}: online <-> url mismatch`);
    if (b.url) assert.equal(b.url, GOVUK_PRISON_VISITS_URL);
    if (b.methods.includes("phone")) assert.ok(b.phone, `${r.prisonSlug}: phone method without phone`);
    if (b.methods.includes("email")) {
      assert.ok(b.email, `${r.prisonSlug}: email method without email`);
      assert.notEqual(b.emailEnquiriesOnly, true, `${r.prisonSlug}: enquiries-only email cannot be a booking method`);
    }
    if (b.methods.includes("prisoner-led")) assert.ok(b.note, `${r.prisonSlug}: prisoner-led needs the source qualifier`);
    if (b.email) assert.match(b.email, /@justice\.gov\.uk$/i);
    if (b.phone) assert.match(b.phone, /^0[\d ]{9,12}$/);
  }
});

test("prisonerContact routes are exactly the GOV.UK-linked services", () => {
  for (const r of ukContactVisitingRecords) {
    const c = r.prisonerContact;
    if (!c) continue;
    if (c.emailAPrisonerUrl) assert.equal(c.emailAPrisonerUrl, EMAIL_A_PRISONER_URL);
    if (c.sendMoneyUrl) assert.equal(c.sendMoneyUrl, SEND_PRISONER_MONEY_URL);
    if (c.postInstructions) assert.match(c.postInstructions, /envelope/);
  }
});

test("postalAddress is only stored when it differs from the canonical site address", () => {
  for (const r of ukContactVisitingRecords) {
    const pa = r.postalAddress;
    if (!pa) continue;
    assert.ok(pa.lines.length > 0);
    assert.match(pa.postcode, UK_POSTCODE);
    assert.equal(pa.lines.some((l) => UK_POSTCODE.test(l)), false, "postcode belongs in postcode, not lines");
    const site = ukPrisonsGenerated.find((p) => p.slug === r.prisonSlug)!;
    const differs = pa.postcode !== site.postcode || pa.lines.some((l) => /PO Box/i.test(l));
    assert.ok(differs, `${r.prisonSlug}: postalAddress duplicates the site address`);
  }
});

test("HMP Preston carries the GOV.UK booking and contact routes, and no postalAddress", () => {
  const r = getContactVisiting("uk", "hmp-preston");
  assert.ok(r);
  assert.equal(r.postalAddress, undefined);
  assert.deepEqual(r.visitBooking, {
    methods: ["online", "phone"],
    url: "https://www.gov.uk/prison-visits",
    phone: "0330 058 8224",
    phoneHours: "Monday to Friday, 9am to 3pm",
    sourceId: CONTACT_VISITING_SOURCE_ID,
  });
  assert.equal(r.prisonerContact?.emailAPrisonerUrl, "https://www.emailaprisoner.com/");
  assert.equal(r.prisonerContact?.sendMoneyUrl, "https://www.gov.uk/send-prisoner-money");
  assert.equal(r.prisonerContact?.postInstructions, "Include the person’s name and prison number on the envelope.");
  assert.equal(r.sources[0].url, "https://www.gov.uk/guidance/preston-prison");
  assert.equal(r.sources[0].checkedAt, "2026-10-17");
});

test("contact data is not wired into getFacilityVerification (display is Content Manager's)", () => {
  const base = getFacilityVerification("uk", "hmp-preston");
  assert.ok(base);
  assert.equal(base.visitBooking, undefined);
  assert.equal(base.prisonerContact, undefined);
  assert.equal(base.fieldSources.visitBooking, undefined);
});

test("withContactVisiting merges blocks and provenance without dropping existing facts", () => {
  const base = getFacilityVerification("uk", "hmp-preston")!;
  const merged = withContactVisiting("uk", "hmp-preston", base)!;
  assert.deepEqual(merged.legalVisits, base.legalVisits);
  assert.deepEqual(merged.sources.slice(0, base.sources.length), base.sources);
  assert.ok(merged.sources.some((s) => s.id === CONTACT_VISITING_SOURCE_ID));
  assert.deepEqual(merged.fieldSources.visitBooking, [CONTACT_VISITING_SOURCE_ID]);
  assert.equal(merged.fieldSources.phone, base.fieldSources.phone);
  assert.ok(merged.visitBooking && merged.prisonerContact);
  assert.equal(withContactVisiting("uk", "hmp-gartree", undefined), undefined);
  const noContact = getFacilityVerification("uk", "hmp-gartree");
  assert.equal(withContactVisiting("uk", "hmp-gartree", noContact), noContact);
});
