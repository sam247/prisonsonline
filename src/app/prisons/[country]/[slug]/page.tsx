import { notFound } from "next/navigation";
import { PrisonProfileView, formatPrisonMetaDescription } from "@/components/pages/PrisonProfileView";
import { RegionPrisonsView } from "@/components/pages/RegionPrisonsView";
import { resolveCountrySecondSegment, allCountrySecondSegmentParams } from "@/lib/routes/resolveCountrySecondSegment";
import { readMoreArticleForUsStateRegion } from "@/lib/programmatic/articles/readMoreArticle";
import { US_FEDERAL_HUB_EYEBROW, US_FEDERAL_HUB_FOOTNOTE } from "@/lib/programmatic/hubCopy";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: { country: string; slug: string } };

export function generateStaticParams() {
  return allCountrySecondSegmentParams();
}

export function generateMetadata({ params }: Props) {
  const { country, slug } = params;
  const resolved = resolveCountrySecondSegment(country, slug);
  if (resolved.kind === "not_found") {
    return buildPageMetadata({ title: "Not found", path: `/prisons/${country}/${slug}` });
  }
  if (resolved.kind === "prison") {
    const p = resolved.prison;
    return buildPageMetadata({
      title: p.name,
      description: formatPrisonMetaDescription(p),
      path: `/prisons/${country}/${slug}`,
    });
  }
  const rName = resolved.prisons[0]?.stateOrRegion || slug;
  const cName = resolved.prisons[0]?.country || country;
  return buildPageMetadata({
    title: `Prisons in ${rName}`,
    description: `Prisons in ${rName}, ${cName}.`,
    path: `/prisons/${country}/${slug}`,
  });
}

export default function PrisonOrRegionPage({ params }: Props) {
  const { country, slug } = params;
  const resolved = resolveCountrySecondSegment(country, slug);
  if (resolved.kind === "not_found") notFound();
  if (resolved.kind === "prison") return <PrisonProfileView prison={resolved.prison} />;
  if (country === "us") {
    const rName = resolved.prisons[0]?.stateOrRegion || slug;
    const readMore = readMoreArticleForUsStateRegion(slug);
    return (
      <RegionPrisonsView
        countrySlug={country}
        regionSlug={slug}
        prisons={resolved.prisons}
        intro={`Federal Bureau of Prisons facilities grouped under ${rName} in this directory (${resolved.prisons.length} sites in the current import). State prisons and local jails are not included unless they appear elsewhere in the dataset.`}
        eyebrow={US_FEDERAL_HUB_EYEBROW}
        footnote={US_FEDERAL_HUB_FOOTNOTE}
        readMoreLink={readMore ?? undefined}
      />
    );
  }
  return <RegionPrisonsView countrySlug={country} regionSlug={slug} prisons={resolved.prisons} />;
}
