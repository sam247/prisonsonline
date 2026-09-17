#!/usr/bin/env node
/**
 * Reads data/prison-images.csv (exported from Google Sheet), resolves Wikimedia Commons
 * file pages to direct image URLs via the Commons API, or accepts direct upload URLs,
 * then writes src/data/prisonImages.json
 *
 * Run: node scripts/build-prison-images.mjs
 *
 * Deploy safety: Vercel/CI builds must not fail when Commons rate-limits (HTTP 429).
 * Prefer SKIP_COMMONS_FETCH=1 or an existing prisonImages.json over a hard exit.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(ROOT, "data", "prison-images.csv");
const OUT_PATH = path.join(ROOT, "src", "data", "prisonImages.json");

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT =
  "PrisonsOnlineBot/1.0 (https://prisonsonline.com; image-build; contact: hello@prisonsonline.com)";

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

/** @param {string} raw */
function normalizeSlug(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (s.includes("/")) {
    const parts = s.split("/").filter(Boolean);
    return parts[parts.length - 1].replace(/\/$/, "") || null;
  }
  return s;
}

/** @param {string} rawUrl */
function resolveWikimediaSource(rawUrl) {
  try {
    const u = new URL(rawUrl.trim());
    if (!u.hostname.includes("wikimedia.org")) return { fileTitle: null, directUrl: null };
    if (u.hostname === "upload.wikimedia.org") {
      return { fileTitle: null, directUrl: u.toString() };
    }
    const seg = u.pathname.replace(/^\/wiki\//, "");
    if (!seg.startsWith("File:")) return { fileTitle: null, directUrl: null };
    return {
      fileTitle: decodeURIComponent(seg.replace(/_/g, " ")),
      directUrl: null,
    };
  } catch {
    return { fileTitle: null, directUrl: null };
  }
}

/** @param {string} line */
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string[]} titles */
async function fetchImageUrlsForTitles(titles) {
  if (titles.length === 0) return new Map();
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
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
      /** @type {Map<string, string>} */
      const map = new Map();
      const pages = data.query?.pages;
      if (!pages) return map;
      for (const page of Object.values(pages)) {
        if (page.missing || page.invalid) continue;
        const title = page.title;
        const url = page.imageinfo?.[0]?.url;
        if (title && url) map.set(title, url);
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

function normalizeTitleKey(t) {
  return String(t || "")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase();
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

  let raw = fs.readFileSync(CSV_PATH, "utf8");
  raw = raw.replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) {
    if (preserveExisting("CSV has no data rows")) return;
    console.warn("CSV has no data rows; nothing to build");
    return;
  }

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = {
    slug: header.indexOf("slug"),
    wikimedia_page_url: header.indexOf("wikimedia_page_url"),
    credit: header.indexOf("credit"),
    licence: header.indexOf("licence"),
    license: header.indexOf("license"),
    alt: header.indexOf("alt"),
  };
  if (idx.slug < 0 || idx.wikimedia_page_url < 0) {
    console.error("CSV must include columns: slug, wikimedia_page_url");
    process.exit(1);
  }

  const licenceCol = idx.licence >= 0 ? idx.licence : idx.license;

  /** @type {{ slug: string, fileTitle: string | null, directUrl: string | null, credit: string, licence: string, alt: string }[]} */
  const rows = [];
  for (let r = 1; r < lines.length; r++) {
    const line = parseCsvLine(lines[r]);
    const slugRaw = line[idx.slug]?.trim();
    const url = line[idx.wikimedia_page_url]?.trim();
    const slug = normalizeSlug(slugRaw);
    const { fileTitle, directUrl } = resolveWikimediaSource(url);
    if (!slug || (!fileTitle && !directUrl)) {
      console.warn(`Skipping row ${r + 1}: missing slug or unsupported wikimedia_page_url`);
      continue;
    }
    rows.push({
      slug,
      fileTitle,
      directUrl,
      credit: idx.credit >= 0 ? (line[idx.credit] || "").trim() : "",
      licence: licenceCol >= 0 ? (line[licenceCol] || "").trim() : "",
      alt: idx.alt >= 0 ? (line[idx.alt] || "").trim() : "",
    });
  }

  /** @type {Record<string, { imageUrl: string; credit: string; licence: string; alt: string }>} */
  const out = {};

  const chunkSize = 8;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const titles = chunk.flatMap((row) => (row.fileTitle ? [row.fileTitle] : []));
    let titleToUrl;
    try {
      titleToUrl = await fetchImageUrlsForTitles(titles);
    } catch (e) {
      console.error("Commons API error:", e);
      if (preserveExisting("Commons unavailable during image build")) return;
      process.exit(1);
    }

    for (const row of chunk) {
      let imageUrl = row.directUrl ?? (row.fileTitle ? titleToUrl.get(row.fileTitle) : undefined);
      if (!imageUrl && row.fileTitle) {
        for (const [t, u] of titleToUrl) {
          if (normalizeTitleKey(t) === normalizeTitleKey(row.fileTitle)) {
            imageUrl = u;
            break;
          }
        }
      }
      if (!imageUrl) {
        console.warn(`No image URL for ${row.slug} (${row.fileTitle})`);
        continue;
      }
      out[row.slug] = {
        imageUrl,
        credit: row.credit,
        licence: row.licence,
        alt: row.alt || `Photograph of ${row.slug.replace(/-/g, " ")}`,
      };
    }

    // Be polite between chunks — reduces 429 risk on local/full rebuilds.
    if (i + chunkSize < rows.length) await sleep(200);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`Wrote ${Object.keys(out).length} entries to ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((e) => {
  console.error(e);
  if (preserveExisting("Unexpected image build failure")) return;
  process.exit(1);
});
