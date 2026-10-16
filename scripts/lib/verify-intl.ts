/**
 * Offline + optional live verification for official-source international bundles.
 *   tsx scripts/verify-<cc>-prisons.ts            schema, frozen slugs, excluded.json reasons
 *   tsx scripts/verify-<cc>-prisons.ts --live     also fetch each sourceUrl and check the facility name appears
 * Read-only: never edits bundles. Exits 1 on any failure.
 */
import fs from "node:fs";
import { bundlePaths, validateBundle } from "./intl-prisons.mjs";

type Row = { slug: string; name: string; sourceUrl: string; status: string };
type Excluded = { name?: string; reason?: string };

const norm = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");

export async function verifyIntlCountry(cc: string, argv = process.argv.slice(2)) {
  const live = argv.includes("--live");
  const { rows: rowsPath, excluded: excludedPath } = bundlePaths(cc);
  const rows = JSON.parse(fs.readFileSync(rowsPath, "utf8")) as Row[];
  const excluded = JSON.parse(fs.readFileSync(excludedPath, "utf8")) as Excluded[];
  const failures: string[] = [...validateBundle(cc, rows)];
  excluded.forEach((e, i) => {
    if (!e.name?.trim() || !e.reason?.trim()) failures.push(`excluded[${i}]: needs name and reason`);
  });
  const included = new Set(rows.map((r) => norm(r.name)));
  for (const e of excluded) if (e.name && included.has(norm(e.name))) failures.push(`excluded facility also in bundle: ${e.name}`);

  if (live) {
    const byUrl = new Map<string, Row[]>();
    for (const r of rows) byUrl.set(r.sourceUrl, [...(byUrl.get(r.sourceUrl) ?? []), r]);
    for (const [url, group] of byUrl) {
      try {
        const res = await fetch(url, { headers: { "user-agent": "PrisonsOnline verification (read-only)" }, redirect: "follow" });
        if (!res.ok) { failures.push(`${url}: HTTP ${res.status}`); continue; }
        if (!/html|text/.test(res.headers.get("content-type") ?? "")) { console.log(`skip name check (non-HTML): ${url}`); continue; }
        const page = norm(await res.text());
        for (const r of group) {
          const core = norm(r.name).replace(/\s*\(.*?\)\s*/g, " ").trim();
          if (!page.includes(core)) console.warn(`review: "${r.name}" not found verbatim on ${url}`);
        }
      } catch (err) {
        failures.push(`${url}: ${(err as Error).message}`);
      }
    }
  }

  const closed = rows.filter((r) => r.status === "closed").length;
  console.log(`[verify:${cc}] ${rows.length} rows (${closed} closed), ${excluded.length} excluded${live ? ", live source check done" : ""}`);
  if (failures.length) {
    console.error(failures.map((f) => `  FAIL ${f}`).join("\n"));
    process.exit(1);
  }
}
