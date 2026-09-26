import Image from "next/image";
import type { ReactNode } from "react";
import type { RealFacilityImage } from "@/types/media";

type Aspect = "video" | "4/3" | "auto";

const aspectClass: Record<Aspect, string> = {
  video: "aspect-video",
  "4/3": "aspect-[4/3]",
  auto: "",
};

const attributionLinkClass = "underline underline-offset-2 hover:text-foreground";

/** TASL-style credit: 'Title' by Author, Licence (linked), via Wikimedia Commons (linked to file page). */
function ImageAttribution({ image }: { image: RealFacilityImage }) {
  const author = (image.author || image.credit || "").trim();
  const title = image.title?.trim();
  const licence = image.licence?.trim() || (image.licenceUrl ? "Licence" : "");
  const isCommons = /(^|\.)wikimedia\.org$/.test(safeHostname(image.sourceUrl));
  const parts: ReactNode[] = [];
  if (title && author) {
    parts.push(
      <span key="work">
        &lsquo;{title}&rsquo; by {author}
      </span>,
    );
  } else if (title) {
    parts.push(<span key="work">&lsquo;{title}&rsquo;</span>);
  } else if (author) {
    parts.push(<span key="work">Photo: {author}</span>);
  }
  if (licence) {
    parts.push(
      image.licenceUrl ? (
        <a
          key="licence"
          href={image.licenceUrl}
          rel="license noopener noreferrer"
          target="_blank"
          className={attributionLinkClass}
        >
          {licence}
        </a>
      ) : (
        <span key="licence">{licence}</span>
      ),
    );
  }
  parts.push(
    <a
      key="source"
      href={image.sourceUrl}
      rel="noopener noreferrer"
      target="_blank"
      className={attributionLinkClass}
    >
      {isCommons ? "via Wikimedia Commons" : "source"}
    </a>,
  );
  return (
    <span className="block text-muted-foreground/80">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 ? ", " : null}
          {part}
        </span>
      ))}
    </span>
  );
}

function safeHostname(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

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
      {(image.caption || image.credit || image.licence || image.sourceUrl) && (
        <figcaption className="mt-2 text-xs text-muted-foreground leading-relaxed space-y-1">
          {image.caption && <span className="block">{image.caption}</span>}
          {image.sourceUrl ? (
            <ImageAttribution image={image} />
          ) : (
            <>
              {image.credit && (
                <span className="block text-muted-foreground/80">Credit: {image.credit}</span>
              )}
              {image.licence && <span className="block">Licence: {image.licence}</span>}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
