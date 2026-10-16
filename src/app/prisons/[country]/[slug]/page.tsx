import { notFound } from "next/navigation";
import { PrisonProfileView, formatPrisonMetaDescription } from "@/components/pages/PrisonProfileView";
import { RegionPrisonsView } from "@/components/pages/RegionPrisonsView";
import { IntlPrisonProfileView, formatIntlPrisonMetaDescription } from "@/components/pages/IntlPrisonProfileView";
import { resolveCountrySecondSegment, allCountrySecondSegmentParams } from "@/lib/routes/resolveCountrySecondSegment";
import { readMoreArticleForUsStateRegion } from "@/lib/programmatic/articles/readMoreArticle";
import { US_FEDERAL_HUB_EYEBROW, US_FEDERAL_HUB_FOOTNOTE } from "@/lib/programmatic/hubCopy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildPrisonPageTitle } from "@/lib/seo/prisonTitle";

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
    if (p.dataProvenance === "official_source") {
      return buildPageMetadata({
        title: `${p.name} | ${p.status === "closed" ? "Closed " : ""}Prison Information`,
        description: formatIntlPrisonMetaDescription(p),
        path: `/prisons/${country}/${slug}`,
      });
    }
    return buildPageMetadata({
      title: buildPrisonPageTitle(p),
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
  if (resolved.kind === "prison") {
    return resolved.prison.dataProvenance === "official_source" ? (
      <IntlPrisonProfileView prison={resolved.prison} />
    ) : (
      <PrisonProfileView prison={resolved.prison} />
    );
  }
  if (country === "us") {
    const rName = resolved.prisons[0]?.stateOrRegion || slug;
    const readMore = readMoreArticleForUsStateRegion(slug);
    return (
      <RegionPrisonsView
        countrySlug={country}
        regionSlug={slug}
        prisons={resolved.prisons}
        intro={`Federal Bureau of Prisons facilities grouped under ${rName} in this directory (${resolved.prisons.length} sites listed). State prisons and local jails are not included.`}
        eyebrow={US_FEDERAL_HUB_EYEBROW}
        footnote={US_FEDERAL_HUB_FOOTNOTE}
        readMoreLink={readMore ?? undefined}
      />
    );
  }
  if (country === "uk" && slug === "long-term-and-high-security-estate") {
    return (
      <RegionPrisonsView
        countrySlug={country}
        regionSlug={slug}
        prisons={resolved.prisons}
        intro="This page reflects the HMPPS-derived long-term and high-security administrative estate grouping. It is broader than a simple Category A list and can include establishments with different category labels or specialist long-term functions."
        footnote="Administrative estate groupings and individual prison categories serve different purposes. Check each prison profile and its linked official source for current facility information."
        readMoreLink={{ href: "/prisons/uk/collection/high-security", label: "Compare the high-security prison collection" }}
      />
    );
  }
  if (resolved.prisons.every((p) => p.dataProvenance === "official_source")) {
    const rName = resolved.prisons[0]?.stateOrRegion || slug;
    const cName = resolved.prisons[0]?.country || country;
    const closed = resolved.prisons.filter((p) => p.status === "closed").length;
    const open = resolved.prisons.length - closed;
    return (
      <RegionPrisonsView
        countrySlug={country}
        regionSlug={slug}
        prisons={resolved.prisons}
        intro={`${open} open facilit${open === 1 ? "y" : "ies"} in ${rName}, ${cName}${closed > 0 ? `, plus ${closed} closed facilit${closed === 1 ? "y" : "ies"} listed for reference` : ""}. Each profile links to the official source it was checked against.`}
      />
    );
  }
  return <RegionPrisonsView countrySlug={country} regionSlug={slug} prisons={resolved.prisons} />;
}
