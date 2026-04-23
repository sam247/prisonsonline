import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ProbationCentre } from "@/types/institutional";

export function ProbationDirectoryIndexView({
  regions,
  total,
}: {
  regions: Array<{ slug: string; name: string; count: number }>;
  total: number;
}) {
  return (
    <div className="container py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">UK Probation Directory</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Structured directory of probation offices and reporting centres in the current HMPPS-derived dataset ({total} centres).
        </p>
      </header>
      <section>
        <h2 className="text-xl font-semibold mb-3">Browse by region</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {regions.map((region) => (
            <li key={region.slug}>
              <Link
                href={`/probation/uk/${region.slug}`}
                className="block rounded-md border border-border/70 p-3 text-sm hover:bg-muted/40 transition-colors"
              >
                <span className="font-medium text-foreground">{region.name}</span>
                <span className="block text-muted-foreground">{region.count} centres</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ProbationRegionView({
  regionName,
  centres,
}: {
  regionName: string;
  centres: ProbationCentre[];
}) {
  return (
    <div className="container py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Probation centres in {regionName}</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Directory listing for {centres.length} centre{centres.length === 1 ? "" : "s"} in this region.
        </p>
      </header>
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {centres.map((centre) => (
          <li key={centre.slug}>
            <Card className="h-full border-border/60">
              <CardContent className="p-5 space-y-2">
                <h2 className="font-semibold text-base">
                  <Link href={`/probation/uk/${centre.slug}`} className="hover:underline text-accent">
                    {centre.name}
                  </Link>
                </h2>
                <p className="text-xs text-muted-foreground">Service type: {centre.buildingType || "General"}</p>
                {centre.address ? (
                  <p className="text-sm text-muted-foreground inline-flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    {centre.address}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Source data: HMPPS listing import used in this build. Confirm live details before travel.
      </p>
      <Link href="/probation" className="text-sm text-accent hover:underline">
        Back to probation directory
      </Link>
    </div>
  );
}

export function ProbationCentreView({ centre }: { centre: ProbationCentre }) {
  return (
    <div className="container py-10 space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{centre.name}</h1>
        <p className="text-muted-foreground mt-2">
          Probation centre listing for {centre.region || "United Kingdom"}.
        </p>
      </header>
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-3">
          <p className="text-sm">
            <span className="font-medium">Service type:</span> {centre.buildingType || "General"}
          </p>
          {centre.address ? (
            <p className="text-sm text-muted-foreground inline-flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              {centre.address}
            </p>
          ) : null}
          {centre.phone ? (
            <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              {centre.phone}
            </p>
          ) : null}
          {centre.localAuthority ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Local authority:</span> {centre.localAuthority}
            </p>
          ) : null}
        </CardContent>
      </Card>
      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          This page is a factual directory listing generated from public-service dataset fields. Contact routes and opening arrangements may change.
        </p>
        {centre.regionSlug ? (
          <p>
            Browse nearby listings in{" "}
            <Link href={`/probation/uk/${centre.regionSlug}`} className="text-accent hover:underline">
              {centre.region}
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}

