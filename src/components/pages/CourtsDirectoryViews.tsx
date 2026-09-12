import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBaseUrl } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { courtJsonLd } from "@/lib/seo/courtJsonLd";
import { courtJurisdictionLabel } from "@/lib/queries/courts";
import {
  NEARBY_DISCLAIMER,
  formatDistanceMiles,
  getNearbyPrisonsForCourt,
  type NearbyPlace,
} from "@/lib/queries/nearbyCourtsPrisons";
import type { Court } from "@/types/court";

const ATTRIBUTION =
  "Court information is based on public information from HM Courts & Tribunals Service and other public sector data licensed under the Open Government Licence v3.0.";

function FactRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 sm:grid-cols-[10rem_1fr]">
      <dt className="text-xs font-medium text-muted-foreground pt-0.5">{label}</dt>
      <dd className="text-sm text-foreground leading-snug">{value}</dd>
    </div>
  );
}

export function CourtsDirectoryIndexView({
  hubs,
  total,
  children,
}: {
  hubs: Array<{ slug: string; label: string; count: number; description: string }>;
  total: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="container py-10 space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Courts in England and Wales</h1>
        <p className="text-muted-foreground mt-2">
          Find contact details and location information for Crown Courts, Magistrates&apos; Courts, County
          Courts, combined centres and tribunals ({total} directory listings).
        </p>
      </header>

      <section aria-labelledby="court-types-heading">
        <h2 id="court-types-heading" className="text-xl font-semibold mb-3">
          Browse by court type
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hubs.map((hub) => (
            <li key={hub.slug}>
              <Link
                href={`/courts/${hub.slug}`}
                className="block rounded-md border border-border/70 p-3 text-sm hover:bg-muted/40 transition-colors h-full"
              >
                <span className="font-medium text-foreground">{hub.label}</span>
                <span className="block text-muted-foreground mt-1">{hub.count} locations</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {children}

      <p className="text-xs text-muted-foreground max-w-3xl">{ATTRIBUTION}</p>
    </div>
  );
}

export function CourtTypeHubView({
  label,
  description,
  courts,
}: {
  label: string;
  description: string;
  courts: Court[];
  hubSlug?: string;
}) {
  return (
    <div className="container py-10 space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/courts" className="hover:text-foreground">
              Courts
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{label}</li>
        </ol>
      </nav>
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">{label}</h1>
        <p className="text-muted-foreground mt-2">
          {description} {courts.length} listing{courts.length === 1 ? "" : "s"}.
        </p>
      </header>
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courts.map((court) => (
          <li key={court.slug}>
            <Card className="h-full border-border/60">
              <CardContent className="p-5 space-y-2">
                <h2 className="font-semibold text-base">
                  <Link href={`/courts/${court.slug}`} className="hover:underline text-accent">
                    {court.name}
                  </Link>
                </h2>
                {courtJurisdictionLabel(court) ? (
                  <p className="text-xs text-muted-foreground">{courtJurisdictionLabel(court)}</p>
                ) : null}
                {court.isClosed ? <Badge variant="secondary">Closed</Badge> : null}
                {court.address ? (
                  <p className="text-sm text-muted-foreground inline-flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                    {[court.address, court.postcode].filter(Boolean).join(", ")}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{ATTRIBUTION}</p>
      <Link href="/courts" className="text-sm text-accent hover:underline">
        Back to courts directory
      </Link>
    </div>
  );
}

function NearbyList({
  heading,
  places,
}: {
  heading: string;
  places: NearbyPlace[];
}) {
  if (!places.length) return null;
  return (
    <section aria-labelledby="nearby-heading" className="space-y-3">
      <h2 id="nearby-heading" className="text-xl font-bold">
        {heading}
      </h2>
      <ul className="space-y-2 text-sm">
        {places.map((p) => (
          <li key={p.slug}>
            <Link href={p.href} className="text-accent hover:underline font-medium">
              {p.name}
            </Link>
            <span className="text-muted-foreground"> — {formatDistanceMiles(p.distanceMiles)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{NEARBY_DISCLAIMER}</p>
    </section>
  );
}

export function CourtProfileView({ court }: { court: Court }) {
  const base = getBaseUrl();
  const typeLabel = courtJurisdictionLabel(court);
  const nearbyPrisons = getNearbyPrisonsForCourt(court, 3);
  const primaryHub = court.hubSlugs[0];
  const hubMeta = primaryHub
    ? (
        [
          ["crown-courts", "Crown Courts"],
          ["magistrates-courts", "Magistrates' Courts"],
          ["county-courts", "County Courts"],
          ["combined-courts", "Combined Courts"],
          ["tribunals", "Tribunals"],
        ] as const
      ).find(([slug]) => slug === primaryHub)
    : undefined;

  const jsonLd = [
    breadcrumbJsonLd(
      [
        { name: "Home", path: "/" },
        { name: "Courts", path: "/courts" },
        ...(hubMeta ? [{ name: hubMeta[1], path: `/courts/${hubMeta[0]}` }] : []),
        { name: court.name, path: `/courts/${court.slug}` },
      ],
      base,
    ),
    courtJsonLd(court),
  ];

  const showAreas = Boolean(court.areasOfLaw?.length);
  const showOfficial = Boolean(court.officialUrl);

  return (
    <div className="container py-10 space-y-8 max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/courts" className="hover:text-foreground">
              Courts
            </Link>
          </li>
          {hubMeta ? (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/courts/${hubMeta[0]}`} className="hover:text-foreground">
                  {hubMeta[1]}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden>/</li>
          <li className="text-foreground">{court.name}</li>
        </ol>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{court.name}</h1>
        <div className="flex flex-wrap gap-2">
          {typeLabel ? <Badge variant="secondary">{typeLabel}</Badge> : null}
          {court.isClosed ? <Badge variant="outline">Closed location</Badge> : null}
        </div>
      </header>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">At a glance</h2>
          <dl className="space-y-3">
            <FactRow label="Court type" value={typeLabel} />
            <FactRow label="Address" value={court.address} />
            <FactRow label="Postcode" value={court.postcode} />
            <FactRow label="Region" value={court.courtRegion} />
            <FactRow label="DX" value={court.isClosed ? undefined : court.dxNumber} />
            <FactRow label="Status" value={court.isClosed ? "Recorded as closed / inactive in Find a Court or Tribunal" : undefined} />
          </dl>
        </CardContent>
      </Card>

      {(court.address || court.postcode) && (
        <section aria-labelledby="address-heading" className="space-y-2">
          <h2 id="address-heading" className="text-xl font-bold">
            Address and contact details
          </h2>
          <p className="text-sm text-muted-foreground inline-flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            {[court.address, court.postcode].filter(Boolean).join(", ")}
          </p>
          {!court.isClosed && court.dxNumber ? (
            <p className="text-sm text-muted-foreground">DX: {court.dxNumber}</p>
          ) : null}
        </section>
      )}

      {showAreas ? (
        <section aria-labelledby="services-heading" className="space-y-2">
          <h2 id="services-heading" className="text-xl font-bold">
            Areas of law / services
          </h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            {court.areasOfLaw!.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="official-heading" className="space-y-3">
        <h2 id="official-heading" className="text-xl font-bold">
          Official court information
        </h2>
        {showOfficial ? (
          <p className="text-sm">
            <a
              href={court.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              View this location on Find a Court or Tribunal
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </p>
        ) : null}
        <p className="text-sm">
          <a
            href="https://www.court-tribunal-hearings.service.gov.uk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            View official court and tribunal hearing lists on GOV.UK
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </p>
        <p className="text-xs text-muted-foreground">
          Hearing schedules are published by HM Courts &amp; Tribunals Service. PrisonsOnline does not host live court
          listings.
        </p>
      </section>

      <NearbyList heading={`Prisons near ${court.name}`} places={nearbyPrisons} />

      <p className="text-xs text-muted-foreground border-t border-border/60 pt-6">{ATTRIBUTION}</p>
    </div>
  );
}
