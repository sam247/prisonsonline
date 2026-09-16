/**
 * AI may assist extraction/comparison but never has write authority.
 * Malformed or extra keys fail closed — zero mutations.
 */

export interface AiExtraction {
  officialName?: string;
  address?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  governor?: string;
  visitingTelephone?: string;
  operator?: string;
  category?: string;
  sourceUrl?: string;
}

const ALLOWED_KEYS = [
  "officialName",
  "address",
  "postcode",
  "phone",
  "email",
  "governor",
  "visitingTelephone",
  "operator",
  "category",
  "sourceUrl",
] as const;

const ALLOWED_KEY_SET = new Set<string>(ALLOWED_KEYS);

export type AiValidation =
  | { ok: true; value: AiExtraction }
  | { ok: false; error: string };

export function validateAiExtraction(raw: unknown): AiValidation {
  if (raw == null) return { ok: false, error: "AI extraction was null or undefined." };
  if (typeof raw === "string") {
    try {
      return validateAiExtraction(JSON.parse(raw));
    } catch {
      return { ok: false, error: "AI extraction was not valid JSON." };
    }
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "AI extraction must be a JSON object." };
  }

  const record = raw as Record<string, unknown>;
  const unknownKeys = Object.keys(record).filter((key) => !ALLOWED_KEY_SET.has(key));
  if (unknownKeys.length) {
    return { ok: false, error: `AI extraction contained unsupported keys: ${unknownKeys.join(", ")}.` };
  }

  const value: AiExtraction = {};
  for (let i = 0; i < ALLOWED_KEYS.length; i += 1) {
    const key = ALLOWED_KEYS[i];
    const v = record[key];
    if (v == null) continue;
    if (typeof v !== "string") {
      return { ok: false, error: `AI extraction field "${key}" must be a string.` };
    }
    const trimmed = v.trim();
    if (trimmed) (value as Record<string, string>)[key] = trimmed;
  }
  return { ok: true, value };
}
