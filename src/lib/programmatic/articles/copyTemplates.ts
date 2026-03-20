import type { Prison } from "@/types/prison";
import type { GeneratedArticleBodySection, GeneratedArticleFaq } from "@/types/siteArticle";
import type { UkCollectionSlug } from "@/lib/programmatic/collections";
import { getProgrammaticCollection } from "@/lib/programmatic/collections";

const DATA_CAVEAT =
  "Figures and labels on Prisons Online come from the HMPPS prison export used in this build. Security category and function wording are administrative fields in that source (and category may be inferred where the export does not map cleanly). Always confirm visiting rules, contact details, and regime information with official HMPPS or GOV.UK sources.";

function sortPrisonsByName(prisons: Prison[]): Prison[] {
  return [...prisons].sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
}

function exampleNames(prisons: Prison[], n: number): string {
  return sortPrisonsByName(prisons)
    .slice(0, n)
    .map((p) => p.name)
    .join(", ");
}

export function buildRegionArticleSections(
  regionName: string,
  regionSlug: string,
  prisons: Prison[],
): { bodySections: GeneratedArticleBodySection[]; faqs: GeneratedArticleFaq[] } {
  const count = prisons.length;
  const examples = exampleNames(prisons, 5);
  const bodySections: GeneratedArticleBodySection[] = [
    {
      id: "purpose",
      heading: "What this page is for",
      paragraphs: [
        `This article helps you understand how we group prisons under “${regionName}” in our England and Wales directory. It is a companion to the regional listing, not a substitute for official prison finder tools.`,
        "Use it to see how many establishments fall under this regional label in our current import, and to jump to individual profiles or the full regional grid.",
      ],
    },
    {
      id: "grouping",
      heading: "How the regional group is defined",
      paragraphs: [
        `We include ${count} establishment${count === 1 ? "" : "s"} whose administrative region in the import matches “${regionName}”. Region names and boundaries follow the source data; if a site sits near a border, check the establishment profile and official listings.`,
        DATA_CAVEAT,
      ],
    },
    {
      id: "examples",
      heading: "Examples from the current import",
      paragraphs: [
        examples
          ? `Illustrative entries include: ${examples}. Every named establishment in this group appears in the related list below with a link to its profile.`
          : "Establishments in this group are listed below.",
      ],
    },
    {
      id: "navigate",
      heading: "Where to go next",
      paragraphs: [
        `Open the regional browse page for “${regionName}” to see the same group as a grid of cards, or follow individual prison links for addresses and contact channels where we hold them.`,
      ],
    },
  ];
  const faqs: GeneratedArticleFaq[] = [
    {
      question: "Is this an official government list?",
      answer:
        "No. It is an independent directory built from an HMPPS-derived dataset. Always use GOV.UK and HMPPS sources for authoritative information.",
    },
    {
      question: "Why might my prison not appear in this region?",
      answer:
        "Labels come from the import. If the establishment is listed under a different region name in the source, it will appear under that region in our site.",
    },
  ];
  return { bodySections, faqs };
}

export function buildOperatorArticleSections(
  operatorLabel: string,
  prisons: Prison[],
): { bodySections: GeneratedArticleBodySection[]; faqs: GeneratedArticleFaq[] } {
  const count = prisons.length;
  const examples = exampleNames(prisons, 5);
  const bodySections: GeneratedArticleBodySection[] = [
    {
      id: "purpose",
      heading: "What this page is for",
      paragraphs: [
        `This article explains how we list prisons associated with “${operatorLabel}” in our England and Wales dataset. It complements the operator hub page, which shows the live grid for that label.`,
        "Operator strings are taken from the HMPPS export; management arrangements can change, so treat the label as a directory snapshot rather than a legal description of the contract.",
      ],
    },
    {
      id: "count",
      heading: "Establishments in this operator group",
      paragraphs: [
        `The current import includes ${count} establishment${count === 1 ? "" : "s"} sharing this operator label.`,
        examples
          ? `Examples include: ${examples}. Full membership is linked below and on the operator hub.`
          : "Linked profiles below match this group.",
        DATA_CAVEAT,
      ],
    },
  ];
  const faqs: GeneratedArticleFaq[] = [
    {
      question: "Does “operator” mean the prison is privately run?",
      answer:
        "Not necessarily. The field reflects the label in the import (which may include the public sector as well as contracted providers). Check official sources for contract status.",
    },
  ];
  return { bodySections, faqs };
}

