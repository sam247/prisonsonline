import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import prisonImagesJson from "@/data/prisonImages.json";
import { getPrisonImage, getPrisonImageRecord, prisonImageKey } from "@/lib/media/prisonImages";
import { crossCountrySlugs, prisons } from "@/data/prisons";
import { getPrisonLastModifiedDate, getPrisonSitemapLastModifiedDate } from "@/lib/seo/prisonLastModified";
// @ts-expect-error plain .mjs helper shared with scripts/build-prison-images.mjs
import { parsePrisonSlugCell, prisonImageKeyForCell, readCrossCountrySlugs } from "../scripts/lib/prison-image-keys.mjs";

const SHARED = "prince-albert-correctional-centre"; // frozen slug used by both CA and ZA
const images = prisonImagesJson as Record<string, { imageUrl: string; updatedAt?: string }>;

test("prince-albert-correctional-centre is a cross-country slug (CA and ZA)", () => {
  const ccs = prisons.filter((p) => p.slug === SHARED).map((p) => p.countrySlug).sort();
  assert.deepEqual(ccs, ["ca", "za"]);
  assert.ok(crossCountrySlugs.has(SHARED));
});

test("build script derives the same cross-country slug set as the runtime", () => {
  const fromFiles = readCrossCountrySlugs(path.resolve(__dirname, "..")) as Set<string>;
  assert.deepEqual([...fromFiles].sort(), [...crossCountrySlugs].sort());
});

test("sheet cells map to bare keys, or <cc>/<slug> only for cross-country slugs", () => {
  assert.equal(prisonImageKeyForCell("/prisons/uk/hmp-bedford", crossCountrySlugs), "hmp-bedford");
  assert.equal(prisonImageKeyForCell("https://prisonsonline.com/prisons/uk/hmp-bedford/", crossCountrySlugs), "hmp-bedford");
  assert.equal(prisonImageKeyForCell("hmp-bedford", crossCountrySlugs), "hmp-bedford");
  assert.equal(prisonImageKeyForCell(`/prisons/ca/${SHARED}`, crossCountrySlugs), `ca/${SHARED}`);
  assert.equal(prisonImageKeyForCell(`https://prisonsonline.com/prisons/za/${SHARED}`, crossCountrySlugs), `za/${SHARED}`);
  assert.equal(prisonImageKeyForCell(SHARED, crossCountrySlugs), null, "a shared slug without a country cannot be keyed");
  assert.deepEqual(parsePrisonSlugCell("/prisons/za/x/"), { countrySlug: "za", slug: "x" });
});

test("every image key matches a real prison (bare slug, alias target, or <cc>/<slug>)", () => {
  const bare = new Set(prisons.map((p) => p.slug));
  const scoped = new Set(prisons.map((p) => prisonImageKey(p.countrySlug, p.slug)));
  for (const key of Object.keys(images)) {
    if (key === "hmp-bronzefield") continue; // alias target for hmp-yoi-bronzefield
    if (key.includes("/")) assert.ok(scoped.has(key) && crossCountrySlugs.has(key.split("/")[1]), `${key}: scoped key must be a cross-country prison`);
    else {
      assert.ok(bare.has(key), `${key} has no prison`);
      assert.ok(!crossCountrySlugs.has(key), `${key} is shared across countries and must use <cc>/<slug>`);
    }
  }
});

test("a slug shared across countries resolves per country, never cross-country", () => {
  for (const p of prisons.filter((x) => x.slug === SHARED)) {
    const own = images[prisonImageKey(p.countrySlug, p.slug)];
    assert.equal(p.facilityImage?.src, own?.imageUrl, `${p.countrySlug}/${SHARED} uses only its own image`);
  }
  assert.equal(getPrisonImage(SHARED, { countrySlug: "xx", ambiguousSlugs: crossCountrySlugs }), undefined);
});

test("scoped record wins for its country only; bare record never leaks to a shared slug", () => {
  const slug = "aaqqigiarvik-correctional-healing-facility"; // has a bare-slug record
  assert.ok(getPrisonImageRecord(slug));
  assert.equal(getPrisonImageRecord(slug, { countrySlug: "za", ambiguousSlugs: new Set([slug]) }), undefined);
});

test("lastModified and sitemap dates use the same per-country record as facilityImage", () => {
  const fb = new Date("2000-01-01T00:00:00Z");
  for (const p of prisons.filter((x) => x.slug === SHARED)) {
    const rec = getPrisonImageRecord(p.slug, { countrySlug: p.countrySlug, ambiguousSlugs: crossCountrySlugs });
    assert.equal(rec, images[prisonImageKey(p.countrySlug, p.slug)]);
    if (!rec?.updatedAt) {
      assert.ok(getPrisonLastModifiedDate(p, fb) instanceof Date);
      void getPrisonSitemapLastModifiedDate(p);
    }
  }
});
