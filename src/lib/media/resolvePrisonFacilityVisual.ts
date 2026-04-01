import type { Prison } from "@/types/prison";
import type { EditorialImage, RealFacilityImage } from "@/types/media";

const UK_EDITORIAL_EXTERIOR: EditorialImage = {
  src: "/images/prisons/uk-editorial-prison-exterior.svg",
  alt: "Illustrative prison exterior image",
  type: "editorial",
};

export type ResolvedFacilityVisual =
  | { kind: "real"; image: RealFacilityImage }
  | { kind: "editorial"; image: EditorialImage }
  | { kind: "fallback" };

/** Real facility photo when present; UK-only editorial when no photo; otherwise neutral fallback (no generic “photo” for US). */
export function resolvePrisonFacilityVisual(prison: Prison): ResolvedFacilityVisual {
  const real = prison.facilityImage?.type === "real" ? prison.facilityImage : undefined;
  if (real) return { kind: "real", image: real };
  if (prison.countrySlug === "uk") return { kind: "editorial", image: UK_EDITORIAL_EXTERIOR };
  return { kind: "fallback" };
}
