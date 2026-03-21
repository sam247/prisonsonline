import Image from "next/image";
import type { EditorialImage } from "@/types/media";

export function EditorialImageBlock({
  image,
  priority,
  sizes = "(max-width: 768px) 100vw, 42rem",
  className = "",
  aspectClassName = "aspect-[21/9] sm:aspect-[2.4/1]",
}: {
  image: EditorialImage;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Tailwind aspect ratio wrapper; default is a wide banner. */
  aspectClassName?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border border-border/50 bg-muted ${aspectClassName} ${className}`.trim()}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
        unoptimized={image.src.endsWith(".svg")}
      />
    </div>
  );
}
