#!/usr/bin/env node
/**
 * Prints overdue counts by tier from the verification queue (merged repo + working copy), and can append one
 * row to the throughput log.
 *
 *   npx tsx scripts/queue-status.ts [--country=uk|us] [--source-changes] [--json] [--next=N]
 *       [--queue-working=PATH]
 *   npx tsx scripts/queue-status.ts --log-row [--date=YYYY-MM-DD] [--processing-seconds=N] [--est-usage=TEXT]
 *       [--log=/workspace/prison-verifier/throughput-log.csv]
 *
 * --source-changes fetches the GOV.UK prisons collection once and counts Tier 2 prisons that are due early because
 * public_updated_at is later than lastVerified.
 */
import fs from "node:fs";
import path from "node:path";
import { prisons } from "@/data/prisons";
import { fetchGovukPrisonsCollection, defaultHttpGet } from "@/lib/verification/govukClient";
import { matchCollectionEntry } from "@/lib/verification/discoverSource";
import {
  TIER_INTERVAL_DAYS,
  compareOverdue,
  isDue,
  loadMergedQueue,
  queuePaths,
  summariseQueue,
  type QueueCountry,
  type QueueEntry,
  type QueueFile,
  type SourceUpdates,
} from "@/lib/verification/queue";
import type { PrisonVerificationInput } from "@/lib/verification/types";

export const THROUGHPUT_HEADER = "date,unique_prisons,repeat_checks,overdue_by_tier,processing_time,failed_runs,estimated_usage,notes";
const DEFAULT_LOG = "/workspace/prison-verifier/throughput-log.csv";
const DAY_MS = 86_400_000;

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const flag = (name: string) => process.argv.includes(`--${name}`);

export function londonDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(d);
}

/** Counts, for one London calendar date: unique prisons checked, repeat checks (previous check was inside the tier interval) and failed runs. */
export function dayStats(queue: QueueFile, date: string): { unique: number; repeats: number; failed: number } {
  let unique = 0;
  let repeats = 0;
  let failed = 0;
  for (const entry of Object.values(queue.entries)) {
    const today = entry.checkHistory.filter((c) => !c.partial && londonDate(c.at) === date);
    if (!today.length) continue;
    unique += 1;
    if (today.some((c) => c.status === "VERIFICATION_FAILED")) failed += 1;
    const first = today[0];
    const previous = entry.checkHistory
      .filter((c) => !c.partial && c.status !== "VERIFICATION_FAILED" && Date.parse(c.at) < Date.parse(first.at) && londonDate(c.at) !== date)
      .at(-1);
    if (previous && Date.parse(first.at) - Date.parse(previous.at) < TIER_INTERVAL_DAYS[entry.tier] * DAY_MS) repeats += 1;
    // two counted checks on the same date is itself a repeat
    if (today.filter((c) => c.status !== "VERIFICATION_FAILED").length > 1) repeats += 1;
  }
  return { unique, repeats, failed };
}

async function sourceUpdatesFor(inputs: PrisonVerificationInput[]): Promise<SourceUpdates> {
  const collection = await fetchGovukPrisonsCollection(defaultHttpGet());
  const out: SourceUpdates = {};
  for (const p of inputs) {
    const hit = matchCollectionEntry(p, collection);
    if (hit?.publicUpdatedAt) out[p.slug] = hit.publicUpdatedAt;
  }
  return out;
}

function toInput(p: (typeof prisons)[number]): PrisonVerificationInput {
  return { slug: p.slug, countrySlug: p.countrySlug, country: p.country, name: p.name, address: p.address, postcode: p.postcode, phone: p.phone, operator: p.operator, securityLevel: p.securityLevel } as PrisonVerificationInput;
}

async function main() {
  const now = new Date(arg("now") ?? Date.now());
  const country = arg("country") as QueueCountry | undefined;
  const { queue } = loadMergedQueue(queuePaths(process.cwd(), arg("queue-working")));
  const sourceUpdates = flag("source-changes") || flag("log-row") ? await sourceUpdatesFor(prisons.filter((p) => p.countrySlug === "uk").map(toInput)).catch((): SourceUpdates => ({})) : ({} as SourceUpdates);
  const summary = summariseQueue(queue, now, { country, sourceUpdates });

  if (flag("log-row")) {
    const date = arg("date") ?? londonDate(now);
    const stats = dayStats(queue, date);
    const overall = summariseQueue(queue, now, { sourceUpdates });
    const row = [
      date,
      stats.unique,
      stats.repeats,
      `T1=${overall.overdueByTier.T1};T2=${overall.overdueByTier.T2};T3=${overall.overdueByTier.T3}`,
      arg("processing-seconds") ? `${arg("processing-seconds")}s` : "n/a",
      stats.failed,
      arg("est-usage") ?? "n/a",
      `"${(arg("notes") ?? "measured from queue").replace(/"/g, "'")}"`,
    ].join(",");
    const logPath = arg("log") ?? DEFAULT_LOG;
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, `${THROUGHPUT_HEADER}\n`, "utf8");
    fs.appendFileSync(logPath, `${row}\n`, "utf8");
    process.stdout.write(`Appended to ${logPath}: ${row}\n`);
    return;
  }

  if (flag("json")) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    return;
  }
  const t = (m: Record<"T1" | "T2" | "T3", number>) => `T1 ${m.T1} / T2 ${m.T2} / T3 ${m.T3}`;
  process.stdout.write(
    [
      `Verification queue at ${now.toISOString()}${country ? ` (${country.toUpperCase()} only)` : ""}`,
      `Overdue by tier:            ${t(summary.overdueByTier)}`,
      `Never fully verified:       ${t(summary.neverFullyVerifiedByTier)}`,
      `Auto-queue size:            ${t(summary.totalByTier)}`,
      `Tier 2 due early (GOV.UK):  ${flag("source-changes") ? summary.sourceChangedDueEarly : "n/a (pass --source-changes)"}`,
      `Manual-only or excluded:    ${summary.parkedOrExcluded}`,
      "",
    ].join("\n"),
  );
  const next = Number(arg("next") ?? 0);
  if (next > 0) {
    const due = Object.values(queue.entries)
      .filter((e: QueueEntry) => (!country || e.country === country) && isDue(e, now, sourceUpdates[e.slug]))
      .sort((a, b) => compareOverdue(a, b, sourceUpdates))
      .slice(0, next);
    process.stdout.write(`Next ${due.length} due:\n${due.map((e) => `  T${e.tier} ${e.country} ${e.slug} (last ${e.lastVerified ?? "never"})`).join("\n")}\n`);
  }
}

if (process.argv[1] && /queue-status\.ts$/.test(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
