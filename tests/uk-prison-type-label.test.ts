import assert from "node:assert/strict";
import test from "node:test";
import { prisons, getPrisonByCountryAndSlug } from "@/data/prisons";
import { buildPrisonTypeBody } from "@/lib/seo/prisonProfileCopy";
import { ukPrisonTypeLabel, ukPopulationPhrase } from "@/lib/seo/ukPrisonTypeLabel";

function uk(slug: string) {
  const p = getPrisonByCountryAndSlug("uk", slug);
  assert.ok(p, `missing ${slug}`);
  return p;
}

test("Gartree type line is clean and non-redundant", () => {
  const body = buildPrisonTypeBody(uk("hmp-gartree"));
  assert.equal(body, "HMP Gartree is a Category B training prison for adult men.");
});

test("UK type labels across function/category combinations", () => {
  assert.equal(ukPrisonTypeLabel(uk("hmp-ashfield")), "Category C training prison for adult men");
  assert.equal(ukPrisonTypeLabel(uk("hmp-bedford")), "Category B local prison for adult men");
  assert.equal(ukPrisonTypeLabel(uk("hmp-yoi-bronzefield")), "women’s prison");
  assert.equal(ukPrisonTypeLabel(uk("hmyoi-aylesbury")), "young offender institution for young men");
  assert.equal(ukPrisonTypeLabel(uk("hmp-ford")), "open prison for adult men");
  assert.equal(ukPrisonTypeLabel(uk("hmp-frankland")), "Category A high-security prison for adult men");
  assert.equal(ukPrisonTypeLabel(uk("oakhill-secure-training-centre")), "secure training centre for young people");
});

test("raw HMPPS gender values are translated, not echoed", () => {
  assert.equal(ukPopulationPhrase({ gender: "Mens Prison" }), "adult men");
  assert.equal(ukPopulationPhrase({ gender: "Men and Womens Prison" }), "men and women");
  assert.equal(ukPopulationPhrase({ gender: "Womens Prison", predominantFunction: "Female" }), "");
});

test("no UK type line repeats raw codes, the category, or misuses high security", () => {
  for (const p of prisons.filter((x) => x.countrySlug === "uk")) {
    const body = buildPrisonTypeBody(p);
    assert.ok(body.length > 0, p.slug);
    assert.doesNotMatch(body, /Mens Prison|Womens Prison|\bCat [A-D]\b| · |facility for|\bTrainer\b/, `${p.slug}: ${body}`);
    const cats = body.match(/Category [A-D]/g) ?? [];
    assert.ok(cats.length <= 1, `${p.slug} repeats category: ${body}`);
    if (/high[- ]security/i.test(body)) {
      assert.match(p.predominantFunction ?? "", /high security/i, `${p.slug} called high security: ${body}`);
    }
  }
});

test("non-UK rows keep the existing type wording", () => {
  const us = prisons.find((x) => x.countrySlug === "us");
  assert.ok(us);
  assert.ok(buildPrisonTypeBody(us).length > 0);
});
