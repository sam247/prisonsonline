import { getPrisonsByCountry, getPrisonsByRegion, getRegionsByCountry } from "@/data/prisons";
import type { GeneratedArticle } from "@/types/siteArticle";
import {
  getPrisonsForUkCollection,
  getProgrammaticCollection,
  listUkCollectionSlugs,
} from "@/lib/programmatic/collections";
import {
  listUkOperatorHubSlugs,
  listUkSecurityHubSlugs,
  resolveUkOperatorHub,
  getPrisonsForUkSecurityHub,
  securityHubTitle,
  MIN_UK_HUB_GROUP_SIZE,
} from "@/lib/programmatic/ukPrisonHubs";
import {
  slugRegionArticle,
  slugOperatorArticle,
  slugSecurityArticle,
  slugCollectionArticle,
  slugExplainerArticle,
} from "@/lib/programmatic/articles/slugRules";
import {
  buildRegionArticleSections,
  buildOperatorArticleSections,
  buildSecurityArticleSections,
  buildCollectionArticleSections,
  buildExplainerSpecs,
} from "@/lib/programmatic/articles/copyTemplates";
import type { SecurityLevel } from "@/types/prison";

const GENERATED_LISTING_CATEGORY = "England & Wales directories";
const EXPLAINER_CATEGORY = "England & Wales explainers";
const GENERATED_DATE = "2026-03-20";

function isUnknownRegion(name: string): boolean {
  const t = name.trim().toLowerCase();
  return t.length === 0 || t === "unknown" || t === "n/a";
}

function assignRelatedArticleSlugs(all: GeneratedArticle[]): GeneratedArticle[] {
  const slugSet = new Set(all.map((a) => a.slug));
  const byKey = (k: string) => slugExplainerArticle(k);

  return all.map((article) => {
    const add = new Set<string>();

    const pushIf = (s: string) => {
      if (slugSet.has(s) && s !== article.slug) add.add(s);
    };

    switch (article.articleKind) {
      case "uk_region":
        pushIf(byKey("using-this-directory"));
        pushIf(byKey("prison-categories-directory"));
        break;
      case "uk_operator":
        pushIf(byKey("using-this-directory"));
        pushIf(byKey("prison-categories-directory"));
        break;
      case "uk_security":
        pushIf(byKey("prison-categories-directory"));
        pushIf(byKey("using-this-directory"));
        break;
      case "uk_collection":
        pushIf(byKey("using-this-directory"));
        if (article.collectionSlug === "private-prisons") pushIf(byKey("private-prisons-dataset"));
        if (article.collectionSlug === "open-prisons") pushIf(byKey("open-prisons-category-d"));
        if (article.collectionSlug === "training-prisons" || article.collectionSlug === "reception-prisons") {
          pushIf(byKey("training-reception-hmpps-fields"));
        }
        if (
          article.collectionSlug === "high-security" ||
          article.collectionSlug === "womens-prisons" ||
          article.collectionSlug === "mens-prisons"
        ) {
          pushIf(byKey("prison-categories-directory"));
        }
        break;
      case "uk_explainer":
        pushIf(byKey("using-this-directory"));
        if (article.explainerKey !== "using-this-directory") {
          pushIf(byKey("prison-categories-directory"));
        }
        break;
      default:
        break;
    }

    return { ...article, relatedArticleSlugs: Array.from(add).slice(0, 5) };
  });
}

