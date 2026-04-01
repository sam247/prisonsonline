import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/site";
import { buildUrlSetXml } from "@/lib/seo/sitemapXml";
import { buildPrisonProfileEntries } from "@/lib/seo/sitemapEntries";

/** Prison profile URLs only. Shard if this file approaches 50k URLs. */
export function GET() {
  const base = getBaseUrl();
  const xml = buildUrlSetXml(buildPrisonProfileEntries(base));
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
