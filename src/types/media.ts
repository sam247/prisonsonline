/** How an image is intended to be used (trust / sourcing). */
export type ImageMode = "real" | "editorial" | "fallback";

/** Named-facility photography only — must not be AI or stock pretending to be a specific prison. */
export interface RealFacilityImage {
  src: string;
  alt: string;
  type: "real";
  caption?: string;
  credit?: string;
  /** Licence string (e.g. CC BY-SA 4.0) when sourced from Commons or similar. */
  licence?: string;
  /** Licence deed URL (absent for plain public domain). */
  licenceUrl?: string;
  /** Author / creator as given on the source file page (HTML stripped). */
  author?: string;
  /** Title of the work (Commons ObjectName, or file name without extension). */
  title?: string;
  /** Source file page, e.g. the Wikimedia Commons `File:` page. */
  sourceUrl?: string;
}

/** Generic thematic imagery for browse/editorial surfaces only. */
export interface EditorialImage {
  src: string;
  alt: string;
  type: "editorial";
}
