import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getPrisonByCountryAndSlug, prisons } from "@/data/prisons";
import { ProfileMapPreview } from "@/components/facility/ProfileMapPreview";
import { hasPublishableCoordinates } from "@/lib/prisons/coordinates";
import { prisonProfileJsonLdGraph } from "@/lib/seo/prisonJsonLd";

(globalThis as { React?: typeof React }).React = React;

const uk = prisons.filter((p) => p.countrySlug === "uk");

test("every UK profile with a matching postcode coordinate publishes geo and a map", () => {
  assert.equal(uk.length, 122);
  const withGeo = uk.filter((p) => hasPublishableCoordinates(p.latitude, p.longitude));
  assert.equal(withGeo.length, 122);
  for (const prison of uk) {
    assert.ok(prison.latitude >= 49 && prison.latitude <= 61, prison.slug);
    assert.ok(prison.longitude >= -9 && prison.longitude <= 3, prison.slug);
    const graph = prisonProfileJsonLdGraph({
      prison,
      path: `/prisons/uk/${prison.slug}`,
      description: "Facility information",
    });
    const building = graph["@graph"][0] as { geo?: { latitude: number; longitude: number } };
    assert.equal(building.geo?.latitude, prison.latitude, prison.slug);
    assert.equal(building.geo?.longitude, prison.longitude, prison.slug);
    const html = renderToStaticMarkup(
      React.createElement(ProfileMapPreview, { latitude: prison.latitude, longitude: prison.longitude }),
    );
    assert.match(html, /Map preview/);
    assert.match(html, new RegExp(prison.latitude.toFixed(4).replace(".", "\\.")));
  }
});

test("HMP Wandsworth and HMP Preston render a map from their postcode coordinates", () => {
  for (const [slug, latitude, longitude] of [
    ["hmp-wandsworth", 51.449138, -0.174641],
    ["hmp-preston", 53.761477, -2.689363],
  ] as const) {
    const prison = getPrisonByCountryAndSlug("uk", slug);
    assert.ok(prison);
    assert.equal(prison.latitude, latitude);
    assert.equal(prison.longitude, longitude);
    assert.equal(prison.sourceRaw?.latitude, null);
    assert.equal(prison.sourceRaw?.longitude, null);
    const preview = renderToStaticMarkup(
      React.createElement(ProfileMapPreview, { latitude: prison.latitude, longitude: prison.longitude }),
    );
    assert.match(preview, /Map preview — /);
    assert.match(preview, new RegExp(latitude.toFixed(4).replace(".", "\\.")));
  }
});

test("missing and 0,0 coordinates emit neither geo nor a map preview", () => {
  const base = getPrisonByCountryAndSlug("uk", "hmp-preston");
  assert.ok(base);
  for (const [latitude, longitude] of [
    [0, 0],
    [Number.NaN, 1],
    [51.5, Number.NaN],
  ] as const) {
    const prison = { ...base, latitude, longitude };
    assert.equal(hasPublishableCoordinates(prison.latitude, prison.longitude), false);
    const graph = prisonProfileJsonLdGraph({
      prison,
      path: "/prisons/uk/hmp-preston",
      description: "Facility information",
    });
    const building = graph["@graph"][0] as { geo?: unknown };
    assert.equal(building.geo, undefined);
  }
  assert.equal(hasPublishableCoordinates(undefined, undefined), false);
  assert.equal(hasPublishableCoordinates(null, null), false);
});
