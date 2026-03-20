import { getBaseUrl } from "@/lib/site";

/** Factual WebPage JSON-LD for prison profiles (no ratings or claims). */
export function prisonProfileWebPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
}) {
  const base = getBaseUrl();
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description.slice(0, 500),
    url: `${base}${path}`,
  };
}
