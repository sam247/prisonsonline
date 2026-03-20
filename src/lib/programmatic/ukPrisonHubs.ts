import type { Prison, SecurityLevel } from "@/types/prison";
import { getPrisonsByCountry } from "@/data/prisons";
import { slugifyKey, operatorSlugFromLabel } from "@/lib/programmatic/slugify";

/** Minimum prisons required to publish a dynamic hub page (avoid thin URLs). */
export const MIN_UK_HUB_GROUP_SIZE = 3;

const ukPrisons = (): Prison[] => getPrisonsByCountry("uk");

function countBy<K>(items: Prison[], keyFn: (p: Prison) => K): Map<K, Prison[]> {
  const m = new Map<K, Prison[]>();
  for (const p of items) {
    const k = keyFn(p);
    const arr = m.get(k) ?? [];
    arr.push(p);
    m.set(k, arr);
  }
  return m;
}

// --- Operator ---

export function getOperatorSlugForPrison(p: Prison): string {
  return operatorSlugFromLabel(p.operator || "");
}

export function listUkOperatorHubSlugs(): string[] {
  const map = countBy(ukPrisons(), (p) => getOperatorSlugForPrison(p));
  return Array.from(map.entries())
    .filter((entry) => entry[1].length >= MIN_UK_HUB_GROUP_SIZE)
    .map(([slug]) => slug)
    .sort();
}

export function getPrisonsForUkOperatorHub(operatorSlug: string): Prison[] {
  return ukPrisons().filter((p) => getOperatorSlugForPrison(p) === operatorSlug);
}

export function resolveUkOperatorHub(operatorSlug: string): {
  prisons: Prison[];
  operatorLabel: string;
} | null {
  const list = getPrisonsForUkOperatorHub(operatorSlug);
  if (list.length < MIN_UK_HUB_GROUP_SIZE) return null;
  const operatorLabel = list[0]?.operator?.trim() || operatorSlug;
  return { prisons: list, operatorLabel };
}

// --- Security / category (maps to existing securityLevel on Prison) ---

const SECURITY_SLUG_TO_LEVEL: Record<string, SecurityLevel> = {
  "category-a": "Category A",
  "category-b": "Category B",
  "category-c": "Category C",
  "category-d": "Category D",
  multi: "Multi",
};

export function listUkSecurityHubSlugs(): string[] {
  const map = countBy(ukPrisons(), (p) => p.securityLevel);
  return Object.entries(SECURITY_SLUG_TO_LEVEL)
    .filter((entry) => (map.get(entry[1]) ?? []).length >= MIN_UK_HUB_GROUP_SIZE)
    .map(([slug]) => slug)
    .sort();
}

export function securityLevelForCategorySlug(categorySlug: string): SecurityLevel | undefined {
  return SECURITY_SLUG_TO_LEVEL[categorySlug];
}

export function getPrisonsForUkSecurityHub(categorySlug: string): Prison[] {
  const level = securityLevelForCategorySlug(categorySlug);
  if (!level) return [];
  return ukPrisons().filter((p) => p.securityLevel === level);
}

export function securityHubTitle(categorySlug: string): string {
  const level = securityLevelForCategorySlug(categorySlug);
  if (!level) return "Prisons";
  return `${level} prisons (England & Wales)`;
}

// --- Predominant function (exact label from import) ---

export function predominantFunctionSlug(p: Prison): string {
  const raw = (p.predominantFunction || "").trim();
  return raw ? slugifyKey(raw) : "";
}

export function listUkFunctionHubSlugs(): string[] {
  const map = countBy(ukPrisons(), (p) => predominantFunctionSlug(p));
  map.delete("");
  return Array.from(map.entries())
    .filter(([slug, arr]) => slug.length > 0 && arr.length >= MIN_UK_HUB_GROUP_SIZE)
    .map(([slug]) => slug)
    .sort();
}

export function getPrisonsForUkFunctionHub(functionSlug: string): Prison[] {
  return ukPrisons().filter((p) => predominantFunctionSlug(p) === functionSlug);
}

