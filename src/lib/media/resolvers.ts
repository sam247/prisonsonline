import { guides } from "@/data/guides";
import type { EditorialImage } from "@/types/media";
import type { GeneratedArticleKind, SiteArticle } from "@/types/siteArticle";
import { isGeneratedArticle, isManualSiteArticle } from "@/types/siteArticle";

export type UkHubImageKind = "collection" | "operator" | "category" | "function" | "subgroup";

function editorial(src: string, alt: string): EditorialImage {
  return { src, alt, type: "editorial" };
}

export function getHomeHeroEditorialImage(): EditorialImage {
  return editorial(
    "/images/editorial/home-hero.svg",
    "Abstract editorial graphic for prison directory browse — not a photograph of a named facility.",
  );
}

const countryEditorialBySlug: Record<string, EditorialImage> = {
  uk: editorial(
    "/images/countries/uk.svg",
    "Abstract editorial graphic representing United Kingdom prison listings — not a photograph of a facility.",
  ),
  us: editorial(
    "/images/countries/us.svg",
    "Abstract editorial graphic representing United States federal prison listings — not a photograph of a facility.",
  ),
  "united-states": editorial(
    "/images/countries/us.svg",
    "Abstract editorial graphic representing United States prison listings — not a photograph of a facility.",
  ),
};

export function getCountryEditorialImage(countrySlug: string): EditorialImage | undefined {
  return countryEditorialBySlug[countrySlug.toLowerCase()];
}

function humanizeSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Editorial banner for UK hub listing pages (collections, operators, categories, etc.). */
export function getUkHubEditorialImage(kind: UkHubImageKind, slug: string): EditorialImage {
  const label = humanizeSlug(slug);
  const base = "/images/editorial/hubs/uk-hub.svg";
  const kindPhrase =
    kind === "collection"
      ? "collection"
      : kind === "operator"
        ? "operator"
        : kind === "category"
          ? "security category"
          : kind === "function"
            ? "function"
            : "sub-group";
  return editorial(
    base,
    `Neutral editorial graphic for browsing UK prisons by ${kindPhrase}: ${label}. Not a photograph of a named prison.`,
  );
}

export function getUsFacilityTypeHubImage(typeSlug: string): EditorialImage {
  return editorial(
    "/images/editorial/hubs/us-federal-type.svg",
    `Neutral editorial graphic for browsing US federal facilities by type (${humanizeSlug(typeSlug)}). Not a facility photograph.`,
  );
}

const guideFallbackBySlug: Record<string, EditorialImage> = {
  "how-prison-visits-work": editorial(
    "/images/guides/how-prison-visits-work.svg",
    "Abstract illustration for a guide about prison visits — not a photograph of a facility.",
  ),
  "what-happens-going-to-prison": editorial(
    "/images/guides/what-happens-going-to-prison.svg",
    "Abstract illustration for a guide about reception into custody — not a photograph of a facility.",
  ),
  "prison-categories-explained": editorial(
    "/images/guides/prison-categories-explained.svg",
    "Abstract illustration for a guide about prison categories — not a photograph of a facility.",
  ),
  "how-prison-sentences-work": editorial(
    "/images/guides/guide-general.svg",
    "Abstract illustration for a guide about sentencing — not a photograph of a facility.",
  ),
  "life-inside-prison": editorial(
    "/images/guides/guide-general.svg",
    "Abstract illustration for daily life in custody — not a photograph of a facility.",
  ),
  "rights-of-prisoners": editorial(
    "/images/guides/guide-general.svg",
    "Abstract illustration for legal rights in custody — not a photograph of a facility.",
  ),
};

export function getGuideCoverImage(guideSlug: string): EditorialImage | undefined {
  const row = guides.find((g) => g.slug === guideSlug);
  if (row?.coverImage) return row.coverImage;
  return guideFallbackBySlug[guideSlug];
}

const manualArticleFallbackBySlug: Record<string, EditorialImage> = {
  "most-dangerous-prisons-world": editorial(
    "/images/articles/most-dangerous-prisons-world.svg",
    "Editorial graphic for an article about notable prisons — not a photograph of a specific named site.",
  ),
  "famous-prison-escapes": editorial(
    "/images/articles/famous-prison-escapes.svg",
    "Editorial graphic for historical prison escapes — not a photograph of a facility.",
  ),
  "history-supermax-prisons": editorial(
    "/images/articles/history-supermax-prisons.svg",
    "Editorial graphic for supermax history context — not a photograph of a facility.",
  ),
};

const generatedKindToSrc: Record<GeneratedArticleKind, string> = {
  uk_region: "/images/editorial/articles/uk-directory-note.svg",
  uk_operator: "/images/editorial/articles/uk-directory-note.svg",
  uk_security: "/images/editorial/articles/uk-directory-note.svg",
  uk_collection: "/images/editorial/articles/uk-directory-note.svg",
  uk_explainer: "/images/editorial/articles/uk-directory-note.svg",
  us_state: "/images/editorial/articles/us-directory-note.svg",
  us_federal_state: "/images/editorial/articles/us-directory-note.svg",
  us_facility_type_explainer: "/images/editorial/articles/us-directory-note.svg",
};

function generatedArticleCover(kind: GeneratedArticleKind, slug: string): EditorialImage {
  const src = generatedKindToSrc[kind] ?? "/images/editorial/articles/uk-directory-note.svg";
  return editorial(
    src,
    `Dataset-backed directory note (${humanizeSlug(slug)}). Thematic graphic only — not a photograph of a named facility.`,
  );
}

export function getArticleCoverImage(article: SiteArticle): EditorialImage | undefined {
  if (isManualSiteArticle(article)) {
    if (article.coverImage) return article.coverImage;
    return manualArticleFallbackBySlug[article.slug];
  }
  if (isGeneratedArticle(article)) {
    return generatedArticleCover(article.articleKind, article.slug);
  }
  return undefined;
}

/** Region browse strip — generic editorial, not tied to a named establishment. */
export function getRegionBrowseEditorialImage(countrySlug: string, regionSlug: string): EditorialImage {
  const c = countrySlug.toLowerCase();
  const r = humanizeSlug(regionSlug);
  if (c === "uk") {
    return editorial(
      "/images/editorial/region-browse-uk.svg",
      `Neutral browse graphic for prisons in ${r}, United Kingdom — not a facility photograph.`,
    );
  }
  if (c === "us" || c === "united-states") {
    return editorial(
      "/images/editorial/region-browse-us.svg",
      `Neutral browse graphic for prisons in ${r}, United States — not a facility photograph.`,
    );
  }
  return editorial(
    "/images/editorial/region-browse.svg",
    `Neutral browse graphic for prisons in ${r} — not a facility photograph.`,
  );
}
