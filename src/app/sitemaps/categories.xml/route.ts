import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/site";
import { buildUrlSetXml } from "@/lib/seo/sitemapXml";
import { buildCategoriesEntries } from "@/lib/seo/sitemapEntries";

/** Static hubs, collections, UK/US programmatic paths, and articles (non-prison-profile URLs). */
export function GET() {
  const base = getBaseUrl();
  const now = new Date();
  const xml = buildUrlSetXml(buildCategoriesEntries(base, now));
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
