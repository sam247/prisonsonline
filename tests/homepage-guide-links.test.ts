import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { guides } from "../src/data/guides";

test("homepage /guides/* links resolve to real guides", () => {
  const src = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const slugs = new Set(guides.map((g) => g.slug));
  const links = [...src.matchAll(/href="\/guides\/([^"#?]+)"/g)].map((m) => m[1]);
  assert.ok(links.length > 0);
  for (const slug of links) assert.ok(slugs.has(slug), `missing guide: ${slug}`);
});