export function buildGeneratedArticles(): GeneratedArticle[] {
  const uk = getPrisonsByCountry("uk");
  const out: GeneratedArticle[] = [];

  // --- Regions ---
  for (const { slug: regionSlug, name: regionName } of getRegionsByCountry("uk")) {
    if (isUnknownRegion(regionName)) continue;
    const prisons = getPrisonsByRegion("uk", regionSlug);
    if (prisons.length < MIN_UK_HUB_GROUP_SIZE) continue;
    const slug = slugRegionArticle(regionSlug);
    const { bodySections, faqs } = buildRegionArticleSections(regionName, regionSlug, prisons);
    const relatedSlugs = prisons.map((p) => p.slug);
    out.push({
      id: `gen:${slug}`,
      slug,
      title: `Prisons in ${regionName}: how this regional group works`,
      description: `Directory note for prisons grouped under “${regionName}” in our England and Wales import (${prisons.length} establishments). Not an official list.`,
      intro: `We currently associate ${prisons.length} establishment${prisons.length === 1 ? "" : "s"} with “${regionName}” in our HMPPS-derived data. This article explains how to use that grouping alongside the regional browse page and individual profiles.`,
      bodySections,
      countrySlug: "uk",
      articleKind: "uk_region",
      category: GENERATED_LISTING_CATEGORY,
      date: GENERATED_DATE,
      relatedPrisons: relatedSlugs,
      relatedGuides: ["prison-categories-explained", "how-prison-visits-work"],
      relatedArticleSlugs: [],
      relatedCollections: [],
      hubLinks: [{ label: `Browse all prisons in ${regionName}`, href: `/prisons/uk/${regionSlug}` }],
      faqs,
      sourceType: "generated",
      regionSlug,
    });
  }

  // --- Operators ---
  for (const operatorSlug of listUkOperatorHubSlugs()) {
    const resolved = resolveUkOperatorHub(operatorSlug);
    if (!resolved) continue;
    const { prisons, operatorLabel } = resolved;
    const slug = slugOperatorArticle(operatorSlug);
    const { bodySections, faqs } = buildOperatorArticleSections(operatorLabel, prisons);
    out.push({
      id: `gen:${slug}`,
      slug,
      title: `${operatorLabel} prisons in England and Wales: directory context`,
      description: `How we list ${prisons.length} establishment${prisons.length === 1 ? "" : "s"} under “${operatorLabel}” from HMPPS operator fields. Companion to the operator hub.`,
      intro: `This note sits alongside the operator hub for “${operatorLabel}”. It summarises what the operator field means in our import and how many prisons share that label today.`,
      bodySections,
      countrySlug: "uk",
      articleKind: "uk_operator",
      category: GENERATED_LISTING_CATEGORY,
      date: GENERATED_DATE,
      relatedPrisons: prisons.map((p) => p.slug),
      relatedGuides: ["prison-categories-explained"],
      relatedArticleSlugs: [],
      relatedCollections: [],
      hubLinks: [{ label: "Open operator hub listing", href: `/prisons/uk/operator/${operatorSlug}` }],
      faqs,
      sourceType: "generated",
      operatorSlug,
    });
  }

  // --- Security / category ---
  for (const categorySlug of listUkSecurityHubSlugs()) {
    const prisons = getPrisonsForUkSecurityHub(categorySlug);
    if (prisons.length < MIN_UK_HUB_GROUP_SIZE) continue;
    const slug = slugSecurityArticle(categorySlug);
    const label = securityHubTitle(categorySlug).replace(" (England & Wales)", "");
    const { bodySections, faqs } = buildSecurityArticleSections(label, categorySlug, prisons);
    out.push({
      id: `gen:${slug}`,
      slug,
      title: `${label}: what our directory pages show`,
      description: `Interpretive guide for ${label.toLowerCase()} listings in our England and Wales dataset (${prisons.length} establishments in this band where published).`,
      intro: `Our category hub for this band lists ${prisons.length} establishment${prisons.length === 1 ? "" : "s"} after import mapping. This article explains how to read those pages and when to verify details with HMPPS.`,
      bodySections,
      countrySlug: "uk",
      articleKind: "uk_security",
      category: GENERATED_LISTING_CATEGORY,
      date: GENERATED_DATE,
      relatedPrisons: prisons.map((p) => p.slug),
      relatedGuides: ["prison-categories-explained", "life-inside-prison"],
      relatedArticleSlugs: [],
      relatedCollections: [],
      hubLinks: [{ label: "Open category hub listing", href: `/prisons/uk/category/${categorySlug}` }],
      faqs,
      sourceType: "generated",
      categorySlug,
    });
  }

  // --- Collections (non-empty only) ---
  for (const collectionSlug of listUkCollectionSlugs()) {
    const prisons = getPrisonsForUkCollection(collectionSlug);
    if (prisons.length === 0) continue;
    const slug = slugCollectionArticle(collectionSlug);
    const spec = getProgrammaticCollection(collectionSlug);
    const { bodySections, faqs } = buildCollectionArticleSections(collectionSlug, prisons);
    out.push({
      id: `gen:${slug}`,
      slug,
      title: `${spec?.title ?? collectionSlug}: reading the thematic list`,
      description: `Context for our “${spec?.breadcrumbLabel ?? spec?.title ?? collectionSlug}” collection (${prisons.length} sites). Links to the hub and example profiles.`,
      intro: `This thematic slice currently includes ${prisons.length} establishment${prisons.length === 1 ? "" : "s"}. The article explains the filter in plain English and points you to the hub grid for the full set.`,
      bodySections,
      countrySlug: "uk",
      articleKind: "uk_collection",
      category: GENERATED_LISTING_CATEGORY,
      date: GENERATED_DATE,
      relatedPrisons: prisons.map((p) => p.slug),
      relatedGuides: ["prison-categories-explained", "life-inside-prison"],
      relatedArticleSlugs: [],
      relatedCollections: [collectionSlug],
      hubLinks: [{ label: "Open collection hub", href: `/prisons/uk/collection/${collectionSlug}` }],
      faqs,
      sourceType: "generated",
      collectionSlug,
    });
  }

  // --- Explainers (aggregates) ---
  const countByLevel = (level: SecurityLevel) => uk.filter((p) => p.securityLevel === level).length;
  const categoryCounts = [
    { label: "Category A", count: countByLevel("Category A") },
    { label: "Category B", count: countByLevel("Category B") },
    { label: "Category C", count: countByLevel("Category C") },
    { label: "Category D", count: countByLevel("Category D") },
    { label: "Multi", count: countByLevel("Multi") },
  ];
  const trainingCount = getPrisonsForUkCollection("training-prisons").length;
  const receptionCount = getPrisonsForUkCollection("reception-prisons").length;
  const openCollectionCount = getPrisonsForUkCollection("open-prisons").length;
  const privateCollectionCount = getPrisonsForUkCollection("private-prisons").length;

  const priv = getPrisonsForUkCollection("private-prisons");
  const train = getPrisonsForUkCollection("training-prisons");
  const examplePrivateNames = [...priv]
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"))
    .slice(0, 4)
    .map((p) => p.name)
    .join(", ");
  const exampleTrainingNames = [...train]
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"))
    .slice(0, 4)
    .map((p) => p.name)
    .join(", ");

  const explainerSpecs = buildExplainerSpecs({
    ukPrisonCount: uk.length,
    categoryCounts,
    trainingCount,
    receptionCount,
    openCollectionCount,
    privateCollectionCount,
    examplePrivateNames,
    exampleTrainingNames,
  });

  for (const spec of explainerSpecs) {
    const slug = slugExplainerArticle(spec.key);
    out.push({
      id: `gen:${slug}`,
      slug,
      title: spec.title,
      description: spec.description,
      intro: spec.intro,
      bodySections: spec.bodySections,
      countrySlug: "uk",
      articleKind: "uk_explainer",
      category: EXPLAINER_CATEGORY,
      date: GENERATED_DATE,
      relatedPrisons: [],
      relatedGuides: spec.relatedGuides,
      relatedArticleSlugs: [],
      relatedCollections: [],
      hubLinks: [{ label: "England & Wales prison browse", href: "/prisons/uk" }],
      faqs: spec.faqs,
      sourceType: "generated",
      explainerKey: spec.key,
    });
  }

  return assignRelatedArticleSlugs(out);
}

export function assertNoSlugCollisions(manualSlugs: readonly string[], generated: GeneratedArticle[]): void {
  const manual = new Set(manualSlugs);
  for (const g of generated) {
    if (manual.has(g.slug)) {
      throw new Error(`Generated article slug collides with manual article: ${g.slug}`);
    }
  }
  const seen = new Set<string>();
  for (const g of generated) {
    if (seen.has(g.slug)) throw new Error(`Duplicate generated article slug: ${g.slug}`);
    seen.add(g.slug);
  }
}
