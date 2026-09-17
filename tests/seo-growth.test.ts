import assert from "node:assert/strict";
import test from "node:test";
import { getGuide } from "@/data/guides";
import { guideSlugsForIntent } from "@/lib/seo/prisonIntentCopy";
import { buildGuideEntries } from "@/lib/seo/sitemapEntries";
import { buildSeoTitle, MAX_RENDERED_TITLE_LENGTH } from "@/lib/seo/title";
import { buildPrisonPageTitle } from "@/lib/seo/prisonTitle";
import { getPrisonByCountryAndSlug } from "@/data/prisons";
import { intentsForPrison } from "@/lib/seo/intentRollout";
import { facilityVerificationRecords } from "@/data/facilitySources";
import { prisonProfileJsonLdGraph } from "@/lib/seo/prisonJsonLd";
import { prisonIntentJsonLdGraph } from "@/lib/seo/prisonIntentJsonLd";
import { buildPrisonIntentEntries, buildProbationEntries } from "@/lib/seo/sitemapEntries";
import { buildUrlSetXml } from "@/lib/seo/sitemapXml";
import { buildIntentMetaDescription, buildIntentPageTitle } from "@/lib/seo/prisonIntentCopy";

test("complete titles stay within the rendered budget", () => {
  const titles = [
    buildSeoTitle({ title: "HMP Berwyn | Category C Prison" }),
    buildSeoTitle({ title: "HMP Berwyn Address, Postcode & Phone" }),
    buildSeoTitle({ title: "A deliberately very long entity title that cannot fit beside the site brand" }),
  ];
  assert.ok(titles.every((title) => title.length <= MAX_RENDERED_TITLE_LENGTH));
  assert.equal(titles[0], "HMP Berwyn | Category C Prison | Prisons Online");
  assert.ok(!titles[2].endsWith("| Prisons Online"));
});
test("profile title owns entity/category rather than contact intent", () => {
  const prison = getPrisonByCountryAndSlug("uk", "hmp-berwyn");
  assert.ok(prison);
  const title = buildPrisonPageTitle(prison);
  assert.match(title, /HMP Berwyn/);
  assert.doesNotMatch(title, /address|contact|visit/i);
});

test("Wandsworth contact-details snippet test uses concrete postcode and phone", () => {
  const wandsworth = getPrisonByCountryAndSlug("uk", "hmp-wandsworth");
  const ranby = getPrisonByCountryAndSlug("uk", "hmp-ranby");
  assert.ok(wandsworth && ranby);
  assert.equal(buildIntentPageTitle(wandsworth, "contact-details"), "HMP Wandsworth Address & Phone | SW18 3HU");
  assert.match(buildIntentMetaDescription(wandsworth, "contact-details"), /SW18 3HU/);
  assert.match(buildIntentMetaDescription(wandsworth, "contact-details"), /\(020\) 8588 4000/);
  assert.equal(buildIntentPageTitle(ranby, "contact-details"), "HMP Ranby Address, Postcode & Phone");
  assert.doesNotMatch(buildIntentMetaDescription(ranby, "contact-details"), /DN22 8EU/);
});

test("legal visits are independently enabled for seven sourced prisons", () => {
  const legal = facilityVerificationRecords.filter((record) => record.legalVisits);
  assert.equal(legal.length, 7);
  for (const record of legal) {
    const prison = getPrisonByCountryAndSlug(record.countrySlug, record.prisonSlug);
    assert.ok(prison);
    assert.ok(intentsForPrison(prison).includes("legal-visits"));
  }
  const oakwood = getPrisonByCountryAndSlug("uk", "hmp-oakwood");
  assert.ok(oakwood);
  assert.ok(!intentsForPrison(oakwood).includes("legal-visits"));
});

test("verification records contain real sources and valid field mappings", () => {
  assert.equal(facilityVerificationRecords.length, 30);
  for (const record of facilityVerificationRecords) {
    const ids = new Set(record.sources.map((source) => source.id));
    assert.ok(record.sources.every((source) => /^https:\/\//.test(source.url) && /^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt)));
    for (const sourceIds of Object.values(record.fieldSources)) {
      assert.ok(sourceIds?.every((id) => ids.has(id)));
    }
  }
});

test("facility and intent schema share a stable entity id", () => {
  const prison = getPrisonByCountryAndSlug("uk", "hmp-berwyn");
  assert.ok(prison);
  const path = "/prisons/uk/hmp-berwyn";
  const profile = prisonProfileJsonLdGraph({ prison, path, description: "Facility information" });
  const intent = prisonIntentJsonLdGraph({ prison, intent: "contact-details", intentPath: `${path}/contact-details`, description: "Contact details" });
  const building = profile["@graph"][0] as Record<string, unknown>;
  const webPage = intent["@graph"][0] as Record<string, unknown>;
  assert.equal((webPage.about as Record<string, unknown>)["@id"], building["@id"]);
});

test("sitemaps contain the 516 base URLs plus seven legal pages without fake freshness", () => {
  assert.equal(buildPrisonIntentEntries("https://prisonsonline.com").length, 523);
  const probation = buildProbationEntries("https://prisonsonline.com");
  assert.ok(probation.length > 300);
  const xml = buildUrlSetXml(probation);
  assert.match(xml, /<loc>https:\/\/prisonsonline.com\/probation<\/loc>/);
  assert.doesNotMatch(xml, /<lastmod>/);
});


test("address how-to links into contact-details winners without changing intent guide wiring", () => {
  const guide = getGuide("how-to-find-a-uk-prison-address");
  assert.ok(guide);
  assert.match(guide.content, /\/prisons\/uk\/category\/category-c/);
  assert.match(guide.content, /\/prisons\/uk\/category\/category-b/);
  assert.match(guide.content, /\/prisons\/uk\/hmp-wandsworth\/contact-details/);
  assert.match(guide.content, /\/prisons\/uk\/hmp-thameside\/contact-details/);
  assert.match(guide.content, /\/prisons\/uk\/hmp-bullingdon\/contact-details/);
  assert.match(guide.content, /\/prisons\/uk\/collection\/private-prisons/);
  assert.match(guide.content, /gov\.uk\/government\/collections\/prisons-in-england-and-wales/);
  assert.deepEqual(guideSlugsForIntent("contact-details"), ["rights-of-prisoners", "life-inside-prison"]);
  const sitemap = buildGuideEntries("https://prisonsonline.com");
  assert.ok(sitemap.some((entry) => entry.loc.endsWith("/guides/how-to-find-a-uk-prison-address")));
});
