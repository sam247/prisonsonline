import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/canonical";
import { siteName } from "@/lib/site";

export function buildPageMetadata(opts: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  const url = canonicalUrl(opts.path);
  const title = opts.title.includes(siteName) ? opts.title : `${opts.title} | ${siteName}`;
  return {
    title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: opts.description,
      url,
      siteName,
      type: "website",
    },
  };
}
