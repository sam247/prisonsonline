import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { prisons } from "@/data/prisons";
import { intentsForPrison } from "@/lib/seo/intentRollout";
import { buildIntentMetaDescription, buildIntentPageTitle } from "@/lib/seo/prisonIntentCopy";
import { formatContactDetailsMetaDescription } from "@/lib/seo/prisonContactMeta";
import { formatPrisonProfileMetaDescription } from "@/lib/seo/prisonProfileMeta";
import { geographicRegion } from "@/lib/prisons/hmppsGroupLabel";

function bySlug(slug: string) {
  const prison = prisons.find((row) => row.slug === slug);
  assert.ok(prison, slug);
  return prison;
}

function cleanAddress(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().replace(/\s+,/g, ",").replace(/,\s*/g, ", ");
}

test("contact-details metas keep contact intent and the recorded phone and postcode", () => {
  const contacts = prisons.filter((prison) => intentsForPrison(prison).includes("contact-details"));
  assert.equal(contacts.length, 128);
  assert.equal(contacts.filter((prison) => prison.countrySlug === "uk").length, 122);
  assert.equal(contacts.filter((prison) => prison.countrySlug === "us").length, 6);
  assert.equal(contacts.filter((prison) => !["uk", "us"].includes(prison.countrySlug)).length, 0);

  const descriptions = new Map<string, string>();
  for (const prison of prisons) {
    descriptions.set(`profile:${prison.countrySlug}/${prison.slug}`, formatPrisonProfileMetaDescription(prison));
    for (const intent of intentsForPrison(prison)) {
      descriptions.set(
        `${intent}:${prison.countrySlug}/${prison.slug}`,
        intent === "contact-details"
          ? formatContactDetailsMetaDescription(prison)
          : buildIntentMetaDescription(prison, intent),
      );
    }
  }
  for (const prison of contacts) {
    const description = descriptions.get(`contact-details:${prison.countrySlug}/${prison.slug}`)!;
    assert.ok(description.length >= 150 && description.length <= 160, `${prison.slug} ${description.length} ${description}`);
    assert.match(description, /\baddress\b/i, prison.slug);
    assert.match(description, /\bpostcode\b/i, prison.slug);
    assert.match(description, /\btelephone\b/i, prison.slug);
    assert.match(description, /\bcontact\b/i, prison.slug);
    assert.match(description, /\bvisiting\b/i, prison.slug);
    assert.match(description, /Visiting and contact details\.$/, prison.slug);
    assert.doesNotMatch(description, /Official contact routes|And how to visit|Profile of this establishment|Directory profile/, prison.slug);
    assert.ok(description.includes(prison.postcode!.trim()), prison.slug);
    assert.ok(description.includes(prison.phone!.trim()), prison.slug);
    const rawRegion = geographicRegion(prison).replace(/\s+/g, " ").trim();
    const letters = rawRegion.replace(/[^A-Za-z]/g, "");
    if (letters && letters === letters.toUpperCase()) {
      assert.equal(description.includes(rawRegion), false, `${prison.slug} ${rawRegion}`);
    }
  }

  const grouped = new Map<string, string[]>();
  for (const [page, description] of descriptions) {
    const pages = grouped.get(description) ?? [];
    pages.push(page);
    grouped.set(description, pages);
  }
  const duplicates = [...grouped.entries()].filter(([, pages]) => pages.length > 1);
  assert.deepEqual(duplicates, []);
});

test("contact metas lead with the verified address where it fits", () => {
  const preston = formatContactDetailsMetaDescription(bySlug("hmp-preston"));
  assert.match(preston, /2 Ribbleton Lane, Preston, Lancashire, PR1 5AB/);
  assert.match(preston, /PR1 5AB/);
  assert.match(preston, /\(01772\) 444 550/);
  assert.match(preston, /Visiting and contact details\.$/);
  assert.doesNotMatch(preston, /Cumbria|CUMBRIA & LANCASHIRE/);

  const elmley = formatContactDetailsMetaDescription(bySlug("hmp-elmley"));
  assert.match(elmley, /Church Road, Eastchurch, Sheerness, Kent, ME12 4DZ/);
  assert.match(elmley, /\(01795\) 802 000/);
  assert.doesNotMatch(elmley, /Surrey|KENT, SURREY & SUSSEX/);

  const peterborough = formatContactDetailsMetaDescription(bySlug("hmp-peterborough"));
  assert.match(peterborough, /Saville Road, Westwood, Peterborough, PE3 7PD/);
  assert.match(peterborough, /\(01733\) 217 500/);
  assert.doesNotMatch(peterborough, /PRIVATELY MANAGED PRISON/);

  const wandsworth = formatContactDetailsMetaDescription(bySlug("hmp-wandsworth"));
  assert.match(wandsworth, /Heathfield Road, London, SW18 3HU/);
  assert.match(wandsworth, /\(020\) 8588 4000/);
  assert.match(wandsworth, /\baddress\b/i);
  assert.match(wandsworth, /\bcontact\b/i);

  const atlanta = formatContactDetailsMetaDescription(bySlug("atlanta-fci"));
  assert.match(atlanta, /601 MCDONOUGH BLVD SE/);
  assert.match(atlanta, /30315/);
  assert.match(atlanta, /404-635-5100/);
  assert.match(atlanta, /Atlanta, Georgia/);

  const berwyn = bySlug("hmp-berwyn");
  const berwynMeta = formatContactDetailsMetaDescription(berwyn);
  assert.equal(berwynMeta.includes(cleanAddress(berwyn.address)), false);
  assert.match(berwynMeta, /Wrexham, North Wales/);
  assert.match(berwynMeta, /LL13 9QE/);
  assert.match(berwynMeta, /\(01978\) 523 000/);
  assert.match(berwynMeta, /\baddress\b/i);
  assert.doesNotMatch(berwynMeta, /HMPPS Wales/);
});

test("contact JSON-LD uses the contact meta description and titles stay unchanged", () => {
  const wandsworth = bySlug("hmp-wandsworth");
  const ranby = bySlug("hmp-ranby");
  assert.equal(buildIntentPageTitle(wandsworth, "contact-details"), "HMP Wandsworth Address & Phone | SW18 3HU");
  assert.equal(buildIntentPageTitle(ranby, "contact-details"), "HMP Ranby Address, Postcode & Phone");
  assert.match(buildIntentMetaDescription(wandsworth, "contact-details"), /SW18 3HU/);
  assert.match(buildIntentMetaDescription(wandsworth, "contact-details"), /\(020\) 8588 4000/);
  assert.doesNotMatch(buildIntentMetaDescription(ranby, "contact-details"), /DN22 8EU/);
  assert.match(formatContactDetailsMetaDescription(ranby), /DN22 8EU/);

  const view = fs.readFileSync("src/components/pages/PrisonIntentView.tsx", "utf8");
  assert.match(view, /intent === "contact-details" \? formatContactDetailsMetaDescription\(prison\) : buildIntentMetaDescription\(prison, intent\)/);
  assert.match(view, /description: metaDesc/);
  const page = fs.readFileSync("src/app/prisons/[country]/[slug]/[intent]/page.tsx", "utf8");
  assert.match(page, /title: buildIntentPageTitle\(prison, intentParam\)/);
  assert.match(page, /intentParam === "contact-details"/);
  assert.match(page, /formatContactDetailsMetaDescription\(prison\)/);
  assert.match(page, /buildIntentMetaDescription\(prison, intentParam\)/);
});
