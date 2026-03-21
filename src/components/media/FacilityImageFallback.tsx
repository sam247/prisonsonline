import { ImageOff, MapPin } from "lucide-react";
import type { Prison } from "@/types/prison";

export function FacilityImageFallback({ prison }: { prison: Prison }) {
  const hasCoords = prison.latitude !== 0 || prison.longitude !== 0;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center sm:py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <ImageOff className="h-7 w-7" aria-hidden />
          </div>
          <div className="space-y-1 max-w-md">
            <p className="text-sm font-medium text-foreground">No photograph in this directory</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This profile lists factual fields from the current import only. We do not show generic or illustrative
              photos as stand-ins for named establishments.
            </p>
          </div>
        </div>
        {hasCoords && (
          <div className="sm:w-[min(100%,280px)] border-t sm:border-t-0 sm:border-l border-border/50 bg-secondary/30">
            <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 px-4 py-6 text-muted-foreground text-sm">
              <MapPin className="h-5 w-5 shrink-0" aria-hidden />
              <p className="text-center tabular-nums text-xs leading-relaxed">
                Coordinates on file
                <br />
                <span className="text-foreground/90">
                  {prison.latitude.toFixed(4)}, {prison.longitude.toFixed(4)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
