import { ImageOff, MapPin } from "lucide-react";
import type { Prison } from "@/types/prison";

export function FacilityImageFallback({
  prison,
  variant = "profile",
}: {
  prison: Prison;
  /** Cards use a shorter message in the same visual slot. */
  variant?: "profile" | "card";
}) {
  const hasCoords = prison.latitude !== 0 || prison.longitude !== 0;
  const isCard = variant === "card";

  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div
          className={`flex flex-1 flex-col items-center justify-center gap-3 text-center ${isCard ? "px-4 py-6 sm:py-8" : "px-6 py-10 sm:py-12"}`}
        >
          <div
            className={`flex items-center justify-center rounded-full bg-secondary text-muted-foreground ${isCard ? "h-10 w-10" : "h-14 w-14"}`}
          >
            <ImageOff className={isCard ? "h-5 w-5" : "h-7 w-7"} aria-hidden />
          </div>
          <div className="space-y-1 max-w-md">
            <p className={`font-medium text-foreground ${isCard ? "text-xs" : "text-sm"}`}>
              No photograph in this directory
            </p>
            <p className={`text-muted-foreground leading-relaxed ${isCard ? "text-[11px] line-clamp-3" : "text-xs"}`}>
              {isCard
                ? "No facility photo on file; we do not use generic stand-ins for named sites."
                : "This profile lists factual fields from the current import only. We do not show generic or illustrative photos as stand-ins for named establishments."}
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
