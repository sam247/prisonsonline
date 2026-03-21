import { notFound } from "next/navigation";
import { UkHubListingPage } from "@/components/programmatic/UkHubListingPage";
import {
  listUkOperatorHubSlugs,
  resolveUkOperatorHub,
} from "@/lib/programmatic/ukPrisonHubs";
import { readMoreArticleForUkOperatorHub } from "@/lib/programmatic/articles/readMoreArticle";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getUkHubEditorialImage } from "@/lib/media/resolvers";

type Props = { params: { operatorSlug: string } };

export function generateStaticParams() {
  return listUkOperatorHubSlugs().map((operatorSlug) => ({ operatorSlug }));
}

export function generateMetadata({ params }: Props) {
  const path = `/prisons/uk/operator/${params.operatorSlug}`;
  const r = resolveUkOperatorHub(params.operatorSlug);
  if (!r) {
    return buildPageMetadata({ title: "Not found", path });
  }
  const title = `${r.operatorLabel} prisons (England & Wales)`;
  const description = `Prisons in England and Wales listed under operator “${r.operatorLabel}” in HMPPS administrative data (${r.prisons.length} establishments).`;
  return buildPageMetadata({ title, description, path });
}

export default function UkOperatorHubPage({ params }: Props) {
  const r = resolveUkOperatorHub(params.operatorSlug);
  if (!r) notFound();

  const path = `/prisons/uk/operator/${params.operatorSlug}`;
  const title = `${r.operatorLabel} prisons (England & Wales)`;
  const subtitle = `${r.prisons.length} establishments from HMPPS import data.`;
  const intro =
    "Operator labels come directly from the HMPPS prison export. Counts reflect the current import only; always confirm management arrangements with official sources.";
  const leaf = r.operatorLabel;
  const readMore = readMoreArticleForUkOperatorHub(params.operatorSlug);

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
      prisons={r.prisons}
      stats={[
        { label: "Establishments", value: r.prisons.length },
        { label: "Operator", value: r.operatorLabel },
      ]}
      readMoreLink={readMore ?? undefined}
      heroImage={getUkHubEditorialImage("operator", params.operatorSlug)}
    />
  );
}
