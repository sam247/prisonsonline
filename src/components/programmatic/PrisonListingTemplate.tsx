import Link from "next/link";
import { PrisonCard } from "@/components/PrisonCard";
import { StatsPanel } from "@/components/StatsPanel";
import { ChevronRight } from "lucide-react";
import type { Prison } from "@/types/prison";

export interface PrisonListingCrumb {
  label: string;
  href?: string;
}

function establishmentCountFromStats(stats?: { label: string; value: string | number }[]): number | undefined {
  const raw = stats?.find((s) => s.label === "Establishments")?.value;
  return typeof raw === "number" ? raw : undefined;
}

export function PrisonListingTemplate({
  breadcrumbs,
  title,
  subtitle,
  intro,
  eyebrow,
  footnote,
  prisons: prisonList,
  stats,
  readMoreLink,
}: {
  breadcrumbs: PrisonListingCrumb[];
  title: string;
  subtitle?: string;
  intro?: string;
  eyebrow?: string;
  footnote?: string;
  prisons: Prison[];
  stats?: { label: string; value: string | number }[];
  /** Optional link to a companion directory article (e.g. programmatic article). */
  readMoreLink?: { href: string; label: string };
}) {
  const n = establishmentCountFromStats(stats);
  const countFactualLine =
    typeof n === "number"
      ? `This page lists ${n} establishment${n === 1 ? "" : "s"} from the current import.`
      : undefined;

  return (
    <div className="min-h-screen">
      <div className="border-b bg-card">
        <div className="container py-3">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-foreground transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>

      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-primary-foreground/80 max-w-3xl leading-relaxed">{subtitle}</p>}
        </div>
      </section>

      {stats && stats.length > 0 && (
        <section className="border-b bg-card">
          <div className="container py-6">
            <StatsPanel stats={stats} />
          </div>
        </section>
      )}

      <div className="border-b bg-muted/30">
        <div className="container py-8 max-w-3xl space-y-4">
          {intro && <p className="text-sm text-foreground/90 leading-relaxed">{intro}</p>}
          {countFactualLine && (
            <p className="text-sm text-muted-foreground leading-relaxed">{countFactualLine}</p>
          )}
          {readMoreLink && (
            <p className="text-sm">
              <Link href={readMoreLink.href} className="text-accent font-medium hover:underline">
                {readMoreLink.label}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="container py-10">
        {prisonList.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center max-w-lg mx-auto">
            <p className="text-muted-foreground mb-4">No establishments match this listing right now.</p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/prisons/uk" className="text-accent font-medium hover:underline">
                United Kingdom prisons
              </Link>
              <Link href="/prisons" className="text-accent font-medium hover:underline">
                Prison finder
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prisonList.map((p) => (
              <PrisonCard key={p.slug} prison={p} />
            ))}
          </div>
        )}
        {footnote && prisonList.length > 0 && (
          <p className="text-xs text-muted-foreground max-w-3xl mt-10 leading-relaxed">{footnote}</p>
        )}
      </div>
    </div>
  );
}
