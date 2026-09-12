/**
 * Build enriched court directory + prison coordinate overlay.
 * Sources: hmctsSites.generated + FaCT OGL CSV + postcodes.io (build-time only).
 * Fail-closed if FaCT cannot be fetched and no valid cache exists.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CACHE = path.join(ROOT, ".cache");
const OUT = path.join(ROOT, "src", "data", "generated");
const FACT_URL = "https://factprod.blob.core.windows.net/csv/courts-and-tribunals-data.csv";
const FACT_CACHE = path.join(CACHE, "fact-courts.csv");
const POSTCODE_CACHE = path.join(CACHE, "postcodes-io-prisons.json");
const REPORT_CACHE = path.join(CACHE, "court-directory-build-report.json");

const COURT_TYPE_HUBS = [
  { slug: "crown-courts", label: "Crown Courts", jurisdiction: "Crown" },
  { slug: "magistrates-courts", label: "Magistrates' Courts", jurisdiction: "Magistrates" },
  { slug: "county-courts", label: "County Courts", jurisdiction: "County" },
  { slug: "combined-courts", label: "Combined Courts", jurisdiction: "Combined" },
  { slug: "tribunals", label: "Tribunals", jurisdiction: "Tribunal" },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function parseCsv(text) {
  const rows = [];
  let i = 0;
  const len = text.length;
  let row = [];
  let cur = "";
  let q = false;
  while (i < len) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        q = false;
        i++;
        continue;
      }
      cur += c;
      i++;
      continue;
    }
    if (c === '"') {
      q = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(cur);
      cur = "";
      i++;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      if (row.some((cell) => cell.length)) rows.push(row);
      row = [];
      cur = "";
      i++;
      continue;
    }
    cur += c;
    i++;
  }
  if (cur.length || row.length) {
    row.push(cur);
    if (row.some((cell) => cell.length)) rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] ?? "";
    });
    return obj;
  });
}

async function loadFactCsv() {
  ensureDir(CACHE);
  try {
    const res = await fetch(FACT_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes("slug") || text.length < 1000) throw new Error("FaCT CSV payload looks invalid");
    fs.writeFileSync(FACT_CACHE, text, "utf8");
    console.log(`[courts] Fetched FaCT CSV (${text.length} bytes) → ${FACT_CACHE}`);
    return { text, fromCache: false };
  } catch (err) {
    if (fs.existsSync(FACT_CACHE)) {
      const text = fs.readFileSync(FACT_CACHE, "utf8");
      if (text.includes("slug") && text.length >= 1000) {
        console.warn(`[courts] WARNING: FaCT fetch failed (${err.message}); using cache ${FACT_CACHE}`);
        return { text, fromCache: true };
      }
    }
    console.error(`[courts] FATAL: FaCT CSV unavailable and no valid cache at ${FACT_CACHE}`);
    console.error(err);
    process.exit(1);
  }
}

function normalisePostcode(pc) {
  const raw = String(pc || "")
    .toUpperCase()
    .replace(/\s+/g, "");
  if (raw.length < 5) return raw;
  return `${raw.slice(0, -3)} ${raw.slice(-3)}`;
}

function compactPostcode(pc) {
  return String(pc || "")
    .toUpperCase()
    .replace(/\s+/g, "");
}

function normaliseName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseName(name) {
  const s = String(name || "").trim();
  if (!s) return s;
  const lowerRatio = (s.match(/[a-z]/g) || []).length / Math.max(1, (s.match(/[A-Za-z]/g) || []).length);
  if (lowerRatio > 0.15) return s.replace(/\s+/g, " ").trim();
  const small = new Set(["and", "of", "the", "at", "in", "for"]);
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => {
      const m = w.match(/^([^A-Za-z]*)([A-Za-z][\w']*)([^A-Za-z]*)$/);
      if (!m) return w;
      const [, pre, core, post] = m;
      if (/^(hmp|hmrc|sscs|iac|et|rcj|dx)$/i.test(core)) return `${pre}${core.toUpperCase()}${post}`;
      if (small.has(core)) return `${pre}${core}${post}`;
      return `${pre}${core.charAt(0).toUpperCase()}${core.slice(1)}${post}`;
    })
    .join(" ")
    .replace(/\bAnd\b/g, "and")
    .replace(/\bOf\b/g, "of")
    .replace(/\bThe\b/g, "the");
}

function parseFactAddress(addresses) {
  const raw = String(addresses || "");
  if (!raw || /no address available/i.test(raw)) {
    return { address: undefined, postcode: undefined, town: undefined, county: undefined };
  }
  const postcode = (raw.match(/Postcode:\s*([^,|]+)/i) || [])[1]?.trim();
  const town = (raw.match(/Town:\s*([^,|]+)/i) || [])[1]?.trim();
  const county = (raw.match(/County:\s*([^,|]+)/i) || [])[1]?.trim();
  const addressLine = (raw.match(/Address:\s*([^,|]+(?:,\s*[^,|]+)*?)(?=,\s*Type:|, Type:|$)/i) || [])[1]?.trim();
  const parts = [addressLine, town, county].filter(Boolean);
  return {
    address: parts.length ? parts.join(", ") : undefined,
    postcode: postcode ? normalisePostcode(postcode) : undefined,
    town: town || undefined,
    county: county && county !== "N/A" ? county : undefined,
  };
}

function parseAreasOfLaw(raw) {
  const s = String(raw || "");
  if (!s || /no areas of law available/i.test(s)) return [];
  const names = [];
  const re = /Name:\s*([^,|]+)/gi;
  let m;
  while ((m = re.exec(s))) {
    const n = m[1].trim();
    if (n && n !== "N/A" && !names.includes(n)) names.push(n);
  }
  return names;
}

function parseTypes(raw) {
  return String(raw || "")
    .split("|")
    .map((t) => t.trim())
    .filter(Boolean);
}

function extractTownFromAddress(address, postcode) {
  if (!address) return undefined;
  let a = address;
  if (postcode) a = a.replace(new RegExp(postcode.replace(/\s+/g, "\\s*"), "i"), "");
  const parts = a
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return parts[0];
}

function reliableCoords(lat, lon) {
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  if (la === 0 && lo === 0) return null;
  if (Math.abs(la) > 90 || Math.abs(lo) > 180) return null;
  return { latitude: la, longitude: lo };
}

function loadHmctsSites() {
  const genPath = path.join(OUT, "hmctsSites.generated.ts");
  if (!fs.existsSync(genPath)) {
    console.error("[courts] FATAL: hmctsSites.generated.ts missing. Run npm run data:build first.");
    process.exit(1);
  }
  // Dynamic import of generated TS is awkward in plain node; re-parse from JSON source.
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "hmpps_hmcts_json", "hmcts_sites.json"), "utf8"));
  // Prefer generated module via a tiny eval of the JSON array — use institutional rebuild output by requiring through tsx if available.
  // Fall back to re-normalising from raw with the same field extraction as build-institutional-data.
  return raw.map((r) => {
    const lines = String(r.description || "").split(/\r?\n/);
    const map = {};
    let key = null;
    for (const line of lines) {
      const m = line.match(/^([^:]{1,60}):\s*(.*)$/);
      if (m && !/^https?:/i.test(m[1])) {
        key = m[1].trim();
        map[key] = m[2].trim();
      } else if (key) {
        map[key] = `${map[key]} ${line.trim()}`.trim();
      }
    }
    const address = (map.Address || map.Adress || "").replace(/\s+/g, " ").trim();
    let postcode = (map.Postcode || "").replace(/\s+/g, " ").trim();
    if (!postcode) {
      const m = address.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i);
      if (m) postcode = m[1];
    }
    return {
      institutionalId: `hmcts:${r.id}`,
      slug: r.id,
      name: String(r.name || "").replace(/\s+/g, " ").trim(),
      address: address || undefined,
      postcode: postcode ? normalisePostcode(postcode) : undefined,
      courtRegion: (map["Court Region"] || "").trim() || undefined,
      jurisdiction: (map["Jurisdiction (From MDS)"] || map.Jurisdiction || "").trim() || undefined,
    };
  });
}

function matchFact(site, factBySlug, factByNamePostcode, factByName, factRows) {
  const slugHit = factBySlug.get(site.slug);
  if (slugHit) return { status: "exact", fact: slugHit, reason: "exact_slug" };

  const nName = normaliseName(site.name);
  const pc = compactPostcode(site.postcode);
  if (nName && pc) {
    const key = `${nName}|${pc}`;
    const hits = factByNamePostcode.get(key) || [];
    if (hits.length === 1) return { status: "strong", fact: hits[0], reason: "name_postcode" };
    if (hits.length > 1) return { status: "ambiguous", fact: null, reason: "name_postcode_multi", candidates: hits.map((h) => h.slug) };
  }

  if (nName) {
    const hits = factByName.get(nName) || [];
    if (hits.length === 1) {
      const fact = hits[0];
      const factPc = compactPostcode(fact.parsed.postcode);
      const town = (fact.parsed.town || "").toLowerCase();
      const addr = (site.address || "").toLowerCase();
      if (pc && factPc && pc === factPc) return { status: "strong", fact, reason: "unique_name_postcode" };
      if (town && addr.includes(town)) return { status: "strong", fact, reason: "unique_name_locality" };
      if (pc && factPc && pc !== factPc) return { status: "ambiguous", fact: null, reason: "unique_name_postcode_mismatch", candidates: [fact.slug] };
      return { status: "unmatched", fact: null, reason: "unique_name_insufficient_evidence" };
    }
    if (hits.length > 1) {
      const withLocality = hits.filter((h) => {
        const town = (h.parsed.town || "").toLowerCase();
        const addr = (site.address || "").toLowerCase();
        const factPc = compactPostcode(h.parsed.postcode);
        if (pc && factPc && pc === factPc) return true;
        if (town && addr.includes(town)) return true;
        return false;
      });
      if (withLocality.length === 1) return { status: "strong", fact: withLocality[0], reason: "name_locality_disambiguated" };
      return { status: "ambiguous", fact: null, reason: "name_multi", candidates: hits.map((h) => h.slug) };
    }
  }

  // Exact name prefix/extension only when postcodes also match and the candidate set is unique.
  if (nName && pc && nName.length >= 10) {
    const prefixHits = factRows.filter((f) => {
      const fn = normaliseName(f.name);
      const fpc = compactPostcode(f.parsed.postcode);
      if (!fn || fpc !== pc) return false;
      return fn === nName || fn.startsWith(`${nName} `) || nName.startsWith(`${fn} `);
    });
    if (prefixHits.length === 1) return { status: "strong", fact: prefixHits[0], reason: "name_prefix_postcode" };
    if (prefixHits.length > 1) return { status: "ambiguous", fact: null, reason: "name_prefix_postcode_multi", candidates: prefixHits.map((h) => h.slug) };
  }

  return { status: "unmatched", fact: null, reason: "no_match" };
}

function jurisdictionsForHubs(jurisdiction) {
  const j = String(jurisdiction || "").trim();
  if (!j || j === "#N/A") return [];
  const hubs = [];
  for (const hub of COURT_TYPE_HUBS) {
    if (j === hub.jurisdiction) hubs.push(hub.slug);
    else if (j.includes("&")) {
      const parts = j.split("&").map((p) => p.trim());
      if (parts.includes(hub.jurisdiction)) hubs.push(hub.slug);
    }
  }
  return hubs;
}

/** Map FaCT type labels to our five hubs only — no loose forcing. */
function hubsFromFactTypes(typeLabels) {
  const hubs = new Set();
  for (const raw of typeLabels || []) {
    const t = raw.toLowerCase();
    if (t.includes("crown court")) hubs.add("crown-courts");
    if (t.includes("magistrates")) hubs.add("magistrates-courts");
    if (t.includes("county court")) hubs.add("county-courts");
    if (t.includes("tribunal")) hubs.add("tribunals");
    // FaCT rarely uses "Combined"; leave Combined to HMCTS MDS jurisdiction only
  }
  return [...hubs];
}

