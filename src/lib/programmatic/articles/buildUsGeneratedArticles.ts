import { getPrisonsByRegion } from "@/data/prisons";
import type { GeneratedArticle } from "@/types/siteArticle";
import {
  listUsFacilityTypeHubSlugs,
  listUsStateRegionSlugsForArticles,
  resolveUsFacilityTypeHub,
} from "@/lib/programmatic/usFederalHubs";
import {
  slugUsStateArticle,
  slugUsFederalStateArticle,
  slugUsFacilityTypeExplainer,
} from "@/lib/programmatic/articles/slugRules";
import type { Prison } from "@/types/prison";

const US_DIR_CATEGORY = "United States (Federal) directories";
const US_EXPLAINER_CATEGORY = "United States (Federal) explainers";
const GENERATED_DATE = "2026-03-20";

const DATA_CAVEAT =
  "This site uses a BOP-derived listing from the build import. It is not a live government feed. Confirm visiting, security classification, and population with the Federal Bureau of Prisons.";

function facilityTypeLongLabel(typeSlug: string): string {
  const u = typeSlug.toLowerCase();
  const map: Record<string, string> = {
    usp: "United States Penitentiary (USP)",
    fci: "Federal Correctional Institution (FCI)",
    fpc: "Federal Prison Camp (FPC)",
    fdc: "Federal Detention Center (FDC)",
    fmc: "Federal Medical Center (FMC)",
    mcc: "Metropolitan Correctional Center (MCC)",
    mdc: "Metropolitan Detention Center (MDC)",
    other: "other BOP facility types",
  };
  return map[u] || `${u.toUpperCase()} (BOP designation)`;
}

function exampleNames(prisons: Prison[], n: number): string {
  return [...prisons]
    .sort((a, b) => a.name.localeCompare(b.name, "en-US"))
    .slice(0, n)
    .map((p) => p.name)
    .join(", ");
}

function assignUsRelatedSlugs(all: GeneratedArticle[]): GeneratedArticle[] {
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  return all.map((article) => {
    const related = new Set<string>();
    const add = (s: string) => {
      if (bySlug.has(s) && s !== article.slug) related.add(s);
    };
    if (article.articleKind === "us_state" && article.regionSlug) {
      add(slugUsFederalStateArticle(article.regionSlug));
    }
    if (article.articleKind === "us_federal_state" && article.regionSlug) {
      add(slugUsStateArticle(article.regionSlug));
    }
    if (article.articleKind === "us_facility_type_explainer" && article.facilityTypeSlug) {
      const otherTypes = listUsFacilityTypeHubSlugs().filter((t) => t !== article.facilityTypeSlug).slice(0, 2);
      for (const t of otherTypes) add(slugUsFacilityTypeExplainer(t));
    }
    return { ...article, relatedArticleSlugs: Array.from(related).slice(0, 5) };
  });
}

