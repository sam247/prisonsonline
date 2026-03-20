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
    subtitle: "Establishments in the HMPPS listing associated with women’s or female provision.",
    intro:
      "These establishments are identified from HMPPS administrative fields (gender, cohort, or name). Confirm details with official sources before visiting or contacting a prison.",
    metaDescription:
      "Browse women’s and female-provision prisons in England and Wales from official HMPPS administrative data.",
    priority: 0.55,
  },
  "mens-prisons": {
    kind: "gender",
    title: "Men’s prisons (England & Wales)",
    subtitle: "Establishments listed with male or men’s provision in HMPPS data.",
    intro:
      "Filtered using gender labels from the HMPPS prison export. Some mixed or specialist sites may not appear here if the source label differs.",
    metaDescription:
      "Directory of men’s prisons in England and Wales based on HMPPS administrative gender fields.",
    priority: 0.54,
  },
  "high-security": {
    kind: "security",
    title: "High-security prisons (England & Wales)",
    subtitle: "Category A and high-security function establishments from HMPPS data.",
    intro:
      "Includes Category A and sites whose predominant function is described as high security in the import.",
    metaDescription:
      "Directory of high-security and Category A prisons in England and Wales based on HMPPS listings.",
    priority: 0.55,
  },
  "private-prisons": {
    kind: "operator",
    title: "Privately managed prisons (England & Wales)",
    subtitle: "Establishments operated under private-sector contracts or listed as privately managed.",
    intro:
      "Identified from operator names (e.g. Serco, G4S, Sodexo) and HMPPS sub-group labels referencing private management.",
    metaDescription:
      "Privately managed prisons in England and Wales from HMPPS administrative data.",
    priority: 0.55,
  },
  "training-prisons": {
    kind: "function",
    title: "Training prisons (England & Wales)",
    subtitle: "Sites whose predominant function references training or trainer regimes.",
    intro:
      "Based on the “Predominant Function” field in the HMPPS export (e.g. Cat B/C trainer roles).",
    metaDescription:
      "Training and trainer prisons in England and Wales from HMPPS administrative data.",
    priority: 0.53,
  },
  "reception-prisons": {
    kind: "function",
    title: "Reception prisons (England & Wales)",
    subtitle: "Establishments with a reception function in the HMPPS listing.",
    intro:
      "Includes sites where the predominant function or cohort references reception and resettlement flows.",
    metaDescription:
      "Reception and resettlement prisons in England and Wales from HMPPS data.",
    priority: 0.53,
  },
  "open-prisons": {
    kind: "security",
    title: "Open prisons (England & Wales)",
    subtitle: "Category D or open-function sites from the HMPPS import.",
    intro:
      "Open conditions are inferred from category mapping and predominant function text. Always verify category with the establishment.",
    metaDescription:
      "Open prisons and Category D sites in England and Wales from HMPPS listings.",
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
