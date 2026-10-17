/**
 * Image-key scheme shared by scripts/build-prison-images.mjs and src/lib/media/prisonImages.ts:
 * - default key is the bare prison slug ("hmp-bedford");
 * - a slug used by more than one country (e.g. "prince-albert-correctional-centre", CA and ZA) is
 *   written under a country-scoped key "<countrySlug>/<slug>" ("ca/prince-albert-correctional-centre"),
 *   because the runtime lookup never applies a bare-slug record to such a slug.
 */
import fs from "fs";
import path from "path";

const PRISON_DATA_FILES = [
  "src/data/generated/ukPrisons.generated.ts",
  "src/data/generated/usPrisons.generated.ts",
  "src/data/generated/caPrisons.generated.ts",
  "src/data/generated/auPrisons.generated.ts",
  "src/data/generated/nzPrisons.generated.ts",
  "src/data/generated/iePrisons.generated.ts",
  "src/data/generated/zaPrisons.generated.ts",
  "src/data/prisons.legacy-international.ts",
];

/**
 * Slugs that appear under more than one countrySlug in the prison data files.
 * @param {string} root repo root
 * @returns {Set<string>}
 */
export function readCrossCountrySlugs(root) {
  /** @type {Map<string, Set<string>>} */
  const byslug = new Map();
  const re = /(?:^|[\s{,"])slug"?\s*:\s*"([^"]+)"[\s\S]*?(?:^|[\s,"])countrySlug"?\s*:\s*"([^"]+)"/gm;
  for (const rel of PRISON_DATA_FILES) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(re)) byslug.set(m[1], (byslug.get(m[1]) ?? new Set()).add(m[2]));
  }
  return new Set([...byslug].filter(([, ccs]) => ccs.size > 1).map(([slug]) => slug));
}

/**
 * Parses a sheet slug cell (full URL, /prisons/<cc>/<slug> path, "<cc>/<slug>" or bare slug).
 * @param {string} raw
 * @returns {{ countrySlug: string | null, slug: string } | null}
 */
export function parsePrisonSlugCell(raw) {
  let s = String(raw || "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) {
    try {
      s = new URL(s).pathname;
    } catch {
      return null;
    }
  }
  const parts = s.split("/").filter(Boolean);
  if (parts[0] === "prisons") parts.shift();
  if (parts.length === 0) return null;
  const slug = parts[parts.length - 1];
  const countrySlug = parts.length >= 2 ? parts[parts.length - 2].toLowerCase() : null;
  return slug ? { countrySlug, slug } : null;
}

/**
 * JSON key for a sheet row: bare slug, or "<cc>/<slug>" when the slug is shared across countries.
 * Returns null for a shared slug with no country (it cannot be keyed safely).
 * @param {string} raw
 * @param {ReadonlySet<string>} crossCountrySlugs
 * @returns {string | null}
 */
export function prisonImageKeyForCell(raw, crossCountrySlugs) {
  const parsed = parsePrisonSlugCell(raw);
  if (!parsed) return null;
  if (!crossCountrySlugs.has(parsed.slug)) return parsed.slug;
  return parsed.countrySlug ? `${parsed.countrySlug}/${parsed.slug}` : null;
}
