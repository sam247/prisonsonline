#!/usr/bin/env node
/**
 * US prison verifier — Phase 1.
 *
 * Default is DRY RUN: identifies the official authority (BOP vs state/local DOC),
 * compares published facts, writes a report, and never mutates production prison data.
 *
 * Writes (facility overlay only) require BOTH:
 *   --write
 *   US_PRISON_VERIFIER_WRITE=1
 */
import fs from "node:fs";
import path from "node:path";
import { prisons } from "@/data/prisons";
import { getFacilityVerification } from "@/data/facilitySources";
import { usVerificationOverlay } from "@/data/generated/usVerificationOverlay.generated";
import type { PrisonVerificationInput } from "@/lib/verification/types";
import {
  ensureEntries,
  loadMergedQueue,
  queuePaths,
  recordRun,
  recordSourceUpdates,
  saveQueueEverywhere,
  selectFromQueue,
  toStateRecord,
  type SourceUpdates,
} from "@/lib/verification/queue";
import { verifyUsPrison, nextUsStateFromResult } from "@/lib/verification/runUsVerification";
import { defaultUsHttpGet, fetchBopLocations } from "@/lib/verification/bopClient";
import { productionUsWritesEnabled, type OverlayStore } from "@/lib/verification/applyChanges";
import { productionUsCompletenessWritesEnabled } from "@/lib/verification/completeness";
import { emptyUsOverlay } from "@/lib/verification/applyChanges";
import {
  US_OVERLAY_JSON_RELATIVE,
  US_OVERLAY_TS_RELATIVE,
  appendAudit,
  defaultUsVerificationDir,
  fileOverlayStore,
  loadState,
  resolveUsOverlayModuleWrite,
  seededOverlayStore,
  saveState,
  upsertPrisonState,
  writeJsonFile,
} from "@/lib/verification/stateStore";
import { buildRunReport, renderCliSummary, renderMarkdownReport } from "@/lib/verification/report";
import { isoNow } from "@/lib/verification/normalize";

function parseArgs(argv: string[]) {
  const slugsFlag = argv.find((arg) => arg.startsWith("--slugs="))?.slice("--slugs=".length);
  const limitFlag = argv.find((arg) => arg.startsWith("--limit="))?.slice("--limit=".length);
  const outFlag = argv.find((arg) => arg.startsWith("--out="))?.slice("--out=".length);
  return {
    writeFlag: argv.includes("--write"),
    completenessWriteFlag: argv.includes("--completeness-write"),
    slugs: slugsFlag ? slugsFlag.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    limit: limitFlag ? Number(limitFlag) : slugsFlag ? 50 : 1,
    outDir: outFlag,
    queueWorking: argv.find((arg) => arg.startsWith("--queue-working="))?.slice("--queue-working=".length),
    noQueueUpdate: argv.includes("--no-queue-update"),
    queueUpdateOnDryRun: argv.includes("--queue-update"),
    help: argv.includes("--help") || argv.includes("-h"),
  };
}

