import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { articleJsonLd } from "@/lib/seo/articleJsonLd";
import { EDITORIAL_POLICY_PATH, organizationJsonLd } from "@/lib/seo/organizationJsonLd";

test("site-wide Organization JSON-LD points at the editorial policy and names no person", () => {
  const data = organizationJsonLd();
  const serialized = JSON.stringify(data);
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "Organization");
  assert.equal(data.name, "Prisons Online");
  assert.equal(data["@id"], "https://prisonsonline.com/#organization");
  assert.equal(data.url, "https://prisonsonline.com");
  assert.equal(data.logo["@type"], "ImageObject");
  assert.equal(data.logo.url, "https://prisonsonline.com/logo-full.png");
  assert.equal(data.publishingPrinciples, `https://prisonsonline.com${EDITORIAL_POLICY_PATH}`);
  assert.equal(data.correctionsPolicy, data.publishingPrinciples);
  assert.equal(data.contactPoint["@type"], "ContactPoint");
  assert.equal(data.contactPoint.contactType, "corrections");
  assert.equal(data.contactPoint.url, "https://prisonsonline.com/contact");
  assert.equal("author" in data, false);
  assert.equal("reviewedBy" in data, false);
  assert.doesNotMatch(serialized, /Person|"Sam"|founder|employee/i);
});

test("root layout emits the Organization JSON-LD script", () => {
  const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /organizationJsonLd/);
  assert.match(layout, /application\/ld\+json/);
});

test("footer does not link to the editorial policy", () => {
  const footer = readFileSync(new URL("../src/components/layout/Footer.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(footer, /Editorial policy/);
  assert.doesNotMatch(footer, /EDITORIAL_POLICY_PATH/);
});

test("article publisher Organization @id matches the site Organization node", () => {
  const data = articleJsonLd({
    headline: "Example",
    description: "Example article",
    path: "/articles/example",
    datePublished: "2026-10-22",
  });
  const publisher = data.publisher as { "@id": string; "@type": string };
  assert.equal(publisher["@type"], "Organization");
  assert.equal(publisher["@id"], "https://prisonsonline.com/#organization");
  assert.equal(publisher["@id"], organizationJsonLd()["@id"]);
});

test("editorial policy page describes GOV.UK, HMPPS, and bop.gov checks with checked dates", () => {
  const page = readFileSync(new URL("../src/app/editorial-policy/page.tsx", import.meta.url), "utf8");
  assert.match(page, /EDITORIAL_POLICY_PATH/);
  assert.match(page, /HM Prison and Probation Service/);
  assert.match(page, /gov\.uk/);
  assert.match(page, /bop\.gov/);
  assert.match(page, /Source checked/);
  assert.match(page, /Federal Bureau of Prisons/);
  assert.match(page, /telephone, postcode or ZIP, and email/);
  assert.doesNotMatch(page, /\bSam\b|reviewed by|@type": "Person"|author:/i);
  assert.doesNotMatch(page, /noindex|robots:/);
});
