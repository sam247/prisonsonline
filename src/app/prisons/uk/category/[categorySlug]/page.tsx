import { notFound } from "next/navigation";
import { UkHubListingPage } from "@/components/programmatic/UkHubListingPage";
import {
  listUkSecurityHubSlugs,
  getPrisonsForUkSecurityHub,
  securityLevelForCategorySlug,
} from "@/lib/programmatic/ukPrisonHubs";
import { readMoreArticleForUkSecurityHub } from "@/lib/programmatic/articles/readMoreArticle";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getUkHubEditorialImage } from "@/lib/media/resolvers";

type Props = { params: { categorySlug: string } };

export function generateStaticParams() {
  return listUkSecurityHubSlugs().map((categorySlug) => ({ categorySlug }));
}

export function generateMetadata({ params }: Props) {
  const path = `/prisons/uk/category/${params.categorySlug}`;
  const level = securityLevelForCategorySlug(params.categorySlug);
  const list = getPrisonsForUkSecurityHub(params.categorySlug);
  if (!level || list.length === 0) {
    return buildPageMetadata({ title: "Not found", path });
  }
  const title = `${level} prisons in England & Wales`;
  const description = `Browse ${list.length} ${level} prisons in England and Wales. HMPPS-based directory listing grouped by security category.`;
  return buildPageMetadata({ title, description, path });
}

export default function UkSecurityCategoryHubPage({ params }: Props) {
  const level = securityLevelForCategorySlug(params.categorySlug);
  const prisonList = getPrisonsForUkSecurityHub(params.categorySlug);
  if (!level || prisonList.length === 0) notFound();

  const path = `/prisons/uk/category/${params.categorySlug}`;
  const title = `${level} prisons in England & Wales`;
  const subtitle = `${prisonList.length} establishments classified as ${level} in this import.`;
  const definition =
    level === "Category B"
      ? "Category B prisons hold people for whom the highest security is not required but escape must be made very difficult."
      : level === "Category C"
        ? "Category C prisons hold people who cannot be trusted in open conditions but are considered unlikely to try to escape."
        : `This page groups establishments mapped to ${level} in the current prison dataset.`;
  const intro = `${definition} The list below is a directory view, not an operational or placement decision.`;
  const leaf = level;
  const readMore = readMoreArticleForUkSecurityHub(params.categorySlug);

  return (
    <UkHubListingPage
      canonicalPath={path}
      jsonLdLeafName={leaf}
      breadcrumbs={[
        { label: "Prisons", href: "/prisons" },
        { label: "United Kingdom", href: "/prisons/uk" },
        { label: leaf },
      ]}
      title={title}
      subtitle={subtitle}
      intro={intro}
      prisons={prisonList}
      stats={[
        { label: "Establishments", value: prisonList.length },
        { label: "Category", value: level },
      ]}
      readMoreLink={readMore ?? undefined}
      heroImage={getUkHubEditorialImage("category", params.categorySlug)}
      methodology="Category mapping uses the HMPPS-derived category, predominant-function and cohort fields in the current import. Facility profiles retain the source labels so the grouping can be checked."
      officialSources={[{ href: "https://www.gov.uk/guidance/categorisation-recategorisation-and-open-conditions", label: "GOV.UK categorisation guidance" }]}
      relatedLinks={[
        { href: "/prisons/uk/collection/high-security", label: "High-security prisons" },
        { href: "/prisons/uk/collection/open-prisons", label: "Open prisons" },
        { href: "/prisons/uk", label: "All UK prisons" },
      ]}
    />
  );
}
