import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/site";
import { buildSitemapIndexXml } from "@/lib/seo/sitemapXml";

export function GET() {
  const base = getBaseUrl();
  const urls = [
    `${base}/sitemaps/prisons.xml`,
    `${base}/sitemaps/prison-intent.xml`,
    `${base}/sitemaps/regions.xml`,
    `${base}/sitemaps/guides.xml`,
    `${base}/sitemaps/categories.xml`,
  ];
  const xml = buildSitemapIndexXml(urls);
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
