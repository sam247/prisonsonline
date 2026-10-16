import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { officialInternationalPrisons, prisons } from "../src/data/prisons";
import { getPrisonImage } from "../src/lib/media/prisonImages";
import type { Prison } from "../src/types/prison";
import type { RealFacilityImage } from "../src/types/media";

// The app compiles JSX with Next's automatic runtime; under tsx the component uses the classic runtime.
(globalThis as { React?: typeof React }).React = React;
// next/image skips its dev-only remote-host check under NODE_ENV=test (Next's own test mode); the real
// host allowlist (upload.wikimedia.org) is enforced by next build.
async function render(prison: Prison): Promise<string> {
  (process.env as Record<string, string>).NODE_ENV = "test";
  const { IntlPrisonProfileView } = await import("../src/components/pages/IntlPrisonProfileView");
  return renderToStaticMarkup(React.createElement(IntlPrisonProfileView, { prison }));
}

const base = officialInternationalPrisons.find((p) => p.countrySlug === "ca" && p.status === "open") as Prison;
const image: RealFacilityImage = {
  type: "real",
  src: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Example_facility.jpg",
  alt: "Exterior of the example institution",
  credit: "Example Photographer",
  author: "Example Photographer",
  licence: "CC BY-SA 4.0",
  licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Example_facility.jpg",
};

test("intl profile renders the facility image with alt text and attribution when one exists", async () => {
  const html = await render({ ...base, facilityImage: image });
  assert.match(html, /Establishment image/);
  assert.match(html, /alt="Exterior of the example institution"/);
  assert.match(html, /Example Photographer/);
  assert.match(html, /CC BY-SA 4\.0/);
  assert.match(html, /commons\.wikimedia\.org\/wiki\/File:Example_facility\.jpg/);
});

test("intl profile renders no image block when there is no image", async () => {
  const html = await render({ ...base, facilityImage: undefined });
  assert.doesNotMatch(html, /Establishment image/);
});

test("image lookup never applies a bare-slug record to a slug shared across countries", () => {
  const slug = "aaqqigiarvik-correctional-healing-facility"; // has a bare-slug record in prisonImages.json
  assert.ok(getPrisonImage(slug), "fixture slug has an image");
  assert.ok(getPrisonImage(slug, { countrySlug: "us", ambiguousSlugs: new Set() }));
  assert.equal(getPrisonImage(slug, { countrySlug: "za", ambiguousSlugs: new Set([slug]) }), undefined);
  assert.equal(getPrisonImage(slug, { countrySlug: "ca", ambiguousSlugs: new Set([slug]) }), undefined);
});

test("a live intl image record (CA Aaqqigiarvik) renders on its profile with credit", async () => {
  const p = prisons.find((x) => x.countrySlug === "ca" && x.slug === "aaqqigiarvik-correctional-healing-facility");
  assert.ok(p?.facilityImage && p.facilityImage.type === "real", "image merged onto the CA row");
  const html = await render(p);
  assert.match(html, /Establishment image/);
  assert.ok(html.includes(`alt="${p.facilityImage.alt.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`), "alt text");
  if (p.facilityImage.credit) assert.ok(html.includes(p.facilityImage.credit.replace(/&/g, "&amp;")), "credit");
});
