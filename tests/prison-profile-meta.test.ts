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
const FILLER = /Profile of this establishment|Directory profile|Official contact routes|And how to visit|Visiting and contact details/i;

function bySlug(slug: string) {
  const prison = prisons.find((row) => row.slug === slug);
  assert.ok(prison, slug);
  return prison;
}

test("profile meta descriptions use verified facts and stay off contact intent", () => {
  const descriptions = prisons.map((prison) => formatPrisonProfileMetaDescription(prison));
  assert.equal(new Set(descriptions).size, descriptions.length);
  for (let i = 0; i < prisons.length; i++) {
    const prison = prisons[i];
    const description = descriptions[i];
    assert.ok(description.length >= 150 && description.length <= 160, `${prison.slug} ${description.length} ${description}`);
    assert.doesNotMatch(description, INTENT, prison.slug);
    assert.doesNotMatch(description, FILLER, prison.slug);
    assert.doesNotMatch(description, /\brecorded\b/i, prison.slug);
    if (prison.countrySlug === "uk" && prison.operator) {
      assert.doesNotMatch(description, /Public Sector Prison/, prison.slug);
      const welshPublic = /^hmpps wales$/i.test((prison.stateOrRegion ?? "").trim()) && /^public sector prison$/i.test(prison.operator);
      if (/^public sector prison$/i.test(prison.operator)) {
        assert.match(description, welshPublic ? /Run by HMPPS Wales\./ : /Run by HM Prison and Probation Service\./, prison.slug);
      } else {
        assert.ok(description.includes(`Operated by ${prison.operator}.`), `${prison.slug} ${description}`);
      }
    }
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
  assert.match(preston, /HMP Preston is a Category B local prison for adult men in Preston, Lancashire/);
  assert.match(preston, /Run by HM Prison and Probation Service/);
  assert.doesNotMatch(preston, /Cumbria|PR1 5AB|01772|Public Sector Prison/);

  const elmley = formatPrisonProfileMetaDescription(bySlug("hmp-elmley"));
  assert.match(elmley, /local prison for adult men in Sheerness, Kent/);
  assert.doesNotMatch(elmley, /Surrey|KENT, SURREY & SUSSEX/);

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

test("UK place lines use full county names", () => {
  const expectPlace = (slug: string, pattern: RegExp, banned?: RegExp) => {
    const description = formatPrisonProfileMetaDescription(bySlug(slug));
    assert.match(description, pattern, description);
    if (banned) assert.doesNotMatch(description, banned, description);
  };
  expectPlace("hmp-kirkham", /Preston, Lancashire/, /\bLancs\b/);
  expectPlace("hmp-ranby", /Retford, Nottinghamshire/, /\bNottingham\b/);
  expectPlace("hmp-berwyn", /Wrexham, Wales/, /North Wales/);
  expectPlace("hmp-yoi-parc", /Bridgend, Wales/, /South Wales/);
  expectPlace("hmp-bullingdon", /Bicester, Oxfordshire/, /\bOxon\b/);
  expectPlace("hmyoi-aylesbury", /Aylesbury, Buckinghamshire/, /\bBucks\b/);
  expectPlace("hmp-leyhill", /Wotton-under-Edge, Gloucestershire/, /\bGloucester\b/);
  expectPlace("hmp-yoi-eastwood-park", /Wotton-under-Edge, Gloucestershire/, /\bGlos\b/);
  expectPlace("hmp-north-sea-camp", /Boston, Lincolnshire/, /\bLincs\b/);
  expectPlace("hmp-kirklevington-grange", /in Yarm\b/, /Cleveland/);
  expectPlace("hmp-yoi-bronzefield", /in Ashford\b/, /Middlesex/);
});

test("profile JSON-LD description matches the profile meta description", () => {
  const wandsworth = bySlug("hmp-wandsworth");
  const meta = formatPrisonProfileMetaDescription(wandsworth);
  assert.notEqual(
    formatPrisonMetaDescription(wandsworth),
    meta,
  );
  const atlantic = bySlug("atlantic-institution");
  assert.notEqual(formatIntlPrisonMetaDescription(atlantic), formatPrisonProfileMetaDescription(atlantic));

  const view = fs.readFileSync("src/components/pages/PrisonProfileView.tsx", "utf8");
  assert.match(view, /const metaDesc = formatPrisonProfileMetaDescription\(prison\)/);
  assert.match(view, /description: metaDesc/);
  const intl = fs.readFileSync("src/components/pages/IntlPrisonProfileView.tsx", "utf8");
  assert.match(intl, /description: formatPrisonProfileMetaDescription\(prison\)/);
  const page = fs.readFileSync("src/app/prisons/[country]/[slug]/page.tsx", "utf8");
  assert.match(page, /description: formatPrisonProfileMetaDescription\(p\)/);
  assert.match(page, /title: buildPrisonPageTitle\(p\)/);
  assert.doesNotMatch(page, /formatPrisonMetaDescription|formatIntlPrisonMetaDescription/);
});
