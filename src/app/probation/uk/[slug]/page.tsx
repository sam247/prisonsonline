import { notFound } from "next/navigation";
import {
  getProbationCentresByCountry,
  getProbationRegionsByCountry,
  resolveProbationUkSecondSegment,
} from "@/lib/queries/probation";
import { ProbationCentreView, ProbationRegionView } from "@/components/pages/ProbationDirectoryViews";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  const centres = getProbationCentresByCountry("uk").map((c) => ({ slug: c.slug }));
  const regions = getProbationRegionsByCountry("uk").map((slug) => ({ slug }));
  return [...centres, ...regions];
}

export function generateMetadata({ params }: Props) {
  const resolved = resolveProbationUkSecondSegment(params.slug);
  if (resolved.kind === "not_found") {
    return buildPageMetadata({ title: "Not found", path: `/probation/uk/${params.slug}` });
  }
  if (resolved.kind === "centre") {
    return buildPageMetadata({
      title: `${resolved.centre.name} probation listing`,
      description: `Public directory listing details for ${resolved.centre.name}.`,
      path: `/probation/uk/${params.slug}`,
    });
  }
  const regionName = resolved.centres[0]?.region || params.slug;
  return buildPageMetadata({
    title: `Probation centres in ${regionName}`,
    description: `Directory of probation centres in ${regionName}.`,
    path: `/probation/uk/${params.slug}`,
  });
}

export default function ProbationUkSecondSegmentPage({ params }: Props) {
  const resolved = resolveProbationUkSecondSegment(params.slug);
  if (resolved.kind === "not_found") notFound();
  if (resolved.kind === "centre") return <ProbationCentreView centre={resolved.centre} />;
  const regionName = resolved.centres[0]?.region || params.slug;
  return <ProbationRegionView regionName={regionName} centres={resolved.centres} />;
}