export function buildSecurityArticleSections(
  categoryLabel: string,
  categorySlug: string,
  prisons: Prison[],
): { bodySections: GeneratedArticleBodySection[]; faqs: GeneratedArticleFaq[] } {
  const count = prisons.length;
  const examples = exampleNames(prisons, 5);
  const bodySections: GeneratedArticleBodySection[] = [
    {
      id: "purpose",
      heading: "What this page is for",
      paragraphs: [
        `This article describes how “${categoryLabel}” appears in our England and Wales directory and how many establishments currently map to it.`,
        "It is intended to help readers interpret our listings alongside the separate category hub and our general guide on prison categories.",
      ],
    },
    {
      id: "mapping",
      heading: "How category is represented here",
      paragraphs: [
        `We currently associate ${count} establishment${count === 1 ? "" : "s"} with this category band in the import-derived model. Mapping uses administrative fields and, where needed, inference rules documented in our data pipeline notes.`,
        DATA_CAVEAT,
      ],
    },
    {
      id: "examples",
      heading: "Examples from the dataset",
      paragraphs: [
        examples
          ? `Illustrative entries: ${examples}. Use the hub page for the complete filtered grid.`
          : "See the hub page for the full grid.",
      ],
    },
  ];
  const faqs: GeneratedArticleFaq[] = [
    {
      question: "Is this the same as a legal security classification?",
      answer:
        "Our site reflects labels derived from published administrative data. Official security category decisions are made by HMPPS; confirm category with the establishment or official channels.",
    },
  ];
  return { bodySections, faqs };
}

export function buildCollectionArticleSections(
  collectionSlug: UkCollectionSlug,
  prisons: Prison[],
): { bodySections: GeneratedArticleBodySection[]; faqs: GeneratedArticleFaq[] } {
  const spec = getProgrammaticCollection(collectionSlug);
  const title = spec?.title ?? collectionSlug;
  const count = prisons.length;
  const examples = exampleNames(prisons, 5);
  const bodySections: GeneratedArticleBodySection[] = [
    {
      id: "purpose",
      heading: "What this thematic list means",
      paragraphs: [
        `“${title}” is a thematic slice of our England and Wales directory. This article explains the intent of that slice and how many prisons it currently contains.`,
        spec?.intro
          ? `From the collection hub: ${spec.intro}`
          : "The collection hub applies transparent filters to the same import you see elsewhere on the site.",
      ],
    },
    {
      id: "count",
      heading: "Size of the group today",
      paragraphs: [
        `The current import places ${count} establishment${count === 1 ? "" : "s"} in this thematic group. Counts change when the underlying export changes.`,
        examples ? `Examples include: ${examples}.` : "",
        DATA_CAVEAT,
      ].filter(Boolean),
    },
    {
      id: "navigate",
      heading: "Using the collection hub",
      paragraphs: [
        "The linked collection page is the canonical card grid for this filter. Use this article when you want narrative context and quick links into examples before browsing the full set.",
      ],
    },
  ];
  const faqs: GeneratedArticleFaq[] = [
    {
      question: "Why is a prison missing from this thematic list?",
      answer:
        "Thematic groups use explicit rules on gender, function text, category, and operator fields. If the source label differs, the site may classify the prison under another collection or only under the general UK browse.",
    },
  ];
  return { bodySections, faqs };
}

export interface ExplainerSpec {
  key: string;
  title: string;
  description: string;
  intro: string;
  bodySections: GeneratedArticleBodySection[];
  faqs: GeneratedArticleFaq[];
  relatedGuides: string[];
}

