import assert from "node:assert/strict";
import { test } from "node:test";
import { ukPrisonsGenerated } from "@/data/generated/ukPrisons.generated";
import { prisonCoordsGenerated } from "@/data/generated/prisonCoords.generated";
// @ts-expect-error — plain .mjs config module without type declarations
import { legacyRootRedirects } from "../config/legacy-root-redirects.mjs";

type Redirect = { source: string; destination: string; permanent: boolean };

test("HMPPS 'Wakfield' misspelling is corrected to GOV.UK 'HMP Wakefield' / hmp-wakefield", () => {
  const wakefield = ukPrisonsGenerated.find((p) => p.slug === "hmp-wakefield");
  assert.ok(wakefield);
  assert.equal(wakefield.name, "HMP Wakefield");
  assert.equal(ukPrisonsGenerated.some((p) => p.slug === "hmp-wakfield" || /wakfield/i.test(p.name)), false);
  assert.equal(prisonCoordsGenerated.some((c) => c.slug === "hmp-wakefield"), true);
  assert.equal(prisonCoordsGenerated.some((c) => c.slug === "hmp-wakfield"), false);
});

test("old Wakfield URLs 301 to hmp-wakefield (profile and intent pages)", () => {
  const redirects = legacyRootRedirects as Redirect[];
  const root = redirects.find((r) => r.source === "/prisons/uk/hmp-wakfield");
  assert.deepEqual(root, { source: "/prisons/uk/hmp-wakfield", destination: "/prisons/uk/hmp-wakefield", permanent: true });
  const nested = redirects.find((r) => r.source === "/prisons/uk/hmp-wakfield/:path*");
  assert.equal(nested?.destination, "/prisons/uk/hmp-wakefield/:path*");
  assert.equal(nested?.permanent, true);
});
