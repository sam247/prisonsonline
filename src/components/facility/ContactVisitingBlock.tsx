import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ContactLink, ContactRow } from "@/lib/seo/prisonContactVisiting";

function RowLink({ link }: { link: ContactLink }) {
  if (link.kind === "official") {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
        {link.label}
        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </a>
    );
  }
  return (
    <Link href={link.href} className="text-accent hover:underline">
      {link.label}
    </Link>
  );
}

export function ContactVisitingBlock({ rows }: { rows: ContactRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="contact-visiting-heading" data-block="contact-visiting" className="scroll-mt-4">
      <h2 id="contact-visiting-heading" className="text-xl font-bold mb-3">
        Contacting and visiting
      </h2>
      <Card className="border-border/60">
        <CardContent className="p-5 sm:p-6">
          <dl>
            {rows.map((row) => (
              <div
                key={row.key}
                data-row={row.key}
                className="grid grid-cols-1 sm:grid-cols-[minmax(9rem,30%)_1fr] gap-x-4 gap-y-0.5 py-2.5 border-b border-border/50 last:border-b-0"
              >
                <dt className="text-xs font-medium text-muted-foreground pt-0.5">{row.label}</dt>
                <dd className="text-sm text-foreground leading-snug">
                  {row.text ? (
                    row.tel ? (
                      <a href={`tel:${row.tel}`} className="text-accent hover:underline">{row.text}</a>
                    ) : row.mailto ? (
                      <a href={`mailto:${row.mailto}`} className="text-accent hover:underline">{row.text}</a>
                    ) : (
                      <span>{row.text}</span>
                    )
                  ) : null}
                  {row.links && row.links.length > 0 ? (
                    <ul className="space-y-1">
                      {row.links.map((l) => (
                        <li key={l.href}>
                          <RowLink link={l} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50 leading-relaxed">
            Rules and services change. Check with the prison or the official service before you visit, send money or
            post anything. Prisons Online is an independent directory, not an official government service.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
