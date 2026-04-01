import type { Prison } from "@/types/prison";
import { getBaseUrl } from "@/lib/site";
import type { PrisonIntentSlug } from "@/lib/seo/intentRollout";
import { buildIntentPageTitle } from "@/lib/seo/prisonIntentCopy";

/** WebPage + BreadcrumbList only (no GovernmentBuilding on intent URLs). */
export function prisonIntentJsonLdGraph(opts: {
  prison: Prison;
  intent: PrisonIntentSlug;
  description: string;
  intentPath: string;
}) {
  const base = getBaseUrl();
  const path = opts.intentPath.startsWith("/") ? opts.intentPath : `/${opts.intentPath}`;
  const url = `${base}${path}`;
  const profilePath = `/prisons/${opts.prison.countrySlug}/${opts.prison.slug}`;
  const title = buildIntentPageTitle(opts.prison, opts.intent);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: opts.description.slice(0, 500),
    url,
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Prisons", item: `${base}/prisons` },
      {
        "@type": "ListItem",
        position: 2,
        name: opts.prison.country,
        item: `${base}/prisons/${opts.prison.countrySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: opts.prison.name,
        item: `${base}${profilePath}`,
      },
      { "@type": "ListItem", position: 4, name: title, item: url },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [webPage, breadcrumb],
  };
}
