import type { PrisonStateRecord, PrisonVerificationInput, VerificationStatus } from "./types";

const STATUS_PRIORITY: Record<VerificationStatus, number> = {
  UNVERIFIED: 0,
  VERIFICATION_FAILED: 1,
  REVIEW_REQUIRED: 2,
  CHANGED: 3,
  CURRENT: 4,
};

export function isUkPrison(prison: Pick<PrisonVerificationInput, "countrySlug">): boolean {
  return prison.countrySlug === "uk";
}

export function isUsPrison(prison: Pick<PrisonVerificationInput, "countrySlug">): boolean {
  return prison.countrySlug === "us" || prison.countrySlug === "united-states";
}

/**
 * never verified → failed/retry → oldest verification.
 * Throughput later is `--limit N` over this same ordering — no redesign.
 */
export function selectUkPrisonsDue(input: {
  prisons: PrisonVerificationInput[];
  state: Record<string, PrisonStateRecord>;
  now: Date;
  limit: number;
  slugs?: string[];
}): PrisonVerificationInput[] {
  const uk = input.prisons.filter(isUkPrison);
  if (input.slugs?.length) {
    const wanted = new Set(input.slugs);
    return uk.filter((p) => wanted.has(p.slug));
  }

  const nowMs = input.now.getTime();
  const ranked = uk
    .map((prison) => {
      const row = input.state[prison.slug];
      const status: VerificationStatus = row?.verificationStatus ?? "UNVERIFIED";
      const last = row?.lastVerifiedAt ? Date.parse(row.lastVerifiedAt) : 0;
      const next = row?.nextVerificationAt ? Date.parse(row.nextVerificationAt) : 0;
      const due = !row || status === "UNVERIFIED" || !next || next <= nowMs;
      return { prison, status, last, due };
    })
    .filter((row) => row.due)
    .sort((a, b) => {
      const pri = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (pri !== 0) return pri;
      if (a.last !== b.last) return a.last - b.last;
      return a.prison.slug.localeCompare(b.prison.slug);
    });

  return ranked.slice(0, Math.max(0, input.limit)).map((row) => row.prison);
}
