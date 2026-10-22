import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { prisons } from "@/data/prisons";
import { formatPrisonMetaDescription } from "@/components/pages/PrisonProfileView";
import { formatIntlPrisonMetaDescription } from "@/components/pages/IntlPrisonProfileView";
import { formatPrisonProfileMetaDescription, prisonProfileOnPageFacts } from "@/lib/seo/prisonProfileMeta";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";

function bySlug(slug: string) {
  const prison = prisons.find((row) => row.slug === slug);
  assert.ok(prison, slug);
  return prison;
}

test("profile meta descriptions use recorded facts and name what the page shows", () => {
  const descriptions = prisons.map((prison) => formatPrisonProfileMetaDescription(prison));
  assert.equal(new Set(descriptions).size, descriptions.length);
  for (let i = 0; i < prisons.length; i++) {
    const prison = prisons[i];
    const description = descriptions[i];
    const facts = prisonProfileOnPageFacts(prison);
    assert.ok(description.length >= 150 && description.length <= 160, `${prison.slug} ${description.length} ${description}`);
    assert.equal(/\baddress\b/i.test(description), facts.address, `${prison.slug} address ${description}`);
    assert.equal(/\bvisiting\b/i.test(description), facts.visiting, `${prison.slug} visiting ${description}`);
    assert.equal(/\bcontact\b/i.test(description), facts.contact, `${prison.slug} contact ${description}`);
    assert.doesNotMatch(description, /\b(phone|phones|telephone|telephones|postcode|postcodes)\b/i, prison.slug);
    if (prison.postcode) assert.equal(description.includes(prison.postcode), false, prison.slug);
    if (prison.phone) assert.equal(description.includes(prison.phone), false, prison.slug);
    if (prison.address && prison.address.trim().length >= 8) {
      assert.equal(description.includes(prison.address.trim()), false, prison.slug);
    }
    const rawRegion = geographicRegion(prison).replace(/\s+/g, " ").trim();
    const letters = rawRegion.replace(/[^A-Za-z]/g, "");
    if (letters && letters === letters.toUpperCase()) {
      assert.equal(description.includes(rawRegion), false, `${prison.slug} ${rawRegion}`);
    }
    assert.ok(description.endsWith("."), prison.slug);
  }
});

test("representative profile metas lead with type, town and what the page shows", () => {
  const preston = formatPrisonProfileMetaDescription(bySlug("hmp-preston"));
  assert.match(preston, /HMP Preston is a Category B local prison for adult men in Preston/);
  assert.match(preston, /Public Sector Prison/);
  assert.match(preston, /Address, visiting and contact details are on this page/);
  assert.doesNotMatch(preston, /PR1 5AB|01772/);

  const elmley = formatPrisonProfileMetaDescription(bySlug("hmp-elmley"));
  assert.match(elmley, /local prison for adult men in Sheerness/);
  assert.match(elmley, /Address, visiting information and contact details are on this page/);
  assert.doesNotMatch(elmley, /KENT, SURREY & SUSSEX/);

  const peterborough = formatPrisonProfileMetaDescription(bySlug("hmp-peterborough"));
  assert.match(peterborough, /HMP Peterborough is a Category B local prison for men and women in Peterborough/);
  assert.match(peterborough, /Sodexo/);
  assert.match(peterborough, /Address, visiting and contact details are on this page/);
  assert.doesNotMatch(peterborough, /PRIVATELY MANAGED PRISON/);

  const wandsworth = formatPrisonProfileMetaDescription(bySlug("hmp-wandsworth"));
  assert.match(wandsworth, /Category B local prison for adult men in London/);
  assert.match(wandsworth, /Address, visiting and contact details are on this page/);
  assert.doesNotMatch(wandsworth, /SW18 3HU|8588 4000/);

  const atlanta = formatPrisonProfileMetaDescription(bySlug("atlanta-fci"));
  assert.match(atlanta, /medium-security FCI \(Federal Correctional Institution\) in Atlanta, Georgia/);
  assert.match(atlanta, /Address, visiting information and contact details are on this page/);
  assert.doesNotMatch(atlanta, /30315|404-635-5100/);

  const florence = formatPrisonProfileMetaDescription(bySlug("florence-admax-usp"));
  assert.match(florence, /^ADX Florence is a supermax USP/);
  assert.match(florence, /Florence, Colorado/);
  assert.match(florence, /address, visiting information and contact details on this page/);

  const sanQuentin = formatPrisonProfileMetaDescription(bySlug("san-quentin"));
  assert.match(sanQuentin, /maximum-security prison in San Quentin, California/);
  assert.match(sanQuentin, /visiting information on this page/);
  assert.doesNotMatch(sanQuentin, /\b(address|contact)\b/i);

  const alcatraz = formatPrisonProfileMetaDescription(bySlug("alcatraz"));
  assert.match(alcatraz, /^Historic: Alcatraz Federal Penitentiary/);
  assert.match(alcatraz, /maximum-security/);
  assert.match(alcatraz, /San Francisco, California/);
  assert.match(alcatraz, /visiting information on this page/);

  const atlantic = formatPrisonProfileMetaDescription(bySlug("atlantic-institution"));
  assert.match(atlantic, /maximum-security Federal correctional institution in Renous/);
  assert.match(atlantic, /Correctional Service of Canada/);
  assert.match(atlantic, /See the address on this page/);
  assert.doesNotMatch(atlantic, /\b(visiting|contact)\b/i);
});

test("profile JSON-LD keeps the previous description text", () => {
  const wandsworth = bySlug("hmp-wandsworth");
  assert.equal(
    formatPrisonMetaDescription(wandsworth),
    "HMP Wandsworth in London, England & Wales. Category B prison profile with category, operator, location, and general facility information.",
  );
  const atlantic = bySlug("atlantic-institution");
  assert.equal(
    formatIntlPrisonMetaDescription(atlantic),
    "Atlantic Institution in Renous, New Brunswick, Canada. Operator, jurisdiction, security classification and official source.",
  );
  const view = fs.readFileSync("src/components/pages/PrisonProfileView.tsx", "utf8");
  assert.match(view, /const metaDesc = formatPrisonMetaDescription\(prison\)/);
  const page = fs.readFileSync("src/app/prisons/[country]/[slug]/page.tsx", "utf8");
  assert.match(page, /description: formatPrisonProfileMetaDescription\(p\)/);
  assert.match(page, /title: buildPrisonPageTitle\(p\)/);
  assert.doesNotMatch(page, /formatPrisonMetaDescription|formatIntlPrisonMetaDescription/);
});
