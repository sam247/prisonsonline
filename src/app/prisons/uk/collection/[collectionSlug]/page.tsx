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
    />
  );
}
