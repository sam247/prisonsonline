"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Court } from "@/types/court";

type HubOption = { slug: string; label: string };

export function CourtsFinderClient({
  courts,
  hubs,
}: {
  courts: Court[];
  hubs: HubOption[];
}) {
  const [query, setQuery] = useState("");
  const [hub, setHub] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = courts;
    if (hub !== "all") {
      list = list.filter((c) => c.hubSlugs.includes(hub));
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const hay = [c.name, c.town, c.address, c.postcode, c.jurisdiction, ...(c.factTypes || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [courts, hub, query]);

  return (
    <section aria-labelledby="court-search-heading" className="space-y-4">
      <h2 id="court-search-heading" className="text-xl font-semibold">
        Search courts
      </h2>
      <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by court name, town or postcode"
          aria-label="Search courts"
          className="sm:flex-1"
        />
        <Select value={hub} onValueChange={setHub}>
          <SelectTrigger className="sm:w-56" aria-label="Filter by court type">
            <SelectValue placeholder="Court type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {hubs.map((h) => (
              <SelectItem key={h.slug} value={h.slug}>
                {h.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {courts.length} listings
      </p>
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.slice(0, 60).map((court) => (
          <li key={court.slug}>
            <Card className="h-full border-border/60">
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold text-base">
                  <Link href={`/courts/${court.slug}`} className="hover:underline text-accent">
                    {court.name}
                  </Link>
                </h3>
                {court.jurisdiction || court.factTypes?.[0] ? (
                  <p className="text-xs text-muted-foreground">
                    {court.factTypes?.join(", ") || court.jurisdiction}
                  </p>
                ) : null}
                {court.isClosed ? <Badge variant="secondary">Closed</Badge> : null}
                {court.address || court.town ? (
                  <p className="text-sm text-muted-foreground inline-flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                    {[court.town || court.address, court.postcode].filter(Boolean).join(", ")}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {filtered.length > 60 ? (
        <p className="text-sm text-muted-foreground">Refine your search to narrow these results.</p>
      ) : null}
    </section>
  );
}
