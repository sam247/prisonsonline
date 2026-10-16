
/**
 * Display-layer helpers for official-source international profiles (ca, au, nz, ie, za).
 * The underlying bundle data is left untouched; these only shape how it reads to visitors.
 */

/** Join place parts, dropping empty and case-insensitive duplicate parts ("Dublin, Dublin" -> "Dublin"). */
export function joinPlaceParts(parts: Array<string | null | undefined>): string {
  const seen = new Set<string>();
  const out: string[] = [];
  const segments = parts.flatMap((part) => (part ?? "").split(","));
  for (const raw of segments) {
    const v = raw.trim();
    if (!v) continue;
    // "Co. Laois" and "Laois" name the same place; keep the first form shown.
    const key = v.toLowerCase().replace(/^(co\.?|county)\s+/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out.join(", ");
}

