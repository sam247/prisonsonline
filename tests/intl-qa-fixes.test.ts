import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { officialInternationalPrisons, prisons } from "../src/data/prisons";
import { countriesData } from "../src/data/countries";
import type { Prison } from "../src/types/prison";

(globalThis as { React?: typeof React }).React = React;
async function render(prison: Prison): Promise<string> {
  (process.env as Record<string, string>).NODE_ENV = "test";
  const { IntlPrisonProfileView } = await import("../src/components/pages/IntlPrisonProfileView");
  return renderToStaticMarkup(React.createElement(IntlPrisonProfileView, { prison }));
}
const INTL = ["ca", "au", "nz", "ie", "za"];

test("homepage country cards include every official-source country, counted from data", async () => {
  const fs = await import("node:fs");
  const src = fs.readFileSync("src/app/page.tsx", "utf8");
  const list = /HOME_COUNTRY_SLUGS = \[([^\]]*)\]/.exec(src)?.[1] ?? "";
  for (const cc of INTL) {
    assert.ok(list.includes(`"${cc}"`), `${cc} card on the homepage`);
    const open = prisons.filter((p) => p.countrySlug === cc && p.status !== "closed").length;
    assert.ok(open > 0, `${cc} has open facilities`);
    assert.equal(countriesData.find((c) => c.slug === cc)?.prisonCount, open, `${cc} card count derived from data`);
  }
});

test("intl listing pages carry no import/dataset wording", async () => {
  const { PrisonListingTemplate } = await import("../src/components/programmatic/PrisonListingTemplate");
  (process.env as Record<string, string>).NODE_ENV = "test";
  for (const cc of INTL) {
    const rows = officialInternationalPrisons.filter((p) => p.countrySlug === cc);
    const region = rows.filter((p) => p.regionSlug === rows[0].regionSlug);
    const html = renderToStaticMarkup(
      React.createElement(PrisonListingTemplate, { breadcrumbs: [], title: "t", prisons: region, stats: [{ label: "Establishments", value: region.length }] }),
    );
    assert.ok(!/\bimport(ed)?\b|dataset/i.test(html), `${cc}: no import/dataset wording`);
    assert.match(html, /each checked against an official source/);
  }
});

test("profile map appears only with official facility coordinates; otherwise no map at all", async () => {
  const withCoords = officialInternationalPrisons.filter((p) => p.coordinateEvidence?.precision === "facility");
  const without = officialInternationalPrisons.filter((p) => !p.coordinateEvidence);
  assert.ok(withCoords.length > 0 && without.length > 0);
  for (const p of [withCoords[0], withCoords[withCoords.length - 1]]) {
    const html = await render(p);
    assert.ok(html.includes("Map preview"), `${p.slug}: map shown`);
    assert.ok(html.includes(p.latitude.toFixed(4)), `${p.slug}: official coordinates`);
  }
  for (const cc of INTL) {
    const p = without.find((x) => x.countrySlug === cc);
    if (!p) continue;
    const html = await render(p);
    assert.ok(!html.includes("Map preview") && !html.includes('id="location-heading"'), `${cc}/${p.slug}: no map, no empty map section`);
  }
});

test("capacity label is hidden when there is no capacity", async () => {
  const p = officialInternationalPrisons.find((x) => !x.capacity) as Prison;
  for (const capacity of [0, undefined as unknown as number, Number.NaN]) {
    const html = await render({ ...p, capacity });
    assert.ok(!/Capacity/i.test(html.replace(/<a [^>]*>[\s\S]*?<\/a>/g, "")), `no capacity label for ${capacity}`);
  }
  const withCap = officialInternationalPrisons.find((x) => x.capacity > 0) as Prison;
  assert.match(await render(withCap), /Capacity \(official\)/);
});
