#!/usr/bin/env node
/**
 * One-off seeder for data/verification/queue.json (UK + US).
 *
 * Reads every piece of verification history it can find and builds one queue entry per prison slug. It only
 * ever ADDS: the evidence files are copied (never moved or edited) into data/verification/history/ and each
 * check keeps a note of every source that recorded it. Re-running it overwrites queue.json with a fresh seed,
 * so only run it before the queue has live data (or point --out at a scratch file).
 *
 *   npx tsx scripts/seed-verification-queue.ts [--out=PATH] [--now=ISO] [--no-history-copy]
 */
import fs from "node:fs";
import path from "node:path";
import { prisons } from "@/data/prisons";
import { ukVerificationOverlay } from "@/data/generated/ukVerificationOverlay.generated";
import { usVerificationOverlay } from "@/data/generated/usVerificationOverlay.generated";
import { isExcludedFromUsActiveQueue } from "@/lib/verification/selectPrison";
import {
  PARKED_FLAG,
  QUEUE_RELATIVE_PATH,
  emptyQueue,
  rederive,
  type CheckBasis,
  type CheckRecord,
  type DiscrepancyRecord,
  type QueueEntry,
  type QueueFile,
  type QueueTier,
} from "@/lib/verification/queue";
import type { VerificationStatus } from "@/lib/verification/types";

const ROOT = process.cwd();
const SHARED_CHECKOUT = "/workspace/prisonsonline/data/verification";
const UK_STATE_DIR = "/workspace/uk-verifier-state";
const PV_DIR = "/workspace/prison-verifier";
const CTR_CSV = "/workspace/prisons-ci/ctr_baseline_2026-10-17.csv";
const TIER1_TARGET = 40;

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const NOW_ISO = arg("now") ?? new Date().toISOString();
const OUT = arg("out") ?? path.join(ROOT, QUEUE_RELATIVE_PATH);
const COPY_HISTORY = !process.argv.includes("--no-history-copy");

const BASIS_PRIORITY: Record<CheckBasis, number> = {
  "audit-log": 5,
  "verifier-run": 5,
  "run-report": 4,
  "dry-run-report": 4,
  "state-file": 3,
  "overlay-applied": 2,
  "transcript-run-summary": 1,
};

const seedSources: string[] = [];
const noteSource = (s: string) => seedSources.includes(s) || seedSources.push(s);

type Checks = Map<string, CheckRecord[]>;
const checks: Checks = new Map();
const discrepancies = new Map<string, DiscrepancyRecord[]>();
const flags = new Map<string, Set<string>>();
const addCheck = (slug: string, c: CheckRecord) => checks.set(slug, [...(checks.get(slug) ?? []), c]);
const addDiscrepancy = (slug: string, d: DiscrepancyRecord) => discrepancies.set(slug, [...(discrepancies.get(slug) ?? []), d]);
const addFlag = (slug: string, f: string) => flags.set(slug, (flags.get(slug) ?? new Set()).add(f));

const readIf = (p: string) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : undefined);

// ---- slug universe -------------------------------------------------------------------------------
const inScope = prisons.filter((p) => p.countrySlug === "uk" || p.countrySlug === "us" || p.countrySlug === "united-states");
const bySlug = new Map(inScope.map((p) => [p.slug, p]));
if (bySlug.size !== inScope.length) throw new Error("Duplicate slug across UK/US prisons; the queue is keyed by slug.");