function toInput(prison: (typeof prisons)[number]): PrisonVerificationInput {
  return {
    slug: prison.slug,
    countrySlug: prison.countrySlug,
    country: prison.country,
    institutionalId: prison.institutionalId,
    dataProvenance: prison.dataProvenance,
    name: prison.name,
    address: prison.address,
    postcode: prison.postcode,
    phone: prison.phone,
    operator: prison.operator,
    securityLevel: prison.securityLevel,
    facilityType: prison.facilityType ?? prison.type,
    city: prison.city,
    stateOrRegion: prison.stateOrRegion,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function gatedOverlayStore(enabled: boolean, inner: OverlayStore): OverlayStore {
  return {
    read: () => inner.read(),
    write(file) {
      if (!enabled) {
        throw new Error("Dry-run overlay write blocked.");
      }
      inner.write(file);
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`Usage: npx tsx scripts/verify-us-prisons.ts [options]

Options:
  --limit=N          How many due US prisons to check (default 1; use 10 for a batch dry-run)
  --slugs=a,b,c      Explicit US slugs (ignores due-date selection)
  --write            Apply SAFE_AUTO_CHANGE overlay writes (also requires US_PRISON_VERIFIER_WRITE=1).
                     Covers phone/postcode/email corrections and, for BOP facilities, the
                     contact/visiting blocks (postalAddress, visitingHours, visitingRulesUrl)
                     parsed from the bop.gov facility page, with sources[] + fieldSources provenance.
  --queue-working=P  Working-copy queue (default $PRISON_VERIFIER_QUEUE_PATH or /workspace/prison-verifier/queue.json)
  --no-queue-update  Select from the queue but do not write results back to it
  --queue-update     Also write back after a dry-run (write-mode runs always write back)
  --out=DIR          Report directory (default data/verification/us/reports)
  --help             Show this help

Default mode is dry-run. Dry-run cannot mutate BOP import JSON, generated prison modules, or the live overlay.
Federal facilities use BOP only. State/local facilities use the identified official corrections authority only.
If the authority cannot be identified, the result is REVIEW_REQUIRED — never general web consensus.
`);
    return;
  }

  const completenessWritesEnabled = productionUsCompletenessWritesEnabled({
    writeFlag: args.completenessWriteFlag,
    env: process.env,
  });
  if (args.completenessWriteFlag && !completenessWritesEnabled) {
    process.stderr.write(
      "Ignoring --completeness-write because completeness write env is not '1'. Completeness stays dry-run.\n",
    );
  }
  const writesEnabled = productionUsWritesEnabled({
    writeFlag: args.writeFlag,
    env: process.env,
  });
  if (args.writeFlag && !writesEnabled) {
    process.stderr.write(
      "Ignoring --write because US_PRISON_VERIFIER_WRITE is not '1'. Staying in dry-run.\n",
    );
  }

  const now = new Date();
  const root = process.cwd();
  const verificationDir = defaultUsVerificationDir(root);
  const overlayJsonPath = path.join(root, US_OVERLAY_JSON_RELATIVE);
  const overlayTsPath = path.join(root, US_OVERLAY_TS_RELATIVE);
  // Seed from the committed generated overlay so SAFE entries are merged, never replaced.
  const overlaySeed = structuredClone(usVerificationOverlay);
  const diskStore = seededOverlayStore(fileOverlayStore(overlayJsonPath, emptyUsOverlay()), overlaySeed);
  const overlayStore = gatedOverlayStore(writesEnabled, diskStore);

  const http = defaultUsHttpGet();
  let bopLocations;
  try {
    bopLocations = await fetchBopLocations(http);
  } catch (error) {
    process.stderr.write(
      `Warning: could not load BOP locations directory (${error instanceof Error ? error.message : error}). Federal checks will fail closed.\n`,
    );
  }

  const state = loadState(verificationDir);
  // The queue (data/verification/queue.json merged with the working copy) decides what is due.
  // It fails closed: with no queue at all this throws rather than falling back to an alphabetical list.
  const queuePathSet = queuePaths(root, args.queueWorking);
  const loaded = loadMergedQueue(queuePathSet);
  const allInputs = prisons.map(toInput);
  let queue = ensureEntries(loaded.queue, allInputs, now);
  const selected = selectFromQueue({
    queue,
    prisons: allInputs,
    country: "us",
    now,
    limit: Number.isFinite(args.limit) && args.limit > 0 ? args.limit : 1,
    slugs: args.slugs,
  });

  if (selected.length === 0) {
    process.stdout.write("No US prisons due for verification.\n");
    return;
  }

  const results = [];
  let nextState = state;
  for (const prison of selected) {
    const result = await verifyUsPrison({
      prison,
      verification: getFacilityVerification(prison.countrySlug, prison.slug),
      bopLocations,
      http,
      overlayStore,
      options: { dryRun: !writesEnabled, writesEnabled, completenessWritesEnabled, now },
    });
    results.push(result);
    appendAudit(verificationDir, result.audit);
    nextState = upsertPrisonState(nextState, nextUsStateFromResult(result, now));
    queue = recordRun(queue, {
      slug: prison.slug,
      at: result.audit.verifiedAt,
      status: result.audit.verificationStatus,
      runStatus: result.audit.runStatus === "failed" ? "failed" : "success",
      mode: writesEnabled ? "write" : "dry-run",
      differenceFields: result.audit.differences.filter((d) => d.classification !== "NO_CHANGE").map((d) => d.field),
      sourceUrl: result.source?.url,
      error: result.audit.errors[0],
    });
    await sleep(150);
  }
  saveState(verificationDir, nextState);
  const queueWritten = !args.noQueueUpdate && (writesEnabled || args.queueUpdateOnDryRun);
  if (queueWritten) saveQueueEverywhere(queue, queuePathSet);

  if (writesEnabled) {
    const moduleSource = resolveUsOverlayModuleWrite({
      seed: overlaySeed,
      stored: diskStore.read(),
      overlayWritten: results.some((result) => result.overlayWritten),
    });
    if (moduleSource !== null) {
      fs.mkdirSync(path.dirname(overlayTsPath), { recursive: true });
      fs.writeFileSync(overlayTsPath, moduleSource, "utf8");
    }
  }

  const report = buildRunReport(results, isoNow(now));
  const stamp = isoNow(now).replace(/[:.]/g, "-");
  const reportDir = args.outDir
    ? path.resolve(args.outDir)
    : path.join(verificationDir, "reports");
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, `run-${stamp}.json`);
  const mdPath = path.join(reportDir, `run-${stamp}.md`);
  writeJsonFile(jsonPath, report);
  fs.writeFileSync(
    mdPath,
    renderMarkdownReport(report, {
      title: "US prison verifier report",
      dryRunNote:
        "Dry-run cannot mutate production prison data (BOP import JSON, generated prison modules, UK records, or the live overlay).",
    }),
    "utf8",
  );
  writeJsonFile(path.join(verificationDir, "latest.json"), {
    generatedAt: report.generatedAt,
    mode: report.mode,
    summary: report.summary,
    prisons: report.prisons.map((row) => ({
      prison: row.prisonSlug,
      success: row.audit.runStatus === "success",
      status: row.audit.verificationStatus,
      authority: row.authority?.name ?? null,
      source: row.source?.url ?? null,
      changedFields: row.audit.differences.map((d) => d.field),
      autoChanged: row.audit.changesApplied.map((d) => d.field),
      wouldHaveAutoApplied: row.audit.wouldHaveAutoApplied.map((d) => d.field),
      reviewRequired: row.audit.reviewRequired,
      contactVisiting: row.contactVisiting
        ? row.contactVisiting.suppressed
          ? { suppressed: true, reason: row.contactVisiting.suppressReason }
          : {
              fields: Object.fromEntries(row.contactVisiting.fields.map((f) => [f.field, f.classification])),
              applied: row.contactVisiting.applied,
            }
        : null,
      nextCheck: nextState.prisons[row.prisonSlug]?.nextVerificationAt ?? null,
      failed: row.audit.runStatus === "failed",
      errors: row.audit.errors,
    })),
  });

  process.stdout.write(`${renderCliSummary(report, "US verifier")}\n`);
  process.stdout.write(`Report: ${mdPath}\n`);
  process.stdout.write(
    queueWritten
      ? `Queue updated: ${queuePathSet.repoPath} and ${queuePathSet.workingPath}\n`
      : "Queue not updated (dry-run, or --no-queue-update). Pass --queue-update to record a dry-run.\n",
  );
  if (writesEnabled) {
    process.stdout.write(`Overlay written: ${overlayJsonPath}\n`);
  } else {
    process.stdout.write("Dry-run: production overlay, BOP import JSON, and UK records were not written.\n");
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
