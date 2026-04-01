import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";
import { getPrisonByCountryAndSlug, prisons } from "@/data/prisons";
import { getPrisonLastModifiedDate } from "@/lib/seo/prisonLastModified";
import { countriesData } from "@/data/countries";
import { guides } from "@/data/guides";
import { allArticles } from "@/data/articles.merge";
import { allCountrySecondSegmentParams } from "@/lib/routes/resolveCountrySecondSegment";
import {
  listUkCollectionSlugs,
  getProgrammaticCollection,
  getPrisonsForUkCollection,
} from "@/lib/programmatic/collections";
import { listUkHubSitemapPaths } from "@/lib/programmatic/ukPrisonHubs";
import { listUsFederalSitemapPaths } from "@/lib/programmatic/usFederalHubs";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const now = new Date();

  const staticPaths = [
    "/",
    "/prisons",
    "/countries",
    "/guides",
    "/articles",
    "/prison-map",
    "/about",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const countrySlugs = Array.from(
    new Set([...prisons.map((p) => p.countrySlug), ...countriesData.map((c) => c.slug)]),
  );
  for (const country of countrySlugs) {
    entries.push({
      url: `${base}/prisons/${country}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const { country, slug } of allCountrySecondSegmentParams()) {
    const prison = getPrisonByCountryAndSlug(country, slug);
    entries.push({
      url: `${base}/prisons/${country}/${slug}`,
      lastModified: prison ? getPrisonLastModifiedDate(prison, now) : now,
      changeFrequency: "weekly",
      priority: 0.65,
    });
  }

  for (const collectionSlug of listUkCollectionSlugs()) {
    const spec = getProgrammaticCollection(collectionSlug);
    if (!spec) continue;
    if (getPrisonsForUkCollection(collectionSlug).length === 0) continue;
    entries.push({
      url: `${base}${spec.canonicalPath}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: spec.priority,
    });
  }

  for (const { path, priority } of listUkHubSitemapPaths()) {
    entries.push({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority,
    });
  }

  for (const { path, priority } of listUsFederalSitemapPaths()) {
    entries.push({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority,
    });
  }

  for (const g of guides) {
    entries.push({
      url: `${base}/guides/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const a of allArticles) {
    entries.push({
      url: `${base}/articles/${a.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
