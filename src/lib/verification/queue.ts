/**
 * Persistent verification queue (UK + US), keyed by prison slug.
 *
 * One tracked file (`data/verification/queue.json`) plus a working copy outside the repo
 * (`/workspace/prison-verifier/queue.json`). The repo copy only changes when a PR merges, but runs
 * happen off origin/main, so every run loads BOTH copies, merges per slug and writes the result back
 * to both. Nothing here deletes history: check/discrepancy histories and flags are only ever unioned.
 *
 * The derived fields (lastVerified, lastAttempt, status, nextDue) are pure functions of
 * checkHistory + tier + flags, so a merge can never leave them disagreeing with the history.
 */
import fs from "node:fs";
import path from "node:path";
import type { PrisonStateRecord, PrisonVerificationInput, VerificationStatus } from "./types";
import { CURRENT_INTERVAL_DAYS, RETRY_INTERVAL_DAYS } from "./types";
import { isExcludedFromUsActiveQueue, isUkPrison, isUsPrison } from "./selectPrison";

export const QUEUE_VERSION = 1;
export const QUEUE_RELATIVE_PATH = "data/verification/queue.json";
export const DEFAULT_WORKING_QUEUE_PATH = "/workspace/prison-verifier/queue.json";
export const WORKING_QUEUE_ENV = "PRISON_VERIFIER_QUEUE_PATH";

export type QueueTier = 1 | 2 | 3;
export type QueueCountry = "uk" | "us";
/** auto = picked by the selectors; manual-only = only via --slugs; excluded = never checked (kept for the record). */
export type QueueSelection = "auto" | "manual-only" | "excluded";

/** Tier 1 30d (high-traffic / sensitive / past discrepancies), tier 2 60d (other UK), tier 3 90d (US). */
export const TIER_INTERVAL_DAYS: Readonly<Record<QueueTier, number>> = { 1: 30, 2: 60, 3: 90 };

/** Flag for records whose open REVIEW_REQUIRED item is waiting on a human decision (reported by queue-status). */
export const PARKED_FLAG = "parked-sam-decision";

export type CheckBasis =
  | "verifier-run"
  | "audit-log"
  | "state-file"
  | "dry-run-report"
  | "run-report"
  | "overlay-applied"
  | "transcript-run-summary";

export interface CheckRecord {
  at: string;
  status: VerificationStatus;
  basis: CheckBasis;
  mode: "dry-run" | "write" | "unknown";
  /** True when the record is NOT a full verifier pass (e.g. the bulk bop.gov contact backfill). Never counts as lastVerified. */
  partial?: boolean;
  /** Other evidence sources that recorded the same check (merged at seed time). */
  alsoSeenIn?: string[];
  note?: string;
}

export interface DiscrepancyRecord {
  at: string;
  status: VerificationStatus;
  fields: string[];
  note?: string;
}

export interface QueueEntry {
  slug: string;
  country: QueueCountry;
  countrySlug: "uk" | "us" | "united-states";
  tier: QueueTier;
  tierBasis: string;
  selection: QueueSelection;
  /** Last successful, non-partial verifier pass (ISO) or null when never fully verified. */
  lastVerified: string | null;
  /** Last attempt of any kind, including failures (ISO) or null. */
  lastAttempt: string | null;
  nextDue: string | null;
  status: VerificationStatus;
  lastSourceUrl?: string;
  /** GOV.UK public_updated_at last seen for the page (UK), used for the change-driven recheck. */
  sourceUpdatedAt?: string | null;
  discrepancyHistory: DiscrepancyRecord[];
  dataReliabilityFlags: string[];
  checkHistory: CheckRecord[];
}

export interface QueueFile {
  version: number;
  /** Seed time. Constant after seeding so concurrent PRs do not conflict on a top-level timestamp. */
  generatedAt: string;
  intervalsDays: Record<string, number>;
  seedSources?: string[];
  entries: Record<string, QueueEntry>;
}

const DAY_MS = 86_400_000;

export function addDaysIso(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY_MS).toISOString();
}

export function countryOf(prison: Pick<PrisonVerificationInput, "countrySlug">): QueueCountry {
  return isUkPrison(prison) ? "uk" : "us";
}

export function emptyQueue(generatedAt: string): QueueFile {
  return {
    version: QUEUE_VERSION,
    generatedAt,
    intervalsDays: { tier1: 30, tier2: 60, tier3: 90, retryAfterFailure: RETRY_INTERVAL_DAYS },
    entries: {},
  };
}

function isCountedVerification(check: CheckRecord): boolean {
  return !check.partial && check.status !== "VERIFICATION_FAILED";
}

