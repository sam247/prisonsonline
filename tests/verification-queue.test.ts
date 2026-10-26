import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { prisons } from "@/data/prisons";
import { ukVerificationOverlay } from "@/data/generated/ukVerificationOverlay.generated";
import { usVerificationOverlay } from "@/data/generated/usVerificationOverlay.generated";
import {
  TIER_INTERVAL_DAYS,
  addDaysIso,
  compareOverdue,
  defaultEntryFor,
  ensureEntries,
  isDue,
  loadMergedQueue,
  mergeQueues,
  parseQueueFile,
  queuePaths,
  recordRun,
  recordSourceUpdates,
  rederive,
  saveQueueEverywhere,
  selectFromQueue,
  summariseQueue,
  emptyQueue,
  type QueueEntry,
  type QueueFile,
} from "@/lib/verification/queue";
import { dayStats, londonDate } from "../scripts/queue-status";
import type { PrisonVerificationInput } from "@/lib/verification/types";

const REPO_QUEUE = path.join(process.cwd(), "data/verification/queue.json");
const seeded = (): QueueFile => parseQueueFile(JSON.parse(fs.readFileSync(REPO_QUEUE, "utf8")), "seeded queue");
const inputs: PrisonVerificationInput[] = prisons.map((p) => ({
  slug: p.slug,
  countrySlug: p.countrySlug,
  country: p.country,
  name: p.name,
  address: p.address,
  postcode: p.postcode,
  phone: p.phone,
  operator: p.operator,
  securityLevel: p.securityLevel,
  facilityType: (p as { facilityType?: string }).facilityType ?? (p as { type?: string }).type,
})) as PrisonVerificationInput[];

function entry(over: Partial<QueueEntry> & { slug: string }): QueueEntry {
  return rederive({
    country: "uk",
    countrySlug: "uk",
    tier: 2,
    tierBasis: "test",
    selection: "auto",
    lastVerified: null,
    lastAttempt: null,
    nextDue: "2026-10-01T00:00:00.000Z",
    status: "UNVERIFIED",
    discrepancyHistory: [],
    dataReliabilityFlags: [],
    checkHistory: [],
    ...over,
  });
}
const check = (at: string, status: "CURRENT" | "CHANGED" | "VERIFICATION_FAILED" = "CURRENT", extra: object = {}) => ({
  at,
  status,
  basis: "verifier-run" as const,
  mode: "write" as const,
  ...extra,
});
const queueOf = (...entries: QueueEntry[]): QueueFile => ({ ...emptyQueue("2026-10-26T00:00:00.000Z"), entries: Object.fromEntries(entries.map((e) => [e.slug, e])) });

// ---- seeded data -------------------------------------------------------------------------------

test("seeded queue covers every UK and US profile exactly once", () => {
  const q = seeded();
  const inScope = prisons.filter((p) => ["uk", "us", "united-states"].includes(p.countrySlug));
  assert.equal(Object.keys(q.entries).length, inScope.length);
  for (const p of inScope) assert.ok(q.entries[p.slug], `missing ${p.slug}`);
  assert.equal(Object.values(q.entries).filter((e) => e.country === "uk").length, prisons.filter((p) => p.countrySlug === "uk").length);
});

test("seeded tiers: 40 UK tier 1, remaining UK tier 2, all US tier 3", () => {
  const entries = Object.values(seeded().entries);
  assert.equal(entries.filter((e) => e.country === "uk" && e.tier === 1).length, 40);
  assert.ok(entries.filter((e) => e.country === "uk").every((e) => e.tier === 1 || e.tier === 2));
  assert.ok(entries.filter((e) => e.country === "us").every((e) => e.tier === 3));
  for (const slug of ["hmp-belmarsh", "hmp-frankland", "hmp-full-sutton", "hmp-long-lartin", "hmp-wakefield", "hmp-whitemoor"]) {
    assert.equal(seeded().entries[slug].tier, 1, `${slug} is Cat A so must be tier 1`);
  }
});

