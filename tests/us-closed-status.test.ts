import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { prisons } from "../src/data/prisons";
import { usPrisonsGenerated } from "../src/data/generated/usPrisons.generated";
import { AD_POLICY } from "../src/lib/ads/layoutPolicy";
import { US_CLOSURE_STATUS, applyClosureStatus } from "../scripts/lib/us-closure-status.mjs";
import { formatPrisonProfileMetaDescription } from "../src/lib/seo/prisonProfileMeta";
import { buildPrisonPageTitle } from "../src/lib/seo/prisonTitle";
import type { Prison } from "../src/types/prison";

(globalThis as { React?: typeof React }).React = React;
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
const find = (cc: string, slug: string): Prison => {
  const p = prisons.find((x) => x.countrySlug === cc && x.slug === slug);
  assert.ok(p, `${cc}/${slug}`);
  return p;
};
const BANNER = 'data-block="closure-status"';
const CONTACT_BLOCK = 'data-block="contact-visiting"';
const HIDDEN_SECTIONS = [
  "overview-heading",
  "visiting-heading",
  "planning-visit-heading",
  "contact-heading",
  "life-heading",
  "prison-type-heading",
  "visiting-guides-heading",
];
const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("closure map: only the two verified facilities, conservative wording, no invented status values", () => {
  assert.deepEqual(Object.keys(US_CLOSURE_STATUS).sort(), ["dublin-fci", "terminal-island-fci"]);
  for (const [slug, e] of Object.entries(US_CLOSURE_STATUS) as [string, Record<string, string>][]) {
    const keys = slug === "terminal-island-fci" ? ["status", "statusLabel", "statusNote", "statusSource"] : ["status", "statusNote", "statusSource"];
    assert.deepEqual(Object.keys(e).sort(), keys, slug);
    assert.equal(e.status, "closed", slug);
    assert.match(e.statusSource, /^https:\/\//, slug);
    assert.doesNotMatch(e.statusNote, /permanently closed/i, slug);
  }
  const dublin = US_CLOSURE_STATUS["dublin-fci"];
  assert.match(dublin.statusNote, /proposing permanent deactivation/);
  assert.match(dublin.statusNote, /April 2024/);
  assert.match(dublin.statusNote, /December 2024/);
  assert.equal(
    dublin.statusSource,
    "https://dublin.ca.gov/DocumentCenter/View/40932/Notification-Letter---FCI-Dublin-120425",
  );
  const ti = US_CLOSURE_STATUS["terminal-island-fci"];
  assert.match(ti.statusNote, /^Operations ended; permanent closure is proposed\./);
  assert.match(ti.statusNote, /McOsker/);
  assert.match(ti.statusNote, /20 August 2026/);
  assert.match(ti.statusNote, /not a BOP document/);
  assert.match(ti.statusSource, /^https:\/\/apnews\.com\/article\/bureau-of-prisons-los-angeles-terminal-island-/);
});

test("applyClosureStatus merges only status fields for listed slugs and leaves others untouched", () => {
  const rec = { slug: "dublin-fci", name: "Dublin FCI", capacity: 0 };
  const out = applyClosureStatus(rec) as Record<string, unknown>;
  assert.equal(out.status, "closed");
  assert.equal(out.statusSource, US_CLOSURE_STATUS["dublin-fci"].statusSource);
  assert.equal(out.statusNote, US_CLOSURE_STATUS["dublin-fci"].statusNote);
  assert.deepEqual(
    Object.keys(out).sort(),
    ["capacity", "name", "slug", "status", "statusNote", "statusSource"],
  );
  const other = { slug: "atwater-usp", name: "Atwater USP" };
  assert.equal(applyClosureStatus(other), other);
  assert.equal("status" in applyClosureStatus(other), false);
});

test("the generated US file carries the status from the build-script map (regeneration keeps it)", () => {
  const withStatus = usPrisonsGenerated.filter((p) => p.status !== undefined);
  assert.deepEqual(withStatus.map((p) => p.slug).sort(), ["dublin-fci", "terminal-island-fci"]);
  for (const p of withStatus) {
    const e = US_CLOSURE_STATUS[p.slug as keyof typeof US_CLOSURE_STATUS];
    assert.equal(p.status, e.status);
    assert.equal(p.statusSource, e.statusSource);
    assert.equal(p.statusNote, e.statusNote);
    assert.equal(p.statusLabel, (e as { statusLabel?: string }).statusLabel);
  }
});

test("legacy fci-terminal-island carries the same wording as terminal-island-fci", () => {
  const legacy = find("united-states", "fci-terminal-island");
  const e = US_CLOSURE_STATUS["terminal-island-fci"];
  assert.equal(legacy.status, "closed");
  assert.equal(legacy.statusSource, e.statusSource);
  assert.equal(legacy.statusNote, e.statusNote);
  assert.equal(legacy.statusLabel, e.statusLabel);
});

for (const [cc, slug] of [
  ["us", "dublin-fci"],
  ["us", "terminal-island-fci"],
  ["united-states", "fci-terminal-island"],
] as const) {
  test(`${cc}/${slug}: banner shown, contact/visit/capacity/security blocks hidden`, async () => {
    const p = find(cc, slug);
    const html = await renderProfile(p);
    const t = text(html);
    assert.ok(html.includes(BANNER));
    assert.ok(t.includes("Facility status: closed"));
    assert.ok(t.includes(p.statusNote!.trim()), "statusNote rendered");
    assert.ok(html.includes(`href="${p.statusSource}"`), "source link rendered");
    assert.ok(!html.includes(CONTACT_BLOCK));
    for (const id of HIDDEN_SECTIONS) assert.ok(!html.includes(`aria-labelledby="${id}"`), id);
    assert.ok(!t.includes("Contacting and visiting"));
    assert.ok(!t.includes("How to visit"));
    assert.ok(!t.includes("Planning your visit"));
    assert.ok(!t.includes("Security / category"));
    assert.ok(!/\bCapacity\b/.test(t.split("Related prisons")[0]), "capacity row hidden");
    const own = t.split("Related prisons")[0];
    assert.ok(!/low-security|1,030|weekends? and federal holidays|weekend visits/i.test(own), "no stale operating copy");
    assert.doesNotMatch(own, /permanently closed/i);
  });
}

test("Terminal Island banner states it rests on a local official, not a BOP document", async () => {
  const t = text(await renderProfile(find("us", "terminal-island-fci")));
  assert.match(t, /Operations ended; permanent closure is proposed\./);
  assert.match(t, /Tim McOsker \(20 August 2026\), relaying the Bureau of Prisons; it is not a BOP document/);
});

test("Dublin banner says BOP is proposing permanent deactivation", async () => {
  const t = text(await renderProfile(find("us", "dublin-fci")));
  assert.match(t, /proposing permanent deactivation/);
});

test("open US, UK, historic legacy and international profiles are unaffected", async () => {
  const open = await renderProfile(find("us", "atwater-usp"));
  assert.ok(!open.includes(BANNER));
  assert.ok(open.includes(CONTACT_BLOCK));
  for (const id of ["overview-heading", "visiting-heading", "planning-visit-heading", "contact-heading"]) {
    assert.ok(open.includes(`aria-labelledby="${id}"`), id);
  }
  assert.ok(text(open).includes("Security / category"));

  const uk = prisons.filter((p) => p.countrySlug === "uk");
  assert.ok(uk.length > 100);
  for (const p of [uk[0], uk[50], uk[100]]) {
    const html = await renderProfile(p);
    assert.ok(!html.includes(BANNER), p.slug);
    assert.ok(html.includes(CONTACT_BLOCK), p.slug);
    assert.ok(html.includes('aria-labelledby="visiting-heading"'), p.slug);
  }

  const alcatraz = find("united-states", "alcatraz");
  assert.equal(alcatraz.status, "historic");
  const alc = await renderProfile(alcatraz);
  assert.ok(!alc.includes(BANNER));
  assert.ok(alc.includes('aria-labelledby="visiting-heading"'));

  const intl = prisons.find((p) => p.dataProvenance === "official_source");
  assert.ok(intl);
  const intlHtml = await renderIntl(intl);
  assert.ok(!intlHtml.includes(BANNER));
});

test("applyClosureStatus carries statusLabel only when the entry has one", () => {
  const ti = applyClosureStatus({ slug: "terminal-island-fci" }) as Record<string, unknown>;
  assert.equal(ti.statusLabel, "Operations ended");
  const dublin = applyClosureStatus({ slug: "dublin-fci" }) as Record<string, unknown>;
  assert.equal("statusLabel" in dublin, false);
});

test("meta description prefix: Dublin keeps 'Closed:', Terminal Island rows use 'Operations ended:'", () => {
  const dublin = formatPrisonProfileMetaDescription(find("us", "dublin-fci"));
  assert.ok(dublin.startsWith("Closed: Dublin FCI"), dublin);
  for (const [cc, slug] of [["us", "terminal-island-fci"], ["united-states", "fci-terminal-island"]] as const) {
    const d = formatPrisonProfileMetaDescription(find(cc, slug));
    assert.ok(d.startsWith("Operations ended: "), d);
    assert.ok(!/^Closed:/.test(d) && !/permanently closed/i.test(d), d);
  }
  // open and historic rows are unchanged
  assert.ok(!/^(Closed|Operations ended|Historic):/.test(formatPrisonProfileMetaDescription(find("us", "atwater-usp"))));
  assert.ok(formatPrisonProfileMetaDescription(find("united-states", "alcatraz")).startsWith("Historic: "));
});

test("page titles and JSON-LD for the three closed rows carry no 'Closed' wording and match the meta description", async () => {
  for (const [cc, slug] of [["us", "dublin-fci"], ["us", "terminal-island-fci"], ["united-states", "fci-terminal-island"]] as const) {
    const p = find(cc, slug);
    assert.ok(!/closed/i.test(buildPrisonPageTitle(p)), buildPrisonPageTitle(p));
    const html = await renderProfile(p);
    const ld = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? "";
    assert.ok(ld.includes(JSON.stringify(formatPrisonProfileMetaDescription(p)).slice(1, -1)), `${slug}: JSON-LD description matches meta`);
  }
});
