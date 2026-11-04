import assert from "node:assert/strict";
import { test } from "node:test";
import { manualContentBlocks, LIST_ITEM } from "@/lib/articles/manualContentBlocks";
import { articles } from "@/data/articles";
import { geographicRegion, isHmppsGroupRegion } from "@/lib/prisons/hmppsGroupLabel";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";
import { buildLocationBody } from "@/lib/seo/prisonProfileCopy";
import { buildIntentBodyParagraphs } from "@/lib/seo/prisonIntentCopy";
import { intentsForPrison } from "@/lib/seo/intentRollout";

test("bullet runs become their own blocks, even without a blank line before them", () => {
  const blocks = manualContentBlocks("Intro:\n- one\n- two\nAfter\n\n## FAQ\r\n\r\nText");
  assert.deepEqual(blocks, ["Intro:", "- one\n- two", "After", "## FAQ", "Text"]);
});

test("overcrowding article: list, following paragraph and FAQ heading are separate blocks", () => {
  const a = articles.find((x) => x.slug === "prison-overcrowding-england-wales");
  assert.ok(a);
  const blocks = manualContentBlocks(a.content);
  const li = blocks.findIndex((b) => b.split("\n").every((l) => LIST_ITEM.test(l)));
  assert.ok(li > 0, "list block found");
  assert.equal(blocks[li].split("\n").length, 3);
  assert.ok(blocks[li + 1].startsWith("HTML:Start from"));
  assert.ok(blocks.includes("## Frequently asked questions"));
});

const GROUP_RE = /LONG TERM & HIGH SECURITY ESTATE|YOUTH CUSTODY SERVICE|PRIVATELY MANAGED PRISON|WOMENS PRISON GROUP/;

test("HMPPS groups never leak into visitor-facing location copy", () => {
  const grouped = ukPrisonsGenerated.filter(isHmppsGroupRegion);
  assert.equal(grouped.length, 40);
  for (const p of grouped) {
    assert.equal(geographicRegion(p), "");
    assert.doesNotMatch(buildLocationBody(p), GROUP_RE, p.slug);
    for (const i of intentsForPrison(p)) {
      assert.doesNotMatch(buildIntentBodyParagraphs(p, i).join(" "), GROUP_RE, `${p.slug}/${i}`);
    }
  }
});
