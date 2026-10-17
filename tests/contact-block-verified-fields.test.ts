import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { prisons } from "../src/data/prisons";
import { getFacilityVerification } from "../src/data/facilitySources";
import { ContactVisitingBlock } from "../src/components/facility/ContactVisitingBlock";
import { OFFICIAL_URLS, contactVisitingRows, verifiedBlock } from "../src/lib/seo/prisonContactVisiting";
import type { FacilityVerificationRecord } from "../src/types/facilitySource";
import type { Prison } from "../src/types/prison";

(globalThis as { React?: typeof React }).React = React;

const find = (cc: string, slug: string) => {
  const p = prisons.find((x) => x.countrySlug === cc && x.slug === slug);
  assert.ok(p, `${cc}/${slug}`);
  return p as Prison;
};
const rowsFor = (p: Prison) => contactVisitingRows(p, getFacilityVerification(p.countrySlug, p.slug));
const row = (p: Prison, key: string) => rowsFor(p).find((r) => r.key === key);
const html = (p: Prison) => renderToStaticMarkup(React.createElement(ContactVisitingBlock, { rows: rowsFor(p) }));

test("UK verified fields show: Wandsworth postal address, booking line, post instructions", () => {
  const w = find("uk", "hmp-wandsworth");
  assert.deepEqual(row(w, "mailing-address")?.lines, ["HMP Wandsworth", "PO Box 757", "Heathfield Road", "Wandsworth", "London", "SW18 3HS"]);
  assert.equal(row(w, "visit-booking-phone")?.text, "0300 060 6509");
  assert.equal(row(w, "visit-booking-phone")?.note, "Monday to Friday, 9am to 3pm");
  assert.match(row(w, "post")?.text ?? "", /prisoner number/);
  const out = html(w);
  assert.match(out, /PO Box 757/);
  assert.match(out, /tel:03000606509/);
});

test("UK without a verified postal address shows no mailing-address row (Preston)", () => {
  const p = find("uk", "hmp-preston");
  assert.equal(row(p, "mailing-address"), undefined);
  assert.equal(row(p, "visit-booking-phone")?.text, "0330 058 8224");
  assert.ok(row(p, "booking")?.links?.some((l) => l.href === OFFICIAL_URLS.ukVisits));
});

test("US verified fields show: visiting rules link; guaynabo-mdc mailing address (REVIEW_REQUIRED) hidden", () => {
  const g = find("us", "guaynabo-mdc");
  assert.equal(row(g, "mailing-address"), undefined, "guaynabo-mdc mailing address must not show");
  assert.doesNotMatch(html(g), /Inmate mail address/);
  assert.match(row(g, "visiting-rules")?.links?.[0]?.href ?? "", /gua_visit\.pdf$/);
});

test("US verified inmate mail address shows on at least one BOP profile, with recipient format", () => {
  const withMail = prisons.filter((p) => p.countrySlug === "us" && row(p, "mailing-address"));
  assert.ok(withMail.length > 0);
  for (const p of withMail) assert.ok((row(p, "mailing-address")?.lines?.length ?? 0) >= 2, p.slug);
});

test("unverified or REVIEW_REQUIRED blocks are hidden", () => {
  const src = { id: "s", name: "x", url: "https://www.bop.gov/x", checkedAt: "2026-10-17" };
  const pa = { lines: ["PO Box 1"], postcode: "00000", sourceId: "s" };
  const base: FacilityVerificationRecord = { countrySlug: "us", prisonSlug: "x", sources: [src], fieldSources: { postalAddress: ["s"] }, postalAddress: pa };
  assert.ok(verifiedBlock(base, "postalAddress"));
  assert.equal(verifiedBlock({ ...base, fieldSources: {} }, "postalAddress"), undefined, "no fieldSources");
  assert.equal(verifiedBlock({ ...base, sources: [] }, "postalAddress"), undefined, "source missing");
  assert.equal(verifiedBlock({ ...base, postalAddress: { ...pa, status: "REVIEW_REQUIRED" } as typeof pa }, "postalAddress"), undefined);
  assert.equal(verifiedBlock({ ...base, postalAddress: undefined }, "postalAddress"), undefined);
});

test("/contact-details rows: verified fields, no address/phone/email dupes, no internal intent links", async () => {
  const { contactDetailsRows } = await import("../src/lib/seo/prisonContactVisiting");
  const cd = (p: Prison) => contactDetailsRows(p, getFacilityVerification(p.countrySlug, p.slug));
  const w = cd(find("uk", "hmp-wandsworth"));
  assert.ok(w.some((r) => r.key === "mailing-address"));
  assert.ok(w.some((r) => r.key === "visit-booking-phone"));
  for (const p of prisons.filter((x) => ["uk", "us"].includes(x.countrySlug))) {
    for (const r of cd(p)) {
      assert.ok(!["address", "phone", "email"].includes(r.key), `${p.slug} ${r.key}`);
      assert.ok(!(r.links ?? []).some((l) => l.kind === "internal"), `${p.slug} internal link`);
    }
  }
  const g = cd(find("us", "guaynabo-mdc"));
  assert.ok(!g.some((r) => r.key === "mailing-address"), "guaynabo-mdc mailing address hidden on /contact-details");
  assert.ok(g.some((r) => r.key === "visiting-rules"));
});