function maxAt(values: Array<string | undefined | null>): string | null {
  let best: string | null = null;
  for (const v of values) {
    if (!v) continue;
    if (best === null || Date.parse(v) > Date.parse(best)) best = v;
  }
  return best;
}

export function sortChecks(checks: CheckRecord[]): CheckRecord[] {
  return [...checks].sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.basis.localeCompare(b.basis));
}

/**
 * Days until the next check. A failed attempt retries after a day; everything else (CURRENT, CHANGED and
 * REVIEW_REQUIRED) waits for the tier interval, so an unresolved review item cannot loop through the daily slots.
 * Past discrepancies instead raise its place in the overdue order.
 */
export function intervalDaysFor(entry: Pick<QueueEntry, "tier" | "status" | "dataReliabilityFlags">): number {
  if (entry.status === "VERIFICATION_FAILED") return RETRY_INTERVAL_DAYS;
  return TIER_INTERVAL_DAYS[entry.tier] ?? CURRENT_INTERVAL_DAYS;
}

/**
 * Recompute lastVerified / lastAttempt / status / nextDue from the history. Never-checked entries keep their
 * stored nextDue (the seed time) so they stay due.
 */
export function rederive(entry: QueueEntry): QueueEntry {
  const checks = sortChecks(entry.checkHistory);
  // Partial records (bulk contact backfill) are evidence, but never a verification or an attempt.
  const real = checks.filter((c) => !c.partial);
  const lastVerified = maxAt(real.filter(isCountedVerification).map((c) => c.at));
  const lastAttempt = maxAt(real.map((c) => c.at));
  const latest = real.length ? real[real.length - 1] : undefined;
  const status: VerificationStatus = latest ? latest.status : "UNVERIFIED";
  const next: QueueEntry = { ...entry, checkHistory: checks, lastVerified, lastAttempt, status };
  if (entry.selection !== "auto") {
    return { ...next, nextDue: null };
  }
  if (latest && lastAttempt) {
    // A failed attempt is retried one day after the attempt; anything else is lastVerified + interval.
    const basis = status === "VERIFICATION_FAILED" ? lastAttempt : (lastVerified ?? lastAttempt);
    return { ...next, nextDue: addDaysIso(basis, intervalDaysFor(next)) };
  }
  return next;
}

function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

const checkKey = (c: CheckRecord) => `${c.at}|${c.basis}|${c.status}|${c.mode}|${c.partial ? "p" : ""}`;
const discrepancyKey = (d: DiscrepancyRecord) => `${d.at}|${d.status}|${[...d.fields].sort().join(",")}`;

function mergeEntry(repo: QueueEntry | undefined, working: QueueEntry | undefined): QueueEntry {
  if (!repo && working) return rederive(structuredClone(working));
  if (repo && !working) return rederive(structuredClone(repo));
  const a = repo as QueueEntry;
  const b = working as QueueEntry;
  const aLast = a.lastVerified ? Date.parse(a.lastVerified) : -1;
  const bLast = b.lastVerified ? Date.parse(b.lastVerified) : -1;
  const aAttempt = a.lastAttempt ? Date.parse(a.lastAttempt) : -1;
  const bAttempt = b.lastAttempt ? Date.parse(b.lastAttempt) : -1;
  // Winner = latest lastVerified, then latest attempt, then the working copy (it is written after every run).
  const winner = aLast !== bLast ? (aLast > bLast ? a : b) : aAttempt !== bAttempt ? (aAttempt > bAttempt ? a : b) : b;
  const sourceUpdatedAt = maxAt([a.sourceUpdatedAt, b.sourceUpdatedAt]);
  const merged: QueueEntry = {
    ...structuredClone(winner),
    // Curated, PR-reviewed fields come from the repo copy.
    tier: a.tier,
    tierBasis: a.tierBasis,
    selection: a.selection,
    sourceUpdatedAt,
    lastSourceUrl: winner.lastSourceUrl ?? a.lastSourceUrl ?? b.lastSourceUrl,
    discrepancyHistory: dedupeBy([...a.discrepancyHistory, ...b.discrepancyHistory], discrepancyKey).sort(
      (x, y) => Date.parse(x.at) - Date.parse(y.at),
    ),
    dataReliabilityFlags: Array.from(new Set([...a.dataReliabilityFlags, ...b.dataReliabilityFlags])).sort(),
    checkHistory: dedupeBy([...a.checkHistory, ...b.checkHistory], checkKey),
    nextDue: winner.nextDue,
  };
  if (!merged.checkHistory.some((c) => !c.partial)) {
    // Never checked on either side: keep the earlier seed due date.
    const due = [a.nextDue, b.nextDue].filter(Boolean) as string[];
    merged.nextDue = due.length ? due.sort()[0] : null;
  }
  return rederive(merged);
}