test("legacy US duplicates and non-automatable profiles are never auto-selected", () => {
  const q = seeded();
  assert.equal(q.entries["fci-terminal-island"].selection, "excluded");
  assert.ok(q.entries["fci-terminal-island"].dataReliabilityFlags.includes("duplicate-of:terminal-island-fci"));
  assert.equal(q.entries["terminal-island-fci"].selection, "auto");
  assert.equal(q.entries.alcatraz.selection, "excluded");
  for (const slug of ["san-quentin", "folsom-state-prison", "angola", "sing-sing", "rikers-island"]) assert.equal(q.entries[slug].selection, "manual-only");
});

test("bulk bop.gov backfill is partial evidence and does not count as a full verification", () => {
  const e = seeded().entries["big-sandy-usp"];
  assert.ok(e.checkHistory.some((c) => c.partial));
  assert.ok(e.dataReliabilityFlags.includes("contact-backfill-only"));
  const neverFull = Object.values(seeded().entries).filter((x) => x.country === "us" && x.selection === "auto" && x.lastVerified === null);
  assert.ok(neverFull.length > 100);
});

test("seeded queue preserves history: no entry loses checks it has evidence for", () => {
  const q = seeded();
  assert.ok(q.entries["hmp-belmarsh"].checkHistory.length >= 4);
  assert.ok(q.entries["hmp-elmley"].discrepancyHistory.length >= 1);
});

test("overlay entry counts never drop (UK and US verification overlays)", () => {
  assert.ok(Object.keys(ukVerificationOverlay.entries).length >= 5, "UK overlay shrank");
  assert.ok(Object.keys(usVerificationOverlay.entries).length >= 134, "US overlay shrank");
});

// ---- merge -------------------------------------------------------------------------------------

test("merge keeps the entry with the latest lastVerified, unions history and flags, repo owns the tier", () => {
  const repo = queueOf(
    entry({ slug: "a", tier: 1, checkHistory: [check("2026-09-01T08:00:00.000Z")], dataReliabilityFlags: ["x"] }),
    entry({ slug: "only-repo" }),
  );
  const working = queueOf(
    entry({ slug: "a", tier: 2, checkHistory: [check("2026-10-10T08:00:00.000Z", "CHANGED")], dataReliabilityFlags: ["y"], sourceUpdatedAt: "2026-10-01T00:00:00Z" }),
    entry({ slug: "only-working" }),
  );
  const merged = mergeQueues(repo, working);
  assert.deepEqual(Object.keys(merged.entries).sort(), ["a", "only-repo", "only-working"]);
  const a = merged.entries.a;
  assert.equal(a.lastVerified, "2026-10-10T08:00:00.000Z");
  assert.equal(a.status, "CHANGED");
  assert.equal(a.tier, 1);
  assert.equal(a.checkHistory.length, 2);
  assert.deepEqual(a.dataReliabilityFlags, ["x", "y"]);
  assert.equal(a.nextDue, addDaysIso("2026-10-10T08:00:00.000Z", 30));
  assert.equal(a.sourceUpdatedAt, "2026-10-01T00:00:00Z");
});

test("merge is symmetric in what it keeps and idempotent", () => {
  const repo = queueOf(entry({ slug: "a", checkHistory: [check("2026-09-01T08:00:00.000Z")] }));
  const working = queueOf(entry({ slug: "a", checkHistory: [check("2026-10-01T08:00:00.000Z")] }));
  const once = mergeQueues(repo, working);
  assert.equal(once.entries.a.lastVerified, mergeQueues(working, repo).entries.a.lastVerified);
  assert.deepEqual(mergeQueues(once, working), once);
  assert.deepEqual(mergeQueues(once, once), once);
});

