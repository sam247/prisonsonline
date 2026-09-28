import fs from "node:fs";
import path from "node:path";
import type { OverlayFile, PrisonStateRecord, VerificationAuditRecord, VerificationStateFile } from "./types";
import { emptyOverlay, type OverlayStore } from "./applyChanges";

export function defaultVerificationDir(root = process.cwd()): string {
  return path.join(root, "data", "verification");
}

export function readJsonFile<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonFile(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function fileOverlayStore(filePath: string, fallback: OverlayFile = emptyOverlay()): OverlayStore {
  return {
    read() {
      return readJsonFile<OverlayFile>(filePath, fallback);
    },
    write(file) {
      writeJsonFile(filePath, file);
    },
  };
}

/**
 * Merge two overlay files entry-by-entry. Entries only in `base` are kept;
 * entries in `incoming` are added, and for shared keys the incoming entry wins
 * while its overrides are layered over the base overrides (field-level merge).
 */
export function mergeOverlayFiles(base: OverlayFile, incoming: OverlayFile): OverlayFile {
  const entries: OverlayFile["entries"] = structuredClone(base.entries ?? {});
  for (const [key, entry] of Object.entries(incoming.entries ?? {})) {
    const previous = entries[key];
    entries[key] = {
      ...structuredClone(entry),
      overrides: { ...previous?.overrides, ...entry.overrides },
    };
  }
  const updatedAt = [base.updatedAt, incoming.updatedAt].filter(Boolean).sort().pop() ?? "";
  return { generatedBy: incoming.generatedBy ?? base.generatedBy, updatedAt, entries };
}

/**
 * Wrap an overlay store so reads always include the committed (seed) overlay
 * entries, e.g. the entries already in ukVerificationOverlay.generated.ts. The
 * runtime overlay.json is gitignored and may be missing or stale, so without
 * this a --write run would start from an empty overlay and wipe earlier SAFE
 * overlays. Writes pass through unchanged (they already contain the seed).
 */
export function seededOverlayStore(inner: OverlayStore, seed: OverlayFile): OverlayStore {
  return {
    read: () => mergeOverlayFiles(seed, inner.read()),
    write: (file) => inner.write(file),
  };
}

/**
 * Decide what (if anything) a --write run should write to the generated UK
 * overlay module. Returns null when no overlay entry was written this run so
 * the committed module stays byte-identical; otherwise the merged module.
 */
export function resolveUkOverlayModuleWrite(input: {
  seed: OverlayFile;
  stored: OverlayFile;
  overlayWritten: boolean;
}): string | null {
  if (!input.overlayWritten) return null;
  return renderOverlayModule(mergeOverlayFiles(input.seed, input.stored));
}

/**
 * US twin of resolveUkOverlayModuleWrite: null when no overlay entry was written
 * this run (committed module stays byte-identical); otherwise seed + stored merged.
 */
export function resolveUsOverlayModuleWrite(input: {
  seed: OverlayFile;
  stored: OverlayFile;
  overlayWritten: boolean;
}): string | null {
  if (!input.overlayWritten) return null;
  return renderUsOverlayModule(mergeOverlayFiles(input.seed, input.stored));
}

export function memoryOverlayStore(initial: OverlayFile = emptyOverlay()): OverlayStore & { snapshot(): OverlayFile } {
  let current: OverlayFile = structuredClone(initial);
  return {
    read() {
      return structuredClone(current);
    },
    write(file) {
      current = structuredClone(file);
    },
    snapshot() {
      return structuredClone(current);
    },
  };
}

export function loadState(dir: string): VerificationStateFile {
  return readJsonFile<VerificationStateFile>(path.join(dir, "state.json"), { prisons: {} });
}

export function saveState(dir: string, state: VerificationStateFile): void {
  writeJsonFile(path.join(dir, "state.json"), state);
}

export function appendAudit(dir: string, record: VerificationAuditRecord): void {
  const filePath = path.join(dir, "audit.jsonl");
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

export function upsertPrisonState(
  state: VerificationStateFile,
  row: PrisonStateRecord,
): VerificationStateFile {
  return { prisons: { ...state.prisons, [row.prisonSlug]: row } };
}

export const OVERLAY_JSON_RELATIVE = "data/verification/overlay.json";
export const OVERLAY_TS_RELATIVE = "src/data/generated/ukVerificationOverlay.generated.ts";
export const US_OVERLAY_JSON_RELATIVE = "data/verification/us/overlay.json";
export const US_OVERLAY_TS_RELATIVE = "src/data/generated/usVerificationOverlay.generated.ts";

export function defaultUsVerificationDir(root = process.cwd()): string {
  return path.join(root, "data", "verification", "us");
}

export function renderOverlayModule(file: OverlayFile): string {
  return `/* eslint-disable */
/** Auto-generated by the UK prison verifier when writes are explicitly enabled. Dry-run never touches this file. */
import type { OverlayFile } from "@/lib/verification/types";

export const ukVerificationOverlay: OverlayFile = ${JSON.stringify(file, null, 2)};
`;
}

export function renderUsOverlayModule(file: OverlayFile): string {
  return `/* eslint-disable */
/** Auto-generated by the US prison verifier when writes are explicitly enabled. Dry-run never touches this file. */
import type { OverlayFile } from "@/lib/verification/types";

export const usVerificationOverlay: OverlayFile = ${JSON.stringify(file, null, 2)};
`;
}
