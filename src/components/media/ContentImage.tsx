import Image from "next/image";
import type { RealFacilityImage } from "@/types/media";

type Aspect = "video" | "4/3" | "auto";

const aspectClass: Record<Aspect, string> = {
  video: "aspect-video",
  "4/3": "aspect-[4/3]",
  auto: "",
};

export function ContentImage({
  image,
  priority,
  sizes = "(max-width: 768px) 100vw, 48rem",
  aspect = "video",
  className = "",
}: {
  image: RealFacilityImage;
  priority?: boolean;
  sizes?: string;
  aspect?: Aspect;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div
        className={`relative w-full overflow-hidden rounded-lg border border-border/60 bg-muted ${aspectClass[aspect]}`}
      >
        {aspect === "auto" ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
            sizes={sizes}
            priority={priority}
            unoptimized={image.src.endsWith(".svg")}
          />
        ) : (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes={sizes}
            priority={priority}
            unoptimized={image.src.endsWith(".svg")}
          />
        )}
      </div>
      {(image.caption || image.credit || image.licence) && (
        <figcaption className="mt-2 text-xs text-muted-foreground leading-relaxed space-y-1">
          {image.caption && <span className="block">{image.caption}</span>}
          {image.credit && (
            <span className="block text-muted-foreground/80">Credit: {image.credit}</span>
          )}
          {image.licence && <span className="block">Licence: {image.licence}</span>}
        </figcaption>
      )}
    </figure>
  );
}