export function buildExplainerSpecs(params: {
  ukPrisonCount: number;
  categoryCounts: { label: string; count: number }[];
  trainingCount: number;
  receptionCount: number;
  openCollectionCount: number;
  privateCollectionCount: number;
  examplePrivateNames: string;
  exampleTrainingNames: string;
}): ExplainerSpec[] {
  const {
    ukPrisonCount,
    categoryCounts,
    trainingCount,
    receptionCount,
    openCollectionCount,
    privateCollectionCount,
    examplePrivateNames,
    exampleTrainingNames,
  } = params;

  const catSummary = categoryCounts
    .filter((c) => c.count > 0)
    .map((c) => `${c.label}: ${c.count}`)
    .join("; ");

  const specs: ExplainerSpec[] = [
    {
      key: "prison-categories-directory",
      title: "How prison category labels appear in this directory",
      description:
        "Plain-English notes on how England and Wales security bands show up in our HMPPS-derived listings, without replacing official HMPPS guidance.",
      intro:
        "This short guide explains what our category-based pages represent, how they relate to the data import, and where to verify information.",
      relatedGuides: ["prison-categories-explained"],
      bodySections: [
        {
          id: "scope",
          heading: "Scope",
          paragraphs: [
            "Prisons Online is a reference site. Category and function fields are displayed as they are modelled from the HMPPS prison export in this build.",
            DATA_CAVEAT,
          ],
        },
        {
          id: "counts",
          heading: "What the import contains today",
          paragraphs: [
            `Across England and Wales we currently hold ${ukPrisonCount} prison records in this build.`,
            catSummary
              ? `Category-band counts in our model (for hubs that meet our minimum size rules) include: ${catSummary}.`
              : "Category bands are available on hub pages where the dataset groups enough establishments together.",
          ],
        },
        {
          id: "next",
          heading: "Read next",
          paragraphs: [
            "Use our general guide on prison categories for wider context, and individual prison profiles for establishment-specific details where we publish them.",
          ],
        },
      ],
      faqs: [
        {
          question: "Why does a profile show a category I did not expect?",
          answer:
            "The site applies mapping rules to administrative fields. If something looks wrong, trust official HMPPS or GOV.UK listings and treat our page as a directory snapshot only.",
        },
      ],
    },
    {
      key: "training-reception-hmpps-fields",
      title: "What “training” and “reception” mean in our HMPPS-based listings",
      description:
        "How we use predominant function text from the import for training and reception themed collections—without claiming a legal definition.",
      intro:
        "Training and reception themed pages filter on wording in the HMPPS export. This article clarifies that mechanism for readers using our collections.",
      relatedGuides: ["what-happens-going-to-prison", "life-inside-prison"],
      bodySections: [
        {
          id: "training",
          heading: "Training-related labels",
          paragraphs: [
            `Our “training prisons” collection looks for trainer or training wording in the predominant function field. ${trainingCount} establishment${trainingCount === 1 ? "" : "s"} currently match that collection filter.`,
            exampleTrainingNames
              ? `Illustrative names from that set: ${exampleTrainingNames}.`
              : "",
          ].filter(Boolean),
        },
        {
          id: "reception",
          heading: "Reception-related labels",
          paragraphs: [
            `Our “reception prisons” collection looks for reception wording in the predominant function field (and related cohort text where applicable). ${receptionCount} establishment${receptionCount === 1 ? "" : "s"} currently match.`,
            DATA_CAVEAT,
          ],
        },
      ],
      faqs: [
        {
          question: "Is this the same as HMPPS’s internal reception definition?",
          answer:
            "No. We only mirror text fields present in the published-style export we import. Operational definitions sit with HMPPS.",
        },
      ],
    },
    {
      key: "private-prisons-dataset",
      title: "Privately managed prisons in this dataset",
      description:
        "How we flag privately managed prisons from operator and sub-group fields, and how many appear in the current England and Wales import.",
      intro:
        "Private-sector involvement is identified from administrative labels, not from contract documents. This page summarises what that means for our directory.",
      relatedGuides: ["prison-categories-explained", "rights-of-prisoners"],
      bodySections: [
        {
          id: "definition",
          heading: "What we treat as privately managed",
          paragraphs: [
            "We reuse the same rules as our private-prisons collection: operator names and sub-group labels that indicate private management in the HMPPS export.",
            `At present ${privateCollectionCount} establishment${privateCollectionCount === 1 ? "" : "s"} appear in that thematic collection.`,
            examplePrivateNames
              ? `Examples from the dataset: ${examplePrivateNames}.`
              : "",
            DATA_CAVEAT,
          ].filter(Boolean),
        },
      ],
      faqs: [
        {
          question: "Can management change?",
          answer:
            "Yes. The operator field can change when contracts change. Always confirm the current operator with official sources.",
        },
      ],
    },
    {
      key: "open-prisons-category-d",
      title: "Open prisons and Category D in our listings",
      description:
        "How open-condition sites are identified from category and function text in the import, and how many appear in our open-prisons collection.",
      intro:
        "Open conditions are sensitive to regime and category. Our site reflects import fields only.",
      relatedGuides: ["prison-categories-explained", "life-inside-prison"],
      bodySections: [
        {
          id: "open",
          heading: "Open prisons collection",
          paragraphs: [
            `Our open-prisons thematic list includes Category D sites and establishments whose predominant function text references open conditions where the import supports it. ${openCollectionCount} establishment${openCollectionCount === 1 ? "" : "s"} currently match that collection.`,
            DATA_CAVEAT,
          ],
        },
      ],
      faqs: [
        {
          question: "Does appearing here mean someone can self-report?",
          answer:
            "No. Placement and licensing decisions are made by HMPPS. This page only describes how we group published administrative data.",
        },
      ],
    },
    {
      key: "using-this-directory",
      title: "Using this directory alongside official sources",
      description:
        "How to interpret Prisons Online’s England and Wales pages, hubs, and articles as navigational aids rather than authoritative casework tools.",
      intro:
        "If you are researching a prison, planning a visit, or supporting someone in custody, start here to understand what our site can and cannot tell you.",
      relatedGuides: ["how-prison-visits-work", "rights-of-prisoners", "prison-categories-explained"],
      bodySections: [
        {
          id: "good_for",
          heading: "What the site is good for",
          paragraphs: [
            "Browsing establishments by region, operator, category band, and thematic collections derived from the same import.",
            "Jumping from overview articles into profile pages and hub grids when you want a structured list.",
          ],
        },
        {
          id: "not_for",
          heading: "What the site is not",
          paragraphs: [
            "We do not publish inspection grades, legal advice, or real-time population statistics.",
            "We do not replace GOV.UK prison finder, HMPPS contact details, or legal representatives.",
          ],
        },
        {
          id: "data",
          heading: "Data freshness",
          paragraphs: [
            `This build includes ${ukPrisonCount} England and Wales prison records from our pipeline. Regenerate the site after import updates to refresh counts and labels.`,
          ],
        },
      ],
      faqs: [
        {
          question: "Where should I confirm visiting hours?",
          answer: "Use the official prison page or phone the establishment. Our profiles may omit or summarise contact channels.",
        },
      ],
    },
  ];

  return specs;
}
