import { ProbationDirectoryIndexView } from "@/components/pages/ProbationDirectoryViews";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getProbationCentresByCountry,
  getProbationCentresByRegion,
  getProbationRegionsByCountry,
} from "@/lib/queries/probation";

export function generateMetadata() {
  return buildPageMetadata({
    title: "UK probation centres directory",
    description: "Browse UK probation offices and reporting centres by region.",
    path: "/probation",
  });
}

export default function ProbationDirectoryPage() {
  const countrySlug = "uk";
  const all = getProbationCentresByCountry(countrySlug);
  const regions = getProbationRegionsByCountry(countrySlug).map((slug) => ({
    slug,
    name: getProbationCentresByRegion(countrySlug, slug)[0]?.region || slug,
    count: getProbationCentresByRegion(countrySlug, slug).length,
  }));

  return <ProbationDirectoryIndexView regions={regions} total={all.length} />;
}

