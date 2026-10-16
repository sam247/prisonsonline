import { MapPin } from "lucide-react";

/** Location preview used on prison profiles (UK/US and official-source international). Render only with real coordinates. */
export function ProfileMapPreview({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <div>
      <div className="bg-secondary/50 rounded-lg h-48 flex items-center justify-center text-muted-foreground text-sm">
        <MapPin className="h-5 w-5 mr-2 shrink-0" aria-hidden />
        Map preview — {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </div>
    </div>
  );
}
