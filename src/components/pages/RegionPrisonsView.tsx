import { PrisonListingTemplate } from "@/components/programmatic/PrisonListingTemplate";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { getBaseUrl } from "@/lib/site";
import { getRegionBrowseEditorialImage } from "@/lib/media/resolvers";
import type { Prison } from "@/types/prison";
import type { PrisonListingCrumb } from "@/components/programmatic/PrisonListingTemplate";

export function RegionPrisonsView({
  countrySlug,
  regionSlug,
  prisons: regionPrisons,
  intro,
  footnote,
  eyebrow,
  readMoreLink,
}: {
  countrySlug: string;
  regionSlug: string;
  prisons: Prison[];
  intro?: string;
  footnote?: string;
  eyebrow?: string;
  readMoreLink?: { href: string; label: string };
}) {
  const countryName = regionPrisons[0]?.country || countrySlug;
  const regionName = regionPrisons[0]?.stateOrRegion || regionSlug;

  const breadcrumbs: PrisonListingCrumb[] = [
    { label: "Prisons", href: "/prisons" },
    { label: countryName, href: `/prisons/${countrySlug}` },
    { label: regionName },
  ];

  const base = getBaseUrl();
  const regionPath = `/prisons/${countrySlug}/${regionSlug}`;
  const heroImage = getRegionBrowseEditorialImage(countrySlug, regionSlug);
  const breadcrumb = breadcrumbJsonLd(
    [
      { name: "Prisons", path: "/prisons" },
      { name: countryName, path: `/prisons/${countrySlug}` },
      { name: regionName, path: regionPath },
    ],
    base,
  );
  const breadcrumbNode: Record<string, unknown> = { ...breadcrumb };
  delete breadcrumbNode["@context"];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${base}${regionPath}#collection`,
        name: `Prisons in ${regionName}`,
        url: `${base}${regionPath}`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: regionPrisons.length,
          itemListElement: regionPrisons.map((prison, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: prison.name,
            url: `${base}/prisons/${prison.countrySlug}/${prison.slug}`,
          })),
        },
      },
      breadcrumbNode,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrisonListingTemplate
      breadcrumbs={breadcrumbs}
      title={`Prisons in ${regionName}`}
      subtitle={`${regionPrisons.length} facilities in ${regionName}, ${countryName}`}
      intro={intro}
      eyebrow={eyebrow}
      footnote={footnote}
      prisons={regionPrisons}
      stats={[{ label: "Establishments", value: regionPrisons.length }]}
      readMoreLink={readMoreLink}
      heroImage={heroImage}
    />
    </>
  );
}
