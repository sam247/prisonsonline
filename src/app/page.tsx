import type { ReactNode } from "react";
import { TrackedContentLink } from "@/components/analytics/TrackedContentLink";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackedInlineLink } from "@/components/analytics/TrackedInlineLink";
import { TrackedPrisonCard } from "@/components/analytics/TrackedPrisonCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { CountryCard } from "@/components/CountryCard";
import { StatsPanel } from "@/components/StatsPanel";
import { prisons, getPrisonsByCountry } from "@/data/prisons";
import { pickPrisonsDiverseRegions } from "@/lib/queries/homePrisonPicks";
import { guides } from "@/data/guides";
import { allArticles } from "@/data/articles.merge";
import { isGeneratedArticle } from "@/types/siteArticle";
import { countriesData } from "@/data/countries";
import { EditorialImageBlock } from "@/components/media/EditorialImageBlock";
import { getArticleCoverImage, getGuideCoverImage, getHomeHeroEditorialImage } from "@/lib/media/resolvers";
import { getRecentlyUpdatedPrisons } from "@/lib/seo/prisonLastModified";
import {
  MapPin,
  BookOpen,
  Globe,
  Building2,
  Users,
  Clock,
  Shield,
  Scale,
  FileText,
  ArrowRight,
  CheckCircle,
  Map,
  Hotel,
  Navigation,
  HeartHandshake,
} from "lucide-react";

const ukPool = prisons.filter((p) => p.countrySlug === "uk");
const usPool = prisons.filter((p) => p.countrySlug === "us");
const ukDirectoryHome = pickPrisonsDiverseRegions(ukPool, 6);
const usDirectoryHome = pickPrisonsDiverseRegions(usPool, 6);
const popularSlugs = [
  "hmp-wandsworth",
  "hmp-manchester",
  "florence-admax-usp",
  "brooklyn-mdc",
  "atlanta-fci",
  "alderson-fpc",
];
const popularPrisons = popularSlugs
  .map((slug) => prisons.find((p) => p.slug === slug))
  .filter((p): p is (typeof prisons)[number] => Boolean(p));
const recentlyUpdatedHome = getRecentlyUpdatedPrisons(prisons, 10);

const iconMap: Record<string, ReactNode> = {
  Users: <Users className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Scale: <Scale className="h-6 w-6" />,
  Clock: <Clock className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
};

const commonSituationSlugs = [
  "how-prison-visits-work",
  "what-happens-going-to-prison",
  "how-prison-sentences-work",
  "life-inside-prison",
  "prison-categories-explained",
  "rights-of-prisoners",
];
const commonSituationGuides = guides.filter((g) => commonSituationSlugs.includes(g.slug));

