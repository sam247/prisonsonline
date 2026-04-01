import Link from "next/link";
import { getPrisonsByRegion } from "@/data/prisons";
import {
  getRelatedArticlesForPrison,
  getRelatedGuidesForPrison,
  getRelatedGuidesFallback,
  getRelatedPrisonsForProfile,
} from "@/lib/queries";
import { listMatchingCollectionHubsForPrison } from "@/lib/programmatic/collections";
import {
  ukFunctionHubHref,
  ukOperatorHubHref,
  ukSecurityHubHref,
  ukSubgroupHubHref,
} from "@/lib/programmatic/ukPrisonHubs";
import { usFacilityTypeHubHref, facilityTypeSlugForPrison } from "@/lib/programmatic/usFederalHubs";
import { slugUsFacilityTypeExplainer, slugUsStateArticle } from "@/lib/programmatic/articles/slugRules";
import { getSiteArticle } from "@/data/articles.merge";
import { prisonProfileJsonLdGraph } from "@/lib/seo/prisonJsonLd";
import {
  buildContactBody,
  buildContactHeading,
  buildHowToVisitBody,
  buildHowToVisitHeading,
  buildPlanningVisitBody,
  buildPlanningVisitHeading,
  buildLocationBody,
  buildLocationHeading,
  buildPrisonTypeBody,
  buildPrisonTypeHeading,
} from "@/lib/seo/prisonProfileCopy";
import { getVisitingGuidesForPrison } from "@/lib/seo/prisonVisitingGuides";
import { isPrisonInIntentRollout } from "@/lib/seo/intentRollout";
import { intentHref } from "@/lib/seo/prisonIntentCopy";
import { resolvePrisonFacilityVisual } from "@/lib/media/resolvePrisonFacilityVisual";
import { ContentImage } from "@/components/media/ContentImage";
import { EditorialImageBlock } from "@/components/media/EditorialImageBlock";
import { FacilityImageFallback } from "@/components/media/FacilityImageFallback";
import { PrisonCard } from "@/components/PrisonCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ChevronRight, BookOpen, FileText } from "lucide-react";
import type { Prison } from "@/types/prison";

function leadSummaryText(p: Prison): string {
  const sd = p.shortDescription?.trim();
  if (sd) return sd;
  const o = p.overview.trim();
  const sentences = o.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 2).join(" ") || o;
}

function formatPrisonMetaDescription(p: Prison): string {
  const parts: string[] = [];
  const primary = p.shortDescription?.trim();
  if (primary) parts.push(primary.replace(/\s+/g, " ").slice(0, 100));
  const loc = [p.postcode, p.stateOrRegion, p.country].filter(Boolean).join(" · ");
  if (loc) parts.push(loc);
  let s = parts.join(" ").replace(/\s+/g, " ").trim();
  if (!s) s = p.overview.replace(/\s+/g, " ").trim();
  return s.slice(0, 160);
}

export { formatPrisonMetaDescription };

function GlanceRow({ label, value }: { label: string; value?: string | null }) {
  const v = value?.trim();
  if (!v || /^none$/i.test(v)) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(9rem,34%)_1fr] gap-x-4 gap-y-0.5 py-2.5 border-b border-border/50 last:border-b-0">
      <dt className="text-xs font-medium text-muted-foreground pt-0.5">{label}</dt>
      <dd className="text-sm text-foreground leading-snug">{v}</dd>
    </div>
  );
}

