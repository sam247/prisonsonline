/** Fixed field order so prisonImages.json does not churn when object key order changes. */
export const IMAGE_FIELD_ORDER = [
  "imageUrl",
  "credit",
  "licence",
  "alt",
  "author",
  "title",
  "sourceUrl",
  "licenceUrl",
  "caption",
];

export function normalizeImageText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Keep the already committed string when the new value is the same after whitespace folding.
 * A genuinely different credit still replaces it.
 */
export function stableImageText(next, previous) {
  const normalized = normalizeImageText(next);
  if (previous == null || previous === "") return normalized;
  if (normalizeImageText(previous) === normalized) return String(previous);
  return normalized;
}

export function stripImageTrackingParams(url) {
  try {
    const u = new URL(String(url || ""));
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return String(url || "");
  }
}

/** Keep the committed URL when it names the same resource after query/hash stripping. */
export function stableImageUrl(next, previous) {
  const normalized = stripImageTrackingParams(next);
  if (!previous) return normalized;
  if (stripImageTrackingParams(previous) === normalized) return String(previous);
  return normalized;
}

export function orderImageRecord(record) {
  /** @type {Record<string, string>} */
  const ordered = {};
  for (const field of IMAGE_FIELD_ORDER) {
    const value = record?.[field];
    if (value) ordered[field] = String(value);
  }
  return ordered;
}

/**
 * Apply stable text/URL reuse against the previous committed record, then fixed field order.
 * @param {Record<string, string>} next
 * @param {Record<string, string> | undefined} previous
 */
export function stabilizeImageRecord(next, previous) {
  const rec = {
    imageUrl: stableImageUrl(next.imageUrl, previous?.imageUrl),
    credit: stableImageText(next.credit, previous?.credit),
    licence: stableImageText(next.licence, previous?.licence),
    alt: stableImageText(next.alt, previous?.alt),
    author: stableImageText(next.author, previous?.author),
    title: stableImageText(next.title, previous?.title),
    sourceUrl: stableImageUrl(next.sourceUrl, previous?.sourceUrl),
  };
  const licenceUrl = stableImageUrl(next.licenceUrl || "", previous?.licenceUrl);
  if (licenceUrl) rec.licenceUrl = licenceUrl;
  const caption = stableImageText(next.caption || "", previous?.caption);
  if (caption) rec.caption = caption;
  return orderImageRecord(rec);
}

/** Sorted slug keys and a trailing newline. Identical inputs always produce identical bytes. */
export function serializePrisonImages(records) {
  const slugs = Object.keys(records).sort((a, b) => a.localeCompare(b));
  /** @type {Record<string, Record<string, string>>} */
  const ordered = {};
  for (const slug of slugs) ordered[slug] = orderImageRecord(records[slug]);
  return `${JSON.stringify(ordered, null, 2)}\n`;
}