/** Merge the committed queue with the working copy, per slug. Histories and flags are unioned, never dropped. */
export function mergeQueues(repo: QueueFile | undefined, working: QueueFile | undefined): QueueFile {
  if (!repo && !working) throw new Error("mergeQueues needs at least one queue");
  const base = repo ?? (working as QueueFile);
  const slugs = new Set<string>([...Object.keys(repo?.entries ?? {}), ...Object.keys(working?.entries ?? {})]);
  const entries: Record<string, QueueEntry> = {};
  for (const slug of Array.from(slugs).sort()) {
    entries[slug] = mergeEntry(repo?.entries[slug], working?.entries[slug]);
  }
  return {
    version: base.version,
    generatedAt: base.generatedAt,
    intervalsDays: base.intervalsDays,
    ...(base.seedSources ? { seedSources: base.seedSources } : {}),
    entries,
  };
}

export function parseQueueFile(raw: unknown, label = "queue"): QueueFile {
  const rec = raw as Partial<QueueFile> | null;
  if (!rec || typeof rec !== "object" || typeof rec.entries !== "object" || rec.entries === null) {
    throw new Error(`${label}: not a valid verification queue (missing entries).`);
  }
  if (rec.version !== QUEUE_VERSION) {
    throw new Error(`${label}: unsupported queue version ${String(rec.version)} (expected ${QUEUE_VERSION}).`);
  }
  for (const [slug, entry] of Object.entries(rec.entries)) {
    const e = entry as Partial<QueueEntry>;
    if (e.slug !== slug || !e.tier || !e.selection || !Array.isArray(e.checkHistory) || !Array.isArray(e.dataReliabilityFlags) || !Array.isArray(e.discrepancyHistory)) {
      throw new Error(`${label}: entry "${slug}" is malformed.`);
    }
  }
  return rec as QueueFile;
}

function readQueueIfPresent(filePath: string): QueueFile | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  return parseQueueFile(JSON.parse(fs.readFileSync(filePath, "utf8")), filePath);
}

export function resolveWorkingQueuePath(flag?: string, env: NodeJS.ProcessEnv = process.env): string {
  return flag || env[WORKING_QUEUE_ENV] || DEFAULT_WORKING_QUEUE_PATH;
}

export interface QueuePaths {
  repoPath: string;
  workingPath: string;
}

export function queuePaths(root: string, workingFlag?: string, env: NodeJS.ProcessEnv = process.env): QueuePaths {
  return { repoPath: path.join(root, QUEUE_RELATIVE_PATH), workingPath: resolveWorkingQueuePathSafe(workingFlag, env) };
}

function resolveWorkingQueuePathSafe(flag: string | undefined, env: NodeJS.ProcessEnv): string {
  return path.resolve(resolveWorkingQueuePath(flag, env));
}

/**
 * Load repo + working copy and merge. Fails closed when neither exists: the selectors never silently fall back
 * to alphabetical order (that is what caused the repeat checks this queue replaces).
 */
export function loadMergedQueue(paths: QueuePaths): { queue: QueueFile; repoFound: boolean; workingFound: boolean } {
  const repo = readQueueIfPresent(paths.repoPath);
  const working = readQueueIfPresent(paths.workingPath);
  if (!repo && !working) {
    throw new Error(
      `No verification queue found (looked at ${paths.repoPath} and ${paths.workingPath}). Refusing to fall back to alphabetical selection; seed it with scripts/seed-verification-queue.ts.`,
    );
  }
  return { queue: mergeQueues(repo, working), repoFound: Boolean(repo), workingFound: Boolean(working) };
}

function writeAtomic(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, filePath);
}

/** Write the merged queue to the worktree copy AND the working copy. */
export function saveQueueEverywhere(queue: QueueFile, paths: QueuePaths): void {
  writeAtomic(paths.repoPath, queue);
  writeAtomic(paths.workingPath, queue);
}

// ---------------------------------------------------------------------------------------------
// Entries for prisons that exist on the site but not (yet) in the queue.

