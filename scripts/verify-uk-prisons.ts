#!/usr/bin/env node
/**
 * UK prison verifier — Phase 1.
 *
 * Default is DRY RUN: fetches GOV.UK, compares published facts, writes a report,
 * and never mutates production prison data.
 *
 * Writes (facility overlay only) require BOTH:
 *   --write
 *   UK_PRISON_VERIFIER_WRITE=1
 */
import fs from "node:fs";
import path from "node:path";
import { prisons } from "@/data/prisons";
import { getFacilityVerification } from "@/data/facilitySources";
import type { PrisonVerificationInput } from "@/lib/verification/types";
import { selectUkPrisonsDue } from "@/lib/verification/selectPrison";
import { verifyUkPrison, nextStateFromResult } from "@/lib/verification/runVerification";
import { defaultHttpGet, fetchGovukPrisonsCollection } from "@/lib/verification/govukClient";
import { productionWritesEnabled, type OverlayStore } from "@/lib/verification/applyChanges";
import {
  OVERLAY_JSON_RELATIVE,
  OVERLAY_TS_RELATIVE,
  appendAudit,
  defaultVerificationDir,
  fileOverlayStore,
  loadState,
  renderOverlayModule,
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
    slugs: slugsFlag ? slugsFlag.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    limit: limitFlag ? Number(limitFlag) : slugsFlag ? 50 : 1,
    outDir: outFlag,
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
    process.stdout.write(`Usage: npx tsx scripts/verify-uk-prisons.ts [options]

Options:
  --limit=N          How many due UK prisons to check (default 1; use 10 for a batch dry-run)
  --slugs=a,b,c      Explicit UK slugs (ignores due-date selection)
  --write            Apply SAFE_AUTO_CHANGE overlay writes (also requires UK_PRISON_VERIFIER_WRITE=1)
  --out=DIR          Report directory (default data/verification/reports)
  --help             Show this help

Default mode is dry-run. Dry-run cannot mutate HMPPS JSON, generated prison modules, or the live overlay.
`);
    return;
  }

  const writesEnabled = productionWritesEnabled({
    writeFlag: args.writeFlag,
    env: process.env,
  });
  if (args.writeFlag && !writesEnabled) {
    process.stderr.write(
      "Ignoring --write because UK_PRISON_VERIFIER_WRITE is not '1'. Staying in dry-run.\n",
    );
  }

  const now = new Date();
  const root = process.cwd();
  const verificationDir = defaultVerificationDir(root);
  const overlayJsonPath = path.join(root, OVERLAY_JSON_RELATIVE);
  const overlayTsPath = path.join(root, OVERLAY_TS_RELATIVE);
  const diskStore = fileOverlayStore(overlayJsonPath);
  const overlayStore = gatedOverlayStore(writesEnabled, diskStore);

  const http = defaultHttpGet();
  let collection;
  try {
    collection = await fetchGovukPrisonsCollection(http);
  } catch (error) {
    process.stderr.write(
      `Warning: could not load GOV.UK prisons collection (${error instanceof Error ? error.message : error}). Falling back to per-prison discovery.\n`,
    );
  }

  const state = loadState(verificationDir);
  const selected = selectUkPrisonsDue({
    prisons: prisons.map(toInput),
    state: state.prisons,
    now,
    limit: Number.isFinite(args.limit) && args.limit > 0 ? args.limit : 1,
    slugs: args.slugs,
  });

  if (selected.length === 0) {
    process.stdout.write("No UK prisons due for verification.\n");
    return;
  }

  const results = [];
  let nextState = state;
  for (const prison of selected) {
    const result = await verifyUkPrison({
      prison,
      verification: getFacilityVerification(prison.countrySlug, prison.slug),
      collection,
      http,
      overlayStore,
      options: { dryRun: !writesEnabled, writesEnabled, now },
    });
    results.push(result);
    appendAudit(verificationDir, result.audit);
    nextState = upsertPrisonState(nextState, nextStateFromResult(result, now));
    await sleep(150);
  }
  saveState(verificationDir, nextState);

  if (writesEnabled) {
    const overlay = diskStore.read();
    fs.mkdirSync(path.dirname(overlayTsPath), { recursive: true });
    fs.writeFileSync(overlayTsPath, renderOverlayModule(overlay), "utf8");
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
  fs.writeFileSync(mdPath, renderMarkdownReport(report), "utf8");
  writeJsonFile(path.join(verificationDir, "latest.json"), {
    generatedAt: report.generatedAt,
    mode: report.mode,
    summary: report.summary,
    prisons: report.prisons.map((row) => ({
      prison: row.prisonSlug,
      success: row.audit.runStatus === "success",
      status: row.audit.verificationStatus,
      source: row.source?.url ?? null,
      changedFields: row.audit.differences.map((d) => d.field),
      autoChanged: row.audit.changesApplied.map((d) => d.field),
      wouldHaveAutoApplied: row.audit.wouldHaveAutoApplied.map((d) => d.field),
      reviewRequired: row.audit.reviewRequired,
      nextCheck: nextState.prisons[row.prisonSlug]?.nextVerificationAt ?? null,
      failed: row.audit.runStatus === "failed",
      errors: row.audit.errors,
    })),
  });

  process.stdout.write(`${renderCliSummary(report)}\n`);
  process.stdout.write(`Report: ${mdPath}\n`);
  if (writesEnabled) {
    process.stdout.write(`Overlay written: ${overlayJsonPath}\n`);
  } else {
    process.stdout.write("Dry-run: production overlay and HMPPS JSON were not written.\n");
  }

}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