// ---- 1. audit logs -------------------------------------------------------------------------------
interface AuditLike {
  prisonSlug: string;
  verifiedAt: string;
  dryRun?: boolean;
  writesEnabled?: boolean;
  runStatus: string;
  verificationStatus: VerificationStatus;
  differences?: Array<{ field: string; classification?: string }>;
  errors?: string[];
}
function ingestAudit(file: string) {
  const text = readIf(file);
  if (!text) return;
  noteSource(file);
  for (const line of text.split("\n").filter(Boolean)) {
    const a = JSON.parse(line) as AuditLike;
    if (!bySlug.has(a.prisonSlug)) continue;
    const failed = a.runStatus === "failed";
    const status: VerificationStatus = failed ? "VERIFICATION_FAILED" : a.verificationStatus;
    addCheck(a.prisonSlug, {
      at: a.verifiedAt,
      status,
      basis: "audit-log",
      mode: a.writesEnabled && !a.dryRun ? "write" : "dry-run",
      ...(failed && a.errors?.[0] ? { note: a.errors[0] } : {}),
    });
    const fields = (a.differences ?? []).filter((d) => d.classification !== "NO_CHANGE").map((d) => d.field);
    if (status !== "CURRENT") addDiscrepancy(a.prisonSlug, { at: a.verifiedAt, status, fields });
  }
}
ingestAudit(path.join(SHARED_CHECKOUT, "audit.jsonl"));
ingestAudit(path.join(SHARED_CHECKOUT, "us/audit.jsonl"));
ingestAudit(path.join(UK_STATE_DIR, "audit.jsonl"));
ingestAudit(path.join(PV_DIR, "us-audit.jsonl"));

// ---- 2. state files ------------------------------------------------------------------------------
function ingestState(file: string) {
  const text = readIf(file);
  if (!text) return;
  noteSource(file);
  const state = JSON.parse(text) as { prisons: Record<string, { verificationStatus: VerificationStatus; lastVerifiedAt?: string }> };
  for (const [slug, row] of Object.entries(state.prisons)) {
    if (!bySlug.has(slug) || !row.lastVerifiedAt) continue;
    addCheck(slug, { at: row.lastVerifiedAt, status: row.verificationStatus, basis: "state-file", mode: "unknown" });
    if (row.verificationStatus !== "CURRENT") addDiscrepancy(slug, { at: row.lastVerifiedAt, status: row.verificationStatus, fields: [] });
  }
}
ingestState(path.join(SHARED_CHECKOUT, "state.json"));
ingestState(path.join(SHARED_CHECKOUT, "us/state.json"));
ingestState(path.join(UK_STATE_DIR, "state.json"));
ingestState(path.join(PV_DIR, "us-verifier-state.json"));

