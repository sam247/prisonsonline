import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPrisonMapRecords } from "@/lib/prison-map/records";
import { PrisonMapClient } from "./prison-map-client";

export const metadata = buildPageMetadata({
  title: "UK & US Prison Map", description: "Find UK and US prisons geographically, search facility locations and open prison profiles. UK markers show approximate postcode locations.", path: "/prison-map",
});

export default function PrisonMapPage() {
  const records = getPrisonMapRecords();
  const uk = records.filter(p => p.country === "uk" && !p.exclusion).length;
  const us = records.filter(p => p.country === "us" && !p.reentryOffice && !p.exclusion).length;
  const offices = records.filter(p => p.reentryOffice && !p.exclusion).length;
  return <div className="min-h-screen">
    <section className="bg-primary text-primary-foreground"><div className="container py-10"><h1 className="mb-3 text-3xl font-bold">Prison Map</h1><p className="max-w-2xl text-primary-foreground/80">Explore the UK and US establishments in the Prisons Online directory. Search by name or location, select a marker and open the prison’s profile.</p></div></section>
    <div className="container space-y-6 py-6 md:py-8">
      <p className="text-sm text-muted-foreground">{uk} UK postcode locations · {us} US prison and facility profiles · {offices} optional reentry offices. Records without reliable locations remain available in the directory and are flagged for review.</p>
      <PrisonMapClient records={records} />
      <nav aria-label="Prison directories" className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm">{[["/prisons", "Prison Finder"], ["/prisons/uk", "UK prison directory"], ["/prisons/us", "US federal directory"], ["/prisons/united-states", "US legacy profiles"]].map(([href, label]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center text-accent underline">{label}</Link>)}</nav>
    </div>
  </div>;
}
