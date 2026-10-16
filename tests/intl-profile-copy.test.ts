import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { officialInternationalPrisons, prisons } from "../src/data/prisons";
import { formatIntlAddress, formatIntlSecurity } from "../src/lib/intl/profileCopy";
import type { Prison } from "../src/types/prison";

(globalThis as { React?: typeof React }).React = React;
async function render(prison: Prison): Promise<string> {
  (process.env as Record<string, string>).NODE_ENV = "test";
  const { IntlPrisonProfileView } = await import("../src/components/pages/IntlPrisonProfileView");
  return renderToStaticMarkup(React.createElement(IntlPrisonProfileView, { prison }));
}
const find = (cc: string, slug: string) => {
  const p = prisons.find((x) => x.countrySlug === cc && x.slug === slug);
  assert.ok(p, `${cc}/${slug}`);
  return p;
};
const COUNTRIES = Array.from(new Set(officialInternationalPrisons.map((p) => p.countrySlug)));

test("(a) overview sentences are grammatical and keep official capitalisation, every country", () => {
  assert.ok(COUNTRIES.length >= 4);
  assert.equal(
    find("ie", "mountjoy-prison").overview,
    "Mountjoy Prison is a prison in Dublin. The operator is Irish Prison Service.",
  );
  for (const p of officialInternationalPrisons) {
    const o = p.overview;
    assert.ok(!o.includes(";"), `${p.slug}: no list fragments in overview: ${o}`);
    assert.match(o, new RegExp(`^${p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} is an? \\S`), `${p.slug}: starts "<name> is a/an"`);
    assert.ok(!/ a [aeiouAEIOU]/.test(o) && !/ an [^aeiouAEIOU\s]/.test(o), `${p.slug}: article agrees: ${o}`);
    assert.ok(!/\s{2,}|\.\.|,\s*\./.test(o), `${p.slug}: no broken punctuation: ${o}`);
    if (p.city) assert.ok(o.includes(p.city), `${p.slug}: city keeps official capitalisation`);
    assert.ok(!/in (\S[^,.]*), \1\./i.test(o), `${p.slug}: place not repeated: ${o}`);
  }
});

test("(b) security is phrased as security, never as facility status", async () => {
  assert.equal(formatIntlSecurity("Medium (closed)"), "Medium security (closed regime)");
  assert.equal(formatIntlSecurity("Low (open)"), "Low security (open regime)");
  assert.equal(formatIntlSecurity("Low (semi-open)"), "Low security (semi-open regime)");
  assert.equal(formatIntlSecurity("Medium (minimum/halfway Inuksuk unit closed since 2020)"), "Medium security");
  assert.equal(formatIntlSecurity("Minimum to high security men"), "Minimum to high security men");
  assert.equal(formatIntlSecurity("Not specified"), undefined);
  for (const p of officialInternationalPrisons.filter((x) => x.status !== "closed")) {
    const s = formatIntlSecurity(p.securityDescription ?? p.securityLevel) ?? "";
    assert.ok(!/closed/i.test(s.replace(/\(closed regime\)/, "")), `${p.slug}: "closed" only as a security regime: ${s}`);
  }
  const html = await render(find("ie", "mountjoy-prison"));
  assert.ok(!html.includes("Medium (closed)"));
  assert.ok(html.includes("Medium security (closed regime)"));
});

test("(c) addresses don't repeat the city or region already in the address line", () => {
  assert.equal(formatIntlAddress({ address: "North Circular Road, Dublin 7", city: "Dublin", stateOrRegion: "Dublin" }), "North Circular Road, Dublin 7");
  assert.equal(formatIntlAddress({ address: "Great Eastern Hwy, Wooroloo WA 6558", city: "Wooroloo", stateOrRegion: "Western Australia" }), "Great Eastern Hwy, Wooroloo WA 6558");
  assert.equal(formatIntlAddress({ address: "Harristown, Castlerea, Co. Roscommon", city: "Castlerea", stateOrRegion: "Roscommon" }), "Harristown, Castlerea, Co. Roscommon");
  assert.equal(formatIntlAddress({ address: "13175 Route 8", city: "Renous", stateOrRegion: "New Brunswick", postcode: "E9E 2E1" }), "13175 Route 8, Renous, New Brunswick, E9E 2E1");
  assert.equal(formatIntlAddress({ city: "Makhado", stateOrRegion: "Gauteng" }), "Makhado, Gauteng");
  for (const p of officialInternationalPrisons) {
    const a = formatIntlAddress(p);
    const parts = a.split(",").map((s) => s.trim().toLowerCase());
    assert.equal(new Set(parts).size, parts.length, `${p.slug}: repeated segment in "${a}"`);
    if (p.address) assert.ok(a.startsWith(p.address.trim()), `${p.slug}: address line kept verbatim`);
  }
});
