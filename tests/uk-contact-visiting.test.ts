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
    // A recipient-format mailing block (US Verifier pattern) is a mailing instruction, not a duplicate site address.
    if ((pa as { recipientFormat?: unknown }).recipientFormat) continue;
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
  // HMP Peterborough is operator-run: its GOV.UK page only links out, so it carries no GOV.UK contact data.
  assert.equal(getContactVisiting("uk", "hmp-peterborough"), undefined);
  assert.equal(withContactVisiting("uk", "hmp-peterborough", undefined), undefined);
  const noContact = getFacilityVerification("uk", "hmp-peterborough");
  assert.equal(withContactVisiting("uk", "hmp-peterborough", noContact), noContact);
});

test("priority UK prisons carry the GOV.UK contact & visiting data (checked 2026-10-17)", () => {
  const slugs = [
    "hmp-preston", "hmp-wandsworth", "hmp-belmarsh", "hmp-yoi-pentonville", "hmp-wormwood-scrubs",
    "hmp-birmingham", "hmp-manchester", "hmp-leeds", "hmp-liverpool", "hmp-durham", "hmp-wakefield",
  ];
  for (const slug of slugs) {
    const r = getContactVisiting("uk", slug);
    assert.ok(r, `missing ${slug}`);
    assert.ok(r.visitBooking, `${slug}: visitBooking`);
    assert.equal(r.prisonerContact?.emailAPrisonerUrl, EMAIL_A_PRISONER_URL);
    assert.equal(r.prisonerContact?.sendMoneyUrl, SEND_PRISONER_MONEY_URL);
  }
  const withPostal = slugs.filter((slug) => getContactVisiting("uk", slug)!.postalAddress);
  assert.deepEqual(withPostal, ["hmp-wandsworth", "hmp-wormwood-scrubs"]);
  assert.deepEqual(getContactVisiting("uk", "hmp-wandsworth")!.postalAddress, {
    lines: ["HMP Wandsworth", "PO Box 757", "Heathfield Road", "Wandsworth", "London"],
    postcode: "SW18 3HS",
    sourceId: CONTACT_VISITING_SOURCE_ID,
  });
  assert.deepEqual(getContactVisiting("uk", "hmp-wormwood-scrubs")!.postalAddress, {
    lines: ["HMP Wormwood Scrubs", "PO Box 757", "Du Cane Road", "London"],
    postcode: "W12 0AE",
    sourceId: CONTACT_VISITING_SOURCE_ID,
  });
  // Site postcodes stay canonical on the prison record.
  assert.equal(ukPrisonsGenerated.find((p) => p.slug === "hmp-wandsworth")!.postcode, "SW18 3HU");
  assert.equal(ukPrisonsGenerated.find((p) => p.slug === "hmp-wormwood-scrubs")!.postcode, "W12 0AN");

  const birmingham = getContactVisiting("uk", "hmp-birmingham")!.visitBooking!;
  assert.deepEqual(birmingham.methods, ["phone", "email"]);
  assert.equal(birmingham.url, undefined);
  assert.equal(birmingham.phone, "0333 207 2490");
  assert.equal(birmingham.email, "visits.birmingham@justice.gov.uk");

  const manchester = getContactVisiting("uk", "hmp-manchester")!.visitBooking!;
  assert.deepEqual(manchester.methods, ["prisoner-led", "phone", "email"]);
  assert.equal(manchester.url, undefined);
  assert.match(manchester.note!, /All other visits are booked by prisoner-led application\./);

  for (const slug of ["hmp-leeds", "hmp-wakefield"]) {
    const b = getContactVisiting("uk", slug)!.visitBooking!;
    assert.equal(b.emailEnquiriesOnly, true);
    assert.equal(b.methods.includes("email"), false);
  }
  assert.match(getContactVisiting("uk", "hmp-belmarsh")!.prisonerContact!.postInstructions!, /or date of birth/);
});