function eligibilityFor(court) {
  const hasIdentity = Boolean(court.slug && court.name);
  const hasLocation = Boolean(court.address || court.postcode);
  if (!hasIdentity || !hasLocation) {
    return { indexable: false, reason: "missing_identity_or_location" };
  }
  if (court.isClosed) {
    // Closed but still has a usable address — index with closed status for findability.
    if (court.address && court.postcode) {
      return { indexable: true, reason: "closed_with_address" };
    }
    return { indexable: false, reason: "closed_insufficient_location" };
  }
  return { indexable: true, reason: "eligible" };
}

async function geocodePrisonPostcodes(prisons) {
  const entries = prisons
    .filter((p) => p.countrySlug === "uk" && p.postcode && p.slug !== "prison-122")
    .map((p) => ({ slug: p.slug, postcode: normalisePostcode(p.postcode) }));

  let cache = {};
  if (fs.existsSync(POSTCODE_CACHE)) {
    try {
      cache = JSON.parse(fs.readFileSync(POSTCODE_CACHE, "utf8"));
    } catch {
      cache = {};
    }
  }

  const missing = entries.filter((e) => !cache[e.slug]?.latitude);
  const unresolved = [];
  const BATCH = 100;

  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    const body = batch.map((b) => b.postcode);
    try {
      const res = await fetch("https://api.postcodes.io/postcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcodes: body }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const results = json.result || [];
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const r = results[j];
        const result = r?.result;
        if (result?.latitude != null && result?.longitude != null) {
          cache[item.slug] = {
            slug: item.slug,
            postcode: item.postcode,
            latitude: result.latitude,
            longitude: result.longitude,
            source: "postcodes.io",
          };
        } else {
          unresolved.push(item);
        }
      }
      console.log(`[courts] postcodes.io batch ${i / BATCH + 1}: resolved ${batch.length - unresolved.filter((u) => batch.some((b) => b.slug === u.slug)).length}/${batch.length}`);
    } catch (err) {
      if (Object.keys(cache).length > 0) {
        console.warn(`[courts] WARNING: postcodes.io failed (${err.message}); using cached prison coords (${Object.keys(cache).length})`);
        break;
      }
      console.error(`[courts] FATAL: postcodes.io unavailable and no prison coords cache`);
      console.error(err);
      process.exit(1);
    }
  }

  // Recompute unresolved against final cache
  const stillMissing = entries.filter((e) => !cache[e.slug]?.latitude);
  ensureDir(CACHE);
  fs.writeFileSync(POSTCODE_CACHE, JSON.stringify(cache, null, 2), "utf8");

  const overlay = entries
    .map((e) => cache[e.slug])
    .filter((c) => c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude));

  return {
    overlay,
    requested: entries.length,
    resolved: overlay.length,
    unresolved: stillMissing,
  };
}

