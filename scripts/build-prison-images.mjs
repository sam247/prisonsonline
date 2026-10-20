#!/usr/bin/env node
/**
 * Reads data/prison-images.csv (exported from the Google Sheet image queue), publishes ONLY rows whose
 * `result_state` is IMAGE_ADDED or ALREADY_COVERED, resolves Wikimedia Commons files via the Commons API
 * (direct image URL + licence / licence URL / author / title from extmetadata), then writes
 * src/data/prisonImages.json.
 *
 * When Commons is reachable, licence, licence URL and title come from Commons extmetadata and
 * override the CSV values (the CSV is only a fallback). Credit and author stay at the committed
 * values unless the Commons file itself changes or the sheet credit cell changes versus
 * data/prison-image-sheet-credits.json. A new file uses the Commons author, then the sheet credit.
 * Rows without a usable Commons file are skipped.
 *
 * Run: node scripts/build-prison-images.mjs
 *
 * Deploy safety: Vercel/CI builds must not fail when Commons rate-limits (HTTP 429).
 * Prefer SKIP_COMMONS_FETCH=1 or an existing prisonImages.json over a hard exit.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisonImageKeyForCell, readCrossCountrySlugs } from "./lib/prison-image-keys.mjs";
import {
  normalizeCommonsFileTitle,
  resolveCommonsFileTitle,
  serializePrisonImages,
  serializeSheetCredits,
  stabilizeImageRecord,
  stripImageTrackingParams,
} from "./lib/stable-prison-images.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(ROOT, "data", "prison-images.csv");
const OUT_PATH = path.join(ROOT, "src", "data", "prisonImages.json");
const SHEET_CREDIT_PATH = path.join(ROOT, "data", "prison-image-sheet-credits.json");

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT =
  "PrisonsOnlineBot/1.0 (https://prisonsonline.com; image-build; contact: hello@prisonsonline.com)";

/** Only these queue states are published to the site. */
const PUBLISHABLE_STATES = new Set(["IMAGE_ADDED", "ALREADY_COVERED"]);

/** Skip live Commons calls on Vercel/CI unless explicitly forced. */
function shouldSkipCommonsFetch() {
  if (process.env.FORCE_COMMONS_FETCH === "1") return false;
  if (process.env.SKIP_COMMONS_FETCH === "1") return true;
  // Vercel sets VERCEL=1; keep deploys offline-safe when committed JSON exists.
  if ((process.env.VERCEL === "1" || process.env.CI === "true") && fs.existsSync(OUT_PATH)) {
    return true;
  }
  return false;
}

function preserveExisting(reason) {
  if (fs.existsSync(OUT_PATH)) {
    console.warn(`${reason}; preserving existing ${path.relative(ROOT, OUT_PATH)}`);
    return true;
  }
  return false;
}


/**
 * RFC 4180-style CSV parser: quoted fields, "" escapes, commas and newlines inside quotes, CRLF.
 * @param {string} text
 * @returns {string[][]}
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string} html */
function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Commons sometimes emits "No machine-readable author provided. X assumed (based on copyright claims)." */
function cleanAuthor(raw) {
  const s = stripHtml(raw);
  const m = s.match(/^No machine-readable author provided\.\s*(.+?)\s+assumed\b/i);
  return (m ? m[1] : s).trim();
}

