const AUTHORITATIVE_HOSTS = new Set([
  "www.gov.uk",
  "gov.uk",
  "www.justice.gov.uk",
  "justice.gov.uk",
  "www.hmpps.gov.uk",
  "hmpps.gov.uk",
]);

const AUTHORITATIVE_PATH_HINTS = [
  "/guidance/",
  "/government/organisations/hm-prison",
  "/government/collections/prisons",
];

/** Hosts/paths that may help discovery but must never overwrite published facts. */
const DISCOVERY_ONLY_HOST_FRAGMENTS = [
  "wikipedia.org",
  "wikimedia.org",
  "prison-insight",
  "prisonphone",
  "doyourowntime",
  "insidetime",
  "prisonersfamilies",
  "serco.com",
  "g4s.com",
  "sodexo",
  "facebook.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "tripadvisor",
  "yell.com",
  "bing.com",
  "google.com",
];

export function parseHttpUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

export function hostnameOf(raw: string): string {
  return parseHttpUrl(raw)?.hostname.replace(/^www\./, "").toLowerCase() ?? "";
}

export function isAuthoritativeUkGovUrl(raw: string | undefined | null): boolean {
  if (!raw) return false;
  const url = parseHttpUrl(raw);
  if (!url) return false;
  const host = url.hostname.toLowerCase();
  if (!AUTHORITATIVE_HOSTS.has(host)) return false;
  if (url.protocol !== "https:") return false;
  return true;
}

export function isDiscoveryOnlyUrl(raw: string | undefined | null): boolean {
  if (!raw) return false;
  const host = hostnameOf(raw);
  return DISCOVERY_ONLY_HOST_FRAGMENTS.some((frag) => host.includes(frag));
}

/** Non-government evidence cannot override government (or our existing) data. */
export function canOverrideFromSourceUrl(raw: string | undefined | null): boolean {
  return isAuthoritativeUkGovUrl(raw) && !isDiscoveryOnlyUrl(raw);
}

export function isLikelyGovUkPrisonGuidancePath(path: string): boolean {
  return AUTHORITATIVE_PATH_HINTS.some((hint) => path.startsWith(hint) || path.includes(hint));
}

export function toGovUkAbsoluteUrl(basePathOrUrl: string): string {
  if (basePathOrUrl.startsWith("https://") || basePathOrUrl.startsWith("http://")) return basePathOrUrl;
  const path = basePathOrUrl.startsWith("/") ? basePathOrUrl : `/${basePathOrUrl}`;
  return `https://www.gov.uk${path}`;
}

export function toGovUkContentApiUrl(basePathOrUrl: string): string {
  if (basePathOrUrl.includes("/api/content/")) return basePathOrUrl;
  const url = parseHttpUrl(toGovUkAbsoluteUrl(basePathOrUrl));
  const path = url?.pathname ?? basePathOrUrl;
  return `https://www.gov.uk/api/content${path}`;
}

export const GOVUK_PRISONS_COLLECTION_PATH = "/government/collections/prisons-in-england-and-wales";
export const GOVUK_CONTENT_API_ORIGIN = "https://www.gov.uk";
