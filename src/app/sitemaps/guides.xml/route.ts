import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/site";
import { buildUrlSetXml } from "@/lib/seo/sitemapXml";
import { buildGuideEntries } from "@/lib/seo/sitemapEntries";

export function GET() {
  const base = getBaseUrl();
  const xml = buildUrlSetXml(buildGuideEntries(base));
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
