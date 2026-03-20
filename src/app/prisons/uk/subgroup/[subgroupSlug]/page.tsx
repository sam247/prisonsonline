import { notFound } from "next/navigation";
import { UkHubListingPage } from "@/components/programmatic/UkHubListingPage";
import {
  listUkSubgroupHubSlugs,
  resolveUkSubgroupHub,
} from "@/lib/programmatic/ukPrisonHubs";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: { subgroupSlug: string } };

export function generateStaticParams() {
  return listUkSubgroupHubSlugs().map((subgroupSlug) => ({ subgroupSlug }));
}

export function generateMetadata({ params }: Props) {
  const path = `/prisons/uk/subgroup/${params.subgroupSlug}`;
  const r = resolveUkSubgroupHub(params.subgroupSlug);
  if (!r) {
    return buildPageMetadata({ title: "Not found", path });
  }
  const title = `${r.subgroupLabel} prisons (England & Wales)`;
  const description = `Prisons grouped under HMPPS “Prison Sub-Group 1: ${r.subgroupLabel}” (${r.prisons.length} establishments).`;
  return buildPageMetadata({ title, description, path });
}

export default function UkSubgroupHubPage({ params }: Props) {
  const r = resolveUkSubgroupHub(params.subgroupSlug);
  if (!r) notFound();

  const path = `/prisons/uk/subgroup/${params.subgroupSlug}`;
  const title = `${r.subgroupLabel} prisons (England & Wales)`;
  const subtitle = `${r.prisons.length} establishments in this administrative sub-group.`;
  const intro =
    "Sub-groups are taken from the HMPPS “Prison Sub-Group 1” field. They reflect administrative clustering, not necessarily a single security level or function.";
  const leaf = r.subgroupLabel;

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
        { label: "Sub-group", value: r.subgroupLabel },
      ]}
    />
  );
}