test("coverage batch 1 carries GOV.UK contact & visiting data (checked 2026-10-17)", () => {
  const slugs = [
    "hmp-hewell", "hmp-elmley", "hmp-nottingham", "hmp-berwyn", "hmp-ranby", "hmp-bullingdon", "hmp-coldingley",
    "hmp-erlestoke", "hmp-garth", "hmp-humber", "hmp-gartree", "hmp-kirkham", "hmp-channings-wood", "hmp-bedford",
    "hmp-morton-hall", "hmp-yoi-stoke-heath", "hmp-guys-marsh", "hmp-yoi-rochester", "hmp-highpoint",
    "hmp-long-lartin", "hmp-huntercombe", "hmp-grendon", "hmp-wymott", "hmp-isle-of-wight",
  ];
  for (const slug of slugs) {
    const r = getContactVisiting("uk", slug);
    assert.ok(r, `missing ${slug}`);
    assert.ok(r.visitBooking, `${slug}: visitBooking`);
    assert.ok(r.prisonerContact, `${slug}: prisonerContact`);
    assert.equal(r.postalAddress, undefined, `${slug}: no separate postal address on GOV.UK`);
  }
  // Bullingdon's only GOV.UK address is the PO Box already used as its site address, so no postalAddress.
  assert.equal(ukPrisonsGenerated.find((p) => p.slug === "hmp-bullingdon")!.postcode, "OX25 1PZ");
  assert.deepEqual(getContactVisiting("uk", "hmp-hewell")!.visitBooking, {
    methods: ["online", "phone"],
    url: GOVUK_PRISON_VISITS_URL,
    phone: "0300 060 6503",
    phoneHours: "Monday to Friday, 9am to 3pm",
    email: "Visits.HMPHewell@justice.gov.uk",
    emailEnquiriesOnly: true,
    sourceId: CONTACT_VISITING_SOURCE_ID,
  });
  const longLartin = getContactVisiting("uk", "hmp-long-lartin")!.visitBooking!;
  assert.deepEqual(longLartin.methods, ["phone", "email"]);
  assert.equal(longLartin.url, undefined);
  assert.deepEqual(getContactVisiting("uk", "hmp-isle-of-wight")!.visitBooking!.methods, ["phone"]);
  assert.ok(getContactVisiting("uk", "hmp-gartree")!.visitBooking!.methods.includes("prisoner-led"));
  assert.deepEqual(getContactVisiting("uk", "hmp-kirkham")!.visitBooking!.methods, ["online", "prisoner-led"]);
  assert.equal(getContactVisiting("uk", "hmp-elmley")!.sources[0].url, "https://www.gov.uk/guidance/elmley-prison");
  assert.equal(getContactVisiting("uk", "hmp-elmley")!.sources[0].sourceModifiedAt, "2026-07-17");
});

test("coverage batch 2 carries GOV.UK contact & visiting data (checked 2026-10-17)", () => {
  const slugs = [
    "hmp-wealstun", "hmp-whitemoor", "hmp-lewes", "hmp-swaleside", "hmp-the-mount", "hmp-exeter", "hmp-sudbury",
    "hmp-hatfield", "hmp-lindholme", "hmp-yoi-hindley", "hmp-risley", "hmp-yoi-isis", "hmp-holme-house", "hmp-wayland",
    "hmp-lowdham-grange", "hmp-featherstone", "hmp-leyhill", "hmp-yoi-stocken", "hmp-brixton", "hmp-north-sea-camp",
    "hmp-yoi-hull", "hmp-littlehey", "hmp-whatton", "hmp-yoi-brinsford",
  ];
  for (const slug of slugs) {
    const r = getContactVisiting("uk", slug);
    assert.ok(r, `missing ${slug}`);
    assert.ok(r.visitBooking, `${slug}: visitBooking`);
    assert.ok(r.prisonerContact, `${slug}: prisonerContact`);
    // Hindley/Risley list a "Postal address" that is the site address itself, so no separate postalAddress.
    assert.equal(r.postalAddress, undefined, `${slug}: no separate postal address on GOV.UK`);
  }
  const isis = getContactVisiting("uk", "hmp-yoi-isis")!.visitBooking!;
  assert.deepEqual(isis.methods, ["prisoner-led"]);
  assert.equal(isis.note, "Social and family visits can only be booked by the prisoner internally.");
  assert.deepEqual(getContactVisiting("uk", "hmp-lewes")!.visitBooking!.methods, ["online"]);
  const featherstone = getContactVisiting("uk", "hmp-featherstone")!.visitBooking!;
  assert.equal(featherstone.emailEnquiriesOnly, true);
  assert.equal(featherstone.methods.includes("email"), false);
  // Swaleside's page names the send-money service without linking it, so no sendMoneyUrl is stored.
  assert.equal(getContactVisiting("uk", "hmp-swaleside")!.prisonerContact!.sendMoneyUrl, undefined);
  assert.equal(getContactVisiting("uk", "hmp-wayland")!.visitBooking!.phone, "01953 804 152");
});