// ---- 3. markdown run reports ---------------------------------------------------------------------
const OMITTED_FIELDS = new Set(["address", "postcode", "phone", "email"]);
function ingestReport(file: string, basis: "dry-run-report" | "run-report") {
  const text = readIf(file);
  if (!text) return;
  noteSource(file);
  let generated: string | undefined;
  let mode: CheckRecord["mode"] = "unknown";
  let slug: string | undefined;
  let status: VerificationStatus | undefined;
  let fieldDiffs: string[] = [];
  const flush = () => {
    if (slug && status && generated && bySlug.has(slug)) {
      addCheck(slug, { at: generated, status, basis, mode });
      if (status !== "CURRENT") addDiscrepancy(slug, { at: generated, status, fields: fieldDiffs });
    }
    slug = undefined;
    status = undefined;
    fieldDiffs = [];
  };
  for (const line of text.split("\n")) {
    const gen = line.match(/^Generated: (\S+)/);
    if (gen) {
      flush();
      generated = gen[1];
      mode = "unknown";
      continue;
    }
    const m = line.match(/^Mode: \*\*(dry-run|write)\*\*/);
    if (m) {
      mode = m[1] as CheckRecord["mode"];
      continue;
    }
    const head = line.match(/^## .*\(`([a-z0-9-]+)`\)/);
    if (head) {
      flush();
      slug = head[1];
      continue;
    }
    if (!slug) continue;
    const st = line.match(/^- Run status: \w+ \/ (\w+)/);
    if (st) status = st[1] as VerificationStatus;
    const f = line.match(/^- (\w+): (SAFE_AUTO_CHANGE|REVIEW_REQUIRED|NO_CHANGE|NO_SOURCE_VALUE) (.*)$/);
    if (!f) continue;
    const [, field, cls, rest] = f;
    if (cls === "SAFE_AUTO_CHANGE" || cls === "REVIEW_REQUIRED") fieldDiffs.push(field);
    if (cls === "NO_CHANGE" && rest.includes("official=(omitted)") && OMITTED_FIELDS.has(field)) addFlag(slug, `source-omits:${field}`);
    if (field === "visitingHours" && cls === "NO_SOURCE_VALUE") addFlag(slug, "visiting-hours-no-structured-source");
    if (field === "category" && cls === "REVIEW_REQUIRED" && rest.includes('current="Medium"') && rest.includes('official="Low"')) {
      addFlag(slug, "category-conflict:site-Medium-vs-bop-Low");
    }
  }
  flush();
}
const reportsDir = path.join(ROOT, "data/verification/reports");
ingestReport(path.join(reportsDir, "PHASE1_DRY_RUN.md"), "dry-run-report");
ingestReport(path.join(reportsDir, "PHASE1_US_DRY_RUN.md"), "dry-run-report");
ingestReport("/workspace/uk-verifier-run-2026-10-19.md", "run-report");
ingestReport("/workspace/uk-verifier-run-2026-10-21.md", "run-report");
ingestReport(path.join(SHARED_CHECKOUT, "us/reports/run-2026-10-19T08-19-09-909Z.md"), "run-report");
ingestReport("/workspace/prison-verifier-run-2026-10-26.md", "run-report");

// COMPLETENESS_DRY_RUN.md: "| slug | UK/US | STATUS |" rows under "Per-row VERIFY status", generated 2026-09-17 09:22:20 UTC.
{
  const file = path.join(reportsDir, "COMPLETENESS_DRY_RUN.md");
  const text = readIf(file);
  if (text) {
    noteSource(file);
    for (const m of text.matchAll(/^\| ([a-z0-9-]+) \| (?:UK|US) \| (CURRENT|CHANGED|REVIEW_REQUIRED) \|$/gm)) {
      if (!bySlug.has(m[1])) continue;
      const at = "2026-09-17T09:22:20.000Z";
      addCheck(m[1], { at, status: m[2] as VerificationStatus, basis: "dry-run-report", mode: "dry-run", note: "completeness dry-run VERIFY row" });
      if (m[2] !== "CURRENT") addDiscrepancy(m[1], { at, status: m[2] as VerificationStatus, fields: [] });
    }
  }
}

// ---- 4. transcript run summaries (UK routine, 09:00 London = 08:00Z in BST) -----------------------
// Source: the routine's own per-run summaries (Prison Verifier transcript digest, /workspace/fleet/_pv_dedup.txt).
// Times are the schedule slot, not measured, so they are marked estimated. All runs had writes on.
const UK_ROUTINE_RUNS: Array<{ at: string; slugs: string[]; changed?: Record<string, string[]> }> = [
  { at: "2026-09-18T08:00:00.000Z", slugs: ["hmp-ashfield", "hmp-birmingham"], changed: { "hmp-birmingham": ["phone"] } },
  { at: "2026-09-21T08:00:00.000Z", slugs: ["hmp-bristol", "hmp-brixton"] },
  { at: "2026-09-23T08:00:00.000Z", slugs: ["hmp-buckley-hall", "hmp-bure"] },
  { at: "2026-09-25T08:00:00.000Z", slugs: ["hmp-cardiff", "hmp-channings-wood"] },
  { at: "2026-09-28T08:00:00.000Z", slugs: ["hmp-ashfield", "hmp-bedford"] },
  { at: "2026-09-30T08:00:00.000Z", slugs: ["hmp-belmarsh", "hmp-berwyn"] },
  { at: "2026-10-02T08:00:00.000Z", slugs: ["hmp-birmingham", "hmp-bristol"] },
  { at: "2026-10-05T08:00:00.000Z", slugs: ["hmp-brixton", "hmp-buckley-hall"] },
  { at: "2026-10-07T08:00:00.000Z", slugs: ["hmp-bullingdon", "hmp-bure"] },
  { at: "2026-10-09T08:00:00.000Z", slugs: ["hmp-cardiff", "hmp-channings-wood"] },
  { at: "2026-10-12T08:00:00.000Z", slugs: ["hmp-coldingley", "hmp-dartmoor"] },
  { at: "2026-10-14T08:00:00.000Z", slugs: ["hmp-dovegate", "hmp-durham"] },
  { at: "2026-10-16T08:00:00.000Z", slugs: ["hmp-elmley", "hmp-erlestoke"], changed: { "hmp-elmley": ["email"] } },
  { at: "2026-10-19T08:00:00.000Z", slugs: ["hmp-ashfield", "hmp-bedford"] },
  { at: "2026-10-21T08:00:00.000Z", slugs: ["hmp-ashfield", "hmp-bedford"] },
  { at: "2026-10-22T20:10:00.000Z", slugs: ["hmp-belmarsh", "hmp-berwyn"] },
];
noteSource("/workspace/fleet/_pv_dedup.txt (UK routine run summaries 18 Sep - 22 Oct)");
for (const run of UK_ROUTINE_RUNS) {
  for (const slug of run.slugs) {
    const changed = run.changed?.[slug];
    addCheck(slug, {
      at: run.at,
      status: changed ? "CHANGED" : "CURRENT",
      basis: "transcript-run-summary",
      mode: "write",
      note: "time estimated from the 09:00 London routine slot",
    });
    if (changed) addDiscrepancy(slug, { at: run.at, status: "CHANGED", fields: changed });
  }
}

// ---- 5. overlay appliedAt ------------------------------------------------------------------------
interface OverlayEntryLike {
  prisonSlug: string;
  appliedAt: string;
  overrides: Record<string, unknown>;
}
const orphanOverlayKeys: string[] = [];
function ingestOverlay(label: string, entries: Record<string, OverlayEntryLike>) {
  noteSource(`${label} (appliedAt)`);
  const byTime = new Map<string, number>();
  for (const e of Object.values(entries)) byTime.set(e.appliedAt, (byTime.get(e.appliedAt) ?? 0) + 1);
  for (const [key, e] of Object.entries(entries)) {
    if (!bySlug.has(e.prisonSlug)) {
      orphanOverlayKeys.push(key);
      continue;
    }
    const bulk = (byTime.get(e.appliedAt) ?? 0) >= 10;
    addCheck(e.prisonSlug, {
      at: e.appliedAt,
      status: bulk ? "CURRENT" : "CHANGED",
      basis: "overlay-applied",
      mode: "write",
      ...(bulk
        ? { partial: true, note: "bulk bop.gov contact/visiting backfill (email, postal address, visiting rules URL); name, address, phone and category were not re-verified" }
        : {}),
    });
    if (bulk) addFlag(e.prisonSlug, "contact-backfill-only");
    else addDiscrepancy(e.prisonSlug, { at: e.appliedAt, status: "CHANGED", fields: Object.keys(e.overrides) });
  }
}
ingestOverlay("src/data/generated/ukVerificationOverlay.generated.ts", ukVerificationOverlay.entries as never);
ingestOverlay("src/data/generated/usVerificationOverlay.generated.ts", usVerificationOverlay.entries as never);

// ---- 6. dedupe checks (same slug, within 2h, compatible mode: keep the best-evidenced record) -----
function dedupeChecks(list: CheckRecord[]): CheckRecord[] {
  const sorted = [...list].sort((a, b) => BASIS_PRIORITY[b.basis] - BASIS_PRIORITY[a.basis] || Date.parse(a.at) - Date.parse(b.at));
  const kept: CheckRecord[] = [];
  for (const c of sorted) {
    const twin = kept.find(
      (k) =>
        Math.abs(Date.parse(k.at) - Date.parse(c.at)) <= 2 * 3_600_000 &&
        (k.mode === c.mode || k.mode === "unknown" || c.mode === "unknown") &&
        Boolean(k.partial) === Boolean(c.partial),
    );
    if (twin) {
      twin.alsoSeenIn = Array.from(new Set([...(twin.alsoSeenIn ?? []), c.basis]));
      if (c.note && !twin.note) twin.note = c.note;
      continue;
    }
    kept.push({ ...c });
  }
  return kept;
}

// ---- 7. traffic (tier 1 basis) -------------------------------------------------------------------
const traffic = new Map<string, number>();
{
  const csv = readIf(CTR_CSV);
  if (csv) {
    noteSource(`${CTR_CSV} (Bing + GSC impressions, 28d)`);
    const [header, ...rows] = csv.trim().split("\n");
    const cols = header.split(",");
    const iSlug = cols.indexOf("slug");
    const iBing = cols.indexOf("bing_impr_28d");
    const iGsc = cols.indexOf("gsc_impr_28d");
    const iCohort = cols.indexOf("cohort");
    for (const row of rows) {
      const cells = row.split(",");
      if (!cells[iCohort]?.startsWith("uk_")) continue;
      const slug = cells[iSlug].replace(/\/contact-details$/, "");
      traffic.set(slug, (traffic.get(slug) ?? 0) + (Number(cells[iBing]) || 0) + (Number(cells[iGsc]) || 0));
    }
  }
}

// ---- 8. hand-curated flags from the 23 Oct US handoff and verifier notes -------------------------
const SAM_DECISION_SECURITY = ["ashland-fci", "atlanta-fci", "bastrop-fci", "beaumont-low-fci", "aliceville-fci", "danbury-fci", "big-spring-fci"];
for (const slug of SAM_DECISION_SECURITY) {
  addFlag(slug, PARKED_FLAG);
  addFlag(slug, "sam-decision:security-level-policy (site Medium vs bop.gov Low)");
}
addFlag("big-sandy-usp", PARKED_FLAG);
addFlag("big-sandy-usp", "bop-lists-separate-camp-mail-address");
addFlag("guaynabo-mdc", PARKED_FLAG);
addFlag("guaynabo-mdc", "bop-postal-address-state-RQ");
addFlag("terminal-island-fci", PARKED_FLAG);
addFlag("terminal-island-fci", "closure-official-source-pending");
addFlag("florence-admax-usp", "legacy-slug-adx-florence-301-check-pending");
addFlag("terminal-island-fci", "bop-directory-no-unique-match");
addFlag("dublin-fci", "bop-directory-no-unique-match");
addFlag("hmp-dartmoor", "operating-status-review-open");
addFlag("hmp-dovegate", "source-omits:address");
addFlag("hmp-dovegate", "source-omits:postcode");
addFlag("hmp-dovegate", "source-omits:phone");
// Past discrepancies found outside a verifier run (PR #74 address fix, address typo PRs).
addDiscrepancy("hmp-preston", { at: "2026-10-17T20:00:00.000Z", status: "CHANGED", fields: ["address"], note: "Preston address fix (PR #74)" });
addDiscrepancy("hmp-holme-house", { at: "2026-10-05T00:00:00.000Z", status: "CHANGED", fields: ["address"], note: "address typo corrected (addr-sitemap PR)" });
addDiscrepancy("hmyoi-cookham-wood", { at: "2026-10-05T00:00:00.000Z", status: "CHANGED", fields: ["address"], note: "address typo corrected (addr-sitemap PR)" });

// ---- 9. tiers -------------------------------------------------------------------------------------
const ukPrisons = inScope.filter((p) => p.countrySlug === "uk");
const catA = new Set(ukPrisons.filter((p) => /category a/i.test(p.securityLevel ?? "") || /high security/i.test(String(p.type ?? ""))).map((p) => p.slug));
const hasDiscrepancy = (slug: string) => (discrepancies.get(slug) ?? []).length > 0;
const tier1Reason = new Map<string, string>();
for (const slug of catA) tier1Reason.set(slug, "Cat A / high security");
for (const p of ukPrisons) {
  if (hasDiscrepancy(p.slug) && !tier1Reason.has(p.slug)) tier1Reason.set(p.slug, "past discrepancy (CHANGED / REVIEW_REQUIRED / correction)");
}
for (const p of ukPrisons) {
  if ((flags.get(p.slug) ?? new Set()).has("operating-status-review-open") && !tier1Reason.has(p.slug)) tier1Reason.set(p.slug, "open operating-status review");
}
const ranked = [...ukPrisons].sort((a, b) => (traffic.get(b.slug) ?? 0) - (traffic.get(a.slug) ?? 0) || a.slug.localeCompare(b.slug));
const trafficRank = new Map(ranked.map((p, i) => [p.slug, i + 1] as const));
const mandatory = tier1Reason.size;
for (const p of ranked) {
  if (tier1Reason.size >= TIER1_TARGET) break;
  if (!tier1Reason.has(p.slug) && (traffic.get(p.slug) ?? 0) > 0) tier1Reason.set(p.slug, "high traffic");
}

// ---- 10. build entries ---------------------------------------------------------------------------
const legacyUsNotes: Record<string, { selection: "manual-only" | "excluded"; flags: string[]; basis: string }> = {
  alcatraz: { selection: "excluded", flags: ["historical-museum-site"], basis: "legacy US profile: historical / museum, no live facility to verify" },
  "fci-terminal-island": {
    selection: "excluded",
    flags: ["duplicate-of:terminal-island-fci", "closure-official-source-pending"],
    basis: "legacy US profile: duplicate of BOP-import terminal-island-fci, which stays in the queue",
  },
  "san-quentin": { selection: "manual-only", flags: ["state-doc-source-not-automatable", "cdcr-403-from-box", "published-security-level-capacity-mismatch"], basis: "legacy US profile: state prison, verifier cannot extract state HTML (always REVIEW_REQUIRED)" },
  "folsom-state-prison": { selection: "manual-only", flags: ["state-doc-source-not-automatable", "cdcr-403-from-box"], basis: "legacy US profile: state prison, verifier cannot extract state HTML (always REVIEW_REQUIRED)" },
  angola: { selection: "manual-only", flags: ["state-doc-source-not-automatable", "official-rules-link-404"], basis: "legacy US profile: state prison, verifier cannot extract state HTML (always REVIEW_REQUIRED)" },
  "sing-sing": { selection: "manual-only", flags: ["state-doc-source-not-automatable"], basis: "legacy US profile: state prison, verifier cannot extract state HTML (always REVIEW_REQUIRED)" },
  "rikers-island": { selection: "manual-only", flags: ["state-doc-source-not-automatable"], basis: "legacy US profile: city jail, verifier cannot extract city DOC HTML (always REVIEW_REQUIRED)" },
};

const entries: Record<string, QueueEntry> = {};
for (const p of inScope) {
  const country = p.countrySlug === "uk" ? "uk" : "us";
  const legacy = p.countrySlug === "united-states" ? legacyUsNotes[p.slug] : undefined;
  let tier: QueueTier;
  let tierBasis: string;
  let selection: QueueEntry["selection"] = "auto";
  if (country === "uk") {
    const reason = tier1Reason.get(p.slug);
    tier = reason ? 1 : 2;
    tierBasis = reason
      ? `${reason}${traffic.has(p.slug) ? `; ${traffic.get(p.slug)} impressions/28d (Bing+GSC, rank ${trafficRank.get(p.slug)})` : ""}`
      : `other UK prison${traffic.has(p.slug) ? `; ${traffic.get(p.slug)} impressions/28d (rank ${trafficRank.get(p.slug)})` : "; no impressions recorded"}`;
  } else {
    tier = 3;
    tierBasis = legacy?.basis ?? "US federal (BOP import), 90-day recheck";
    if (legacy) {
      selection = legacy.selection;
      for (const f of legacy.flags) addFlag(p.slug, f);
    }
    if (!legacy && isExcludedFromUsActiveQueue({ slug: p.slug, operator: p.operator, facilityType: (p as { facilityType?: string }).facilityType ?? (p as { type?: string }).type })) {
      selection = "excluded";
    }
  }
  const history = dedupeChecks(checks.get(p.slug) ?? []);
  const base: QueueEntry = {
    slug: p.slug,
    country,
    countrySlug: p.countrySlug as QueueEntry["countrySlug"],
    tier,
    tierBasis,
    selection,
    lastVerified: null,
    lastAttempt: null,
    nextDue: NOW_ISO,
    status: "UNVERIFIED",
    discrepancyHistory: dedupeDiscrepancies(discrepancies.get(p.slug) ?? []),
    dataReliabilityFlags: Array.from(flags.get(p.slug) ?? []).sort(),
    checkHistory: history,
  };
  entries[p.slug] = rederive(base);
}

function dedupeDiscrepancies(list: DiscrepancyRecord[]): DiscrepancyRecord[] {
  const out: DiscrepancyRecord[] = [];
  for (const d of [...list].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
    const dup = out.find((o) => o.status === d.status && Math.abs(Date.parse(o.at) - Date.parse(d.at)) <= 2 * 3_600_000);
    if (dup) {
      dup.fields = Array.from(new Set([...dup.fields, ...d.fields])).sort();
      if (d.note && !dup.note) dup.note = d.note;
    } else out.push({ ...d, fields: [...d.fields].sort() });
  }
  return out;
}

const queue: QueueFile = {
  ...emptyQueue(NOW_ISO),
  seedSources,
  entries: Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b))),
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(queue, null, 2)}\n`, "utf8");

// ---- 11. copy the evidence (never move or edit) -------------------------------------------------
if (COPY_HISTORY) {
  const histDir = path.join(path.dirname(OUT), "history");
  fs.mkdirSync(histDir, { recursive: true });
  const copies: Array<[string, string]> = [
    [path.join(SHARED_CHECKOUT, "audit.jsonl"), "uk-audit-shared-checkout.jsonl"],
    [path.join(UK_STATE_DIR, "audit.jsonl"), "uk-audit-uk-verifier-state.jsonl"],
    [path.join(SHARED_CHECKOUT, "us/audit.jsonl"), "us-audit-shared-checkout.jsonl"],
    [path.join(SHARED_CHECKOUT, "state.json"), "uk-state-shared-checkout.json"],
    [path.join(UK_STATE_DIR, "state.json"), "uk-state-uk-verifier-state.json"],
    [path.join(SHARED_CHECKOUT, "us/state.json"), "us-state-shared-checkout.json"],
    [path.join(PV_DIR, "us-verifier-state.json"), "us-state-prison-verifier.json"],
    [path.join(PV_DIR, "us-next-slugs.txt"), "us-next-slugs.retired.txt"],
    ["/workspace/uk-verifier-run-2026-10-19.md", "run-uk-2026-10-19.md"],
    ["/workspace/uk-verifier-run-2026-10-21.md", "run-uk-2026-10-21.md"],
    [path.join(SHARED_CHECKOUT, "us/reports/run-2026-10-19T08-19-09-909Z.md"), "run-us-2026-10-19.md"],
    ["/workspace/prison-verifier-run-2026-10-26.md", "run-combined-2026-10-26.md"],
  ];
  for (const [src, name] of copies) if (fs.existsSync(src)) fs.copyFileSync(src, path.join(histDir, name));
  const lines = ["slug,impressions_28d_bing_plus_gsc,rank,tier,tier_basis"];
  for (const p of ranked) {
    const e = entries[p.slug];
    lines.push(`${p.slug},${traffic.get(p.slug) ?? 0},${trafficRank.get(p.slug)},${e.tier},"${e.tierBasis.replace(/"/g, "'")}"`);
  }
  fs.writeFileSync(path.join(histDir, "uk-tier-basis-traffic-2026-10-26.csv"), `${lines.join("\n")}\n`, "utf8");
}

// ---- summary -------------------------------------------------------------------------------------
const all = Object.values(queue.entries);
const count = (f: (e: QueueEntry) => boolean) => all.filter(f).length;
process.stdout.write(
  `Seeded ${all.length} entries (UK ${count((e) => e.country === "uk")}, US ${count((e) => e.country === "us")}) -> ${OUT}\n` +
    `Tier 1 mandatory (Cat A / discrepancy / status review): ${mandatory}; tier 1 total ${count((e) => e.tier === 1 && e.country === "uk")}\n` +
    `Tier 2 ${count((e) => e.tier === 2)}, tier 3 auto ${count((e) => e.tier === 3 && e.selection === "auto")}, manual-only ${count((e) => e.selection === "manual-only")}, excluded ${count((e) => e.selection === "excluded")}\n` +
    `Fully verified (lastVerified set): UK ${count((e) => e.country === "uk" && !!e.lastVerified)}, US ${count((e) => e.country === "us" && !!e.lastVerified)}\n` +
    `Orphan overlay keys (no profile): ${orphanOverlayKeys.join(", ") || "none"}\n`,
);
process.stdout.write(`Tier 1 UK: ${all.filter((e) => e.tier === 1 && e.country === "uk").map((e) => e.slug).join(", ")}\n`);
