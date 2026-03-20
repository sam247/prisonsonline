import { getBaseUrl } from "@/lib/site";

export function articleJsonLd(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
}) {
  const base = getBaseUrl();
  const url = `${base}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}
