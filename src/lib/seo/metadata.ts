import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/canonical";
import { siteName } from "@/lib/site";
import { buildSeoTitle } from "@/lib/seo/title";

export function buildPageMetadata(opts: {
  title: string;
  description?: string;
  path: string;
  preserveTitle?: boolean;
}): Metadata {
  const url = canonicalUrl(opts.path);
  const title = buildSeoTitle({ title: opts.title, preserveVerbatim: opts.preserveTitle });
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
