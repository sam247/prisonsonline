/** How an image is intended to be used (trust / sourcing). */
export type ImageMode = "real" | "editorial" | "fallback";

/** Named-facility photography only — must not be AI or stock pretending to be a specific prison. */
export interface RealFacilityImage {
  src: string;
  alt: string;
  type: "real";
  caption?: string;
  credit?: string;
}

/** Generic thematic imagery for browse/editorial surfaces only. */
export interface EditorialImage {
  src: string;
  alt: string;
  type: "editorial";
}
