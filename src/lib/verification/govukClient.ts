import type { GovukCollectionEntry, GovukContentDocument } from "./types";
import { GOVUK_CONTENT_API_ORIGIN, GOVUK_PRISONS_COLLECTION_PATH, toGovUkAbsoluteUrl, toGovUkContentApiUrl } from "./sourcePolicy";

export const VERIFIER_USER_AGENT = "PrisonsOnline-UKVerifier/0.1 (+https://prisonsonline.com)";

export interface HttpGet {
  (url: string): Promise<{ ok: boolean; status: number; text: string }>;
}

export class SourceUnavailableError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "SourceUnavailableError";
    this.status = status;
  }
}

export function defaultHttpGet(timeoutMs = 15000): HttpGet {
  return async (url: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": VERIFIER_USER_AGENT,
        },
        signal: controller.signal,
      });
      const text = await res.text();
      return { ok: res.ok, status: res.status, text };
    } catch (error) {
      const message = error instanceof Error ? error.message : "network error";
      throw new SourceUnavailableError(`GOV.UK request failed for ${url}: ${message}`);
    } finally {
      clearTimeout(timer);
    }
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function bodyFromDetails(details: Record<string, unknown> | null): string {
  if (!details) return "";
  const body = details.body;
  if (typeof body === "string") return body;
  if (body && typeof body === "object") return JSON.stringify(body);
  return "";
}

export function parseGovukContentDocument(raw: unknown, fallbackUrl?: string): GovukContentDocument {
  const record = asRecord(raw);
  if (!record) throw new Error("GOV.UK content API returned a non-object.");
  const details = asRecord(record.details);
  const basePath = readString(record.base_path);
  const withdrawnNotice = asRecord(record.withdrawn_notice);
  const withdrawn = Boolean(record.withdrawn) || Boolean(withdrawnNotice && Object.keys(withdrawnNotice).length);
  const orgLinks = asRecord(record.links)?.organisations;
  const organisationTitles = Array.isArray(orgLinks)
    ? orgLinks.map((org) => readString(asRecord(org)?.title)).filter(Boolean)
    : [];
  return {
    title: readString(record.title),
    description: readString(record.description) || undefined,
    basePath,
    webUrl: toGovUkAbsoluteUrl(basePath || fallbackUrl || ""),
    body: bodyFromDetails(details),
    publicUpdatedAt: readString(record.public_updated_at) || undefined,
    withdrawn,
    organisationTitles,
  };
}

export function parseGovukCollection(raw: unknown): GovukCollectionEntry[] {
  const record = asRecord(raw);
  const links = asRecord(record?.links);
  const documents = links?.documents;
  if (!Array.isArray(documents)) return [];
  return documents
    .map((doc) => {
      const row = asRecord(doc);
      if (!row) return null;
      const basePath = readString(row.base_path);
      if (!basePath) return null;
      return {
        title: readString(row.title),
        basePath,
        webUrl: readString(row.web_url) || toGovUkAbsoluteUrl(basePath),
        withdrawn: Boolean(row.withdrawn),
      } satisfies GovukCollectionEntry;
    })
    .filter((row): row is GovukCollectionEntry => Boolean(row));
}

export async function fetchJson(http: HttpGet, url: string): Promise<unknown> {
  const res = await http(url);
  if (!res.ok) {
    throw new SourceUnavailableError(`HTTP ${res.status} for ${url}`, res.status);
  }
  try {
    return JSON.parse(res.text) as unknown;
  } catch {
    throw new Error(`Malformed JSON from ${url}`);
  }
}

export async function fetchGovukContent(http: HttpGet, basePathOrUrl: string): Promise<GovukContentDocument> {
  const apiUrl = toGovUkContentApiUrl(basePathOrUrl);
  const json = await fetchJson(http, apiUrl);
  return parseGovukContentDocument(json, basePathOrUrl);
}

export async function fetchGovukPrisonsCollection(http: HttpGet): Promise<GovukCollectionEntry[]> {
  const json = await fetchJson(http, toGovUkContentApiUrl(GOVUK_PRISONS_COLLECTION_PATH));
  return parseGovukCollection(json);
}

export interface SearchHit {
  title: string;
  link: string;
  description?: string;
  organisationSlugs: string[];
}

export function parseSearchHits(raw: unknown): SearchHit[] {
  const record = asRecord(raw);
  const results = record?.results;
  if (!Array.isArray(results)) return [];
  return results.map((hit) => {
    const row = asRecord(hit);
    const orgs = Array.isArray(row?.organisations) ? row.organisations : [];
    return {
      title: readString(row?.title),
      link: readString(row?.link),
      description: readString(row?.description) || undefined,
      organisationSlugs: orgs.map((org) => readString(asRecord(org)?.slug)).filter(Boolean),
    };
  });
}

export async function searchGovukPrisonGuides(http: HttpGet, query: string): Promise<SearchHit[]> {
  const url = new URL(`${GOVUK_CONTENT_API_ORIGIN}/api/search.json`);
  url.searchParams.set("q", query);
  url.searchParams.set("filter_format", "detailed_guide");
  url.searchParams.set("filter_organisations", "hm-prison-and-probation-service");
  url.searchParams.set("count", "8");
  const json = await fetchJson(http, url.toString());
  return parseSearchHits(json);
}
