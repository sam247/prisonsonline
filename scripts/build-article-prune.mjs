#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INPUT_FILE = path.join(ROOT, "data", "growth", "generated_article_prune.csv");
const OUTPUT_FILE = path.join(ROOT, "src", "data", "generated", "articlePrune.generated.ts");

function parseCsvRows(text) {
  const [header, ...rest] = text.split(/\r?\n/).filter(Boolean);
  if (!header) return [];
  const keys = header.split(",").map((k) => k.trim().toLowerCase());
  return rest.map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return Object.fromEntries(keys.map((k, i) => [k, cols[i] ?? ""]));
  });
}

function run() {
  if (!fs.existsSync(INPUT_FILE)) {
    fs.writeFileSync(
      OUTPUT_FILE,
      "/* eslint-disable */\n/** Auto-generated control file for pruning low-value generated article families. */\n\nexport const prunedGeneratedArticleSlugs: string[] = [];\n",
      "utf8",
    );
    console.log("No prune CSV found. Wrote empty prune list.");
    return;
  }

  const rows = parseCsvRows(fs.readFileSync(INPUT_FILE, "utf8"));
  const slugs = rows
    .filter((r) => (r.prune || "").toLowerCase() === "yes")
    .map((r) => r.slug)
    .filter(Boolean);

  const uniqueSlugs = Array.from(new Set(slugs)).sort();
  const lines = [
    "/* eslint-disable */",
    "/** Auto-generated control file for pruning low-value generated article families. */",
    "",
    "export const prunedGeneratedArticleSlugs: string[] = [",
    ...uniqueSlugs.map((slug) => `  ${JSON.stringify(slug)},`),
    "];",
    "",
  ];

  fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf8");
  console.log(`Wrote ${uniqueSlugs.length} pruned generated article slugs.`);
}

run();

