import { notFound } from "next/navigation";
import { UkHubListingPage } from "@/components/programmatic/UkHubListingPage";
import {
  listUsFacilityTypeHubSlugs,
  resolveUsFacilityTypeHub,
} from "@/lib/programmatic/usFederalHubs";
import { US_FEDERAL_HUB_EYEBROW, US_FEDERAL_HUB_FOOTNOTE } from "@/lib/programmatic/hubCopy";
import { readMoreArticleForUsFacilityTypeHub } from "@/lib/programmatic/articles/readMoreArticle";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: { typeSlug: string } };

export function generateStaticParams() {
  return listUsFacilityTypeHubSlugs().map((typeSlug) => ({ typeSlug }));
}

export function generateMetadata({ params }: Props) {
  const path = `/prisons/us/facility-type/${params.typeSlug}`;
  const r = resolveUsFacilityTypeHub(params.typeSlug);
  if (!r) {
    return buildPageMetadata({ title: "Not found", path });
  }
  const title = `${r.typeLabel} federal facilities (BOP listing)`;
  const description = `${r.prisons.length} federal Bureau of Prisons sites typed ${r.typeLabel} in this import. Directory listing only.`;
  return buildPageMetadata({ title, description, path });
}

export default function UsFacilityTypeHubPage({ params }: Props) {
  const r = resolveUsFacilityTypeHub(params.typeSlug);
  if (!r) notFound();

  const path = `/prisons/us/facility-type/${params.typeSlug}`;
  const title = `${r.typeLabel} federal facilities (United States)`;
  const subtitle = `${r.prisons.length} establishments from the BOP-derived import in this build.`;
  const intro =
    "Facility type codes come from the federal import (e.g. FCI, USP, FPC). They are administrative labels for browsing this directory, not a substitute for official BOP classification pages.";
  const readMore = readMoreArticleForUsFacilityTypeHub(params.typeSlug);

  return (
    <UkHubListingPage
      canonicalPath={path}
      jsonLdLeafName={`${r.typeLabel} facilities`}
      listingCountryForJsonLd={{ name: "United States (Federal)", path: "/prisons/us" }}
      breadcrumbs={[
        { label: "Prisons", href: "/prisons" },
        { label: "United States (Federal)", href: "/prisons/us" },
        { label: `${r.typeLabel} facilities` },
      ]}
      title={title}
      subtitle={subtitle}
      intro={intro}
      eyebrow={US_FEDERAL_HUB_EYEBROW}
      footnote={US_FEDERAL_HUB_FOOTNOTE}
      prisons={r.prisons}
      stats={[
        { label: "Establishments", value: r.prisons.length },
        { label: "Facility type", value: r.typeLabel },
      ]}
      readMoreLink={readMore ?? undefined}
    />
  );
}