function loadUkPrisons() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "hmpps_hmcts_json", "hmpps_prisons_only.json"), "utf8"));
  return raw.map((r) => {
    const lines = String(r.description || "").split(/\r?\n/);
    const map = {};
    let key = null;
    for (const line of lines) {
      const m = line.match(/^([^:]{1,60}):\s*(.*)$/);
      if (m && !/^https?:/i.test(m[1])) {
        key = m[1].trim();
        map[key] = m[2].trim();
      } else if (key) {
        map[key] = `${map[key]} ${line.trim()}`.trim();
      }
    }
    const address = (map.Address || map.Adress || "").replace(/\s+/g, " ").trim();
    let postcode = (map.Postcode || "").replace(/\s+/g, " ").trim();
    if (!postcode) {
      const m = address.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i);
      if (m) postcode = m[1];
    }
    return {
      slug: r.id,
      name: r.name,
      countrySlug: "uk",
      address: address || undefined,
      postcode: postcode || undefined,
    };
  });
}

function emitTs(fileName, body) {
  ensureDir(OUT);
  const header = `/* eslint-disable */\n/** Auto-generated by scripts/build-court-directory.mjs — do not edit by hand */\n`;
  fs.writeFileSync(path.join(OUT, fileName), `${header}${body}\n`, "utf8");
}

