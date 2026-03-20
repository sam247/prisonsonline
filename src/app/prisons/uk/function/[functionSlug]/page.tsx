import { notFound } from "next/navigation";
import { UkHubListingPage } from "@/components/programmatic/UkHubListingPage";
import {
  listUkFunctionHubSlugs,
  resolveUkFunctionHub,
} from "@/lib/programmatic/ukPrisonHubs";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: { functionSlug: string } };

export function generateStaticParams() {
  return listUkFunctionHubSlugs().map((functionSlug) => ({ functionSlug }));
}

export function generateMetadata({ params }: Props) {
  const path = `/prisons/uk/function/${params.functionSlug}`;
  const r = resolveUkFunctionHub(params.functionSlug);
  if (!r) {
    return buildPageMetadata({ title: "Not found", path });
  }
  const title = `${r.functionLabel} prisons (England & Wales)`;
  const description = `Prisons whose predominant function is “${r.functionLabel}” in the HMPPS export (${r.prisons.length} establishments).`;
  return buildPageMetadata({ title, description, path });
}

export default function UkFunctionHubPage({ params }: Props) {
  const r = resolveUkFunctionHub(params.functionSlug);
  if (!r) notFound();

  const path = `/prisons/uk/function/${params.functionSlug}`;
  const title = `${r.functionLabel} prisons (England & Wales)`;
  const subtitle = `${r.prisons.length} establishments sharing this predominant function label.`;
  const intro =
    "Grouping uses the exact “Predominant Function” text from the import. Spelling variants would appear as separate lists if introduced in source data.";
  const leaf = r.functionLabel;

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
        { label: "Function", value: r.functionLabel },
      ]}
    />
  );
}