export function buildUsGeneratedArticles(): GeneratedArticle[] {
  const out: GeneratedArticle[] = [];

  for (const regionSlug of listUsStateRegionSlugsForArticles()) {
    const prisons = getPrisonsByRegion("us", regionSlug);
    if (prisons.length === 0) continue;
    const stateName = prisons[0]?.stateOrRegion || regionSlug;
    const count = prisons.length;
    const examples = exampleNames(prisons, 5);

    const stateSlug = slugUsStateArticle(regionSlug);
    out.push({
      id: `gen:${stateSlug}`,
      slug: stateSlug,
      title: `Prisons in ${stateName} (federal BOP listing in this directory)`,
      description: `Directory note for ${count} federal BOP facility records grouped under ${stateName} in this import. Not a complete list of all custody in the state.`,
      intro: `This page explains how we group federal Bureau of Prisons facilities recorded for ${stateName}. The state browse view lists ${count} establishment${count === 1 ? "" : "s"} from the current import.`,
      bodySections: [
        {
          id: "scope",
          heading: "What is included",
          paragraphs: [
            `Only federal BOP facilities present in our import are listed. State prisons, jails, and private facilities outside this dataset are not shown here.`,
            DATA_CAVEAT,
          ],
        },
        {
          id: "examples",
          heading: "Examples from the dataset",
          paragraphs: [
            examples
              ? `Illustrative entries: ${examples}. Use the links below for full profiles.`
              : "Open the state browse link for the full card grid.",
          ],
        },
      ],
      countrySlug: "us",
      articleKind: "us_state",
      category: US_DIR_CATEGORY,
      date: GENERATED_DATE,
      relatedPrisons: prisons.map((p) => p.slug),
      relatedGuides: ["prison-categories-explained", "life-inside-prison"],
      relatedArticleSlugs: [],
      relatedCollections: [],
      hubLinks: [{ label: `Browse facilities in ${stateName}`, href: `/prisons/us/${regionSlug}` }],
      faqs: [
        {
          question: "Does this list every prison in the state?",
          answer:
            "No. It lists federal BOP facilities from our import only. State departments of correction operate separate prison systems.",
        },
      ],
      sourceType: "generated",
      regionSlug,
    });

    const fedSlug = slugUsFederalStateArticle(regionSlug);
    out.push({
      id: `gen:${fedSlug}`,
      slug: fedSlug,
      title: `Federal prisons in ${stateName}: how this directory groups BOP sites`,
      description: `Context for ${count} federal (BOP) facility record${count === 1 ? "" : "s"} in ${stateName} on Prisons Online.`,
      intro: `All entries here are federal Bureau of Prisons sites in ${stateName} as represented in our BOP-derived dataset—not county jails or state prisons unless they appear separately in other parts of the site.`,
      bodySections: [
        {
          id: "federal",
          heading: "Federal vs state custody",
          paragraphs: [
            "Federal prisons hold people convicted of federal offences or otherwise in BOP custody. State systems are organised separately; this directory slice is federal-only.",
            DATA_CAVEAT,
          ],
        },
        {
          id: "count",
          heading: "Facilities in this group",
          paragraphs: [
            `The import currently includes ${count} federal site${count === 1 ? "" : "s"} for ${stateName}.`,
            examples ? `Examples: ${examples}.` : "",
          ].filter(Boolean),
        },
      ],
      countrySlug: "us",
      articleKind: "us_federal_state",
      category: US_DIR_CATEGORY,
      date: GENERATED_DATE,
      relatedPrisons: prisons.map((p) => p.slug),
      relatedGuides: ["prison-categories-explained"],
      relatedArticleSlugs: [],
      relatedCollections: [],
      hubLinks: [{ label: `Open the ${stateName} browse page`, href: `/prisons/us/${regionSlug}` }],
      sourceType: "generated",
      regionSlug,
    });
  }

  for (const typeSlug of listUsFacilityTypeHubSlugs()) {
    const resolved = resolveUsFacilityTypeHub(typeSlug);
    if (!resolved) continue;
    const { prisons, typeLabel } = resolved;
    const slug = slugUsFacilityTypeExplainer(typeSlug);
    const longLabel = facilityTypeLongLabel(typeSlug);
    const count = prisons.length;
    const examples = exampleNames(prisons, 5);

    out.push({
      id: `gen:${slug}`,
      slug,
      title: `What is a ${typeLabel} prison? (Federal BOP directory note)`,
      description: `Plain-language note on ${longLabel} facilities in the federal system, with ${count} example sites from this import.`,
      intro: `“${typeLabel}” is a Bureau of Prisons facility-type designation in our dataset. This article summarises what that label usually signals in a directory context—without replacing official BOP definitions or legal classifications.`,
      bodySections: [
        {
          id: "meaning",
          heading: "How we use this label",
          paragraphs: [
            `In this build, ${longLabel} appears on ${count} federal record${count === 1 ? "" : "s"}. Names and acronyms follow the import; operational detail varies by site.`,
            DATA_CAVEAT,
          ],
        },
        {
          id: "examples",
          heading: "Examples in this import",
          paragraphs: [
            examples
              ? `Named sites include: ${examples}.`
              : "See the facility-type hub for the full grid.",
          ],
        },
        {
          id: "hub",
          heading: "Browse by this facility type",
          paragraphs: [
            "Use the linked hub page to compare establishments that share this designation in our listing.",
          ],
        },
      ],
      countrySlug: "us",
      articleKind: "us_facility_type_explainer",
      category: US_EXPLAINER_CATEGORY,
      date: GENERATED_DATE,
      relatedPrisons: prisons.map((p) => p.slug),
      relatedGuides: ["prison-categories-explained", "life-inside-prison"],
      relatedArticleSlugs: [],
      relatedCollections: [],
      hubLinks: [{ label: `Open ${typeLabel} hub listing`, href: `/prisons/us/facility-type/${typeSlug}` }],
      faqs: [
        {
          question: "Is security level the same as facility type?",
          answer:
            "Not exactly. We show a simplified security label on profiles; facility type is a separate field from the import. Use BOP sources for authoritative classification.",
        },
      ],
      sourceType: "generated",
      facilityTypeSlug: typeSlug,
    });
  }

  return assignUsRelatedSlugs(out);
}
