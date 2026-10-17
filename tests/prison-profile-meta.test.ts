import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { prisons } from "@/data/prisons";
import { formatPrisonMetaDescription } from "@/components/pages/PrisonProfileView";
import { formatIntlPrisonMetaDescription } from "@/components/pages/IntlPrisonProfileView";
import { formatPrisonProfileMetaDescription } from "@/lib/seo/prisonProfileMeta";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";

const INTENT =
  /\b(address|addresses|phone|phones|telephone|telephones|postcode|postcodes|postal|contact|contacts|visit|visits|visiting|visitor|visitors)\b/i;

function bySlug(slug: string) {
  const prison = prisons.find((row) => row.slug === slug);
  assert.ok(prison, slug);
  return prison;
}

test("profile meta descriptions use recorded facts and stay off contact intent", () => {
  const descriptions = prisons.map((prison) => formatPrisonProfileMetaDescription(prison));
  assert.equal(new Set(descriptions).size, descriptions.length);
  for (let i = 0; i < prisons.length; i++) {
    const prison = prisons[i];
    const description = descriptions[i];
    assert.ok(description.length >= 150 && description.length <= 160, `${prison.slug} ${description.length} ${description}`);
    assert.doesNotMatch(description, INTENT, prison.slug);
    if (prison.postcode) assert.equal(description.includes(prison.postcode), false, prison.slug);
    if (prison.phone) assert.equal(description.includes(prison.phone), false, prison.slug);
    const rawRegion = geographicRegion(prison).replace(/\s+/g, " ").trim();
    const letters = rawRegion.replace(/[^A-Za-z]/g, "");
    if (letters && letters === letters.toUpperCase()) {
      assert.equal(description.includes(rawRegion), false, `${prison.slug} ${rawRegion}`);
    }
    assert.ok(description.endsWith("."), prison.slug);
  }
});

test("representative profile metas lead with type, town and operator", () => {
  const preston = formatPrisonProfileMetaDescription(bySlug("hmp-preston"));
  assert.match(preston, /HMP Preston is a Category B local prison for adult men in Preston, Cumbria & Lancashire/);
  assert.match(preston, /Public Sector Prison/);
  assert.doesNotMatch(preston, /PR1 5AB|01772/);

  const elmley = formatPrisonProfileMetaDescription(bySlug("hmp-elmley"));
  assert.match(elmley, /local prison for adult men in Sheerness, Kent, Surrey & Sussex/);
  assert.doesNotMatch(elmley, /KENT, SURREY & SUSSEX/);

  const peterborough = formatPrisonProfileMetaDescription(bySlug("hmp-peterborough"));
  assert.match(peterborough, /HMP Peterborough/);
  assert.match(peterborough, /Sodexo/);
  assert.doesNotMatch(peterborough, /PRIVATELY MANAGED PRISON/);

  const wandsworth = formatPrisonProfileMetaDescription(bySlug("hmp-wandsworth"));
  assert.match(wandsworth, /Category B local prison for adult men in London/);
  assert.doesNotMatch(wandsworth, /SW18 3HU|8588 4000/);

  const atlanta = formatPrisonProfileMetaDescription(bySlug("atlanta-fci"));
  assert.match(atlanta, /medium-security FCI \(Federal Correctional Institution\) in Atlanta, Georgia/);
  assert.match(atlanta, /Federal Bureau of Prisons/);
  assert.doesNotMatch(atlanta, /30315|404-635-5100/);

  const florence = formatPrisonProfileMetaDescription(bySlug("florence-admax-usp"));
  assert.match(florence, /^ADX Florence is a supermax USP/);
  assert.match(florence, /Florence, Colorado/);

  const sanQuentin = formatPrisonProfileMetaDescription(bySlug("san-quentin"));
  assert.match(sanQuentin, /maximum-security prison in San Quentin, California/);
  assert.match(sanQuentin, /California Department of Corrections and Rehabilitation/);

  const alcatraz = formatPrisonProfileMetaDescription(bySlug("alcatraz"));
  assert.match(alcatraz, /^Historic: Alcatraz Federal Penitentiary/);
  assert.match(alcatraz, /San Francisco, California/);

  const atlantic = formatPrisonProfileMetaDescription(bySlug("atlantic-institution"));
  assert.match(atlantic, /maximum-security Federal correctional institution in Renous, New Brunswick, Canada/);
  assert.match(atlantic, /Correctional Service of Canada/);
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