export function resolveUkFunctionHub(functionSlug: string): {
  prisons: Prison[];
  functionLabel: string;
} | null {
  const list = getPrisonsForUkFunctionHub(functionSlug);
  if (list.length < MIN_UK_HUB_GROUP_SIZE) return null;
  const functionLabel = list[0]?.predominantFunction?.trim() || functionSlug;
  return { prisons: list, functionLabel };
}

// --- Prison sub-group 1 ---

export function prisonSubGroup1Slug(p: Prison): string {
  const raw = (p.prisonSubGroup1 || "").trim();
  if (!raw || /^none$/i.test(raw)) return "";
  return slugifyKey(raw);
}

export function listUkSubgroupHubSlugs(): string[] {
  const map = countBy(ukPrisons(), (p) => prisonSubGroup1Slug(p));
  map.delete("");
  return Array.from(map.entries())
    .filter(([slug, arr]) => slug.length > 0 && arr.length >= MIN_UK_HUB_GROUP_SIZE)
    .map(([slug]) => slug)
    .sort();
}

export function getPrisonsForUkSubgroupHub(subgroupSlug: string): Prison[] {
  return ukPrisons().filter((p) => prisonSubGroup1Slug(p) === subgroupSlug);
}

export function resolveUkSubgroupHub(subgroupSlug: string): {
  prisons: Prison[];
  subgroupLabel: string;
} | null {
  const list = getPrisonsForUkSubgroupHub(subgroupSlug);
  if (list.length < MIN_UK_HUB_GROUP_SIZE) return null;
  const subgroupLabel = list[0]?.prisonSubGroup1?.trim() || subgroupSlug;
  return { prisons: list, subgroupLabel };
}

// --- Profile link helpers (no dead links) ---

export function ukOperatorHubHref(p: Prison): string | null {
  if (p.countrySlug !== "uk") return null;
  const slug = getOperatorSlugForPrison(p);
  const n = getPrisonsForUkOperatorHub(slug).length;
  return n >= MIN_UK_HUB_GROUP_SIZE ? `/prisons/uk/operator/${slug}` : null;
}

export function ukSecurityHubHref(p: Prison): string | null {
  if (p.countrySlug !== "uk") return null;
  const entry = Object.entries(SECURITY_SLUG_TO_LEVEL).find(([, lvl]) => lvl === p.securityLevel);
  if (!entry) return null;
  const [categorySlug] = entry;
  const n = getPrisonsForUkSecurityHub(categorySlug).length;
  return n >= MIN_UK_HUB_GROUP_SIZE ? `/prisons/uk/category/${categorySlug}` : null;
}

export function ukFunctionHubHref(p: Prison): string | null {
  if (p.countrySlug !== "uk") return null;
  const slug = predominantFunctionSlug(p);
  if (!slug) return null;
  const n = getPrisonsForUkFunctionHub(slug).length;
  return n >= MIN_UK_HUB_GROUP_SIZE ? `/prisons/uk/function/${slug}` : null;
}

export function ukSubgroupHubHref(p: Prison): string | null {
  if (p.countrySlug !== "uk") return null;
  const slug = prisonSubGroup1Slug(p);
  if (!slug) return null;
  const n = getPrisonsForUkSubgroupHub(slug).length;
  return n >= MIN_UK_HUB_GROUP_SIZE ? `/prisons/uk/subgroup/${slug}` : null;
}

// --- Sitemap ---

export function listUkHubSitemapPaths(): { path: string; priority: number }[] {
  const priority = 0.52;
  const out: { path: string; priority: number }[] = [];
  for (const operatorSlug of listUkOperatorHubSlugs()) {
    out.push({ path: `/prisons/uk/operator/${operatorSlug}`, priority });
  }
  for (const categorySlug of listUkSecurityHubSlugs()) {
    out.push({ path: `/prisons/uk/category/${categorySlug}`, priority });
  }
  for (const functionSlug of listUkFunctionHubSlugs()) {
    out.push({ path: `/prisons/uk/function/${functionSlug}`, priority });
  }
  for (const subgroupSlug of listUkSubgroupHubSlugs()) {
    out.push({ path: `/prisons/uk/subgroup/${subgroupSlug}`, priority });
  }
  return out;
}
