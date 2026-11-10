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
assert.equal(intents.length, 519, "Intent sitemap should contain 512 base URLs plus seven legal-visit URLs");
// 272 UK/US profiles - 3 closed US facilities (dublin-fci, terminal-island-fci, fci-terminal-island) + 137 open Canada + 95 open Australia + 18 New Zealand + 13 Ireland + 215 South Africa profiles (closed facilities are excluded).
assert.equal(prisons.length, 747, "Prison profile sitemap count regression");
assert.equal(prisons.filter((e) => e.loc.includes("/prisons/ca/")).length, 137, "Canada profile sitemap count (open facilities only)");
assert.ok(!prisons.some((e) => e.loc.endsWith("/prisons/ca/toronto-jail")), "Closed Canada facilities must not appear in the prison sitemap");
assert.equal(prisons.filter((e) => e.loc.includes("/prisons/au/")).length, 95, "Australia profile sitemap count (open facilities only)");
for (const slug of ["dawn-de-loas-correctional-centre", "oberon-correctional-centre"]) assert.ok(!prisons.some((e) => e.loc.endsWith(`/prisons/au/${slug}`)), `Temporarily closed ${slug} must not appear in the prison sitemap`);
assert.equal(prisons.filter((e) => e.loc.includes("/prisons/nz/")).length, 18, "New Zealand profile sitemap count");
assert.equal(prisons.filter((e) => e.loc.includes("/prisons/ie/")).length, 13, "Ireland profile sitemap count");
assert.equal(prisons.filter((e) => e.loc.includes("/prisons/za/")).length, 215, "South Africa profile sitemap count");
assert.ok(
  prisons.some((e) => e.loc.endsWith("/prisons/us/florence-admax-usp")),
  "Canonical ADX Florence destination missing from prison sitemap",
);
assert.ok(
  !prisons.some((e) => e.loc.includes("/prisons/united-states/adx-florence")),
  "Legacy ADX Florence URL must not appear in prison sitemap",
);
assert.ok(
  !prisons.some((e) => e.loc.includes("/prisons/united-states/usp-leavenworth")),
  "Legacy USP Leavenworth URL must not appear in prison sitemap (301 to /prisons/us/leavenworth-fci)",
);
assert.ok(
  prisons.some((e) => e.loc.endsWith("/prisons/us/leavenworth-fci")),
  "Canonical Leavenworth FCI destination missing from prison sitemap",
);
// 68 previously; /prisons/canada hub replaced by /prisons/ca, plus 13 Canada province/territory pages.
// AU: /prisons/australia hub replaced by /prisons/au, plus 8 state/territory pages (81 - 1 + 9).
// NZ: new /prisons/nz hub plus 9 region pages (89 + 10).
// IE: new /prisons/ie hub plus 7 county pages (99 + 8).
// ZA: new /prisons/za hub plus 6 DCS region pages (107 + 7).
assert.equal(regions.length, 114, "Region sitemap count regression");
assert.ok(regions.some((e) => e.loc.endsWith("/prisons/ca")), "Canada hub missing from region sitemap");
assert.ok(!regions.some((e) => e.loc.endsWith("/prisons/canada")), "Legacy /prisons/canada must not appear (301 to /prisons/ca)");
assert.ok(regions.some((e) => e.loc.endsWith("/prisons/au")), "Australia hub missing from region sitemap");
assert.ok(regions.some((e) => e.loc.endsWith("/prisons/nz")), "New Zealand hub missing from region sitemap");
assert.ok(regions.some((e) => e.loc.endsWith("/prisons/ie")), "Ireland hub missing from region sitemap");
assert.ok(regions.some((e) => e.loc.endsWith("/prisons/za")), "South Africa hub missing from region sitemap");
for (const province of ["limpopo", "mpumalanga", "north-west", "northern-cape", "free-state"]) assert.ok(!regions.some((e) => e.loc.endsWith(`/prisons/za/${province}`)), `Inferred province ${province} must not be a ZA region route`);
assert.ok(!regions.some((e) => e.loc.endsWith("/prisons/australia")), "Legacy /prisons/australia must not appear (301 to /prisons/au)");
assert.ok(
  !regions.some((e) => e.loc.includes("/prisons/united-states/adx-florence")),
  "Legacy ADX path must not appear in region sitemap",
);
assert.equal(guides.length, 15, "Guide sitemap count regression");
assert.equal(categories.length, 141, "Categories sitemap count regression");
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
assert.ok(
  regions.some((e) => e.loc.endsWith("/prisons/us/puerto-rico")) && !regions.some((e) => e.loc.endsWith("/prisons/us/rq")),
  "Puerto Rico region must be /prisons/us/puerto-rico, not the legacy RQ code",
);
