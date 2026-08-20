import type { Prison } from "@/types/prison";
import type { ProgrammaticCollection } from "@/types/collection";
import { prisons } from "@/data/prisons";
import { isPrivatelyManagedPrison } from "@/lib/generated/prisonAggregates";

export type UkCollectionSlug =
  | "womens-prisons"
  | "mens-prisons"
  | "high-security"
  | "private-prisons"
  | "training-prisons"
  | "reception-prisons"
  | "open-prisons";

const filters: Record<UkCollectionSlug, (p: Prison) => boolean> = {
  "womens-prisons": (p) => {
    const g = `${p.gender ?? ""} ${p.cohort ?? ""} ${p.name}`.toLowerCase();
    return /women|female|womens|ladies/.test(g);
  },
  "mens-prisons": (p) => {
    const g = (p.gender || "").toLowerCase();
    return (
      g.includes("mens") ||
      (g.includes("male") && !g.includes("female")) ||
      /\bmen's\b/i.test(p.gender || "")
    );
  },
  "high-security": (p) =>
    p.securityLevel === "Category A" ||
    (p.predominantFunction?.toLowerCase().includes("high security") ?? false),
  "private-prisons": (p) => isPrivatelyManagedPrison(p),
  "training-prisons": (p) => /\btrainer\b/i.test(p.predominantFunction || ""),
  "reception-prisons": (p) => /\breception\b/i.test(p.predominantFunction || ""),
  "open-prisons": (p) =>
    p.securityLevel === "Category D" ||
    /\bopen\b/i.test(p.predominantFunction || ""),
};

const meta: Record<UkCollectionSlug, Omit<ProgrammaticCollection, "slug" | "canonicalPath">> = {
  "womens-prisons": {
    kind: "gender",
    title: "Women’s prisons (England & Wales)",
    subtitle: "A comprehensive directory view of establishments associated with women’s or female provision.",
    intro:
      "Women’s prisons hold women and, at some sites, young women or mother-and-baby units. This broader list uses gender, cohort and facility-name evidence rather than only the narrow “Female” predominant-function label.",
    metaDescription:
      "Browse women’s prisons and female-provision establishments in England and Wales from HMPPS administrative data.",
    priority: 0.55,
  },
  "mens-prisons": {
    kind: "gender",
    title: "Men’s prisons (England & Wales)",
    subtitle: "Establishments listed with male or men’s provision in HMPPS data.",
    intro:
      "Filtered using gender labels from the HMPPS prison export. Some mixed or specialist sites may not appear here if the source label differs.",
    metaDescription:
      "Browse men’s prisons in England and Wales from HMPPS administrative gender fields.",
    priority: 0.54,
  },
  "high-security": {
    kind: "security",
    title: "High-security prisons (England & Wales)",
    subtitle: "Category A and high-security-function establishments in the current directory.",
    intro:
      "High-security prisons hold people whose escape would present the greatest public risk. This collection includes Category A establishments and sites whose predominant function is recorded as high security; it is distinct from the administrative long-term and high-security estate grouping.",
    metaDescription:
      "Browse high-security and Category A prisons in England and Wales from HMPPS listings.",
    priority: 0.55,
  },
  "private-prisons": {
    kind: "operator",
    title: "Privately managed prisons (England & Wales)",
    subtitle: "Establishments operated under private-sector contracts or recorded as privately managed.",
    intro:
      "Private prisons are custodial establishments managed by contracted operators rather than directly by the public prison service. This list is derived from operator names and private-management labels in the current HMPPS-derived import.",
    metaDescription:
      "Browse privately managed prisons in England and Wales from HMPPS administrative data.",
    priority: 0.55,
  },
  "training-prisons": {
    kind: "function",
    title: "Training prisons (England & Wales)",
    subtitle: "Sites whose predominant function references training or trainer regimes.",
    intro:
      "Based on the “Predominant Function” field in the HMPPS export (e.g. Cat B/C trainer roles).",
    metaDescription:
      "Browse training and trainer prisons in England and Wales from HMPPS administrative data.",
    priority: 0.53,
  },
  "reception-prisons": {
    kind: "function",
    title: "Reception prisons (England & Wales)",
    subtitle: "Establishments with a reception function in the HMPPS listing.",
    intro:
      "Includes sites where the predominant function or cohort references reception and resettlement flows.",
    metaDescription:
      "Browse reception and resettlement prisons in England and Wales from HMPPS data.",
    priority: 0.53,
  },
  "open-prisons": {
    kind: "security",
    title: "Open prisons (England & Wales)",
    subtitle: "Category D or open-function sites from the HMPPS import.",
    intro:
      "Open conditions are inferred from category mapping and predominant function text. Always verify category with the establishment.",
    metaDescription:
      "Browse open prisons and Category D sites in England and Wales from HMPPS listings.",
    priority: 0.53,
  },
};

export function listUkCollectionSlugs(): UkCollectionSlug[] {
  return Object.keys(filters) as UkCollectionSlug[];
}

export function getProgrammaticCollection(slug: string): ProgrammaticCollection | undefined {
  if (!isUkCollectionSlug(slug)) return undefined;
  const m = meta[slug];
  return {
    ...m,
    slug,
    breadcrumbLabel: m.breadcrumbLabel ?? m.title,
    canonicalPath: `/prisons/uk/collection/${slug}`,
  };
}

/** Returns a collection URL only if the list is non-empty (avoids dead links). */
export function ukCollectionHrefIfNonEmpty(slug: UkCollectionSlug): string | null {
  if (!isUkCollectionSlug(slug)) return null;
  if (getPrisonsForUkCollection(slug).length === 0) return null;
  return `/prisons/uk/collection/${slug}`;
}

/** Thematic collection pages this prison belongs to (non-empty lists only). */
export function listMatchingCollectionHubsForPrison(p: Prison): { label: string; href: string }[] {
  if (p.countrySlug !== "uk") return [];
  const out: { label: string; href: string }[] = [];
  for (const slug of listUkCollectionSlugs()) {
    const fn = filters[slug];
    if (!fn(p)) continue;
    const spec = getProgrammaticCollection(slug);
    if (!spec) continue;
    if (getPrisonsForUkCollection(slug).length === 0) continue;
    out.push({
      label: spec.breadcrumbLabel ?? spec.title,
      href: spec.canonicalPath,
    });
  }
  return out;
}

export function isUkCollectionSlug(s: string): s is UkCollectionSlug {
  return s in filters;
}

export function getPrisonsForUkCollection(slug: UkCollectionSlug): Prison[] {
  const fn = filters[slug];
  return prisons.filter((p) => p.countrySlug === "uk" && fn(p));
}
