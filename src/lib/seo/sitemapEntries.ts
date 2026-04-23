import { allCountrySecondSegmentParams } from "@/lib/routes/resolveCountrySecondSegment";
import { countriesData } from "@/data/countries";
import { guides } from "@/data/guides";
import { allArticles } from "@/data/articles.merge";
import { prisons, getPrisonByCountryAndSlug, getPrisonsByRegion } from "@/data/prisons";
import { getProbationCentresByCountry, getProbationRegionsByCountry, listProbationServiceTypeHubSlugs } from "@/lib/queries/probation";
import {
  listUkCollectionSlugs,
  getProgrammaticCollection,
  getPrisonsForUkCollection,
} from "@/lib/programmatic/collections";
import { listUkHubSitemapPaths } from "@/lib/programmatic/ukPrisonHubs";
import { listUsFederalSitemapPaths } from "@/lib/programmatic/usFederalHubs";
import { intentsForPrison, prisonsEligibleForIntentPages } from "@/lib/seo/intentRollout";
import { getPrisonLastModifiedDate, getPrisonLastModBuildFallback } from "@/lib/seo/prisonLastModified";

export type SitemapUrlEntry = { loc: string; lastmod: Date };

export function buildPrisonProfileEntries(base: string): SitemapUrlEntry[] {
  const fb = getPrisonLastModBuildFallback();
  return prisons.map((p) => ({
    loc: `${base}/prisons/${p.countrySlug}/${p.slug}`,
    lastmod: getPrisonLastModifiedDate(p, fb),
  }));
}

export function buildPrisonIntentEntries(base: string): SitemapUrlEntry[] {
  const fb = getPrisonLastModBuildFallback();
  const list = prisonsEligibleForIntentPages();
  const out: SitemapUrlEntry[] = [];
  for (const p of list) {
    const lastmod = getPrisonLastModifiedDate(p, fb);
    for (const intent of intentsForPrison(p)) {
      out.push({
        loc: `${base}/prisons/${p.countrySlug}/${p.slug}/${intent}`,
        lastmod,
      });
    }
  }
  return out;
}

export function buildRegionEntries(base: string, now: Date): SitemapUrlEntry[] {
  const entries: SitemapUrlEntry[] = [];
  const countrySlugs = Array.from(
    new Set([...prisons.map((p) => p.countrySlug), ...countriesData.map((c) => c.slug)]),
  );
  for (const country of countrySlugs) {
    entries.push({ loc: `${base}/prisons/${country}`, lastmod: now });
  }
  for (const { country, slug } of allCountrySecondSegmentParams()) {
    if (getPrisonByCountryAndSlug(country, slug)) continue;
    if (getPrisonsByRegion(country, slug).length === 0) continue;
    entries.push({ loc: `${base}/prisons/${country}/${slug}`, lastmod: now });
  }
  return entries;
}

export function buildGuideEntries(base: string, now: Date): SitemapUrlEntry[] {
  return guides.map((g) => ({ loc: `${base}/guides/${g.slug}`, lastmod: now }));
}

export function buildProbationEntries(base: string, now: Date): SitemapUrlEntry[] {
  const out: SitemapUrlEntry[] = [{ loc: `${base}/probation`, lastmod: now }];
  const centres = getProbationCentresByCountry("uk");
  const regions = getProbationRegionsByCountry("uk");
  for (const centre of centres) out.push({ loc: `${base}/probation/uk/${centre.slug}`, lastmod: now });
  for (const region of regions) out.push({ loc: `${base}/probation/uk/${region}`, lastmod: now });
  for (const typeSlug of listProbationServiceTypeHubSlugs("uk")) {
    out.push({ loc: `${base}/probation/uk/service-type/${typeSlug}`, lastmod: now });
  }
  return out;
}

export function buildCategoriesEntries(base: string, now: Date): SitemapUrlEntry[] {
  const entries: SitemapUrlEntry[] = [];
  const staticPaths = [
    "/",
    "/prisons",
    "/countries",
    "/guides",
    "/articles",
    "/prison-map",
    "/probation",
    "/about",
  ];
  for (const path of staticPaths) {
    entries.push({ loc: `${base}${path}`, lastmod: now });
  }

  for (const collectionSlug of listUkCollectionSlugs()) {
    const spec = getProgrammaticCollection(collectionSlug);
    if (!spec) continue;
    if (getPrisonsForUkCollection(collectionSlug).length === 0) continue;
    entries.push({ loc: `${base}${spec.canonicalPath}`, lastmod: now });
  }

  for (const { path } of listUkHubSitemapPaths()) {
    entries.push({ loc: `${base}${path}`, lastmod: now });
  }

  for (const { path } of listUsFederalSitemapPaths()) {
    entries.push({ loc: `${base}${path}`, lastmod: now });
  }

  for (const a of allArticles) {
    entries.push({ loc: `${base}/articles/${a.slug}`, lastmod: now });
  }

  return entries;
}
