import { notFound } from "next/navigation";
import { UkHubListingPage } from "@/components/programmatic/UkHubListingPage";
import {
  listUkSubgroupHubSlugs,
  resolveUkSubgroupHub,
} from "@/lib/programmatic/ukPrisonHubs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getUkHubEditorialImage } from "@/lib/media/resolvers";

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
  const title = `${r.subgroupLabel} prisons in England & Wales`;
  const description = `Browse ${r.prisons.length} prisons in the HMPPS administrative sub-group “${r.subgroupLabel}” across England and Wales.`;
  return buildPageMetadata({ title, description, path });
}

export default function UkSubgroupHubPage({ params }: Props) {
  const r = resolveUkSubgroupHub(params.subgroupSlug);
  if (!r) notFound();

  const path = `/prisons/uk/subgroup/${params.subgroupSlug}`;
  const title = `${r.subgroupLabel} prisons in England & Wales`;
  const subtitle = `${r.prisons.length} establishments in this administrative sub-group.`;
  const intro = params.subgroupSlug === "long-term-and-high-security-estate"
    ? "This is the exact HMPPS-derived “Prison Sub-Group 1” classification for the long-term and high-security estate. It is an administrative grouping, not a synonym for Category A or the broader high-security collection."
    : "Browse prisons in this HMPPS administrative sub-group for England and Wales. Sub-groups come from the “Prison Sub-Group 1” field and reflect administrative clustering, not necessarily a single security level or function.";
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
      heroImage={getUkHubEditorialImage("subgroup", params.subgroupSlug)}
      methodology="Sub-group pages use the exact Prison Sub-Group 1 value from the current HMPPS-derived import."
      relatedLinks={params.subgroupSlug === "long-term-and-high-security-estate" ? [
        { href: "/prisons/uk/collection/high-security", label: "High-security prison collection" },
        { href: "/prisons/uk/long-term-and-high-security-estate", label: "Administrative estate region" },
      ] : undefined}
    />
  );
}
