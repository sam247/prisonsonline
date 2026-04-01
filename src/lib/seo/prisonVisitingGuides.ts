import { getGuide } from "@/data/guides";
import type { Guide } from "@/data/guides";

const VISITING_GUIDE_SLUGS = [
  "how-prison-visits-work",
  "what-to-wear-to-a-prison-visit",
  "what-can-you-bring-to-prison",
] as const;

/** Fixed set of visiting-related guides for prison profile pages (2–3 items when all exist). */
export function getVisitingGuidesForPrison(): Guide[] {
  return VISITING_GUIDE_SLUGS.map((slug) => getGuide(slug)).filter((g): g is Guide => Boolean(g));
}
