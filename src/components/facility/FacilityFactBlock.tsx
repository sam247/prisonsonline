"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Mail, Phone } from "lucide-react";
import type { Prison } from "@/types/prison";
import type { FacilityVerificationRecord } from "@/types/facilitySource";
import { sendGtagEvent } from "@/lib/analytics/gtag";
import { Card, CardContent } from "@/components/ui/card";

function FactRow({ label, children }: { label: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="py-3 border-b border-border/50 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</dt>
      <dd className="text-base text-foreground leading-relaxed">{children}</dd>
    </div>
  );
}

function eventBase(prison: Prison, pageFamily: string) {
  return { page_family: pageFamily, entity_slug: prison.slug };
}

export function FacilityFactBlock({
  prison,
  verification,
  pageFamily = "prison_contact",
}: {
  prison: Prison;
  verification?: FacilityVerificationRecord;
  pageFamily?: string;
}) {
  const [copied, setCopied] = useState(false);
  const facts = verification?.overrides ?? {};
  const address = facts.address ?? prison.address;
  const postcode = facts.postcode ?? prison.postcode;
  const phone = facts.phone ?? prison.phone;
  const email = facts.email;
  const operator = facts.operator ?? prison.operator;
  const category = facts.category ?? prison.securityLevel;

  const copyAddress = async () => {
    const value = [address, postcode].filter(Boolean).join(", ");
    if (!value || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    sendGtagEvent("contact_action", { ...eventBase(prison, pageFamily), action_type: "address_copy" });
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section aria-labelledby="facility-facts-heading" className="mb-8">
      <h2 id="facility-facts-heading" className="text-xl font-bold mb-3">
        {prison.name}
      </h2>
      <Card className="border-border/70">
        <CardContent className="p-5 sm:p-6">
          <dl>
            <FactRow label="Address">
              {address ? (
                <div className="flex items-start justify-between gap-4">
                  <span>{address}</span>
                  <button type="button" onClick={copyAddress} className="text-sm text-accent hover:underline inline-flex items-center gap-1 shrink-0" aria-label={`Copy address for ${prison.name}`}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              ) : undefined}
            </FactRow>
            <FactRow label="Postcode">{postcode}</FactRow>
            <FactRow label="Telephone">
              {phone ? (
                <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="text-accent hover:underline inline-flex items-center gap-2" onClick={() => sendGtagEvent("contact_action", { ...eventBase(prison, pageFamily), action_type: "telephone" })}>
                  <Phone className="h-4 w-4" /> {phone}
                </a>
              ) : undefined}
            </FactRow>
            <FactRow label="Email">
              {email ? (
                <a href={`mailto:${email}`} className="text-accent hover:underline inline-flex items-center gap-2" onClick={() => sendGtagEvent("contact_action", { ...eventBase(prison, pageFamily), action_type: "email" })}>
                  <Mail className="h-4 w-4" /> {email}
                </a>
              ) : undefined}
            </FactRow>
            <FactRow label="Operator">{operator}</FactRow>
            <FactRow label="Category / type">{category}</FactRow>
          </dl>

          {verification?.sources.length ? (
            <div className="mt-5 pt-5 border-t border-border/60">
              <h3 className="text-sm font-semibold mb-2">Official information</h3>
              <ul className="space-y-2 text-sm">
                {verification.sources.map((source) => {
                  const domain = new URL(source.url).hostname;
                  const verifiedFields = Object.entries(verification.fieldSources)
                    .filter(([, sourceIds]) => sourceIds?.includes(source.id))
                    .map(([field]) => field === "legalVisits" ? "legal visits" : field);
                  return (
                    <li key={source.id}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1" onClick={() => sendGtagEvent("official_source_click", { ...eventBase(prison, pageFamily), source_domain: domain, source_name: source.name })}>
                        {source.name} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <span className="block text-xs text-muted-foreground mt-0.5">Source checked {source.checkedAt}</span>
                      {verifiedFields.length ? <span className="block text-xs text-muted-foreground">Supports: {verifiedFields.join(", ")}</span> : null}
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-muted-foreground mt-3">Only the fields named under each source were verified in that check. Other displayed fields remain values from the directory import.</p>
              <p className="text-xs text-muted-foreground mt-3">Prisons Online is an independent directory, not an official government service.</p>
            </div>
          ) : (
            <p className="mt-5 pt-5 border-t border-border/60 text-xs text-muted-foreground">These directory fields have not yet been individually verified against a linked primary source.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
