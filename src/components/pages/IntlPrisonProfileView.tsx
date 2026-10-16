import Link from "next/link";
import { ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PrisonCard } from "@/components/PrisonCard";
import { getRelatedPrisonsForProfile } from "@/lib/queries/relatedPrisons";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { getBaseUrl } from "@/lib/site";
import type { Prison } from "@/types/prison";

/**
 * Profile for official-source international rows (ca, au, nz, ie, za).
 * Shows only facts carried by the bundle and links to the official source; no generated
 * visiting rules or narrative copy.
 */

const LEVEL_LABEL: Record<string, string> = {
  federal: "Federal",
  provincial: "Provincial",
  territorial: "Territorial",
  state: "State",
  national: "National",
};

export function intlStatusLabel(p: Prison): string | null {
  if (p.status === "closed") return "Closed";
  if (p.status === "historic") return "Historic";
  return null;
}

export function formatIntlPrisonMetaDescription(p: Prison): string {
  const status = intlStatusLabel(p);
  const where = [p.city, p.stateOrRegion, p.country].filter(Boolean).join(", ");
  return `${status ? `${status}: ` : ""}${p.name} in ${where}. Operator, jurisdiction, security classification and official source.`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function Fact({ label, value }: { label: string; value?: string | number | null }) {
  const v = typeof value === "number" ? (value > 0 ? value.toLocaleString() : "") : value?.trim();
  if (!v) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(9rem,34%)_1fr] gap-x-4 gap-y-0.5 py-2.5 border-b border-border/50 last:border-b-0">
      <dt className="text-xs font-medium text-muted-foreground pt-0.5">{label}</dt>
      <dd className="text-sm text-foreground leading-snug">{v}</dd>
    </div>
  );
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\d?\./, "");
  } catch {
    return url;
  }
}

export function IntlPrisonProfileView({ prison }: { prison: Prison }) {
  const status = intlStatusLabel(prison);
  const related = getRelatedPrisonsForProfile(prison, 6);
  const regionHref = `/prisons/${prison.countrySlug}/${prison.regionSlug}`;
  const countryHref = `/prisons/${prison.countrySlug}`;
  const profilePath = `${countryHref}/${prison.slug}`;
  const base = getBaseUrl();
  const sources = [prison.sourceUrl, ...(prison.additionalSourceUrls ?? [])].filter((u): u is string => Boolean(u));
  const address = [prison.address, prison.city, prison.stateOrRegion, prison.postcode].filter(Boolean).join(", ");
  const security = prison.securityDescription ?? (prison.securityLevel !== "Not specified" ? prison.securityLevel : undefined);

  const breadcrumb = breadcrumbJsonLd(
    [
      { name: "Prisons", path: "/prisons" },
      { name: prison.country, path: countryHref },
      { name: prison.stateOrRegion, path: regionHref },
      { name: prison.name, path: profilePath },
    ],
    base,
  );
  const breadcrumbNode: Record<string, unknown> = { ...breadcrumb };
  delete breadcrumbNode["@context"];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "GovernmentBuilding",
        "@id": `${base}${profilePath}#facility`,
        name: prison.name,
        url: `${base}${profilePath}`,
        address: {
          "@type": "PostalAddress",
          ...(prison.address ? { streetAddress: prison.address } : {}),
          addressLocality: prison.city,
          addressRegion: prison.stateOrRegion,
          ...(prison.postcode ? { postalCode: prison.postcode } : {}),
          addressCountry: prison.countrySlug.toUpperCase(),
        },
        ...(prison.coordinateEvidence?.precision === "facility"
          ? { geo: { "@type": "GeoCoordinates", latitude: prison.latitude, longitude: prison.longitude } }
          : {}),
        ...(sources.length ? { sameAs: sources } : {}),
      },
      breadcrumbNode,
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="border-b bg-card">
        <div className="container py-3">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <Link href="/prisons" className="hover:text-foreground transition-colors">Prisons</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <Link href={countryHref} className="hover:text-foreground transition-colors">{prison.country}</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <Link href={regionHref} className="hover:text-foreground transition-colors">{prison.stateOrRegion}</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-foreground font-medium">{prison.name}</span>
          </nav>
        </div>
      </div>

      <header className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <div className="mb-4 flex flex-wrap gap-2">
            {status ? <Badge variant="destructive">{status}</Badge> : null}
            {security ? <Badge variant="secondary">{security}</Badge> : null}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{prison.name}</h1>
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            <p>{[prison.city, prison.stateOrRegion, prison.country].filter(Boolean).join(", ")}</p>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-10">
            {status ? (
              <p role="note" className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
                {status === "Closed"
                  ? `This facility is listed by its official source as ${prison.statusNote ? prison.statusNote.toLowerCase() : "closed"}. It is kept here for reference.`
                  : "This is a historic facility and no longer holds prisoners."}
              </p>
            ) : null}

            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-xl font-bold mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{prison.overview}</p>
            </section>

            <section aria-labelledby="facts-heading">
              <h2 id="facts-heading" className="text-xl font-bold mb-4">Facility details</h2>
              <Card className="border-border/60">
                <CardContent className="p-5 sm:p-6">
                  <dl>
                    <Fact label="Status" value={status ?? "Open"} />
                    <Fact label="Facility type" value={prison.type} />
                    <Fact label="Security classification" value={security} />
                    <Fact label="Jurisdiction" value={prison.jurisdiction} />
                    <Fact label="Management area" value={prison.managementArea} />
                    <Fact label="Level" value={prison.jurisdictionLevel ? LEVEL_LABEL[prison.jurisdictionLevel] : undefined} />
                    <Fact label="Operator" value={prison.operator} />
                    <Fact label="Operator type" value={prison.operatorType === "private" ? "Private" : prison.operatorType === "public" ? "Public" : undefined} />
                    <Fact label="Address" value={address} />
                    <Fact label="Capacity (official)" value={prison.capacity} />
                    <Fact label="Opened" value={prison.openedYear > 0 ? String(prison.openedYear) : undefined} />
                  </dl>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="source-heading">
              <h2 id="source-heading" className="text-xl font-bold mb-4">Official source</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The details above were checked against the official {sources.length > 1 ? "sources" : "source"} below
                {prison.sourceCheckedAt ? ` on ${prison.sourceCheckedAt}` : ""}.
                {status ? "" : " For visiting, contact and current arrangements, use the operator’s official information."}
              </p>
              <ul className="space-y-2 text-sm">
                {sources.map((url) => (
                  <li key={url}>
                    <a href={url} rel="noopener noreferrer" target="_blank" className="text-accent hover:underline inline-flex items-center gap-1.5 break-all">
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {hostname(url)}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {related.length > 0 ? (
              <section aria-labelledby="related-heading">
                <h2 id="related-heading" className="text-xl font-bold mb-4">Other prisons in {prison.country}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((p) => (
                    <PrisonCard key={p.slug} prison={p} variant="compact" />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:pt-1">
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-2 text-sm">
                <h3 className="font-semibold mb-1">Browse</h3>
                <Link href={regionHref} className="text-accent hover:underline flex items-center gap-1">
                  Prisons in {prison.stateOrRegion}
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </Link>
                <Link href={countryHref} className="text-accent hover:underline flex items-center gap-1">
                  All prisons in {prison.country}
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </Link>
                <Link href="/prison-map" className="text-accent hover:underline flex items-center gap-1">
                  Prison map
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
