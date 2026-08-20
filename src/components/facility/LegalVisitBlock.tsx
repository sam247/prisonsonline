"use client";

import { ExternalLink, Mail, Phone } from "lucide-react";
import type { Prison } from "@/types/prison";
import type { FacilityVerificationRecord } from "@/types/facilitySource";
import { sendGtagEvent } from "@/lib/analytics/gtag";
import { Card, CardContent } from "@/components/ui/card";

export function LegalVisitBlock({ prison, verification }: { prison: Prison; verification: FacilityVerificationRecord }) {
  const legal = verification.legalVisits!;
  const sourceById = new Map(verification.sources.map((source) => [source.id, source]));
  const base = { page_family: "prison_legal_visits", entity_slug: prison.slug, intent_slug: "legal-visits" };

  return (
    <section aria-labelledby="legal-visit-details-heading" className="mb-8">
      <h2 id="legal-visit-details-heading" className="text-xl font-bold mb-3">Official booking details</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">{legal.summary}</p>
      <div className="space-y-4">
        {legal.contacts.map((contact) => {
          const source = sourceById.get(contact.sourceId);
          return (
            <Card key={`${contact.label}-${contact.email ?? contact.phone}`} className="border-border/70">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">{contact.label}</h3>
                <div className="space-y-2 text-sm">
                  {contact.email && <a href={`mailto:${contact.email}`} className="text-accent hover:underline flex items-center gap-2" onClick={() => sendGtagEvent("contact_action", { ...base, action_type: "email" })}><Mail className="h-4 w-4" />{contact.email}</a>}
                  {contact.phone && <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="text-accent hover:underline flex items-center gap-2" onClick={() => sendGtagEvent("contact_action", { ...base, action_type: "telephone" })}><Phone className="h-4 w-4" />{contact.phone}</a>}
                  {contact.schedule?.map((line) => <p key={line} className="text-muted-foreground">{line}</p>)}
                  {source && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1 pt-1" onClick={() => sendGtagEvent("official_source_click", { ...base, source_domain: new URL(source.url).hostname, source_name: source.name })}>Check the official source <ExternalLink className="h-3.5 w-3.5" /></a>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-4">Sources checked {verification.sources.map((source) => source.checkedAt).sort().at(-1)}. Procedures can change; use the official link before relying on a time or booking route.</p>
    </section>
  );
}