test("merge never drops history: a stale repo copy cannot erase a newer working-copy check", () => {
  const repo = seeded();
  const working = structuredClone(repo);
  working.entries["hmp-bristol"].checkHistory.push(check("2026-10-27T08:00:00.000Z"));
  working.entries["hmp-bristol"] = rederive(working.entries["hmp-bristol"]);
  const merged = mergeQueues(repo, working);
  assert.equal(merged.entries["hmp-bristol"].lastVerified, "2026-10-27T08:00:00.000Z");
  assert.ok(merged.entries["hmp-bristol"].checkHistory.length > repo.entries["hmp-bristol"].checkHistory.length);
  assert.equal(Object.keys(merged.entries).length, Object.keys(repo.entries).length);
});

test("a failed attempt retries in a day and does not advance lastVerified", () => {
  const e = entry({ slug: "a", tier: 2, checkHistory: [check("2026-09-01T08:00:00.000Z"), check("2026-10-20T08:00:00.000Z", "VERIFICATION_FAILED")] });
  assert.equal(e.lastVerified, "2026-09-01T08:00:00.000Z");
  assert.equal(e.lastAttempt, "2026-10-20T08:00:00.000Z");
  assert.equal(e.status, "VERIFICATION_FAILED");
  assert.equal(e.nextDue, addDaysIso("2026-10-20T08:00:00.000Z", 1));
});

test("load fails closed when no queue exists and merges both copies when present", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "queue-test-"));
  const paths = queuePaths(dir, path.join(dir, "working.json"));
  assert.throws(() => loadMergedQueue(paths), /No verification queue found/);
  const q = queueOf(entry({ slug: "a" }));
  saveQueueEverywhere(q, paths);
  assert.ok(fs.existsSync(paths.repoPath) && fs.existsSync(paths.workingPath));
  const stale = loadMergedQueue(paths);
  assert.equal(stale.repoFound && stale.workingFound, true);
});

// ---- selection and tiering ---------------------------------------------------------------------

const NOW = new Date("2026-10-26T09:00:00.000Z");

test("tier intervals are 30 / 60 / 90 days", () => {
  assert.deepEqual(TIER_INTERVAL_DAYS, { 1: 30, 2: 60, 3: 90 });
  for (const [tier, days] of [[1, 30], [2, 60], [3, 90]] as const) {
    const e = entry({ slug: `t${tier}`, tier, checkHistory: [check("2026-09-01T08:00:00.000Z")] });
    assert.equal(e.nextDue, addDaysIso("2026-09-01T08:00:00.000Z", days));
  }
});

test("due and priority: tier first, then never-verified, oldest verification, discrepancies, flags", () => {
  const t1old = entry({ slug: "t1-old", tier: 1, checkHistory: [check("2026-08-01T08:00:00.000Z")] });
  const t1older = entry({ slug: "t1-older", tier: 1, checkHistory: [check("2026-07-01T08:00:00.000Z")] });
  const t1never = entry({ slug: "t1-never", tier: 1 });
  const t2never = entry({ slug: "t2-never", tier: 2 });
  const t3 = entry({ slug: "t3", tier: 3, country: "us", countrySlug: "us", checkHistory: [check("2026-05-01T08:00:00.000Z")] });
  const fresh = entry({ slug: "t1-fresh", tier: 1, checkHistory: [check("2026-10-20T08:00:00.000Z")] });
  const order = [t2never, t1old, t3, t1never, fresh, t1older].filter((e) => isDue(e, NOW)).sort((a, b) => compareOverdue(a, b)).map((e) => e.slug);
  assert.deepEqual(order, ["t1-never", "t1-older", "t1-old", "t2-never", "t3"]);

  const plain = entry({ slug: "p", tier: 1 });
  const withHistory = entry({ slug: "q", tier: 1, discrepancyHistory: [{ at: "2026-09-01T00:00:00.000Z", status: "CHANGED", fields: ["email"] }] });
  const flagged = entry({ slug: "r", tier: 1, dataReliabilityFlags: ["source-omits:email"] });
  assert.deepEqual([plain, flagged, withHistory].sort((a, b) => compareOverdue(a, b)).map((e) => e.slug), ["q", "r", "p"]);
});

