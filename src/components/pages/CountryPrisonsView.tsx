import Link from "next/link";
import { getPrisonsByCountry, getRegionsByCountry } from "@/data/prisons";
import { getRecentlyUpdatedPrisons } from "@/lib/seo/prisonLastModified";
import { getCountry } from "@/data/countries";
import { listUsFacilityTypeHubSlugs } from "@/lib/programmatic/usFederalHubs";
import { TrackedPrisonCard } from "@/components/analytics/TrackedPrisonCard";
import { StatsPanel } from "@/components/StatsPanel";
import { ChevronRight, BookOpen } from "lucide-react";
import { guides } from "@/data/guides";
import { EditorialImageBlock } from "@/components/media/EditorialImageBlock";
import { getCountryEditorialImage } from "@/lib/media/resolvers";

export function CountryPrisonsView({ countrySlug }: { countrySlug: string }) {
  const countryPrisons = getPrisonsByCountry(countrySlug);
  const recentlyUpdated = getRecentlyUpdatedPrisons(countryPrisons, 8);
  const regions = getRegionsByCountry(countrySlug);
  const countryData = getCountry(countrySlug);
  const countryName = countryPrisons[0]?.country || countryData?.name || countrySlug;

  if (countryPrisons.length === 0 && !countryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Country Not Found</h1>
          <Link href="/prisons" className="text-accent hover:underline">
            Browse all prisons
          </Link>
        </div>
      </div>
    );
  }

  const capacitySum = countryPrisons.reduce((sum, p) => sum + p.capacity, 0);
  const countryBanner = countryData?.coverImage ?? getCountryEditorialImage(countrySlug);
  const stats = [
    { label: "Prisons Listed", value: countryPrisons.length || countryData?.prisonCount || 0 },
    { label: "Prison Population", value: countryData?.prisonPopulation ?? "—" },
    { label: "Regions", value: regions.length },
    { label: "Total Capacity", value: capacitySum > 0 ? capacitySum : "—" },
  ];

  return (
    <div className="min-h-screen">
      <div className="border-b bg-card">
        <div className="container py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/prisons" className="hover:text-foreground transition-colors">
              Prisons
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{countryName}</span>
          </nav>
        </div>
      </div>

      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          {countryBanner && (
            <div className="mb-6 max-w-3xl rounded-lg overflow-hidden border border-primary-foreground/15">
              <EditorialImageBlock
                image={countryBanner}
                aspectClassName="aspect-[21/9] max-h-32 sm:max-h-40"
                sizes="(max-width: 768px) 100vw, 48rem"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">Prisons in {countryName}</h1>
          <p className="text-primary-foreground/70">
            {countryPrisons.length} facilities across {regions.length} regions
          </p>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-6">
          <StatsPanel stats={stats} />
        </div>
      </section>

      <div className="container py-10">
        {countryData?.description && (
          <div className="mb-8 max-w-3xl">
            <p className="text-muted-foreground leading-relaxed">{countryData.description}</p>
          </div>
        )}

        {countrySlug === "us" && listUsFacilityTypeHubSlugs().length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Browse by facility type</h2>
            <p className="text-sm text-muted-foreground mb-3 max-w-2xl">
              Hubs list only types that meet the minimum size rule in this build (three or more sites).
            </p>
            <div className="flex flex-wrap gap-2">
              {listUsFacilityTypeHubSlugs().map((typeSlug) => (
                <Link
                  key={typeSlug}
                  href={`/prisons/us/facility-type/${typeSlug}`}
                  className="px-3 py-1.5 text-sm bg-secondary rounded-md hover:bg-secondary/80 transition-colors text-foreground uppercase"
                >
                  {typeSlug}
                </Link>
              ))}
            </div>
          </div>
        )}

        {regions.length > 1 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Browse by Region</h2>
            <div className="flex flex-wrap gap-2">
              {regions.map((r) => (
                <Link
                  key={r.slug}
                  href={`/prisons/${countrySlug}/${r.slug}`}
                  className="px-3 py-1.5 text-sm bg-secondary rounded-md hover:bg-secondary/80 transition-colors text-foreground"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {recentlyUpdated.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Recently updated prisons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyUpdated.map((p) => (
                <TrackedPrisonCard key={p.slug} prison={p} listName="country_recent" />
              ))}
            </div>
          </section>
        )}

        {countryPrisons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryPrisons.map((p) => (
              <TrackedPrisonCard key={p.slug} prison={p} listName="country_all" />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Prison data for {countryName} is coming soon. We are actively expanding our directory.
          </p>
        )}

        <section className="mt-16">
          <h2 className="text-xl font-bold mb-4">Related Guides</h2>
          <div className="flex flex-wrap gap-3">
            {guides.slice(0, 4).map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-md text-sm text-foreground hover:bg-secondary/80 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-accent" />
                {guide.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
