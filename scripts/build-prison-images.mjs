#!/usr/bin/env node
/**
 * Reads data/prison-images.csv (exported from Google Sheet), resolves Wikimedia Commons
 * file pages to direct image URLs via the Commons API, writes src/data/prisonImages.json
 *
 * Run: node scripts/build-prison-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(ROOT, "data", "prison-images.csv");
const OUT_PATH = path.join(ROOT, "src", "data", "prisonImages.json");

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

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

/** @param {string} url */
function fileTitleFromCommonsUrl(url) {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("wikimedia.org")) return null;
    const seg = u.pathname.replace(/^\/wiki\//, "");
    if (!seg.startsWith("File:")) return null;
    return decodeURIComponent(seg.replace(/_/g, " "));
  } catch {
    return null;
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
  const res = await fetch(`${COMMONS_API}?${params}`);
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
}

function normalizeTitleKey(t) {
  return String(t || "")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase();
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.warn(`No ${CSV_PATH}; writing empty prisonImages.json`);
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, "{}\n", "utf8");
    return;
  }

  let raw = fs.readFileSync(CSV_PATH, "utf8");
  raw = raw.replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) {
    console.warn("CSV has no data rows; writing {}");
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, "{}\n", "utf8");
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

  /** @type {{ slug: string, fileTitle: string, credit: string, licence: string, alt: string }[]} */
  const rows = [];
  for (let r = 1; r < lines.length; r++) {
    const line = parseCsvLine(lines[r]);
    const slugRaw = line[idx.slug]?.trim();
    const url = line[idx.wikimedia_page_url]?.trim();
    const slug = normalizeSlug(slugRaw);
    const fileTitle = fileTitleFromCommonsUrl(url);
    if (!slug || !fileTitle) {
      console.warn(`Skipping row ${r + 1}: missing slug or invalid wikimedia_page_url`);
      continue;
    }
    rows.push({
      slug,
      fileTitle,
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
    const titles = chunk.map((row) => row.fileTitle);
    let titleToUrl;
    try {
      titleToUrl = await fetchImageUrlsForTitles(titles);
    } catch (e) {
      console.error("Commons API error:", e);
      process.exit(1);
    }

    for (const row of chunk) {
      let imageUrl = titleToUrl.get(row.fileTitle);
      if (!imageUrl) {
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
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`Wrote ${Object.keys(out).length} entries to ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
