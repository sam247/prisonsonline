import { notFound } from "next/navigation";
import { UkHubListingPage } from "@/components/programmatic/UkHubListingPage";
import {
  getPrisonsForUkCollection,
  getProgrammaticCollection,
  isUkCollectionSlug,
  listUkCollectionSlugs,
} from "@/lib/programmatic/collections";
import { readMoreArticleForUkCollectionHub } from "@/lib/programmatic/articles/readMoreArticle";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getUkHubEditorialImage } from "@/lib/media/resolvers";

type Props = { params: { collectionSlug: string } };

export function generateStaticParams() {
  return listUkCollectionSlugs().map((collectionSlug) => ({ collectionSlug }));
}

export function generateMetadata({ params }: Props) {
  const spec = getProgrammaticCollection(params.collectionSlug);
  if (!spec) {
    return buildPageMetadata({
      title: "Not found",
      path: `/prisons/uk/collection/${params.collectionSlug}`,
    });
  }
  return buildPageMetadata({
    title: spec.title,
    description: spec.metaDescription,
    path: spec.canonicalPath,
  });
}

export default function UkCollectionPage({ params }: Props) {
  const { collectionSlug } = params;
  if (!isUkCollectionSlug(collectionSlug)) notFound();

  const spec = getProgrammaticCollection(collectionSlug)!;
  const prisonList = getPrisonsForUkCollection(collectionSlug);
  const stats = [
    { label: "Establishments", value: prisonList.length },
    { label: "Collection", value: spec.breadcrumbLabel ?? spec.title },
  ];

  const readMore = readMoreArticleForUkCollectionHub(collectionSlug);

  return (
    <UkHubListingPage
      canonicalPath={spec.canonicalPath}
      jsonLdLeafName={spec.breadcrumbLabel ?? spec.title}
      breadcrumbs={[
        { label: "Prisons", href: "/prisons" },
        { label: "United Kingdom", href: "/prisons/uk" },
        { label: spec.breadcrumbLabel ?? spec.title },
      ]}
      title={spec.title}
      subtitle={spec.subtitle}
      intro={spec.intro}
      prisons={prisonList}
      stats={stats}
      readMoreLink={readMore ?? undefined}
      heroImage={getUkHubEditorialImage("collection", collectionSlug)}
      methodology="Collections are calculated from visible HMPPS-derived fields such as gender, category, predominant function and operator. Counts update with the underlying import; no establishments are added manually to inflate the list."
      officialSources={[{ href: "https://www.gov.uk/government/collections/prisons-in-england-and-wales", label: "GOV.UK prisons in England and Wales" }]}
      relatedLinks={collectionSlug === "womens-prisons" ? [
        { href: "/prisons/uk/function/female", label: "Female function classification" },
        { href: "/prisons/uk", label: "All UK prisons" },
      ] : collectionSlug === "high-security" ? [
        { href: "/prisons/uk/long-term-and-high-security-estate", label: "Long-term and high-security estate" },
        { href: "/prisons/uk/category/category-b", label: "Category B prisons" },
      ] : collectionSlug === "private-prisons" ? [
        { href: "/prisons/uk", label: "All UK prisons" },
        { href: "/prisons/uk/collection/high-security", label: "High-security prisons" },
      ] : undefined}
    />
  );
}
