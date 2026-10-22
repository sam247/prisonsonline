import assert from "node:assert/strict";
import test from "node:test";
import type { FacilityVerificationRecord, VisitBooking } from "@/types/facilitySource";
import type { Prison } from "@/types/prison";
import { ukPrisonFaqBreadcrumbJsonLd } from "@/lib/seo/ukPrisonFaqBreadcrumbJsonLd";

const SOURCE = { id: "s", name: "GOV.UK", url: "https://www.gov.uk/guidance/example-prison", checkedAt: "2026-10-17" };

function prison(overrides: Partial<Prison> = {}): Prison {
  return {
    name: "HMP Example",
    slug: "hmp-example",
    country: "United Kingdom",
    countrySlug: "uk",
    stateOrRegion: "London",
    regionSlug: "london",
    city: "London",
    securityLevel: "Category B",
    capacity: 0,
    operator: "HM Prison and Probation Service",
    openedYear: 0,
    latitude: 0,
    longitude: 0,
    type: "Prison",
    overview: "",
    history: "",
    prisonLife: "",
    visitingInfo: "",
    dataProvenance: "hmpps_import",
    address: "1 Example Road",
    postcode: "SW1A 1AA",
    phone: "020 7946 0000",
    ...overrides,
  };
}

function record(partial: Partial<FacilityVerificationRecord> = {}): FacilityVerificationRecord {
  return {
    countrySlug: "uk",
    prisonSlug: "hmp-example",
    sources: [SOURCE],
    fieldSources: {},
    ...partial,
  };
}

function booking(partial: Partial<VisitBooking> = {}): VisitBooking {
  return { methods: ["online"], sourceId: "s", ...partial };
}

type Graph = {
  "@graph": Array<Record<string, unknown> & { "@type": string; mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> }>;
};

function graphFor(p: Prison, page: string, verification?: FacilityVerificationRecord) {
  return ukPrisonFaqBreadcrumbJsonLd(p, page, verification) as Graph | null;
}

function questions(data: Graph) {
  return data["@graph"].find((node) => node["@type"] === "FAQPage")?.mainEntity ?? [];
}

function names(data: Graph) {
  return questions(data).map((item) => item.name);
}

function answer(data: Graph, name: string) {
  return questions(data).find((item) => item.name === name)?.acceptedAnswer.text;
}

const full = record({
  fieldSources: {
    address: ["s"],
    postcode: ["s"],
    phone: ["s"],
    email: ["s"],
    postalAddress: ["s"],
    visitBooking: ["s"],
    prisonerContact: ["s"],
    visitingHours: ["s"],
    visitingRulesUrl: ["s"],
  },
  overrides: { email: "example@justice.gov.uk" },
  postalAddress: { lines: ["PO Box 1", "London"], postcode: "SW1A 2BB", sourceId: "s" },
  visitBooking: booking({
    methods: ["online", "phone"],
    url: "https://www.gov.uk/prison-visits",
    phone: "0300 060 6509",
    phoneHours: "Monday to Friday, 9am to 3pm",
    email: "visits@justice.gov.uk",
    note: "Book in person after a visit.",
  }),
  prisonerContact: {
    postInstructions: "Include the person’s name and prisoner number on the envelope.",
    emailAPrisonerUrl: "https://www.emailaprisoner.com/",
    sendMoneyUrl: "https://www.gov.uk/send-prisoner-money",
    sourceId: "s",
  },
  visitingHours: { schedule: ["Sat: 9:00 AM - 11:00 AM"], note: "Sessions can be cancelled.", sourceId: "s" },
  visitingRulesUrl: { url: "https://www.gov.uk/guidance/example-prison", sourceId: "s" },
});

test("non-UK pages and other intents emit nothing", () => {
  assert.equal(graphFor(prison({ countrySlug: "us" }), "profile", full), null);
  assert.equal(graphFor(prison(), "visiting-times", full), null);
  assert.equal(graphFor(prison(), "booking-a-visit", full), null);
});