async function main() {
  const { text: factText, fromCache } = await loadFactCsv();
  const factRows = parseCsv(factText).map((row) => {
    const parsed = parseFactAddress(row.addresses);
    return {
      ...row,
      parsed,
      areasOfLaw: parseAreasOfLaw(row.areas_of_law),
      typeLabels: parseTypes(row.types),
      isOpen: String(row.open).toLowerCase() === "true",
      coords: reliableCoords(row.lat, row.lon),
    };
  });

  const factBySlug = new Map(factRows.map((r) => [r.slug, r]));
  const factByNamePostcode = new Map();
  const factByName = new Map();
  for (const r of factRows) {
    const nn = normaliseName(r.name);
    if (!nn) continue;
    if (!factByName.has(nn)) factByName.set(nn, []);
    factByName.get(nn).push(r);
    const pc = compactPostcode(r.parsed.postcode);
    if (pc) {
      const key = `${nn}|${pc}`;
      if (!factByNamePostcode.has(key)) factByNamePostcode.set(key, []);
      factByNamePostcode.get(key).push(r);
    }
  }

  const hmcts = loadHmctsSites();
  const matchStats = { exact: 0, strong: 0, unmatched: 0, ambiguous: 0 };
  const ambiguous = [];
  const unmatched = [];

  const courts = hmcts.map((site) => {
    const match = matchFact(site, factBySlug, factByNamePostcode, factByName, factRows);
    matchStats[match.status] = (matchStats[match.status] || 0) + 1;

    const displayName = titleCaseName(site.name);
    let hubSlugs = jurisdictionsForHubs(site.jurisdiction);
    const base = {
      institutionalId: site.institutionalId,
      slug: site.slug,
      name: displayName,
      address: site.address,
      postcode: site.postcode ? normalisePostcode(site.postcode) : undefined,
      courtRegion: site.courtRegion,
      jurisdiction: site.jurisdiction && site.jurisdiction !== "#N/A" ? site.jurisdiction : undefined,
      town: extractTownFromAddress(site.address, site.postcode),
      hubSlugs,
      matchStatus: match.status,
      matchReason: match.reason,
      sources: ["hmcts_sites"],
      isClosed: false,
      indexable: false,
      indexReason: "",
    };

    if (match.status === "ambiguous") {
      ambiguous.push({ slug: site.slug, reason: match.reason, candidates: match.candidates || [] });
    }
    if (match.status === "unmatched") {
      unmatched.push({ slug: site.slug, reason: match.reason });
    }

    if ((match.status === "exact" || match.status === "strong") && match.fact) {
      const fact = match.fact;
      base.sources.push("fact_ogl");
      base.factSlug = fact.slug;
      base.officialUrl = `https://www.find-court-tribunal.service.gov.uk/courts/${fact.slug}`;
      base.isClosed = !fact.isOpen;
      base.factTypes = fact.typeLabels;
      base.areasOfLaw = fact.areasOfLaw;
      base.dxNumber = fact.dx_number && fact.dx_number !== "null" ? fact.dx_number : undefined;
      if (fact.coords) {
        base.latitude = fact.coords.latitude;
        base.longitude = fact.coords.longitude;
      }
      if (!base.address && fact.parsed.address) base.address = fact.parsed.address;
      if (!base.postcode && fact.parsed.postcode) base.postcode = fact.parsed.postcode;
      if (!base.town && fact.parsed.town) base.town = fact.parsed.town;

      const factHubs = hubsFromFactTypes(fact.typeLabels);
      if (factHubs.length) {
        // Prefer FaCT type hubs when present; keep Combined from MDS if set and FaCT has both Mag+County
        const merged = new Set(factHubs);
        if (hubSlugs.includes("combined-courts")) merged.add("combined-courts");
        base.hubSlugs = [...merged];
      }
    }

    const elig = eligibilityFor(base);
    base.indexable = elig.indexable;
    base.indexReason = elig.reason;
    return base;
  });

  const prisons = loadUkPrisons();
  const geo = await geocodePrisonPostcodes(prisons);

  const indexableCourts = courts.filter((c) => c.indexable);
  const closedCount = courts.filter((c) => c.isClosed).length;
  const withCoords = courts.filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude)).length;

  emitTs(
    "courts.generated.ts",
    `import type { Court } from "@/types/court";\n\nexport const courtsGeneratedRaw = ${JSON.stringify(courts, null, 2)} as const;\n\nexport const courtsGenerated: Court[] = courtsGeneratedRaw as unknown as Court[];\n`,
  );

  emitTs(
    "prisonCoords.generated.ts",
    `export type PrisonCoordOverlay = { slug: string; postcode: string; latitude: number; longitude: number; source: string };\n\nexport const prisonCoordsGeneratedRaw = ${JSON.stringify(geo.overlay, null, 2)} as const;\n\nexport const prisonCoordsGenerated: PrisonCoordOverlay[] = prisonCoordsGeneratedRaw as unknown as PrisonCoordOverlay[];\n`,
  );

  // Update generatedIndex exports if needed — append courts exports via separate note; keep institutional index intact.
  const report = {
    builtAt: new Date().toISOString(),
    factFromCache: fromCache,
    hmctsCount: hmcts.length,
    courtsGenerated: courts.length,
    indexable: indexableCourts.length,
    closedCount,
    withCoords,
    matchStats,
    ambiguousCount: ambiguous.length,
    unmatchedCount: unmatched.length,
    ambiguous: ambiguous.slice(0, 50),
    unmatched: unmatched.slice(0, 80),
    prisonCoords: {
      requested: geo.requested,
      resolved: geo.resolved,
      unresolvedCount: geo.unresolved.length,
      unresolved: geo.unresolved,
    },
    hubs: COURT_TYPE_HUBS.map((h) => ({
      ...h,
      count: courts.filter((c) => c.hubSlugs.includes(h.slug)).length,
    })),
  };

  fs.writeFileSync(REPORT_CACHE, JSON.stringify(report, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        courts: courts.length,
        indexable: indexableCourts.length,
        matchStats,
        closedCount,
        withCoords,
        prisonCoordsResolved: geo.resolved,
        prisonCoordsUnresolved: geo.unresolved.length,
        factFromCache: fromCache,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
