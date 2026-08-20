import { getBaseUrl } from "@/lib/site";

export function articleJsonLd(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  author?: { name: string; url?: string };
  reviewer?: { name: string; url?: string };
  image?: string;
  sources?: { name: string; url: string }[];
}) {
  const base = getBaseUrl();
  const url = `${base}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    publisher: {
      "@type": "Organization",
      name: "Prisons Online",
      url: base,
      logo: { "@type": "ImageObject", url: `${base}/logo-full.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
  if (opts.dateModified) data.dateModified = opts.dateModified;
  if (opts.author) data.author = { "@type": "Person", ...opts.author };
  if (opts.reviewer) data.reviewedBy = { "@type": "Person", ...opts.reviewer };
  if (opts.image) data.image = opts.image.startsWith("http") ? opts.image : `${base}${opts.image.startsWith("/") ? opts.image : `/${opts.image}`}`;
  if (opts.sources?.length) data.citation = opts.sources.map((source) => ({ "@type": "CreativeWork", name: source.name, url: source.url }));
  return data;
}
