import { prisons } from "@/data/prisons";
import type { Prison } from "@/types/prison";
import { isInTopEntityCohort } from "@/lib/seo/entityCohort";

/** Fixed allow-list: route segment must match exactly (unknown segments → notFound). */
export const PRISON_INTENT_SLUGS = [
  "visiting-times",
  "contact-details",
  "booking-a-visit",
  "what-to-expect",
  "sending-money",
  "phone-calls",
  "email-a-prisoner",
  "legal-visits",
] as const;

export type PrisonIntentSlug = (typeof PRISON_INTENT_SLUGS)[number];

/**
 * Phase-1 US intent rollout: curated federal / high-profile BOP rows only.
 * Expand deliberately in a second phase; keep in sync with `generateStaticParams` and prison-intent sitemap.
 */
export const US_INTENT_ROLLOUT_SLUGS = [
  "florence-admax-usp",
  "alderson-fpc",
  "manchester-fci",
  "brooklyn-mdc",
  "atlanta-fci",
  "coleman-i-usp",
] as const;

const US_ROLLOUT_SET = new Set<string>(US_INTENT_ROLLOUT_SLUGS);

const BASE_INTENTS: PrisonIntentSlug[] = [
  "visiting-times",
  "contact-details",
  "booking-a-visit",
  "what-to-expect",
];

const EXPANDED_INTENTS: PrisonIntentSlug[] = [
  "sending-money",
  "phone-calls",
  "email-a-prisoner",
  "legal-visits",
];

export function isPrisonIntentSlug(value: string): value is PrisonIntentSlug {
  return (PRISON_INTENT_SLUGS as readonly string[]).includes(value);
}

export function isPrisonInIntentRollout(prison: Prison): boolean {
  if (prison.countrySlug === "uk") return true;
  if (prison.countrySlug === "us") return US_ROLLOUT_SET.has(prison.slug);
  return false;
}

/** Prisons that receive static intent pages and profile “Prison information” links. */
export function prisonsEligibleForIntentPages(): Prison[] {
  return prisons.filter(
    (p) => p.countrySlug === "uk" || (p.countrySlug === "us" && US_ROLLOUT_SET.has(p.slug)),
  );
}

export function intentsForPrison(prison: Prison): PrisonIntentSlug[] {
  if (!isPrisonInIntentRollout(prison)) return [];
  if (isInTopEntityCohort(prison.countrySlug, prison.slug)) {
    return [...BASE_INTENTS, ...EXPANDED_INTENTS];
  }
  return BASE_INTENTS;
}

export function intentGenerateStaticParams(): { country: string; slug: string; intent: string }[] {
  const list = prisonsEligibleForIntentPages();
  return list.flatMap((p) =>
    intentsForPrison(p).map((intent) => ({
      country: p.countrySlug,
      slug: p.slug,
      intent,
    })),
  );
}
