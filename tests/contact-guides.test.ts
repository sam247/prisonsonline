import { test } from "node:test";
import assert from "node:assert/strict";
import { guides } from "../src/data/guides";
import { readFileSync } from "node:fs";

const slugs = new Set(guides.map((g) => g.slug));

function internalGuideLinks(content: string): string[] {
  return [...content.matchAll(/href=\\?"\/guides\/([^"\\#?]+)/g)].map((m) => m[1]);
}

test("email-a-prisoner guide exists with official sources and resolvable internal links", () => {
  const guide = guides.find((g) => g.slug === "how-to-email-a-prisoner");
  assert.ok(guide, "missing /guides/how-to-email-a-prisoner");
  assert.match(guide.content, /https:\/\/www\.emailaprisoner\.com\//);
  assert.match(guide.content, /https:\/\/www\.gov\.uk\/find-prisoner/);
  assert.match(guide.content, /https:\/\/www\.bop\.gov\/inmates\/trulincs\.jsp/);
  for (const slug of internalGuideLinks(guide.content)) assert.ok(slugs.has(slug), `missing linked guide ${slug}`);
  assert.ok(guide.faqs.length >= 4);
  assert.doesNotMatch(guide.content, /\{|\}|TODO|lorem/i);
});

test("email-a-prisoner guide keeps UK and US federal processes in separate sections", () => {
  const guide = guides.find((g) => g.slug === "how-to-email-a-prisoner")!;
  const usStart = guide.content.indexOf("## US federal prisons");
  assert.ok(usStart > 0);
  assert.doesNotMatch(guide.content.slice(0, usStart), /CorrLinks/);
  assert.doesNotMatch(guide.content.slice(usStart), /eMates|GOV\.UK/);
});

test("homepage common situations link to the email-a-prisoner guide", () => {
  const src = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const block = src.slice(src.indexOf("const commonSituationSlugs"), src.indexOf("const commonSituationGuides"));
  assert.match(block, /"how-to-email-a-prisoner"/);
  assert.match(src, /Mail: <Mail /);
});
