/** Align with scripts/build-institutional-data.mjs slugify for stable URLs. */
export function slugifyKey(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function operatorSlugFromLabel(operator: string): string {
  return slugifyKey(operator) || "unknown";
}