/** @param {string} fileTitle */
function titleFromFileName(fileTitle) {
  return String(fileTitle || "")
    .replace(/^File:/, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .trim();
}

/** @param {string} fileTitle */
function commonsPageUrl(fileTitle) {
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle.replace(/ /g, "_")).replace(/%3A/g, ":")}`;
}

/** @param {string} url */
function stripTrackingParams(url) {
  return stripImageTrackingParams(url);
}

function normalizeTitleKey(t) {
  return normalizeCommonsFileTitle(t);
}

/**
 * Last reconciled sheet credit for each slug. Missing file means "no recorded edits".
 * @param {string} [file]
 * @returns {Record<string, string>}
 */
export function loadSheetCreditBaseline(file = SHEET_CREDIT_PATH) {
  if (!fs.existsSync(file)) return {};
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  return parsed && typeof parsed === "object" ? parsed : {};
}

/**
 * Publishable CSV rows in sheet order.
 * @param {string} [csvPath]
 * @param {string} [root]
 */
export function loadPublishableImageRows(csvPath = CSV_PATH, root = ROOT) {
  const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const table = parseCsv(raw);
  if (table.length < 2) return [];
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);
  const idx = {
    slug: col("slug"),
    wikimedia_page_url: col("wikimedia_page_url"),
    credit: col("credit"),
    licence: col("licence") >= 0 ? col("licence") : col("license"),
    licence_url: col("licence_url") >= 0 ? col("licence_url") : col("license_url"),
    alt: col("alt"),
    caption: col("caption"),
    result_state: col("result_state"),
  };
  if (idx.slug < 0 || idx.wikimedia_page_url < 0 || idx.result_state < 0) {
    throw new Error("CSV must include columns: slug, wikimedia_page_url, result_state");
  }
  const cell = (line, i) => (i >= 0 ? String(line[i] ?? "").trim() : "");
  const crossCountrySlugs = readCrossCountrySlugs(root);
  /** @type {{ slug: string, fileTitle: string, credit: string, licence: string, licenceUrl: string, alt: string, caption: string }[]} */
  const rows = [];
  for (let r = 1; r < table.length; r++) {
    const line = table[r];
    const state = cell(line, idx.result_state).toUpperCase();
    const slug = prisonImageKeyForCell(cell(line, idx.slug), crossCountrySlugs);
    if (!PUBLISHABLE_STATES.has(state)) continue;
    const fileTitle = resolveCommonsFileTitle(cell(line, idx.wikimedia_page_url));
    if (!slug || !fileTitle) {
      console.warn(`Skipping row ${r + 1}: missing slug (shared slugs need /prisons/<cc>/<slug>) or unsupported wikimedia_page_url`);
      continue;
    }
    rows.push({
      slug,
      fileTitle,
      credit: cell(line, idx.credit),
      licence: cell(line, idx.licence),
      licenceUrl: cell(line, idx.licence_url),
      alt: cell(line, idx.alt),
      caption: cell(line, idx.caption),
    });
  }
  return rows;
}

/**
 * @param {Map<string, { imageUrl: string, sourceUrl: string, licence: string, licenceUrl: string, author: string, title: string }>} info
 * @param {string} fileTitle
 */
export function lookupCommonsMeta(info, fileTitle) {
  let meta = info.get(fileTitle);
  if (meta) return meta;
  for (const [t, m] of info) {
    if (normalizeTitleKey(t) === normalizeTitleKey(fileTitle)) return m;
  }
  return undefined;
}

/**
 * Same merge the image build runs after a Commons fetch.
 * Credit and author stay on the committed record unless the file or the sheet credit changed.
 * @param {{
 *   rows: { slug: string, fileTitle: string, credit: string, licence: string, licenceUrl: string, alt: string, caption: string }[],
 *   commonsInfo: Map<string, { imageUrl: string, sourceUrl: string, licence: string, licenceUrl: string, author: string, title: string }>,
 *   existing?: Record<string, Record<string, string>>,
 *   sheetCredits?: Record<string, string>,
 * }} input
 */
export function publishImageRows({ rows, commonsInfo, existing = {}, sheetCredits = {} }) {
  /** @type {Record<string, Record<string, string>>} */
  const out = {};
  const sorted = [...rows].sort((a, b) => a.slug.localeCompare(b.slug) || a.fileTitle.localeCompare(b.fileTitle));
  for (const row of sorted) {
    const meta = lookupCommonsMeta(commonsInfo, row.fileTitle);
    if (!meta) {
      console.warn(`No Commons file for ${row.slug} (${row.fileTitle}); skipping`);
      continue;
    }
    const author = meta.author || row.credit;
    const licence = meta.licence || row.licence;
    if (!licence) {
      console.warn(`No licence for ${row.slug} (${row.fileTitle}); skipping`);
      continue;
    }
    /** @type {Record<string, string>} */
    const rec = {
      imageUrl: meta.imageUrl,
      credit: author,
      licence,
      alt: row.alt || `Photograph of ${row.slug.split("/").pop().replace(/-/g, " ")}`,
      author,
      title: meta.title || titleFromFileName(row.fileTitle),
      sourceUrl: meta.sourceUrl,
    };
    const licenceUrl = meta.licence ? meta.licenceUrl : row.licenceUrl;
    if (licenceUrl) rec.licenceUrl = licenceUrl;
    if (row.caption) rec.caption = row.caption;
    const previousSheet = Object.prototype.hasOwnProperty.call(sheetCredits, row.slug)
      ? sheetCredits[row.slug]
      : row.credit;
    out[row.slug] = stabilizeImageRecord(rec, existing[row.slug], {
      sheetCredit: row.credit,
      previousSheetCredit: previousSheet,
    });
  }
  return out;
}

/**
 * @param {string[]} titles
 * @returns {Promise<Map<string, { imageUrl: string; sourceUrl: string; licence: string; licenceUrl: string; author: string; title: string }>>}
 */
async function fetchCommonsInfo(titles) {
  if (titles.length === 0) return new Map();
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|ObjectName",
    titles: titles.join("|"),
  });

  const maxAttempts = 4;
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${COMMONS_API}?${params}`, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`Commons API ${res.status}`);
        const retryAfter = Number(res.headers.get("retry-after"));
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 500 * 2 ** (attempt - 1);
        if (attempt < maxAttempts) {
          console.warn(`Commons ${res.status}; retry ${attempt}/${maxAttempts - 1} in ${waitMs}ms`);
          await sleep(waitMs);
          continue;
        }
        throw lastErr;
      }
      if (!res.ok) throw new Error(`Commons API ${res.status}`);
      const data = await res.json();
      const map = new Map();
      /** Map requested titles through Commons normalisation so lookups by the CSV title still work. */
      const normalized = new Map((data.query?.normalized ?? []).map((n) => [n.to, n.from]));
      const pages = data.query?.pages;
      if (!pages) return map;
      for (const page of Object.values(pages)) {
        if (page.missing !== undefined || page.invalid !== undefined) continue;
        const info = page.imageinfo?.[0];
        if (!page.title || !info?.url) continue;
        const meta = info.extmetadata ?? {};
        const value = (k) => stripHtml(meta[k]?.value ?? "");
        const entry = {
          imageUrl: stripTrackingParams(info.url),
          sourceUrl: info.descriptionurl ? stripTrackingParams(info.descriptionurl) : commonsPageUrl(page.title),
          licence: value("LicenseShortName"),
          licenceUrl: value("LicenseUrl"),
          author: cleanAuthor(meta.Artist?.value ?? ""),
          title: value("ObjectName") || titleFromFileName(page.title),
        };
        map.set(page.title, entry);
        const requested = normalized.get(page.title);
        if (requested) map.set(requested, entry);
      }
      return map;
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts) {
        const waitMs = 500 * 2 ** (attempt - 1);
        console.warn(`Commons fetch failed (${e}); retry ${attempt}/${maxAttempts - 1} in ${waitMs}ms`);
        await sleep(waitMs);
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr ?? new Error("Commons API failed");
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    if (preserveExisting(`No ${CSV_PATH}`)) return;
    console.warn(`No ${CSV_PATH}; nothing to build`);
    return;
  }

  if (shouldSkipCommonsFetch()) {
    preserveExisting("Skipping Commons fetch on Vercel/CI (committed JSON present)");
    return;
  }

  let rows;
  try {
    rows = loadPublishableImageRows();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  if (rows.length === 0) {
    if (preserveExisting("CSV has no data rows")) return;
    console.warn("CSV has no data rows; nothing to build");
    return;
  }

  /** @type {Record<string, Record<string, string>>} */
  const out = {};
  /** @type {Record<string, Record<string, string>>} */
  const existing = fs.existsSync(OUT_PATH) ? JSON.parse(fs.readFileSync(OUT_PATH, "utf8")) : {};
  const sheetCredits = loadSheetCreditBaseline();

  rows.sort((a, b) => a.slug.localeCompare(b.slug) || a.fileTitle.localeCompare(b.fileTitle));

  const chunkSize = 8;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    let info;
    try {
      info = await fetchCommonsInfo(chunk.map((row) => row.fileTitle));
    } catch (e) {
      console.error("Commons API error:", e);
      if (preserveExisting("Commons unavailable during image build")) return;
      process.exit(1);
    }

    Object.assign(out, publishImageRows({ rows: chunk, commonsInfo: info, existing, sheetCredits }));

    // Be polite between chunks — reduces 429 risk on local/full rebuilds.
    if (i + chunkSize < rows.length) await sleep(200);
  }

  /** @type {Record<string, string>} */
  const reconciledCredits = {};
  for (const row of rows) {
    if (out[row.slug]) reconciledCredits[row.slug] = row.credit;
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, serializePrisonImages(out), "utf8");
  fs.writeFileSync(SHEET_CREDIT_PATH, serializeSheetCredits(reconciledCredits), "utf8");
  console.log(`Wrote ${Object.keys(out).length} entries to ${path.relative(ROOT, OUT_PATH)}`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((e) => {
    console.error(e);
    if (preserveExisting("Unexpected image build failure")) return;
    process.exit(1);
  });
}
