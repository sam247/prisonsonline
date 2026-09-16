import { BOP_LOCATIONS_URL, BOP_ORIGIN, toBopAbsoluteUrl } from "./usSourcePolicy";
import { SourceUnavailableError, type HttpGet } from "./govukClient";

export const US_VERIFIER_USER_AGENT = "PrisonsOnline-USVerifier/0.1 (+https://prisonsonline.com)";

export function defaultUsHttpGet(timeoutMs = 15000): HttpGet {
  return async (url: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json, text/html;q=0.9",
          "User-Agent": US_VERIFIER_USER_AGENT,
        },
        signal: controller.signal,
      });
      const text = await res.text();
      return { ok: res.ok, status: res.status, text };
    } catch (error) {
      const message = error instanceof Error ? error.message : "network error";
      throw new SourceUnavailableError(`BOP request failed for ${url}: ${message}`);
    } finally {
      clearTimeout(timer);
    }
  };
}

export interface BopLocation {
  code: string;
  name: string;
  nameTitle: string;
  nameDisplay: string;
  type: string;
  securityLevel: string;
  url: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  contactEmail: string;
  locationtype: string;
  privateFacl: string;
  faclTypeDescription: string;
  gender?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function parseBopLocations(raw: unknown): BopLocation[] {
  const record = asRecord(raw);
  const locations = record?.Locations ?? record?.locations;
  if (!Array.isArray(locations)) return [];
  const parsed: BopLocation[] = [];
  for (const row of locations) {
    const loc = asRecord(row);
    if (!loc) continue;
    const code = readString(loc.code).toUpperCase();
    if (!code) continue;
    parsed.push({
      code,
      name: readString(loc.name),
      nameTitle: readString(loc.nameTitle),
      nameDisplay: readString(loc.nameDisplay),
      type: readString(loc.type),
      securityLevel: readString(loc.securityLevel),
      url: readString(loc.url),
      address: readString(loc.address),
      city: readString(loc.city),
      state: readString(loc.state),
      zipCode: readString(loc.zipCode),
      phoneNumber: readString(loc.phoneNumber),
      contactEmail: readString(loc.contactEmail),
      locationtype: readString(loc.locationtype),
      privateFacl: readString(loc.privateFacl),
      faclTypeDescription: readString(loc.faclTypeDescription),
      gender: readString(loc.gender) || undefined,
    });
  }
  return parsed;
}

export async function fetchBopLocations(http: HttpGet): Promise<BopLocation[]> {
  const res = await http(BOP_LOCATIONS_URL);
  if (!res.ok) {
    throw new SourceUnavailableError(`HTTP ${res.status} for ${BOP_LOCATIONS_URL}`, res.status);
  }
  let json: unknown;
  try {
    json = JSON.parse(res.text) as unknown;
  } catch {
    throw new Error(`Malformed JSON from ${BOP_LOCATIONS_URL}`);
  }
  const locations = parseBopLocations(json);
  if (locations.length === 0) {
    throw new Error("BOP locations directory parsed empty.");
  }
  return locations;
}

export function bopPublicUrl(loc: BopLocation): string {
  const path = loc.url || "";
  if (!path || path.includes("search.jsp")) {
    return `${BOP_ORIGIN}/locations/`;
  }
  return toBopAbsoluteUrl(path);
}

export { BOP_LOCATIONS_URL, BOP_ORIGIN };
