import type { PrisonVerificationResult } from "./types";

export interface RunReport {
  generatedAt: string;
  mode: "dry-run" | "write";
  writesEnabled: boolean;
  prisonCount: number;
  summary: {
    current: number;
    changed: number;
    reviewRequired: number;
    failed: number;
    productionMutations: number;
    completenessSafeFills: number;
    completenessWrites: number;
    completenessSuppressed: number;
  };
  prisons: PrisonVerificationResult[];
}

export function buildRunReport(results: PrisonVerificationResult[], generatedAt: string): RunReport {
  const writesEnabled = results.some((row) => row.writesEnabled);
  return {
    generatedAt,
    mode: writesEnabled ? "write" : "dry-run",
    writesEnabled,
    prisonCount: results.length,
    summary: {
      current: results.filter((row) => row.audit.verificationStatus === "CURRENT").length,
      changed: results.filter((row) => row.audit.verificationStatus === "CHANGED").length,
      reviewRequired: results.filter((row) => row.audit.verificationStatus === "REVIEW_REQUIRED").length,
      failed: results.filter((row) => row.audit.verificationStatus === "VERIFICATION_FAILED").length,
      productionMutations: results.filter((row) => row.productionMutated).length,
      completenessSafeFills: results.reduce((n, row) => n + (row.completeness?.safeFills.length ?? 0), 0),
      completenessWrites: results.filter((row) => row.completeness?.completenessMutated).length,
      completenessSuppressed: results.filter((row) => row.completeness?.suppressed).length,
    },
    prisons: results,
  };
}

function lineForField(result: PrisonVerificationResult, fieldName: string): string {
  const row = result.fields.find((field) => field.field === fieldName);
  if (!row) return `- ${fieldName}: (not checked)`;
  const would = row.wouldAutoApply ? " | WOULD have been auto-applied" : "";
  const applied = result.audit.changesApplied.some((field) => field.field === row.field)
    ? " | APPLIED"
    : "";
  const current = row.currentValue ? ` current=${JSON.stringify(row.currentValue)}` : " current=(empty)";
  const official = row.officialValue ? ` official=${JSON.stringify(row.officialValue)}` : " official=(omitted)";
  return `- ${row.field}: ${row.classification}${current}${official} | ${row.evidence}${would}${applied}`;
}

export function renderMarkdownReport(
  report: RunReport,
  options?: { title?: string; dryRunNote?: string },
): string {
  const title = options?.title ?? "UK prison verifier report";
  const dryRunNote =
    options?.dryRunNote ??
    "Dry-run cannot mutate production prison data (HMPPS JSON, generated prison modules, or the live overlay).";
  const lines: string[] = [
    `# ${title}`,
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: **${report.mode}** (writesEnabled=${report.writesEnabled})`,
    `Prisons: ${report.prisonCount}`,
    `Summary: current=${report.summary.current} changed=${report.summary.changed} review=${report.summary.reviewRequired} failed=${report.summary.failed} productionMutations=${report.summary.productionMutations} completenessSafeFills=${report.summary.completenessSafeFills} completenessWrites=${report.summary.completenessWrites} completenessSuppressed=${report.summary.completenessSuppressed}`,
    "",
    report.mode === "dry-run"
      ? dryRunNote
      : "Write mode is active. Only SAFE_AUTO_CHANGE overlay fields may have been applied.",
    "",
  ];

  for (const result of report.prisons) {
    lines.push(`## ${result.published.name || result.prisonSlug} (\`${result.prisonSlug}\`)`);
    lines.push("");
    if (result.authority) {
      lines.push(
        `- Authority: ${result.authority.identified ? `${result.authority.name} (${result.authority.kind})` : "NOT IDENTIFIED"} — ${result.authority.evidence}`,
      );
    }
    lines.push(`- Official source located: ${result.source?.ok ? result.source.url : "NO"}`);
    if (result.source?.ok) lines.push(`- Discovery method: ${result.source.method}`);
    lines.push(`- Run status: ${result.audit.runStatus} / ${result.audit.verificationStatus}`);
    lines.push(`- Review required: ${result.audit.reviewRequired}`);
    lines.push(`- Production mutated: ${result.productionMutated}`);
    lines.push(`- Fields checked: ${result.audit.fieldsChecked.join(", ")}`);
    lines.push("");
    for (const field of result.audit.fieldsChecked) {
      lines.push(lineForField(result, field));
    }

    lines.push("");
    lines.push("### VERIFY");
    lines.push(`- Kind for auto overlay diffs: CORRECTION (SAFE_AUTO_CHANGE)`);
    lines.push(
      `- Would auto-correct: ${(result.audit.wouldHaveAutoApplied ?? []).map((f) => f.field).join(", ") || "(none)"}`,
    );
    lines.push(
      `- Corrections applied: ${(result.audit.changesApplied ?? []).map((f) => f.field).join(", ") || "(none)"}`,
    );

    const completeness = result.completeness;
    lines.push("");
    lines.push("### COMPLETENESS");
    if (!completeness) {
      lines.push("- (not evaluated)");
    } else {
      lines.push(`- Suppressed: ${completeness.suppressed}${completeness.suppressReason ? ` — ${completeness.suppressReason}` : ""}`);
      lines.push(`- Empty fields found: ${completeness.emptyFieldsFound.join(", ") || "(none)"}`);
      lines.push(
        `- SAFE_FILL: ${completeness.safeFills.map((f) => `${f.field}=${JSON.stringify(f.officialValue)}`).join(", ") || "(none)"}`,
      );
      lines.push(
        `- Fills applied: ${completeness.fillsApplied.map((f) => f.field).join(", ") || "(none)"}`,
      );
      lines.push(
        `- REVIEW_REQUIRED: ${completeness.completenessReviewRequired.map((f) => f.field).join(", ") || "(none)"}`,
      );
      lines.push(
        `- NO_SOURCE_VALUE: ${completeness.noSourceValues.map((f) => f.field).join(", ") || "(none)"}`,
      );
      lines.push(
        `- UNSUPPORTED_FIELD: ${completeness.unsupportedFieldsFound.map((f) => f.field).join(", ") || "(none)"}`,
      );
      lines.push(`- Completeness writes enabled: ${completeness.completenessWritesEnabled}`);
      lines.push(`- Completeness mutated: ${completeness.completenessMutated}`);
    }

    if (result.missingOfficialFields.length) {
      lines.push("");
      lines.push("Potentially useful official fields we do not store:");
      for (const missing of result.missingOfficialFields) {
        lines.push(`- ${missing.field}: ${missing.officialValue} — ${missing.note}`);
      }
    }
    if (result.audit.errors.length) {
      lines.push("");
      lines.push("Errors:");
      for (const error of result.audit.errors) lines.push(`- ${error}`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

export function renderCliSummary(report: RunReport, label = "UK verifier"): string {
  const rows = report.prisons.map((result) => {
    const source = result.source?.ok ? result.source.url : "unidentified";
    const auto = result.audit.wouldHaveAutoApplied.map((field) => field.field).join(",") || "-";
    return `${result.prisonSlug}\t${result.audit.verificationStatus}\t${source}\twouldAuto=${auto}\tmutated=${result.productionMutated}`;
  });
  return [`${label} ${report.mode}: ${report.prisonCount} prisons`, ...rows].join("\n");
}
