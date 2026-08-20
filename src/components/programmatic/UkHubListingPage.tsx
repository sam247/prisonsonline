import { PrisonListingTemplate } from "@/components/programmatic/PrisonListingTemplate";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { UK_HUB_EYEBROW, UK_HUB_FOOTNOTE } from "@/lib/programmatic/hubCopy";
import { getBaseUrl } from "@/lib/site";
import type { Prison } from "@/types/prison";
import type { EditorialImage } from "@/types/media";
import type { PrisonListingCrumb } from "@/components/programmatic/PrisonListingTemplate";

const defaultListingCountry = { name: "United Kingdom", path: "/prisons/uk" };

export function UkHubListingPage({
  canonicalPath,
  breadcrumbs,
  jsonLdLeafName,
  title,
  subtitle,
  intro,
  eyebrow = UK_HUB_EYEBROW,
  footnote = UK_HUB_FOOTNOTE,
  prisons: prisonList,
  stats,
  readMoreLink,
  listingCountryForJsonLd = defaultListingCountry,
  heroImage,
  methodology,
  relatedLinks,
  officialSources,
}: {
  canonicalPath: string;
  breadcrumbs: PrisonListingCrumb[];
  /** Final breadcrumb name in JSON-LD (can be shorter than full page title). */
  jsonLdLeafName: string;
  title: string;
  subtitle?: string;
  intro?: string;
  eyebrow?: string;
  footnote?: string;
  prisons: Prison[];
  stats?: { label: string; value: string | number }[];
  readMoreLink?: { href: string; label: string };
  /** Override middle breadcrumb segment for JSON-LD (default: UK). */
  listingCountryForJsonLd?: { name: string; path: string };
  heroImage?: EditorialImage;
  methodology?: string;
  relatedLinks?: { href: string; label: string }[];
  officialSources?: { href: string; label: string }[];
}) {
  const base = getBaseUrl();
  const trail = [
    { name: "Prisons", path: "/prisons" },
    { name: listingCountryForJsonLd.name, path: listingCountryForJsonLd.path },
    { name: jsonLdLeafName, path: canonicalPath },
  ];
  const breadcrumb = breadcrumbJsonLd(trail, base);
  const breadcrumbNode: Record<string, unknown> = { ...breadcrumb };
  delete breadcrumbNode["@context"];
  const collectionPage = {
    "@type": "CollectionPage",
    "@id": `${base}${canonicalPath}#collection`,
    name: title,
    url: `${base}${canonicalPath}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: prisonList.length,
      itemListElement: prisonList.map((prison, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: prison.name,
        url: `${base}/prisons/${prison.countrySlug}/${prison.slug}`,
      })),
    },
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [collectionPage, breadcrumbNode],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrisonListingTemplate
        breadcrumbs={breadcrumbs}
        title={title}
        subtitle={subtitle}
        intro={intro}
        eyebrow={eyebrow}
        footnote={footnote}
        prisons={prisonList}
        stats={stats}
        readMoreLink={readMoreLink}
        heroImage={heroImage}
        methodology={methodology}
        relatedLinks={relatedLinks}
        officialSources={officialSources}
      />
    </>
  );
}
