import type { Prison } from "@/types/prison";

const SOURCE_DATE_KEYS = [
  "updatedAt",
  "updated_at",
  "lastModified",
  "last_modified",
  "modified",
  "modifiedAt",
  "timestamp",
  "updated",
] as const;

function parseRawDate(value: unknown): Date | null {
  if (value == null) return null;
  if (typeof value === "string" && value.trim()) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function getPrisonLastModifiedDate(prison: Prison, fallback: Date): Date {
  const raw = prison.sourceRaw;
  if (!raw || typeof raw !== "object") return fallback;

  for (const key of SOURCE_DATE_KEYS) {
    const d = parseRawDate(raw[key]);
    if (d) return d;
  }

  return fallback;
}

export function getPrisonLastModifiedMs(prison: Prison, fallbackMs: number): number {
  return getPrisonLastModifiedDate(prison, new Date(fallbackMs)).getTime();
}

export function getRecentlyUpdatedPrisons(list: Prison[], limit: number): Prison[] {
  const fb = Date.now();
  return [...list]
    .sort((a, b) => {
      const diff = getPrisonLastModifiedMs(b, fb) - getPrisonLastModifiedMs(a, fb);
      if (diff !== 0) return diff;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, limit);
}
