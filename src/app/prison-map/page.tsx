import Link from "next/link";
import { MapPin } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Prison Map",
  description: "Explore prisons geographically.",
  path: "/prison-map",
});

export default function PrisonMapPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Prison Map</h1>
          <p className="text-primary-foreground/70">Explore prisons geographically</p>
        </div>
      </section>

      <div className="container py-10">
        <div className="bg-secondary/50 rounded-lg h-96 flex flex-col items-center justify-center text-muted-foreground">
          <MapPin className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-2">Interactive Map Coming Soon</p>
          <p className="text-sm max-w-md text-center">
            An interactive map view will allow you to explore prisons by location. In the meantime, use the{" "}
            <Link href="/prisons" className="text-accent hover:underline">
              Prison Finder
            </Link>{" "}
            to search and filter prisons.
          </p>
        </div>
      </div>
    </div>
  );
}
