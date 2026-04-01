/** Escape text for XML urlset / sitemap index. */
export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildUrlSetXml(entries: { loc: string; lastmod: Date }[]): string {
  const body = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${xmlEscape(e.loc)}</loc>\n    <lastmod>${e.lastmod.toISOString()}</lastmod>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

/** Child sitemap absolute URLs. Shard any segment that approaches 50k URLs (see route comments). */
export function buildSitemapIndexXml(childAbsoluteUrls: string[]): string {
  const body = childAbsoluteUrls
    .map((u) => `  <sitemap>\n    <loc>${xmlEscape(u)}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}
