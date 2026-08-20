import assert from "node:assert/strict";
import fs from "node:fs";
import { buildPrisonIntentEntries, buildProbationEntries } from "@/lib/seo/sitemapEntries";
import { buildUrlSetXml } from "@/lib/seo/sitemapXml";

const base = "https://prisonsonline.com";
const probation = buildProbationEntries(base);
const intents = buildPrisonIntentEntries(base);
const indexRoute = fs.readFileSync("src/app/sitemap.xml/route.ts", "utf8");

assert.match(indexRoute, /\/sitemaps\/probation\.xml/);
assert.ok(probation.length > 300, `Expected a populated probation sitemap, found ${probation.length}`);
assert.equal(new Set(probation.map((entry) => entry.loc)).size, probation.length, "Probation sitemap contains duplicate URLs");
assert.equal(intents.length, 523, "Intent sitemap should contain 516 base URLs plus seven legal-visit URLs");

const xml = buildUrlSetXml(probation);
assert.match(xml, /^<\?xml/);
assert.match(xml, /<urlset/);
assert.match(xml, /https:\/\/prisonsonline.com\/probation\/uk\//);
assert.doesNotMatch(xml, /<lastmod>/, "Probation URLs must not claim a generated request-time modification date");

console.log(JSON.stringify({ probationUrls: probation.length, intentUrls: intents.length, indexIncludesProbation: true }, null, 2));
