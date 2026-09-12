import { notFound } from "next/navigation";
import { CourtProfileView, CourtTypeHubView } from "@/components/pages/CourtsDirectoryViews";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getIndexableCourts,
  listCourtTypeHubSummaries,
  resolveCourtSlug,
  courtJurisdictionLabel,
} from "@/lib/queries/courts";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  const hubs = listCourtTypeHubSummaries().map((h) => ({ slug: h.slug }));
  const courts = getIndexableCourts().map((c) => ({ slug: c.slug }));
  return [...hubs, ...courts];
}

export function generateMetadata({ params }: Props) {
  const resolved = resolveCourtSlug(params.slug);
  if (resolved.kind === "not_found") {
    return buildPageMetadata({ title: "Not found", path: `/courts/${params.slug}` });
  }
  if (resolved.kind === "hub") {
    return buildPageMetadata({
      title: `${resolved.hub.label} directory`,
      description: resolved.hub.description,
      path: `/courts/${params.slug}`,
    });
  }
  const court = resolved.court;
  const type = courtJurisdictionLabel(court);
  const title = `${court.name}: Address, Contact Details & Information`;
  const bits = [
    "Find",
    type ? `${type.toLowerCase()} ` : "",
    "address and visitor information for ",
    court.name,
    court.postcode ? ` (${court.postcode})` : "",
    ".",
  ];
  return buildPageMetadata({
    title,
    description: bits.join(""),
    path: `/courts/${params.slug}`,
    preserveTitle: true,
  });
}

export default function CourtSlugPage({ params }: Props) {
  const resolved = resolveCourtSlug(params.slug);
  if (resolved.kind === "not_found") notFound();
  if (resolved.kind === "hub") {
    return (
      <CourtTypeHubView
        label={resolved.hub.label}
        description={resolved.hub.description}
        courts={resolved.courts}
        hubSlug={resolved.hub.slug}
      />
    );
  }
  return <CourtProfileView court={resolved.court} />;
}