export function defaultEntryFor(prison: PrisonVerificationInput, nowIso: string): QueueEntry {
  const country = countryOf(prison);
  const excluded = country === "us" && isExcludedFromUsActiveQueue(prison);
  return {
    slug: prison.slug,
    country,
    countrySlug: prison.countrySlug as QueueEntry["countrySlug"],
    tier: country === "uk" ? 2 : 3,
    tierBasis: "default (added after the queue was seeded)",
    selection: excluded ? "excluded" : "auto",
    lastVerified: null,
    lastAttempt: null,
    nextDue: excluded ? null : nowIso,
    status: "UNVERIFIED",
    discrepancyHistory: [],
    dataReliabilityFlags: ["added-after-seed"],
    checkHistory: [],
  };
}

/** Add default entries for site prisons the queue does not know. Existing entries are untouched. */
export function ensureEntries(queue: QueueFile, prisons: PrisonVerificationInput[], now: Date): QueueFile {
  const next = structuredClone(queue);
  for (const prison of prisons) {
    if (!isUkPrison(prison) && !isUsPrison(prison)) continue;
    if (!next.entries[prison.slug]) next.entries[prison.slug] = defaultEntryFor(prison, now.toISOString());
  }
  next.entries = Object.fromEntries(Object.entries(next.entries).sort(([x], [y]) => x.localeCompare(y)));
  return next;
}

// ---------------------------------------------------------------------------------------------
// Selection

export interface SourceUpdates {
  /** slug -> GOV.UK public_updated_at (ISO). */
  [slug: string]: string | undefined;
}

export function isSourceChanged(entry: QueueEntry, sourceUpdatedAt?: string | null): boolean {
  const seen = sourceUpdatedAt ?? entry.sourceUpdatedAt ?? null;
  if (!seen || !entry.lastVerified) return false;
  return Date.parse(seen) > Date.parse(entry.lastVerified);
}

/**
 * Due when nextDue has passed. Tier 2 (other UK) is also due early when GOV.UK republished the page after
 * lastVerified. Excluded and manual-only entries are never auto-selected.
 */
export function isDue(entry: QueueEntry, now: Date, sourceUpdatedAt?: string | null): boolean {
  if (entry.selection !== "auto") return false;
  if (entry.lastVerified === null && entry.lastAttempt === null) return true;
  if (entry.nextDue && Date.parse(entry.nextDue) <= now.getTime()) return true;
  return entry.tier === 2 && isSourceChanged(entry, sourceUpdatedAt);
}

export function overdueDays(entry: QueueEntry, now: Date): number {
  if (!entry.nextDue) return 0;
  return Math.max(0, Math.floor((now.getTime() - Date.parse(entry.nextDue)) / DAY_MS));
}

function negativeDiscrepancyCount(entry: QueueEntry): number {
  return entry.discrepancyHistory.length;
}

/** Priority: tier, oldest successful verification (never = first), source change, past discrepancies, missing/unreliable data. */
export function compareOverdue(
  a: QueueEntry,
  b: QueueEntry,
  updates: SourceUpdates = {},
): number {
  if (a.tier !== b.tier) return a.tier - b.tier;
  const aLast = a.lastVerified ? Date.parse(a.lastVerified) : 0;
  const bLast = b.lastVerified ? Date.parse(b.lastVerified) : 0;
  if (aLast !== bLast) return aLast - bLast;
  // Both never fully verified: entries with no partial (backfill) evidence first.
  if (!a.lastVerified && !b.lastVerified) {
    const aPartial = maxAt(a.checkHistory.filter((c) => c.partial).map((c) => c.at));
    const bPartial = maxAt(b.checkHistory.filter((c) => c.partial).map((c) => c.at));
    const aP = aPartial ? Date.parse(aPartial) : 0;
    const bP = bPartial ? Date.parse(bPartial) : 0;
    if (aP !== bP) return aP - bP;
  }
  const aChanged = isSourceChanged(a, updates[a.slug]) ? 1 : 0;
  const bChanged = isSourceChanged(b, updates[b.slug]) ? 1 : 0;
  if (aChanged !== bChanged) return bChanged - aChanged;
  const dis = negativeDiscrepancyCount(b) - negativeDiscrepancyCount(a);
  if (dis !== 0) return dis;
  const flags = b.dataReliabilityFlags.length - a.dataReliabilityFlags.length;
  if (flags !== 0) return flags;
  return a.slug.localeCompare(b.slug);
}

