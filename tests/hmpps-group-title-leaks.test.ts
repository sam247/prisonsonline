import assert from "node:assert/strict";
import { test } from "node:test";
import { regionTitleName, HMPPS_NON_GEOGRAPHIC_GROUPS } from "@/lib/prisons/hmppsGroupLabel";
import { buildGeneratedArticles } from "@/lib/programmatic/articles/buildGeneratedArticles";
import { getRegionsByCountry } from "@/data/prisons";

const regionArticles = () => buildGeneratedArticles().filter((a) => a.articleKind === "uk_region");

test("regionTitleName relabels HMPPS groups and keeps geographic regions", () => {
  assert.equal(regionTitleName("WOMENS PRISON GROUP"), "Women's Prison Group");
  assert.equal(regionTitleName("LONDON"), "LONDON");
});

test("generated UK region article titles are unchanged (metadata/JSON-LD source)", () => {
  const names = new Map(getRegionsByCountry("uk").map((r) => [r.slug, r.name]));
  const arts = regionArticles();
  assert.ok(arts.length > 0);
  for (const a of arts) {
    assert.equal(a.title, `Prisons in ${names.get(a.regionSlug!)}: how this regional group works`);
  }
  assert.ok(arts.some((a) => a.title === "Prisons in YOUTH CUSTODY SERVICE: how this regional group works"));
});

test("generated UK region article visible body, intro and link labels never show raw HMPPS group names", () => {
  const leaks: string[] = [];
  for (const a of regionArticles()) {
    const visible = JSON.stringify([a.intro, a.bodySections, a.faqs, a.hubLinks]);
    for (const g of HMPPS_NON_GEOGRAPHIC_GROUPS) if (visible.includes(g)) leaks.push(`${a.slug}: ${g}`);
  }
  assert.deepEqual(leaks, []);
});
