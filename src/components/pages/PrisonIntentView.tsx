import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import type { Prison } from "@/types/prison";
import type { PrisonIntentSlug } from "@/lib/seo/intentRollout";
import { prisonIntentJsonLdGraph } from "@/lib/seo/prisonIntentJsonLd";
import {
  buildIntentBodyParagraphs,
  buildIntentPageTitle,
  guideSlugsForIntent,
  intentHref,
  intentTopicLabel,
  siblingIntentsFor,
} from "@/lib/seo/prisonIntentCopy";
import { guides } from "@/data/guides";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";
import { slotForTemplate } from "@/lib/ads/layoutPolicy";

export function PrisonIntentView({
  prison,
  intent,
}: {
  prison: Prison;
  intent: PrisonIntentSlug;
}) {
  const intentPath = intentHref(prison.countrySlug, prison.slug, intent);
  const title = buildIntentPageTitle(prison, intent);
  const paragraphs = buildIntentBodyParagraphs(prison, intent);
  const guideSlugs = guideSlugsForIntent(intent);
  const guideLinks = guideSlugs
    .map((slug) => guides.find((g) => g.slug === slug))
    .filter((g): g is (typeof guides)[number] => Boolean(g));
  const siblings = siblingIntentsFor(intent);
  const metaDesc = paragraphs.slice(0, 2).join(" ").slice(0, 500);
  const jsonLd = prisonIntentJsonLdGraph({
    prison,
    intent,
    description: metaDesc,
    intentPath,
  });

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b bg-card">
        <div className="container py-3">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <Link href="/prisons" className="hover:text-foreground transition-colors">
              Prisons
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <Link href={`/prisons/${prison.countrySlug}`} className="hover:text-foreground transition-colors">
              {prison.country}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <Link href={`/prisons/${prison.countrySlug}/${prison.slug}`} className="hover:text-foreground transition-colors">
              {prison.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-foreground font-medium">{title}</span>
          </nav>
        </div>
      </div>

      <header className="bg-primary text-primary-foreground">
        <div className="container py-10 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-primary-foreground/80 text-sm md:text-base max-w-3xl leading-relaxed">
            Directory context for {prison.name} in {prison.city}, {prison.stateOrRegion}. Confirm all operational detail
            with {prison.operator?.trim() || "the official operator"}.
          </p>
        </div>
      </header>

      <article className="container py-10 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {slotForTemplate("intent", 0) ? (
          <section className="mt-8" aria-label="Sponsored">
            <div className="rounded-md border border-border/50 p-3 bg-muted/20">
              <p className="text-[11px] text-muted-foreground mb-2">Sponsored</p>
              <AdSenseUnit slot={slotForTemplate("intent", 0)!} style={{ minHeight: 250 }} />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="intent-related-heading" className="mt-10 pt-8 border-t border-border/60">
          <h2 id="intent-related-heading" className="text-lg font-semibold text-foreground mb-4">
            Related on this site
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={`/prisons/${prison.countrySlug}/${prison.slug}`} className="text-accent hover:underline">
                Main profile: {prison.name}
              </Link>
            </li>
            <li>
              <Link
                href={`/prisons/${prison.countrySlug}/${prison.regionSlug}`}
                className="text-accent hover:underline"
              >
                Prisons in {prison.stateOrRegion}
              </Link>
            </li>
            {guideLinks.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="text-accent hover:underline inline-flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {g.title}
                </Link>
              </li>
            ))}
            {siblings.map((s) => (
              <li key={s}>
                <Link href={intentHref(prison.countrySlug, prison.slug, s)} className="text-accent hover:underline">
                  {intentTopicLabel(s)} — {prison.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="intent-next-steps-heading" className="mt-8 pt-6 border-t border-border/60">
          <h2 id="intent-next-steps-heading" className="text-lg font-semibold text-foreground mb-3">
            Next step journey
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={`/prisons/${prison.countrySlug}/${prison.slug}`} className="text-accent hover:underline">
                Return to full profile
              </Link>
            </li>
            {guideLinks.slice(0, 2).map((g) => (
              <li key={`${g.slug}-next`}>
                <Link href={`/guides/${g.slug}`} className="text-accent hover:underline">
                  Read guide: {g.title}
                </Link>
              </li>
            ))}
            {prison.countrySlug === "uk" ? (
              <li>
                <Link href="/probation" className="text-accent hover:underline">
                  Find related probation services
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      </article>
    </div>
  );
}
