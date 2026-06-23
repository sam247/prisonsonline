import { notFound } from "next/navigation";
import { UkHubListingPage } from "@/components/programmatic/UkHubListingPage";
import {
  listUkSecurityHubSlugs,
  getPrisonsForUkSecurityHub,
  securityLevelForCategorySlug,
  securityHubTitle,
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
  const intro =
    "Browse prisons grouped under this England and Wales security category view. Category mapping is inferred from HMPPS predominant function, cohort, and related text in the build pipeline, so always verify category with HM Prison and Probation Service or official listings.";
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
    />
  );
}
