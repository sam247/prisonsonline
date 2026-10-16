import test from "node:test";
import assert from "node:assert/strict";
import prisonImagesJson from "@/data/prisonImages.json";
import { getPrisonImage, normalizePrisonImageKey, prisonImageKey } from "@/lib/media/prisonImages";
import { prisons } from "@/data/prisons";

test("image keys are country-qualified <cc>/<slug>", () => {
  for (const key of Object.keys(prisonImagesJson)) assert.match(key, /^[a-z]{2}(-[a-z]+)*\/[^/]+$/, `${key} must be <cc>/<slug>`);
});

test("normalizePrisonImageKey accepts URLs, /prisons/<cc>/<slug> paths and <cc>/<slug>; rejects bare slugs", () => {
  assert.equal(normalizePrisonImageKey("https://prisonsonline.com/prisons/ca/prince-albert-correctional-centre"), "ca/prince-albert-correctional-centre");
  assert.equal(normalizePrisonImageKey("/prisons/za/prince-albert-correctional-centre/"), "za/prince-albert-correctional-centre");
  assert.equal(normalizePrisonImageKey("uk/hmp-bedford"), "uk/hmp-bedford");
  assert.equal(normalizePrisonImageKey("hmp-bedford"), null);
});

test("every image key matches a real prison in that country", () => {
  const known = new Set(prisons.map((p) => prisonImageKey(p.countrySlug, p.slug)));
  for (const key of Object.keys(prisonImagesJson)) {
    if (key === "uk/hmp-bronzefield") continue; // alias target for uk/hmp-yoi-bronzefield
    assert.ok(known.has(key), `${key} has no prison`);
  }
});

test("a slug shared across countries resolves per country, never cross-country", () => {
  const slug = "prince-albert-correctional-centre";
  assert.equal(getPrisonImage("xx", slug), undefined);
  for (const p of prisons.filter((x) => x.slug === slug)) {
    const own = (prisonImagesJson as Record<string, { imageUrl: string }>)[prisonImageKey(p.countrySlug, p.slug)];
    assert.equal(p.facilityImage?.src, own?.imageUrl, `${p.countrySlug}/${slug} uses only its own image`);
  }
});
