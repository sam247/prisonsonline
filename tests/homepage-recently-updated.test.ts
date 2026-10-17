import test from "node:test";
import assert from "node:assert/strict";
import type { Prison } from "@/types/prison";
import { prisons } from "@/data/prisons";
import {
  getHomepageRecentlyUpdatedPrisons,
  getPrisonVerificationCheckedDate,
} from "@/lib/seo/prisonLastModified";
import { prisonCapacityLabel } from "@/lib/prisons/capacityLabel";

const mk = (slug: string, status?: Prison["status"]) => ({ slug, status }) as Prison;
const dates: Record<string, string | undefined> = {
  a: "2026-10-01", b: "2026-10-10", c: "2026-09-01", closed: "2026-10-20", hist: "2026-10-21", undated: undefined,
};
const getDate = (p: Prison) => (dates[p.slug] ? new Date(dates[p.slug]!) : null);
const list = [mk("a"), mk("b", "open"), mk("c"), mk("closed", "closed"), mk("hist", "historic"), mk("undated")];

test("closed and historic records are excluded", () => {
  const out = getHomepageRecentlyUpdatedPrisons(list, 10, getDate).map((p) => p.slug);
  assert.ok(!out.includes("closed") && !out.includes("hist"));
});

test("undated records are excluded (no build-time fallback)", () => {
  const out = getHomepageRecentlyUpdatedPrisons(list, 10, getDate).map((p) => p.slug);
  assert.ok(!out.includes("undated"));
});

test("sorted by verification date descending", () => {
  assert.deepEqual(getHomepageRecentlyUpdatedPrisons(list, 10, getDate).map((p) => p.slug), ["b", "a", "c"]);
});

test("real data: homepage list has no Alcatraz, all dated and open, descending", () => {
  const out = getHomepageRecentlyUpdatedPrisons(prisons, 10);
  assert.ok(out.length > 0);
  assert.ok(!out.some((p) => /alcatraz/i.test(p.slug)));
  const ds = out.map((p) => getPrisonVerificationCheckedDate(p)!.getTime());
  out.forEach((p) => assert.ok(p.status !== "closed" && p.status !== "historic"));
  for (let i = 1; i < ds.length; i++) assert.ok(ds[i - 1] >= ds[i]);
});

test("'Former capacity' label for historic/closed records", () => {
  assert.equal(prisonCapacityLabel({ status: "historic" }), "Former capacity");
  assert.equal(prisonCapacityLabel({ status: "closed" }), "Former capacity");
  assert.equal(prisonCapacityLabel({ status: "open" }), "Capacity");
  assert.equal(prisonCapacityLabel({}), "Capacity");
});