test("verified fields become FAQ answers and breadcrumbs", () => {
  const profile = graphFor(prison(), "profile", full);
  assert.ok(profile);
  assert.equal(answer(profile, "What is the address?"), "1 Example Road");
  assert.equal(answer(profile, "What is the postcode?"), "SW1A 1AA");
  assert.equal(answer(profile, "What is the phone number?"), "020 7946 0000");
  assert.equal(answer(profile, "What is the email address?"), "example@justice.gov.uk");
  assert.equal(answer(profile, "What is the postal address for letters?"), "PO Box 1\nLondon\nSW1A 2BB");
  assert.equal(answer(profile, "Which visit booking methods are listed?"), "online, phone");
  assert.equal(answer(profile, "What is the visit booking page?"), "https://www.gov.uk/prison-visits");
  assert.equal(answer(profile, "What is the visits booking line?"), "0300 060 6509");
  assert.equal(answer(profile, "What are the visits booking line hours?"), "Monday to Friday, 9am to 3pm");
  assert.equal(answer(profile, "What is the visits booking email?"), "visits@justice.gov.uk");
  assert.equal(answer(profile, "What is the visit booking note?"), "Book in person after a visit.");
  assert.equal(
    answer(profile, "What are the letter instructions?"),
    "Include the person’s name and prisoner number on the envelope.",
  );
  assert.equal(answer(profile, "What is the email a prisoner page?"), "https://www.emailaprisoner.com/");
  assert.equal(answer(profile, "What is the send money page?"), "https://www.gov.uk/send-prisoner-money");
  assert.equal(answer(profile, "What are the visiting hours?"), "Sat: 9:00 AM - 11:00 AM");
  assert.equal(answer(profile, "What is the visiting hours note?"), "Sessions can be cancelled.");
  assert.equal(answer(profile, "What is the visiting rules page?"), "https://www.gov.uk/guidance/example-prison");

  const crumbs = profile["@graph"].find((node) => node["@type"] === "BreadcrumbList")!;
  const list = crumbs.itemListElement as Array<{ position: number; name: string; item: string }>;
  assert.deepEqual(
    list.map((item) => item.item),
    [
      "https://prisonsonline.com/prisons",
      "https://prisonsonline.com/prisons/uk",
      "https://prisonsonline.com/prisons/uk/hmp-example",
    ],
  );
  assert.deepEqual(list.map((item) => item.position), [1, 2, 3]);

  const contact = graphFor(prison(), "contact-details", full);
  assert.ok(contact);
  const contactCrumbs = (contact["@graph"].find((node) => node["@type"] === "BreadcrumbList")!.itemListElement ??
    []) as Array<{ name: string; item: string }>;
  assert.equal(contactCrumbs.length, 4);
  assert.equal(contactCrumbs[3].name, "HMP Example Address, Postcode & Phone");
  assert.equal(contactCrumbs[3].item, "https://prisonsonline.com/prisons/uk/hmp-example/contact-details");
});

