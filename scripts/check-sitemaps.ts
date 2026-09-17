import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildPrisonIntentEntries,
  buildProbationEntries,
  buildCourtsEntries,
  buildPrisonProfileEntries,
  buildRegionEntries,
  buildGuideEntries,
  buildCategoriesEntries,
} from "@/lib/seo/sitemapEntries";
import { buildUrlSetXml } from "@/lib/seo/sitemapXml";

const base = "https://prisonsonline.com";
const probation = buildProbationEntries(base);
const intents = buildPrisonIntentEntries(base);
const prisons = buildPrisonProfileEntries(base);
const regions = buildRegionEntries(base);
const guides = buildGuideEntries(base);
const categories = buildCategoriesEntries(base);
const courts = buildCourtsEntries(base);
const indexRoute = fs.readFileSync("src/app/sitemap.xml/route.ts", "utf8");

assert.match(indexRoute, /\/sitemaps\/probation\.xml/);
assert.match(indexRoute, /\/sitemaps\/courts\.xml/);
assert.ok(probation.length > 300, `Expected a populated probation sitemap, found ${probation.length}`);
assert.equal(new Set(probation.map((entry) => entry.loc)).size, probation.length, "Probation sitemap contains duplicate URLs");
assert.equal(intents.length, 523, "Intent sitemap should contain 516 base URLs plus seven legal-visit URLs");
assert.equal(prisons.length, 274, "Prison profile sitemap count regression");
assert.ok(
  prisons.some((e) => e.loc.endsWith("/prisons/us/florence-admax-usp")),
  "Canonical ADX Florence destination missing from prison sitemap",
);
assert.ok(
  !prisons.some((e) => e.loc.includes("/prisons/united-states/adx-florence")),
  "Legacy ADX Florence URL must not appear in prison sitemap",
);
assert.equal(regions.length, 70, "Region sitemap count regression");
assert.ok(
  !regions.some((e) => e.loc.includes("/prisons/united-states/adx-florence")),
  "Legacy ADX path must not appear in region sitemap",
);
assert.equal(guides.length, 13, "Guide sitemap count regression");
assert.equal(categories.length, 137, "Categories sitemap count regression");
assert.equal(probation.length, 328, "Probation sitemap count regression");
assert.ok(courts.length > 100, `Expected populated courts sitemap, found ${courts.length}`);
assert.equal(new Set(courts.map((e) => e.loc)).size, courts.length, "Courts sitemap contains duplicate URLs");
assert.ok(courts.some((e) => e.loc.endsWith("/courts")));
assert.ok(courts.some((e) => e.loc.includes("/courts/crown-courts")));

const xml = buildUrlSetXml(probation);
assert.match(xml, /^<\?xml/);
assert.match(xml, /<urlset/);
assert.match(xml, /https:\/\/prisonsonline.com\/probation\/uk\//);
assert.doesNotMatch(xml, /<lastmod>/, "Probation URLs must not claim a generated request-time modification date");

console.log(
  JSON.stringify(
    {
      prisons: prisons.length,
      intents: intents.length,
      probation: probation.length,
      regions: regions.length,
      guides: guides.length,
      categories: categories.length,
      courts: courts.length,
      indexIncludesCourts: true,
    },
    null,
    2,
  ),
);