test("tier 2 is due early when GOV.UK public_updated_at is later than lastVerified", () => {
  const e = entry({ slug: "a", tier: 2, checkHistory: [check("2026-10-10T08:00:00.000Z")] });
  assert.equal(isDue(e, NOW), false);
  assert.equal(isDue(e, NOW, "2026-10-05T00:00:00Z"), false);
  assert.equal(isDue(e, NOW, "2026-10-12T00:00:00Z"), true);
  const t1 = entry({ slug: "b", tier: 1, checkHistory: [check("2026-10-10T08:00:00.000Z")] });
  assert.equal(isDue(t1, NOW, "2026-10-12T00:00:00Z"), false, "only tier 2 is change-driven");
  const stored = recordSourceUpdates(queueOf(e), { a: "2026-10-12T00:00:00Z" });
  assert.equal(stored.entries.a.sourceUpdatedAt, "2026-10-12T00:00:00Z");
});

test("excluded and manual-only entries are never auto-selected but --slugs still works", () => {
  const q = seeded();
  const picked = selectFromQueue({ queue: q, prisons: inputs, country: "us", now: NOW, limit: 500 }).map((p) => p.slug);
  for (const slug of ["fci-terminal-island", "alcatraz", "san-quentin", "folsom-state-prison", "angola", "sing-sing", "rikers-island"]) {
    assert.ok(!picked.includes(slug), `${slug} must not be auto-selected`);
  }
  const forced = selectFromQueue({ queue: q, prisons: inputs, country: "us", now: NOW, limit: 5, slugs: ["san-quentin"] });
  assert.deepEqual(forced.map((p) => p.slug), ["san-quentin"]);
});

test("seeded selection: UK picks tier 1 first, US picks never-verified tier 3, and the ordering is stable", () => {
  const q = seeded();
  const uk = selectFromQueue({ queue: q, prisons: inputs, country: "uk", now: NOW, limit: 2 });
  assert.equal(uk.length, 2);
  assert.ok(uk.every((p) => q.entries[p.slug].tier === 1));
  const us = selectFromQueue({ queue: q, prisons: inputs, country: "us", now: NOW, limit: 2 });
  assert.equal(us.length, 2);
  assert.ok(us.every((p) => q.entries[p.slug].selection === "auto" && p.countrySlug !== "uk"));
  assert.deepEqual(selectFromQueue({ queue: q, prisons: inputs, country: "us", now: NOW, limit: 2 }).map((p) => p.slug), us.map((p) => p.slug));
});

test("recordRun writes back lastVerified, nextDue and status, and logs discrepancies", () => {
  let q = queueOf(entry({ slug: "a", tier: 1 }));
  q = recordRun(q, { slug: "a", at: "2026-10-26T09:00:00.000Z", status: "CHANGED", runStatus: "success", mode: "write", differenceFields: ["phone"], sourceUrl: "https://example.test" });
  const e = q.entries.a;
  assert.equal(e.lastVerified, "2026-10-26T09:00:00.000Z");
  assert.equal(e.status, "CHANGED");
  assert.equal(e.nextDue, addDaysIso("2026-10-26T09:00:00.000Z", 30));
  assert.equal(e.discrepancyHistory.length, 1);
  assert.equal(e.lastSourceUrl, "https://example.test");
});

test("ensureEntries adds site prisons the queue does not know, due immediately, without touching existing entries", () => {
  const q = seeded();
  delete q.entries["hmp-bristol"];
  const next = ensureEntries(q, inputs, NOW);
  assert.ok(next.entries["hmp-bristol"].dataReliabilityFlags.includes("added-after-seed"));
  assert.equal(next.entries["hmp-bristol"].selection, "auto");
  assert.deepEqual(next.entries["hmp-belmarsh"], q.entries["hmp-belmarsh"]);
  assert.equal(defaultEntryFor(inputs.find((p) => p.slug === "alcatraz") as PrisonVerificationInput, NOW.toISOString()).tier, 3);
});

test("summary counts overdue by tier", () => {
  const s = summariseQueue(seeded(), NOW);
  assert.equal(s.totalByTier.T1, 40);
  assert.equal(s.totalByTier.T2, 82);
  assert.ok(s.overdueByTier.T1 > 0 && s.overdueByTier.T3 > 100);
  assert.equal(s.parkedOrExcluded, 7);
});