export function selectFromQueue(input: {
  queue: QueueFile;
  prisons: PrisonVerificationInput[];
  country: QueueCountry;
  now: Date;
  limit: number;
  slugs?: string[];
  sourceUpdates?: SourceUpdates;
}): PrisonVerificationInput[] {
  const inCountry = input.prisons.filter((p) => (input.country === "uk" ? isUkPrison(p) : isUsPrison(p)));
  if (input.slugs?.length) {
    const wanted = new Set(input.slugs);
    return inCountry.filter((p) => wanted.has(p.slug));
  }
  const updates = input.sourceUpdates ?? {};
  const bySlug = new Map(inCountry.map((p) => [p.slug, p] as const));
  const due = Object.values(input.queue.entries)
    .filter((e) => e.country === input.country && bySlug.has(e.slug) && isDue(e, input.now, updates[e.slug]))
    .sort((a, b) => compareOverdue(a, b, updates));
  return due.slice(0, Math.max(0, input.limit)).map((e) => bySlug.get(e.slug) as PrisonVerificationInput);
}

// ---------------------------------------------------------------------------------------------
// Write-back

export interface RunRecord {
  slug: string;
  at: string;
  status: VerificationStatus;
  runStatus: "success" | "failed";
  mode: "dry-run" | "write";
  differenceFields: string[];
  sourceUrl?: string;
  error?: string;
}

/** Record one run against the queue: appends history, then re-derives lastVerified / status / nextDue. */
export function recordRun(queue: QueueFile, run: RunRecord): QueueFile {
  const next = structuredClone(queue);
  const entry = next.entries[run.slug];
  if (!entry) throw new Error(`recordRun: "${run.slug}" is not in the queue (call ensureEntries first).`);
  const status: VerificationStatus = run.runStatus === "failed" ? "VERIFICATION_FAILED" : run.status;
  entry.checkHistory.push({
    at: run.at,
    status,
    basis: "verifier-run",
    mode: run.mode,
    ...(run.error ? { note: run.error } : {}),
  });
  if (status !== "CURRENT" && status !== "UNVERIFIED") {
    entry.discrepancyHistory.push({ at: run.at, status, fields: run.differenceFields, ...(run.error ? { note: run.error } : {}) });
  }
  if (run.sourceUrl) entry.lastSourceUrl = run.sourceUrl;
  next.entries[run.slug] = rederive(entry);
  return next;
}

/** Record the GOV.UK public_updated_at seen this run (UK change-driven recheck). */
export function recordSourceUpdates(queue: QueueFile, updates: SourceUpdates): QueueFile {
  const next = structuredClone(queue);
  for (const [slug, at] of Object.entries(updates)) {
    if (at && next.entries[slug]) next.entries[slug].sourceUpdatedAt = maxAt([next.entries[slug].sourceUpdatedAt, at]);
  }
  return next;
}

// ---------------------------------------------------------------------------------------------
// Status

export interface OverdueSummary {
  overdueByTier: Record<"T1" | "T2" | "T3", number>;
  neverFullyVerifiedByTier: Record<"T1" | "T2" | "T3", number>;
  totalByTier: Record<"T1" | "T2" | "T3", number>;
  sourceChangedDueEarly: number;
  parkedOrExcluded: number;
}

export function summariseQueue(
  queue: QueueFile,
  now: Date,
  opts: { country?: QueueCountry; sourceUpdates?: SourceUpdates } = {},
): OverdueSummary {
  const zero = () => ({ T1: 0, T2: 0, T3: 0 });
  const out: OverdueSummary = {
    overdueByTier: zero(),
    neverFullyVerifiedByTier: zero(),
    totalByTier: zero(),
    sourceChangedDueEarly: 0,
    parkedOrExcluded: 0,
  };
  for (const entry of Object.values(queue.entries)) {
    if (opts.country && entry.country !== opts.country) continue;
    if (entry.selection !== "auto") {
      out.parkedOrExcluded += 1;
      continue;
    }
    const key = `T${entry.tier}` as "T1" | "T2" | "T3";
    out.totalByTier[key] += 1;
    if (!entry.lastVerified) out.neverFullyVerifiedByTier[key] += 1;
    const updates = opts.sourceUpdates?.[entry.slug];
    if (isDue(entry, now, updates)) {
      out.overdueByTier[key] += 1;
      if (!(entry.nextDue && Date.parse(entry.nextDue) <= now.getTime()) && entry.lastVerified) out.sourceChangedDueEarly += 1;
    }
  }
  return out;
}

/** Convert a queue entry to the legacy per-prison state shape (kept so state.json / latest.json stay compatible). */
export function toStateRecord(entry: QueueEntry): PrisonStateRecord {
  return {
    prisonSlug: entry.slug,
    countrySlug: entry.countrySlug,
    verificationStatus: entry.status,
    lastVerifiedAt: entry.lastVerified ?? undefined,
    nextVerificationAt: entry.nextDue ?? undefined,
    lastSourceUrl: entry.lastSourceUrl,
  };
}
