import Link from "next/link";
import { countries, getCountrySlug, getPrisonsByCountry } from "@/data/prisons";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, ChevronRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Prisons by Country",
  description: "Browse prisons organised by country and region.",
  path: "/countries",
});

export default function CountriesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Prisons by Country</h1>
          <p className="text-primary-foreground/70">Browse prisons organised by country and region</p>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map((country) => {
            const slug = getCountrySlug(country);
            const count = getPrisonsByCountry(slug).length;
            return (
              <Link key={country} href={`/prisons/${slug}`}>
                <Card className="group h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">{country}</h3>
                        <p className="text-sm text-muted-foreground">
                          {count} {count === 1 ? "prison" : "prisons"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
