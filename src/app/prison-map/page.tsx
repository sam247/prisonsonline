import Link from "next/link";
import { MapPin, Globe, Search } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui/button";

export const metadata = buildPageMetadata({
  title: "Browse Prisons by Location",
  description:
    "Browse UK and US prisons by country and name. Use the Prison Finder to search and filter facilities — there is no interactive map yet.",
  path: "/prison-map",
});

export default function PrisonMapPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Browse Prisons by Location</h1>
          <p className="text-primary-foreground/70">
            Search and filter the directory — an interactive map is not available yet.
          </p>
        </div>
      </section>

      <div className="container py-10 max-w-3xl">
        <div className="rounded-lg border border-border/60 bg-card p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Use the Prison Finder</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We do not ship an interactive geographic map on this site yet. You can still find
            establishments by name, country, region, and facility type through the directory
            below.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link href="/prisons">
                <Search className="h-4 w-4" /> Open Prison Finder
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/prisons/uk">
                <Globe className="h-4 w-4" /> Browse UK prisons
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/prisons/us">
                <Globe className="h-4 w-4" /> Browse US federal prisons
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