// ---- no prison twice in a window ---------------------------------------------------------------

test("12 weeks of Mon/Wed/Fri runs (2 UK + 2 US) never check a prison twice inside its tier interval", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "queue-sim-"));
  const paths = queuePaths(dir, path.join(dir, "working.json"));
  // The repo copy never advances (as on a stale origin/main); only the working copy carries the progress.
  const baseline = seeded();
  fs.mkdirSync(path.dirname(paths.repoPath), { recursive: true });
  fs.writeFileSync(paths.repoPath, JSON.stringify(baseline));
  fs.writeFileSync(paths.workingPath, JSON.stringify(baseline));

  const start = new Date("2026-10-28T09:00:00.000Z");
  const runs: Array<{ at: string; slugs: string[] }> = [];
  for (let week = 0; week < 12; week++) {
    for (const dayOffset of [0, 2, 4]) {
      const now = new Date(start.getTime() + (week * 7 + dayOffset) * 86_400_000);
      let { queue } = loadMergedQueue(paths);
      queue = ensureEntries(queue, inputs, now);
      const picked = [
        ...selectFromQueue({ queue, prisons: inputs, country: "uk", now, limit: 2 }),
        ...selectFromQueue({ queue, prisons: inputs, country: "us", now, limit: 2 }),
      ];
      assert.ok(new Set(picked.map((p) => p.slug)).size === picked.length, "duplicate inside one run");
      for (const p of picked) {
        queue = recordRun(queue, { slug: p.slug, at: now.toISOString(), status: "CURRENT", runStatus: "success", mode: "write", differenceFields: [] });
      }
      saveQueueEverywhere(queue, paths);
      // simulate a fresh checkout of the stale repo copy before the next run
      fs.writeFileSync(paths.repoPath, JSON.stringify(baseline));
      runs.push({ at: now.toISOString(), slugs: picked.map((p) => p.slug) });
    }
  }
  const seen = new Map<string, string[]>();
  for (const r of runs) for (const s of r.slugs) seen.set(s, [...(seen.get(s) ?? []), r.at]);
  assert.equal(runs.length, 36);
  assert.ok(runs.every((r) => r.slugs.length === 4));
  const final = loadMergedQueue(paths).queue;
  for (const [slug, times] of seen) {
    if (times.length < 2) continue;
    const interval = TIER_INTERVAL_DAYS[final.entries[slug].tier];
    for (let i = 1; i < times.length; i++) {
      const gap = (Date.parse(times[i]) - Date.parse(times[i - 1])) / 86_400_000;
      assert.ok(gap >= interval, `${slug} checked twice ${gap}d apart (interval ${interval}d)`);
    }
  }
  // Every slot is used (36 runs x 2 UK + 2 US). US picks are all distinct inside the window; UK picks repeat only
  // after the 30-day tier 1 interval (which the gap check above already enforces).
  assert.equal(Array.from(seen.values()).flat().length, 144);
  const usSeen = Array.from(seen.keys()).filter((slug) => final.entries[slug].country === "us");
  assert.equal(usSeen.length, 72);
});

test("throughput day stats count unique prisons and repeat checks", () => {
  const q = queueOf(
    entry({ slug: "fresh", tier: 1, checkHistory: [check("2026-10-26T09:00:00.000Z")] }),
    entry({ slug: "repeat", tier: 1, checkHistory: [check("2026-10-15T09:00:00.000Z"), check("2026-10-26T09:00:00.000Z")] }),
    entry({ slug: "failed", tier: 2, checkHistory: [check("2026-10-26T09:00:00.000Z", "VERIFICATION_FAILED")] }),
  );
  assert.deepEqual(dayStats(q, "2026-10-26"), { unique: 3, repeats: 1, failed: 1 });
  assert.equal(londonDate("2026-07-01T23:30:00.000Z"), "2026-07-02");
});
