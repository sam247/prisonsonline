import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/site";
import { buildUrlSetXml } from "@/lib/seo/sitemapXml";
import { buildRegionEntries } from "@/lib/seo/sitemapEntries";

/** Country indexes and region listing pages only (no prison profile URLs). */
export function GET() {
  const base = getBaseUrl();
  const now = new Date();
  const xml = buildUrlSetXml(buildRegionEntries(base, now));
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