test("missing fields add no FAQ entry", () => {
  const bare = graphFor(prison({ address: "  ", postcode: undefined, phone: "n/a" }), "profile", record());
  assert.ok(bare);
  assert.equal(bare["@graph"].some((node) => node["@type"] === "FAQPage"), false);

  const noBookingSubs = graphFor(
    prison(),
    "profile",
    record({ fieldSources: { visitBooking: ["s"] }, visitBooking: booking({ methods: [] }) }),
  );
  assert.ok(noBookingSubs);
  assert.equal(noBookingSubs["@graph"].some((node) => node["@type"] === "FAQPage"), false);

  const dropped: Array<[string, FacilityVerificationRecord, string]> = [
    ["address", record({ fieldSources: { postcode: ["s"], phone: ["s"] } }), "What is the address?"],
    ["postcode", record({ fieldSources: { address: ["s"], phone: ["s"] } }), "What is the postcode?"],
    ["phone", record({ fieldSources: { address: ["s"], postcode: ["s"] } }), "What is the phone number?"],
    [
      "email",
      record({ fieldSources: { email: ["s"] }, overrides: {} }),
      "What is the email address?",
    ],
    [
      "postal lines",
      record({
        fieldSources: { postalAddress: ["s"] },
        postalAddress: { lines: [], postcode: " ", sourceId: "s" },
      }),
      "What is the postal address for letters?",
    ],
    [
      "booking url",
      record({ fieldSources: { visitBooking: ["s"] }, visitBooking: booking({ methods: ["phone"], phone: "0300 111" }) }),
      "What is the visit booking page?",
    ],
    [
      "booking phone",
      record({ fieldSources: { visitBooking: ["s"] }, visitBooking: booking({ url: "https://www.gov.uk/prison-visits" }) }),
      "What is the visits booking line?",
    ],
    [
      "booking hours",
      record({ fieldSources: { visitBooking: ["s"] }, visitBooking: booking({ phone: "0300 111" }) }),
      "What are the visits booking line hours?",
    ],
    [
      "booking email",
      record({ fieldSources: { visitBooking: ["s"] }, visitBooking: booking({ phone: "0300 111", emailEnquiriesOnly: true }) }),
      "What is the visits enquiries email?",
    ],
    [
      "booking note",
      record({ fieldSources: { visitBooking: ["s"] }, visitBooking: booking({ phone: "0300 111" }) }),
      "What is the visit booking note?",
    ],
    [
      "letter instructions",
      record({
        fieldSources: { prisonerContact: ["s"] },
        prisonerContact: { emailAPrisonerUrl: "https://www.emailaprisoner.com/", sourceId: "s" },
      }),
      "What are the letter instructions?",
    ],
    [
      "email a prisoner",
      record({
        fieldSources: { prisonerContact: ["s"] },
        prisonerContact: { postInstructions: "Name on the envelope.", sourceId: "s" },
      }),
      "What is the email a prisoner page?",
    ],
    [
      "send money",
      record({
        fieldSources: { prisonerContact: ["s"] },
        prisonerContact: { postInstructions: "Name on the envelope.", sourceId: "s" },
      }),
      "What is the send money page?",
    ],
    [
      "visiting hours",
      record({
        fieldSources: { visitingHours: ["s"] },
        visitingHours: { schedule: [" "], note: "Check the prison.", sourceId: "s" },
      }),
      "What are the visiting hours?",
    ],
    [
      "visiting note",
      record({
        fieldSources: { visitingHours: ["s"] },
        visitingHours: { schedule: ["Sat: 9:00 AM - 11:00 AM"], sourceId: "s" },
      }),
      "What is the visiting hours note?",
    ],
    [
      "visiting rules",
      record({ fieldSources: { visitingHours: ["s"] }, visitingHours: { schedule: ["Sat: 9:00 AM - 11:00 AM"], sourceId: "s" } }),
      "What is the visiting rules page?",
    ],
  ];

  for (const [label, verification, questionName] of dropped) {
    const data = graphFor(prison(), "contact-details", verification);
    assert.ok(data, label);
    assert.equal(names(data).includes(questionName), false, `${label} must be omitted`);
  }
});

test("unverified blocks and enquiries-only email do not invent an entry", () => {
  const unverified = graphFor(
    prison(),
    "profile",
    record({
      postalAddress: { lines: ["PO Box 9"], postcode: "SW1A 9ZZ", sourceId: "s" },
      visitBooking: booking({ phone: "0300 000 0000" }),
    }),
  );
  assert.ok(unverified);
  assert.equal(unverified["@graph"].some((node) => node["@type"] === "FAQPage"), false);

  const review = graphFor(
    prison(),
    "profile",
    record({
      fieldSources: { visitBooking: ["s"] },
      visitBooking: { ...booking({ phone: "0300 000 0000" }), status: "REVIEW_REQUIRED" } as VisitBooking,
    }),
  );
  assert.ok(review);
  assert.equal(names(review).includes("What is the visits booking line?"), false);

  const enquiries = graphFor(
    prison(),
    "profile",
    record({
      fieldSources: { visitBooking: ["s"] },
      visitBooking: booking({ email: "enquiries@justice.gov.uk", emailEnquiriesOnly: true, methods: ["email"] }),
    }),
  );
  assert.ok(enquiries);
  assert.equal(answer(enquiries, "What is the visits enquiries email?"), "enquiries@justice.gov.uk");
  assert.equal(names(enquiries).includes("What is the visits booking email?"), false);
});