export function PrisonProfileView({ prison }: { prison: Prison }) {
  const related = getRelatedPrisonsForProfile(prison, 8);
  const relatedArticles = getRelatedArticlesForPrison(prison);
  const relatedGuides = getRelatedGuidesForPrison(prison);
  const fallbackGuides = getRelatedGuidesFallback(3);
  const guideLinks = relatedGuides.length > 0 ? relatedGuides : fallbackGuides;
  const guidesAreGeneral = relatedGuides.length === 0;

  const hasCoords = prison.latitude !== 0 || prison.longitude !== 0;
  const visitingGuides = getVisitingGuidesForPrison();
  const prisonTypeBody = buildPrisonTypeBody(prison);
  const thematicHubs = listMatchingCollectionHubsForPrison(prison);
  const operatorHub = ukOperatorHubHref(prison);
  const securityHub = ukSecurityHubHref(prison);
  const functionHub = ukFunctionHubHref(prison);
  const subgroupHub = ukSubgroupHubHref(prison);
  const usFacilityHub = prison.countrySlug === "us" ? usFacilityTypeHubHref(prison) : null;
  const usStateArticle =
    prison.countrySlug === "us" ? getSiteArticle(slugUsStateArticle(prison.regionSlug)) : undefined;
  const usFacilityExplainerArticle =
    prison.countrySlug === "us"
      ? getSiteArticle(slugUsFacilityTypeExplainer(facilityTypeSlugForPrison(prison)))
      : undefined;

  const profilePath = `/prisons/${prison.countrySlug}/${prison.slug}`;
  const relatedSlugs = new Set(related.map((r) => r.slug));
  const sameRegionAll = getPrisonsByRegion(prison.countrySlug, prison.regionSlug)
    .filter((p) => p.slug !== prison.slug)
    .sort((a, b) => a.name.localeCompare(b.name));
  const preferredPeers = sameRegionAll.filter((p) => !relatedSlugs.has(p.slug));
  let regionLinkPrisons = preferredPeers.slice(0, 6);
  if (regionLinkPrisons.length < 3) {
    regionLinkPrisons = sameRegionAll.slice(0, 6);
  }

  const metaDesc = formatPrisonMetaDescription(prison);
  const profileJsonLd = prisonProfileJsonLdGraph({
    prison,
    path: profilePath,
    description: metaDesc,
  });

  const showHmppsCapacityNote =
    prison.dataProvenance === "hmpps_import" && prison.capacity === 0 && prison.openedYear === 0;
  const showBopImportNote =
    prison.dataProvenance === "bop_import" && prison.capacity === 0 && prison.openedYear === 0;
  const facilityVisual = resolvePrisonFacilityVisual(prison);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />

      <div className="border-b bg-card">
        <div className="container py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/prisons" className="hover:text-foreground transition-colors">
              Prisons
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <Link href={`/prisons/${prison.countrySlug}`} className="hover:text-foreground transition-colors">
              {prison.country}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-foreground font-medium">{prison.name}</span>
          </nav>
        </div>
      </div>

      <header className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <Badge variant="secondary" className="mb-4">
            {prison.securityLevel}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{prison.name}</h1>
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            <p>
              {prison.city}, {prison.stateOrRegion}, {prison.country}
            </p>
          </div>
        </div>
      </header>

      <div className="border-b bg-muted/40">
        <div className="container py-8 max-w-3xl">
          <p className="text-base text-foreground/90 leading-relaxed">{leadSummaryText(prison)}</p>
          {prison.dataProvenance === "hmpps_import" && (
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Profile fields are derived from published HMPPS listing data used in this site build. Narrative sections
              below summarise import fields; they are not independent inspections or reports.
            </p>
          )}
          {prison.dataProvenance === "bop_import" && (
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Profile fields are derived from the BOP-derived facility listing used in this build. Narrative sections are
              neutral framing only; confirm all operational detail with the Federal Bureau of Prisons.
            </p>
          )}
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-10">
            <nav aria-label="Prison directory" className="flex flex-col gap-2 text-sm">
              <Link
                href={`/prisons/${prison.countrySlug}/${prison.regionSlug}`}
                className="text-accent hover:underline w-fit"
              >
                Other prisons in {prison.stateOrRegion}
              </Link>
              <Link href={`/prisons/${prison.countrySlug}`} className="text-accent hover:underline w-fit">
                All prisons in {prison.country}
              </Link>
            </nav>

            {isPrisonInIntentRollout(prison) ? (
              <section aria-labelledby="prison-information-heading" className="scroll-mt-4">
                <h2 id="prison-information-heading" className="text-xl font-bold mb-3">
                  Prison information
                </h2>
                <ul className="space-y-2 text-sm text-accent">
                  <li>
                    <Link href={intentHref(prison.countrySlug, prison.slug, "visiting-times")} className="hover:underline">
                      Visiting times for {prison.name}
                    </Link>
                  </li>
                  <li>
                    <Link href={intentHref(prison.countrySlug, prison.slug, "contact-details")} className="hover:underline">
                      Contact details for {prison.name}
                    </Link>
                  </li>
                  <li>
                    <Link href={intentHref(prison.countrySlug, prison.slug, "booking-a-visit")} className="hover:underline">
                      How to book a visit to {prison.name}
                    </Link>
                  </li>
                  <li>
                    <Link href={intentHref(prison.countrySlug, prison.slug, "what-to-expect")} className="hover:underline">
                      What to expect at {prison.name}
                    </Link>
                  </li>
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="facility-visual-heading" className="scroll-mt-4">
              <h2 id="facility-visual-heading" className="sr-only">
                Establishment image
              </h2>
              {facilityVisual.kind === "real" ? (
                <ContentImage image={facilityVisual.image} />
              ) : facilityVisual.kind === "editorial" ? (
                <EditorialImageBlock
                  image={facilityVisual.image}
                  aspectClassName="aspect-video"
                  sizes="(max-width: 1024px) 100vw, 48rem"
                />
              ) : (
                <FacilityImageFallback prison={prison} />
              )}
            </section>

            <section aria-labelledby="at-a-glance-heading">
              <h2 id="at-a-glance-heading" className="text-xl font-bold mb-4">
                At a glance
              </h2>
              <Card className="border-border/60">
                <CardContent className="p-5 sm:p-6">
                  <dl>
                    <GlanceRow label="Security / category" value={prison.securityLevel} />
                    <GlanceRow label="Operator" value={prison.operator} />
                    <GlanceRow
                      label="Capacity"
                      value={prison.capacity > 0 ? prison.capacity.toLocaleString() : "Not listed"}
                    />
                    <GlanceRow
                      label="Opened"
                      value={prison.openedYear > 0 ? String(prison.openedYear) : "Not listed"}
                    />
                    <GlanceRow label="Gender (listing)" value={prison.gender} />
                    <GlanceRow label="Cohort" value={prison.cohort} />
                    <GlanceRow label="Predominant function" value={prison.predominantFunction} />
                    <GlanceRow label="Prison sub-group 1" value={prison.prisonSubGroup1} />
                    <GlanceRow label="Prison sub-group 2" value={prison.prisonSubGroup2} />
                    <GlanceRow label="Type (listing)" value={prison.type} />
                    <GlanceRow
                      label="Facility type (BOP)"
                      value={prison.facilityType ? prison.facilityType.toUpperCase() : undefined}
                    />
                  </dl>
                  {showHmppsCapacityNote && (
                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50 leading-relaxed">
                      The HMPPS import used here does not include capacity or opening year for these establishments.
                    </p>
                  )}
                  {showBopImportNote && (
                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50 leading-relaxed">
                      This BOP listing import does not include capacity, opening year, or coordinates for these sites.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            {prisonTypeBody ? (
              <section aria-labelledby="prison-type-heading">
                <h2 id="prison-type-heading" className="text-xl font-bold mb-4">
                  {buildPrisonTypeHeading(prison.name)}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{prisonTypeBody}</p>
              </section>
            ) : null}

            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-xl font-bold mb-4">
                Overview
              </h2>
              <p className="text-muted-foreground leading-relaxed">{prison.overview}</p>
            </section>

            <section aria-labelledby="history-heading">
              <h2 id="history-heading" className="text-xl font-bold mb-4">
                History
              </h2>
              <p className="text-muted-foreground leading-relaxed">{prison.history}</p>
            </section>

            {prison.notableInmates && (
              <section aria-labelledby="notable-heading">
                <h2 id="notable-heading" className="text-xl font-bold mb-4">
                  Notable Inmates
                </h2>
                <p className="text-muted-foreground leading-relaxed">{prison.notableInmates}</p>
              </section>
            )}

            <section aria-labelledby="life-heading">
              <h2 id="life-heading" className="text-xl font-bold mb-4">
                Prison Life
              </h2>
              <p className="text-muted-foreground leading-relaxed">{prison.prisonLife}</p>
            </section>

            <section aria-labelledby="visiting-heading">
              <h2 id="visiting-heading" className="text-xl font-bold mb-4">
                {buildHowToVisitHeading(prison.name)}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{buildHowToVisitBody(prison)}</p>
            </section>

            <section aria-labelledby="planning-visit-heading">
              <h2 id="planning-visit-heading" className="text-xl font-bold mb-4">
                {buildPlanningVisitHeading(prison.name, prison.slug)}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{buildPlanningVisitBody(prison)}</p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                For a step-by-step overview, read{" "}
                <Link href="/guides/how-prison-visits-work" className="text-accent hover:underline">
                  how prison visits work
                </Link>{" "}
                — then confirm every rule with the operator for this establishment.
              </p>
            </section>

            {prison.inspectionNotes && (
              <section aria-labelledby="inspection-heading">
                <h2 id="inspection-heading" className="text-xl font-bold mb-4">
                  Inspection Notes
                </h2>
                <p className="text-muted-foreground leading-relaxed">{prison.inspectionNotes}</p>
              </section>
            )}

            <section aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="text-xl font-bold mb-4">
                {buildContactHeading(prison.name)}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{buildContactBody(prison)}</p>
            </section>

            <section aria-labelledby="location-heading">
              <h2 id="location-heading" className="text-xl font-bold mb-4">
                {buildLocationHeading(prison.name)}
              </h2>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">{buildLocationBody(prison)}</p>
                {hasCoords ? (
                  <div>
                    <div className="bg-secondary/50 rounded-lg h-48 flex items-center justify-center text-muted-foreground text-sm">
                      <MapPin className="h-5 w-5 mr-2 shrink-0" aria-hidden />
                      Map preview — {prison.latitude.toFixed(4)}, {prison.longitude.toFixed(4)}
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary/50 rounded-lg p-6 text-muted-foreground text-sm space-y-2">
                    <p>Coordinates are not available for this establishment in the current dataset.</p>
                  </div>
                )}
              </div>
            </section>

            {visitingGuides.length > 0 ? (
              <section aria-labelledby="visiting-guides-heading">
                <h2 id="visiting-guides-heading" className="text-xl font-bold mb-4">
                  Prison visiting guides
                </h2>
                <ul className="space-y-2">
                  {visitingGuides.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/guides/${g.slug}`}
                        className="text-accent hover:underline inline-flex items-center gap-2 text-sm"
                      >
                        <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {g.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="articles-heading">
              <h2 id="articles-heading" className="text-xl font-bold mb-4">
                Related articles
              </h2>
              {relatedArticles.length > 0 ? (
                <ul className="space-y-2">
                  {relatedArticles.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/articles/${a.slug}`}
                        className="text-accent hover:underline inline-flex items-center gap-2 text-sm"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No articles reference this prison yet.</p>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:pt-1">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Explore region</h3>
                <Link
                  href={`/prisons/${prison.countrySlug}/${prison.regionSlug}`}
                  className="text-sm text-accent hover:underline inline-flex items-center gap-1"
                >
                  Prisons in {prison.stateOrRegion}
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </Link>
              </CardContent>
            </Card>

            {prison.countrySlug === "us" && prison.dataProvenance === "bop_import" && (usFacilityHub || usStateArticle || usFacilityExplainerArticle) && (
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold">Federal directory</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Links appear only when this build publishes the matching hub or article.
                  </p>
                  <ul className="text-sm space-y-2">
                    {usFacilityHub && (
                      <li>
                        <span className="text-foreground/80">Facility type: </span>
                        <Link href={usFacilityHub} className="text-accent hover:underline">
                          {prison.type} hub
                        </Link>
                      </li>
                    )}
                    {usStateArticle && (
                      <li>
                        <Link href={`/articles/${usStateArticle.slug}`} className="text-accent hover:underline">
                          Directory article: {usStateArticle.title}
                        </Link>
                      </li>
                    )}
                    {usFacilityExplainerArticle && (
                      <li>
                        <Link
                          href={`/articles/${usFacilityExplainerArticle.slug}`}
                          className="text-accent hover:underline"
                        >
                          {usFacilityExplainerArticle.title}
                        </Link>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {prison.countrySlug === "uk" &&
              (operatorHub || securityHub || functionHub || subgroupHub || thematicHubs.length > 0) && (
                <Card className="border-border/60">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">Directory hubs</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Only hubs that meet listing thresholds in this build are linked.
                    </p>
                    {(operatorHub || securityHub || functionHub || subgroupHub) && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide mb-2">
                          By attribute
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          {operatorHub && (
                            <li>
                              <span className="text-foreground/80">Operator: </span>
                              <Link href={operatorHub} className="text-accent hover:underline">
                                {prison.operator}
                              </Link>
                            </li>
                          )}
                          {securityHub && (
                            <li>
                              <span className="text-foreground/80">Security band: </span>
                              <Link href={securityHub} className="text-accent hover:underline">
                                {prison.securityLevel}
                              </Link>
                            </li>
                          )}
                          {functionHub && prison.predominantFunction && (
                            <li>
                              <span className="text-foreground/80">Function: </span>
                              <Link href={functionHub} className="text-accent hover:underline">
                                {prison.predominantFunction}
                              </Link>
                            </li>
                          )}
                          {subgroupHub && prison.prisonSubGroup1 && (
                            <li>
                              <span className="text-foreground/80">Sub-group: </span>
                              <Link href={subgroupHub} className="text-accent hover:underline">
                                {prison.prisonSubGroup1}
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {thematicHubs.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide mb-2">
                          Themed lists
                        </h4>
                        <ul className="text-sm space-y-1.5">
                          {thematicHubs.map((h) => (
                            <li key={h.href}>
                              <Link href={h.href} className="text-accent hover:underline">
                                {h.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-1">
                  {guidesAreGeneral ? "General guides" : "Related guides"}
                </h3>
                {guidesAreGeneral && (
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    These guides are not specific to this establishment; they cover common questions about prisons and
                    visits.
                  </p>
                )}
                <div className="space-y-2">
                  {guideLinks.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/guides/${guide.slug}`}
                      className="flex items-center gap-2 text-sm text-accent hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {guide.title}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {regionLinkPrisons.length > 0 && (
          <section
            className="mt-16 border-t border-border/60 pt-12"
            aria-labelledby="other-prisons-region-heading"
          >
            <h2 id="other-prisons-region-heading" className="text-xl font-bold mb-4">
              Other prisons in {prison.stateOrRegion}
            </h2>
            <ul className="space-y-3 text-sm max-w-2xl">
              {regionLinkPrisons.map((p) => {
                const href = `/prisons/${p.countrySlug}/${p.slug}`;
                return (
                  <li key={p.slug} className="space-y-1 text-muted-foreground">
                    <div>
                      <Link href={href} className="text-accent hover:underline">
                        {p.name} prison details
                      </Link>
                    </div>
                    <div>
                      <Link href={href} className="text-accent hover:underline">
                        {p.name} visiting information
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16 border-t border-border/60 pt-12" aria-labelledby="related-prisons-heading">
            <h2 id="related-prisons-heading" className="text-xl font-bold mb-2">
              Related prisons
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              {prison.countrySlug === "us" && prison.dataProvenance === "bop_import"
                ? "Other federal sites in the same state or with the same facility-type code where available, then other US federal listings in this import."
                : "Other establishments in the same region, operator, or security category where the dataset supports it, then other sites in the same country."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <PrisonCard key={p.slug} prison={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
