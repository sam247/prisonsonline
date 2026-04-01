import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/site";
import { buildUrlSetXml } from "@/lib/seo/sitemapXml";
import { buildPrisonIntentEntries } from "@/lib/seo/sitemapEntries";

/** Intent URLs match `generateStaticParams` rollout (UK all + US shortlist × four intents). */
export function GET() {
  const base = getBaseUrl();
  const xml = buildUrlSetXml(buildPrisonIntentEntries(base));
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
