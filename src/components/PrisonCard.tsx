import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Prison } from "@/types/prison";

interface PrisonCardProps {
  prison: Prison;
  variant?: "default" | "compact";
}

function cardMetaLine(prison: Prison): string | null {
  const fn = prison.predominantFunction?.trim();
  const g = prison.gender?.trim();
  if (fn) return fn;
  if (g) return g;
  return null;
}

export function PrisonCard({ prison, variant = "default" }: PrisonCardProps) {
  const meta = cardMetaLine(prison);
  const pad = variant === "compact" ? "p-4" : "p-5";

  return (
    <Link href={`/prisons/${prison.countrySlug}/${prison.slug}`}>
      <Card className="group h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60">
        <CardContent className={pad}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
              {prison.name}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-xs font-medium">
              {prison.securityLevel}
            </Badge>
          </div>

          <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="leading-snug">
              {prison.city}
              {prison.stateOrRegion ? ` · ${prison.stateOrRegion}` : ""}
              {prison.country ? ` · ${prison.country}` : ""}
            </span>
          </div>

          {prison.operator?.trim() && (
            <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-1">
              <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-snug">{prison.operator}</span>
            </div>
          )}

          {meta && (
            <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-snug mt-1">{meta}</p>
          )}

          {prison.shortDescription?.trim() && (
            <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-snug mt-2 border-t border-border/40 pt-2">
              {prison.shortDescription.trim()}
            </p>
          )}

          {prison.capacity > 0 && (
            <p className="text-xs text-muted-foreground/70 mt-2 tabular-nums">
              Capacity: {prison.capacity.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
