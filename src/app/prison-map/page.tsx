import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPrisonMapRecords } from "@/lib/prison-map/records";
import { MAP_COUNTRIES, MAP_COUNTRY_ORDER } from "@/lib/prison-map/location";
import { PrisonMapClient } from "./prison-map-client";

export const metadata = buildPageMetadata({
  title: "Prison Map", description: "Find prisons in the UK, US, Canada, Australia, New Zealand, Ireland and South Africa geographically, search facility locations and open prison profiles. UK markers show approximate postcode locations.", path: "/prison-map",
});

export default function PrisonMapPage() {
  const records = getPrisonMapRecords();
  const uk = records.filter(p => p.country === "uk" && !p.exclusion).length;
  const us = records.filter(p => p.country === "us" && !p.reentryOffice && !p.exclusion).length;
  const offices = records.filter(p => p.reentryOffice && !p.exclusion).length;
  const intl = MAP_COUNTRY_ORDER.filter(c => c !== "uk" && c !== "us").map(c => `${records.filter(p => p.country === c && !p.exclusion).length} ${MAP_COUNTRIES[c].label} official facility locations`);
  return <div className="min-h-screen">
    <section className="bg-primary text-primary-foreground"><div className="container py-10"><h1 className="mb-3 text-3xl font-bold">Prison Map</h1><p className="max-w-2xl text-primary-foreground/80">Explore the establishments in the Prisons Online directory. Search by name or location, select a marker and open the prison’s profile.</p></div></section>
    <div className="container space-y-6 py-6 md:py-8">
      <p className="text-sm text-muted-foreground">{uk} UK postcode locations · {us} US prison and facility profiles · {offices} optional reentry offices{intl.map(t => ` · ${t}`).join("")}. Records without reliable locations remain available in the directory and are flagged for review.</p>
      <PrisonMapClient records={records} />
      <nav aria-label="Prison directories" className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm">{[["/prisons", "Prison Finder"], ["/prisons/uk", "UK prison directory"], ["/prisons/us", "US federal directory"], ["/prisons/united-states", "US legacy profiles"], ["/prisons/ca", "Canada prison directory"], ["/prisons/za", "South Africa prison directory"], ["/prisons/ie", "Ireland prison directory"], ["/prisons/nz", "New Zealand prison directory"], ["/prisons/au", "Australia prison directory"]].map(([href, label]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center text-accent underline">{label}</Link>)}</nav>
    </div>
  </div>;
}
