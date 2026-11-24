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
 * Used for licence, alt, title and caption. Credit and author use resolveCreditAndAuthor.
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

/**
 * Resolves a Commons file page URL or an upload.wikimedia.org URL to a `File:` title.
 * @param {string} rawUrl
 * @returns {string | null}
 */
export function resolveCommonsFileTitle(rawUrl) {
  try {
    const u = new URL(String(rawUrl || "").trim());
    if (!u.hostname.endsWith("wikimedia.org")) return null;
    if (u.hostname === "upload.wikimedia.org") {
      // /wikipedia/commons/a/ab/Name.jpg or /wikipedia/commons/thumb/a/ab/Name.jpg/640px-Name.jpg
      const segs = u.pathname.split("/").filter(Boolean);
      const thumbIdx = segs.indexOf("thumb");
      const name = thumbIdx >= 0 ? segs[thumbIdx + 3] : segs[segs.length - 1];
      return name ? `File:${decodeURIComponent(name).replace(/_/g, " ")}` : null;
    }
    const seg = decodeURIComponent(u.pathname.replace(/^\/wiki\//, ""));
    if (!seg.startsWith("File:")) return null;
    return seg.replace(/_/g, " ");
  } catch {
    return null;
  }
}

/** Case-insensitive file identity. Underscores and repeated spaces do not make a new file. */
export function normalizeCommonsFileTitle(title) {
  return String(title || "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** @param {Record<string, string> | undefined} record */
export function commonsFileTitleOf(record) {
  if (!record) return null;
  return resolveCommonsFileTitle(record.sourceUrl) || resolveCommonsFileTitle(record.imageUrl);
}

/**
 * True when there is no committed record, or both sides resolve to different Commons files.
 * An unresolvable URL is not treated as a file change.
 * @param {Record<string, string>} next
 * @param {Record<string, string> | undefined} previous
 */
export function imageFileChanged(next, previous) {
  if (!previous) return true;
  const prevTitle = commonsFileTitleOf(previous);
  const nextTitle = commonsFileTitleOf(next);
  if (!prevTitle || !nextTitle) return false;
  return normalizeCommonsFileTitle(prevTitle) !== normalizeCommonsFileTitle(nextTitle);
}

/**
 * A blank sheet cell is not a change. Whitespace-only edits are not a change.
 * Compare against the last reconciled sheet credit, not the published credit:
 * the published credit can be a cleaned Commons author while the sheet cell is unchanged.
 * @param {string | undefined} sheetCredit
 * @param {string | undefined} previousSheetCredit
 */
export function sheetCreditChanged(sheetCredit, previousSheetCredit) {
  const next = normalizeImageText(sheetCredit);
  if (!next) return false;
  return next !== normalizeImageText(previousSheetCredit);
}

/**
 * Keep the committed credit and author unless the image file changed or the sheet credit changed.
 * A new file takes the fetched attribution. A sheet-credit edit takes the sheet text for both fields,
 * so a noisy Commons author cannot replace either one.
 * @param {Record<string, string>} next
 * @param {Record<string, string> | undefined} previous
 * @param {{ sheetCredit?: string, previousSheetCredit?: string, fileChanged?: boolean }} [options]
 */
export function resolveCreditAndAuthor(next, previous, options = {}) {
  const sheetCredit = options.sheetCredit ?? "";
  const previousSheetCredit = options.previousSheetCredit === undefined ? sheetCredit : options.previousSheetCredit;
  const fileChanged = options.fileChanged ?? imageFileChanged(next, previous);
  if (!previous || fileChanged) {
    return {
      credit: normalizeImageText(next.credit),
      author: normalizeImageText(next.author),
    };
  }
  if (sheetCreditChanged(sheetCredit, previousSheetCredit)) {
    const sheet = normalizeImageText(sheetCredit);
    return { credit: sheet, author: sheet };
  }
  return {
    credit: previous.credit == null ? "" : String(previous.credit),
    author: previous.author == null ? "" : String(previous.author),
  };
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
 * Credit and author follow resolveCreditAndAuthor.
 * @param {Record<string, string>} next
 * @param {Record<string, string> | undefined} previous
 * @param {{ sheetCredit?: string, previousSheetCredit?: string }} [options]
 */
export function stabilizeImageRecord(next, previous, options = {}) {
  const attribution = resolveCreditAndAuthor(next, previous, options);
  const rec = {
    imageUrl: stableImageUrl(next.imageUrl, previous?.imageUrl),
    credit: attribution.credit,
    licence: stableImageText(next.licence, previous?.licence),
    alt: stableImageText(next.alt, previous?.alt),
    author: attribution.author,
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

/** Sorted slug keys and a trailing newline. */
export function serializeSheetCredits(credits) {
  const slugs = Object.keys(credits).sort((a, b) => a.localeCompare(b));
  /** @type {Record<string, string>} */
  const ordered = {};
  for (const slug of slugs) ordered[slug] = String(credits[slug] ?? "");
  return `${JSON.stringify(ordered, null, 2)}\n`;
}
