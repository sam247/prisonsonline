export type AdTemplateKind = "entity" | "intent" | "guide" | "directory";

/**
 * Conservative ad policy to protect UX/CWV:
 * - no ad before factual identity block
 * - cap ad units per template
 * - reserve minimum height to reduce layout shift
 */
export const AD_POLICY: Record<AdTemplateKind, { maxUnits: number; slots: string[] }> = {
  entity: { maxUnits: 2, slots: ["4281655507", "6357338949"] },
  intent: { maxUnits: 1, slots: ["5649551028"] },
  guide: { maxUnits: 1, slots: ["9839713678"] },
  directory: { maxUnits: 1, slots: ["2947041561"] },
};

export function slotForTemplate(kind: AdTemplateKind, index = 0): string | null {
  const policy = AD_POLICY[kind];
  if (!policy) return null;
  if (index >= policy.maxUnits) return null;
  return policy.slots[index] ?? null;
}