export default function HomePage() {
  const stats = [
    { label: "Prisons Listed", value: prisons.length },
    { label: "Countries Covered", value: countriesData.length },
    { label: "Information Guides", value: guides.length },
    { label: "Articles Published", value: allArticles.length },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-navy-dark opacity-90" />
        <div className="container relative py-16 md:py-24">
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[1fr_minmax(0,420px)] items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Find Prison Information Worldwide</h1>
              <p className="text-lg md:text-xl text-primary-foreground/75 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Search prisons, learn about prison systems, and understand how prisons operate around the world.
              </p>
              <SearchBar size="large" className="max-w-2xl mx-auto lg:mx-0 mb-3" />
              <p className="text-sm text-primary-foreground/50 mb-8 max-w-2xl mx-auto lg:mx-0">
                Search by prison name, country or city —{" "}
                <span className="italic">Try: HMP Wandsworth, Florence ADX, London</span>
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <TrackedCtaLink href="/prisons" promotionName="home_hero_search_all" className="inline-flex">
                  <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <MapPin className="h-4 w-4" /> Search All Prisons
                  </Button>
                </TrackedCtaLink>
                <TrackedCtaLink href="/prisons/uk" promotionName="home_hero_browse_uk" className="inline-flex">
                  <Button
                    variant="outline"
                    className="gap-2 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <Globe className="h-4 w-4" /> Browse UK Prisons
                  </Button>
                </TrackedCtaLink>
                <TrackedCtaLink href="/prisons/united-states" promotionName="home_hero_browse_us" className="inline-flex">
                  <Button
                    variant="outline"
                    className="gap-2 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <Globe className="h-4 w-4" /> Browse US Prisons
                  </Button>
                </TrackedCtaLink>
              </div>
            </div>
            <div className="max-w-md mx-auto lg:max-w-none rounded-xl overflow-hidden border border-primary-foreground/15 shadow-lg">
              <EditorialImageBlock
                image={getHomeHeroEditorialImage()}
                priority
                aspectClassName="aspect-[4/3]"
                sizes="(max-width: 1024px) 100vw, 420px"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-14">
          <h2 className="text-2xl font-bold text-foreground mb-2">Find prison information by need</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Jump to guides that match what you are trying to do next.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TrackedContentLink
              href="/guides/how-prison-visits-work"
              contentType="guide"
              itemId="home_need_visiting"
              className="block"
            >
              <Card className="h-full border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">Visiting a prisoner</h3>
                  <p className="text-sm text-muted-foreground">How visits are arranged and what to prepare for.</p>
                </CardContent>
              </Card>
            </TrackedContentLink>
            <TrackedContentLink
              href="/guides/life-inside-prison"
              contentType="guide"
              itemId="home_need_money"
              className="block"
            >
              <Card className="h-full border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">Sending money to prisoners</h3>
                  <p className="text-sm text-muted-foreground">
                    General context for now; a dedicated money-and-accounts guide is planned.
                  </p>
                  {/* TODO: point href at dedicated prisoner money guide when published */}
                </CardContent>
              </Card>
            </TrackedContentLink>
            <TrackedContentLink
              href="/guides/how-prison-visits-work"
              contentType="guide"
              itemId="home_need_booking"
              className="block"
            >
              <Card className="h-full border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">Booking a prison visit</h3>
                  <p className="text-sm text-muted-foreground">Booking channels, timing, and common requirements.</p>
                </CardContent>
              </Card>
            </TrackedContentLink>
            <TrackedContentLink
              href="/guides/rights-of-prisoners"
              contentType="guide"
              itemId="home_need_rights"
              className="block"
            >
              <Card className="h-full border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">Prison rules and rights</h3>
                  <p className="text-sm text-muted-foreground">Rights, rules, and where to verify current policy.</p>
                </CardContent>
              </Card>
            </TrackedContentLink>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">UK Prisons Directory</h2>
              <p className="text-muted-foreground mt-1">A sample of establishments across UK regions</p>
            </div>
            <TrackedInlineLink
              href="/prisons/uk"
              itemId="/prisons/uk_directory"
              className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
            >
              All UK prisons <ArrowRight className="h-4 w-4" />
            </TrackedInlineLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ukDirectoryHome.map((prison) => (
              <TrackedPrisonCard key={prison.slug} prison={prison} listName="home_uk_directory" />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">US Federal and State Prisons</h2>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                Browse federal facilities and selected major US prisons. This directory is largely BOP-sourced; state
                and local coverage is not comprehensive.
              </p>
            </div>
            <TrackedInlineLink
              href="/prisons/us"
              itemId="/prisons/us_directory"
              className="text-sm font-medium text-accent hover:underline flex items-center gap-1 shrink-0"
            >
              Federal US directory <ArrowRight className="h-4 w-4" />
            </TrackedInlineLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {usDirectoryHome.map((prison) => (
              <TrackedPrisonCard key={prison.slug} prison={prison} listName="home_us_directory" />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Popular Prisons</h2>
              <p className="text-muted-foreground mt-1">Frequently searched UK and US establishments</p>
            </div>
            <TrackedInlineLink
              href="/prisons"
              itemId="/prisons_view_popular"
              className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </TrackedInlineLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularPrisons.map((prison) => (
              <TrackedPrisonCard key={prison.slug} prison={prison} listName="home_popular" />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recently updated prisons</h2>
              <p className="text-muted-foreground mt-1">Profiles with the freshest source metadata in this build</p>
            </div>
            <TrackedInlineLink
              href="/prisons"
              itemId="/prisons_recent_footer"
              className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
            >
              Browse all <ArrowRight className="h-4 w-4" />
            </TrackedInlineLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyUpdatedHome.map((prison) => (
              <TrackedPrisonCard key={prison.slug} prison={prison} listName="home_recently_updated" />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/40">
        <div className="container py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Checked against official sources</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Updated regularly</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Independent guidance for families</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-6">
          <StatsPanel stats={stats} />
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Common situations</h2>
          <p className="text-muted-foreground mt-1">Quick help for the most common prison-related questions</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonSituationGuides.map((guide) => {
            const cover = getGuideCoverImage(guide.slug);
            return (
              <TrackedContentLink
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                contentType="guide"
                itemId={guide.slug}
                className="block"
              >
                <Card className="h-full group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60 overflow-hidden">
                  {cover && (
                    <EditorialImageBlock
                      image={cover}
                      aspectClassName="aspect-[2.4/1]"
                      sizes="(max-width: 640px) 100vw, 360px"
                      className="rounded-t-lg rounded-b-none border-x-0 border-t-0 border-b border-border/50"
                    />
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                        {iconMap[guide.icon] || <BookOpen className="h-5 w-5" />}
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
                        {guide.title} (UK)
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{guide.excerpt}</p>
                  </CardContent>
                </Card>
              </TrackedContentLink>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Browse by Country</h2>
              <p className="text-muted-foreground mt-1">Explore prison systems around the world</p>
            </div>
            <TrackedInlineLink
              href="/countries"
              itemId="/countries_all"
              className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
            >
              All countries <ArrowRight className="h-4 w-4" />
            </TrackedInlineLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {countriesData.slice(0, 4).map((country) => (
              <CountryCard
                key={country.slug}
                country={country}
                listedPrisonCount={getPrisonsByCountry(country.slug).length}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Map className="h-7 w-7" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Find prisons near you</h2>
          <p className="text-muted-foreground mb-6">
            Explore prisons geographically using our interactive map. Search by location to find facilities near any address in the UK or US.
          </p>
          <TrackedCtaLink href="/prison-map" promotionName="home_prison_map" className="inline-flex">
            <Button className="gap-2">
              <MapPin className="h-4 w-4" /> Open Prison Map
            </Button>
          </TrackedCtaLink>
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Prison Information Guides</h2>
              <p className="text-muted-foreground mt-1">Helpful resources for understanding the prison system</p>
            </div>
            <TrackedInlineLink
              href="/guides"
              itemId="/guides_index"
              className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
            >
              All guides <ArrowRight className="h-4 w-4" />
            </TrackedInlineLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.slice(0, 6).map((guide) => {
              const cover = getGuideCoverImage(guide.slug);
              return (
                <TrackedContentLink
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  contentType="guide"
                  itemId={guide.slug}
                  className="block"
                >
                  <Card className="h-full group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60 overflow-hidden">
                    {cover && (
                      <EditorialImageBlock
                        image={cover}
                        aspectClassName="aspect-[2.2/1]"
                        sizes="(max-width: 640px) 100vw, 360px"
                        className="rounded-t-lg rounded-b-none border-x-0 border-t-0 border-b border-border/50"
                      />
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                          {iconMap[guide.icon] || <BookOpen className="h-5 w-5" />}
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
                          {guide.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{guide.excerpt}</p>
                    </CardContent>
                  </Card>
                </TrackedContentLink>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Latest updates and insights</h2>
            <p className="text-muted-foreground mt-1">Analysis and insights on prison systems</p>
          </div>
          <TrackedInlineLink
            href="/articles"
            itemId="/articles_index"
            className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
          >
            All articles <ArrowRight className="h-4 w-4" />
          </TrackedInlineLink>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allArticles.slice(0, 4).map((article) => {
            const cover = getArticleCoverImage(article);
            return (
              <TrackedContentLink
                key={article.slug}
                href={`/articles/${article.slug}`}
                contentType="article"
                itemId={article.slug}
                className="block"
              >
                <Card className="border-border/60 h-full hover:shadow-md transition-all duration-200 overflow-hidden">
                  {cover && (
                    <EditorialImageBlock
                      image={cover}
                      aspectClassName="aspect-video"
                      sizes="(max-width: 768px) 100vw, 280px"
                      className="rounded-t-lg rounded-b-none border-x-0 border-t-0 border-b border-border/50"
                    />
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Updated recently
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 leading-tight">{article.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {isGeneratedArticle(article) ? article.description : article.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </TrackedContentLink>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="container py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Planning a prison visit?</h2>
            <p className="text-muted-foreground mt-1">Resources to help you prepare</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <TrackedCtaLink href="/visit-planning/hotels" promotionName="home_visit_hotels" className="block">
              <Card className="h-full group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60 text-center">
                <CardContent className="p-5">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Hotel className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors mb-1">Find nearby hotels</h3>
                  <p className="text-sm text-muted-foreground">Accommodation close to the prison you&apos;re visiting</p>
                </CardContent>
              </Card>
            </TrackedCtaLink>
            <TrackedCtaLink href="/visit-planning/journey" promotionName="home_visit_journey" className="block">
              <Card className="h-full group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60 text-center">
                <CardContent className="p-5">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Navigation className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors mb-1">Plan your journey</h3>
                  <p className="text-sm text-muted-foreground">Directions and transport options for your visit</p>
                </CardContent>
              </Card>
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/guides/how-prison-visits-work"
              promotionName="home_visit_visits_guide"
              className="block"
            >
              <Card className="h-full group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60 text-center">
                <CardContent className="p-5">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors mb-1">Get help with visits</h3>
                  <p className="text-sm text-muted-foreground">Our complete guide to visiting someone in prison</p>
                </CardContent>
              </Card>
            </TrackedCtaLink>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Explore the Global Prison Directory</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
            Browse prisons by country, region, or security level. Our comprehensive database provides factual, up-to-date information.
          </p>
          <TrackedCtaLink href="/prisons" promotionName="home_footer_start_exploring" className="inline-flex">
            <Button size="lg" variant="secondary" className="gap-2">
              <MapPin className="h-4 w-4" /> Start Exploring
            </Button>
          </TrackedCtaLink>
        </div>
      </section>
    </div>
  );
}
