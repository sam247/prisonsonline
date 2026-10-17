import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { prisons } from "../src/data/prisons";
import { guides } from "../src/data/guides";
import { getFacilityVerification } from "../src/data/facilitySources";
import { AD_POLICY } from "../src/lib/ads/layoutPolicy";
import {
  OFFICIAL_URLS,
  contactVisitingRows,
  isBopInstitution,
  isContactVisitingEligible,
} from "../src/lib/seo/prisonContactVisiting";
import type { Prison } from "../src/types/prison";

(globalThis as { React?: typeof React }).React = React;
// Ad units need the c15t consent provider; these tests only render page content.
AD_POLICY.entity.maxUnits = 0;

async function renderProfile(prison: Prison): Promise<string> {
  (process.env as Record<string, string>).NODE_ENV = "test";
  const { PrisonProfileView } = await import("../src/components/pages/PrisonProfileView");
  return renderToStaticMarkup(React.createElement(PrisonProfileView, { prison }));
}
async function renderIntl(prison: Prison): Promise<string> {
  (process.env as Record<string, string>).NODE_ENV = "test";
  const { IntlPrisonProfileView } = await import("../src/components/pages/IntlPrisonProfileView");
  return renderToStaticMarkup(React.createElement(IntlPrisonProfileView, { prison }));
}
const find = (cc: string, slug: string) => {
  const p = prisons.find((x) => x.countrySlug === cc && x.slug === slug);
  assert.ok(p, `${cc}/${slug}`);
  return p;
};
const rowsFor = (p: Prison) => contactVisitingRows(p, getFacilityVerification(p.countrySlug, p.slug));
const keys = (p: Prison) => rowsFor(p).map((r) => r.key);
const hrefs = (p: Prison) => rowsFor(p).flatMap((r) => (r.links ?? []).map((l) => l.href));
const BLOCK = 'data-block="contact-visiting"';

test("every UK and US BOP profile gets the block; no international or legacy row does", () => {
  const uk = prisons.filter((p) => p.countrySlug === "uk");
  const us = prisons.filter((p) => p.countrySlug === "us");
  assert.ok(uk.length > 100 && us.length > 100);
  for (const p of [...uk, ...us]) assert.ok(rowsFor(p).length > 0, `${p.countrySlug}/${p.slug}`);
  for (const p of prisons.filter((x) => !["uk", "us"].includes(x.countrySlug))) {
    assert.equal(isContactVisitingEligible(p), false, `${p.countrySlug}/${p.slug}`);
    assert.equal(rowsFor(p).length, 0, `${p.countrySlug}/${p.slug}`);
  }
});

test("rows with no data are hidden; values are read, never invented", () => {
  const preston = find("uk", "hmp-preston");
  const bare: Prison = { ...preston, address: undefined, postcode: undefined, phone: "  " };
  const k = keys(bare);
  assert.ok(!k.includes("address") && !k.includes("phone"), "missing address/phone rows hidden");
  assert.ok(!k.includes("email"), "no email without a verified overlay value");
  assert.ok(!k.includes("official-page") || getFacilityVerification("uk", "hmp-preston")?.sources.length);
  // No verification record → no email and no official-page row.
  const noVerify = contactVisitingRows(preston, undefined).map((r) => r.key);
  assert.ok(!noVerify.includes("email") && !noVerify.includes("official-page"));
  // Email row only from a verified overlay override.
  const belmarsh = find("uk", "hmp-belmarsh");
  const email = rowsFor(belmarsh).find((r) => r.key === "email");
  assert.equal(email?.text, getFacilityVerification("uk", "hmp-belmarsh")?.overrides?.email);
  // Address/phone exactly the published values.
  const r = rowsFor(preston);
  assert.equal(r.find((x) => x.key === "phone")?.text, preston.phone);
  assert.ok(r.find((x) => x.key === "address")?.text?.includes(preston.postcode!));
  // A US BOP row with no data at all still renders nothing invented.
  const atl = find("us", "atlanta-fci");
  const usBare: Prison = { ...atl, address: "", phone: "" };
  const uk2 = contactVisitingRows(usBare, undefined).map((x) => x.key);
  assert.deepEqual(uk2, ["booking", "contact-federal-inmate"]);
});

test("official links appear only where the facility type matches", () => {
  const ukLinks = Object.values(OFFICIAL_URLS).filter((u) => u.includes("gov.uk"));
  const bopLinks = Object.values(OFFICIAL_URLS).filter((u) => u.includes("bop.gov"));
  for (const p of prisons.filter((x) => x.countrySlug === "uk")) {
    const h = hrefs(p);
    for (const u of ukLinks) assert.ok(h.includes(u), `uk/${p.slug} has ${u}`);
    assert.ok(!h.some((x) => x.includes("bop.gov")), `uk/${p.slug}: no BOP links`);
  }
  for (const p of prisons.filter((x) => x.countrySlug === "us")) {
    const h = hrefs(p);
    assert.ok(!h.some((x) => x.includes("gov.uk")), `us/${p.slug}: no GOV.UK links`);
    if (isBopInstitution(p)) for (const u of bopLinks) assert.ok(h.includes(u), `us/${p.slug} has ${u}`);
    else for (const u of bopLinks) assert.ok(!h.includes(u), `us/${p.slug} (CCM office): no inmate-contact links`);
  }
  assert.equal(isBopInstitution(find("us", "atlanta-fci")), true);
  const ccm = prisons.find((p) => p.countrySlug === "us" && /\bccm\b/i.test(p.name));
  assert.ok(ccm && !isBopInstitution(ccm));
  // A state/legacy US row never gets BOP links even if mislabelled as US.
  const state: Prison = { ...find("us", "atlanta-fci"), dataProvenance: "manual", operator: "California Department of Corrections" };
  assert.equal(rowsFor(state).length, 0);
});

test("every linked guide and internal route exists", () => {
  const guideSlugs = new Set(guides.map((g) => g.slug));
  for (const p of prisons.filter((x) => isContactVisitingEligible(x))) {
    for (const r of rowsFor(p)) for (const l of r.links ?? []) {
      if (l.href.startsWith("/guides/")) assert.ok(guideSlugs.has(l.href.slice(8)), `missing guide ${l.href}`);
      else if (l.href.startsWith("/")) assert.match(l.href, new RegExp(`^/prisons/${p.countrySlug}/${p.slug}/booking-a-visit$`));
      else assert.match(l.href, /^https:\/\/www\.(gov\.uk|bop\.gov)\//);
    }
  }
});

test("rendered profiles: block on UK and US BOP, absent on international", async () => {
  for (const [cc, slug] of [["uk", "hmp-preston"], ["uk", "hmp-wandsworth"], ["us", "atlanta-fci"]] as const) {
    const html = await renderProfile(find(cc, slug));
    assert.ok(html.includes(BLOCK), `${slug}: block`);
    assert.match(html, /Contacting and visiting/);
  }
  const intl = prisons.filter((p) => p.dataProvenance === "official_source").slice(0, 10);
  assert.ok(intl.length > 0);
  for (const p of intl) assert.ok(!(await renderIntl(p)).includes(BLOCK), `${p.countrySlug}/${p.slug}`);
  for (const p of prisons.filter((x) => x.countrySlug === "united-states")) {
    assert.ok(!(await renderProfile(p)).includes(BLOCK), `legacy ${p.slug}`);
  }
});
