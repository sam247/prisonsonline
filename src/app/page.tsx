import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { PrisonCard } from "@/components/PrisonCard";
import { CountryCard } from "@/components/CountryCard";
import { StatsPanel } from "@/components/StatsPanel";
import { prisons, getPrisonsByCountry } from "@/data/prisons";
import { guides } from "@/data/guides";
import { allArticles } from "@/data/articles.merge";
import { isGeneratedArticle } from "@/types/siteArticle";
import { countriesData } from "@/data/countries";
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

const featuredSlugs = ["hmp-bullingdon", "san-quentin", "adx-florence", "rikers-island"];
const featuredPrisons = prisons.filter((p) => featuredSlugs.includes(p.slug));
const ukPrisons = prisons.filter((p) => p.countrySlug === "uk").slice(0, 5);

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
        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Find Prison Information Worldwide</h1>
            <p className="text-lg md:text-xl text-primary-foreground/75 mb-8 leading-relaxed">
              Search prisons, learn about prison systems, and understand how prisons operate around the world.
            </p>
            <SearchBar size="large" className="max-w-2xl mx-auto mb-3" />
            <p className="text-sm text-primary-foreground/50 mb-8">
              Search by prison name, country or city — <span className="italic">Try: HMP Wandsworth, Rikers Island, London</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/prisons">
                <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  <MapPin className="h-4 w-4" /> Search All Prisons
                </Button>
              </Link>
              <Link href="/prisons/uk">
                <Button
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Globe className="h-4 w-4" /> Browse UK Prisons
                </Button>
              </Link>
              <Link href="/prisons/united-states">
                <Button
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Globe className="h-4 w-4" /> Browse US Prisons
                </Button>
              </Link>
            </div>
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
          {commonSituationGuides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`}>
              <Card className="h-full group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                      {iconMap[guide.icon] || <BookOpen className="h-5 w-5" />}
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">{guide.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{guide.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured Prisons</h2>
              <p className="text-muted-foreground mt-1">Notable prisons from around the world</p>
            </div>
            <Link href="/prisons" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPrisons.map((prison) => (
              <PrisonCard key={prison.slug} prison={prison} />
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Popular UK Prisons</h2>
            <p className="text-muted-foreground mt-1">Frequently searched prisons in the United Kingdom</p>
          </div>
          <Link href="/prisons/uk" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
            All UK prisons <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ukPrisons.map((prison) => (
            <PrisonCard key={prison.slug} prison={prison} />
          ))}
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Browse by Country</h2>
              <p className="text-muted-foreground mt-1">Explore prison systems around the world</p>
            </div>
            <Link href="/countries" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              All countries <ArrowRight className="h-4 w-4" />
            </Link>
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
          <Link href="/prison-map">
            <Button className="gap-2">
              <MapPin className="h-4 w-4" /> Open Prison Map
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Prison Information Guides</h2>
              <p className="text-muted-foreground mt-1">Helpful resources for understanding the prison system</p>
            </div>
            <Link href="/guides" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              All guides <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.slice(0, 6).map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <Card className="h-full group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                        {iconMap[guide.icon] || <BookOpen className="h-5 w-5" />}
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">{guide.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{guide.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Latest updates and insights</h2>
            <p className="text-muted-foreground mt-1">Analysis and insights on prison systems</p>
          </div>
          <Link href="/articles" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
            All articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allArticles.slice(0, 4).map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`}>
              <Card className="border-border/60 h-full hover:shadow-md transition-all duration-200">
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
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="container py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Planning a prison visit?</h2>
            <p className="text-muted-foreground mt-1">Resources to help you prepare</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Link href="/visit-planning/hotels">
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
            </Link>
            <Link href="/visit-planning/journey">
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
            </Link>
            <Link href="/guides/how-prison-visits-work">
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
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Explore the Global Prison Directory</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
            Browse prisons by country, region, or security level. Our comprehensive database provides factual, up-to-date information.
          </p>
          <Link href="/prisons">
            <Button size="lg" variant="secondary" className="gap-2">
              <MapPin className="h-4 w-4" /> Start Exploring
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
