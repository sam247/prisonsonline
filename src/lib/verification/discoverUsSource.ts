import type { FacilityVerificationRecord } from "@/types/facilitySource";
import type { PrisonVerificationInput, SourceDiscovery } from "./types";
import type { ResolvedUsAuthority } from "./usAuthority";
import { canOverrideFromUsSourceUrl } from "./usSourcePolicy";
import { bopPublicUrl, type BopLocation } from "./bopClient";
import { coreUsFacilityName } from "./normalize";

function slugify(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function typeAliases(raw?: string): string[] {
  const t = (raw || "").toLowerCase();
  if (!t) return [];
  if (t === "ccm" || t === "rrm") return ["ccm", "rrm"];
  if (t === "usmcfp" || t === "mcfp") return ["mcfp", "usmcfp"];
  return [t];
}

export function locationMatchKeys(loc: BopLocation): string[] {
  const keys = new Set<string>();
  const nameDisplay = slugify(loc.nameDisplay);
  const nameTitle = slugify(loc.nameTitle);
  const name = slugify(loc.name);
  const type = (loc.type || "").toLowerCase();
  if (nameDisplay) keys.add(nameDisplay);
  if (nameTitle) keys.add(nameTitle);
  if (name && type) keys.add(`${name}-${type}`);
  if (nameDisplay.includes("medium")) keys.add(nameDisplay.replace(/medium/g, "med"));
  if (nameTitle.includes("medium")) keys.add(nameTitle.replace(/medium/g, "med"));
  if (type === "rrm" && name) {
    keys.add(`${name}-ccm`);
    if (nameDisplay) keys.add(nameDisplay.replace(/rrm/g, "ccm"));
  }
  if (type === "mcfp" && name) {
    keys.add(`${name}-usmcfp`);
  }
  return Array.from(keys).filter(Boolean);
}

function prisonSlugCandidates(prison: PrisonVerificationInput): string[] {
  const slug = prison.slug;
  return Array.from(new Set([slug, slug.replace(/-med-/g, "-medium-").replace(/-med$/g, "-medium")]));
}

function typesCompatible(prison: PrisonVerificationInput, loc: BopLocation): boolean {
  const published = (prison.facilityType || "").toLowerCase();
  const locType = (loc.type || "").toLowerCase();
  if (!published || published === "other") return true;
  return typeAliases(published).includes(locType);
}

function unique<T>(rows: T[], key: (row: T) => string): T[] {
  const map = new Map<string, T>();
  for (const row of rows) map.set(key(row), row);
  return Array.from(map.values());
}

export function matchBopLocation(
  prison: PrisonVerificationInput,
  locations: BopLocation[],
): BopLocation | undefined {
  const index = new Map<string, BopLocation[]>();
  for (const loc of locations) {
    for (const key of locationMatchKeys(loc)) {
      const list = index.get(key) ?? [];
      list.push(loc);
      index.set(key, list);
    }
  }

  const hits: BopLocation[] = [];
  for (const slug of prisonSlugCandidates(prison)) {
    hits.push(...(index.get(slug) ?? []));
  }
  const compatible = unique(
    hits.filter((loc) => typesCompatible(prison, loc)),
    (loc) => loc.code,
  );
  if (compatible.length === 1) return compatible[0];
  if (compatible.length > 1) return undefined;

  const hay = `${prison.slug} ${prison.name}`.toLowerCase();
  if (/\b(adx|admax)\b/.test(hay)) {
    const admax = locations.filter((loc) =>
      /\b(adx|admax)\b/i.test(`${loc.nameDisplay} ${loc.nameTitle} ${loc.name}`),
    );
    const uniq = unique(admax, (loc) => loc.code);
    if (uniq.length === 1) return uniq[0];
  }

  const core = coreUsFacilityName(prison.name);
  if (core && core.length >= 4) {
    const named = locations.filter((loc) => coreUsFacilityName(loc.nameDisplay) === core && typesCompatible(prison, loc));
    const uniq = unique(named, (loc) => loc.code);
    if (uniq.length === 1) return uniq[0];
  }

  return undefined;
}

export function knownOfficialUrlFromFacilitySource(
  verification: FacilityVerificationRecord | undefined,
  authority: ResolvedUsAuthority,
): string | undefined {
  const urls = verification?.sources.map((source) => source.url) ?? [];
  return urls.find((url) => canOverrideFromUsSourceUrl(url, authority));
}

/**
 * Discover an official page for the already-identified authority only.
 * No Wikipedia, no directories, no open-web search, no slug guesses.
 */
export function discoverUsAuthoritativeSource(input: {
  prison: PrisonVerificationInput;
  authority: ResolvedUsAuthority;
  verification?: FacilityVerificationRecord;
  bopLocations?: BopLocation[];
}): SourceDiscovery {
  const known = knownOfficialUrlFromFacilitySource(input.verification, input.authority);
  if (known) {
    const url = new URL(known);
    return {
      ok: true,
      url: known,
      basePath: url.pathname,
      method: input.authority.kind === "federal-bop" ? "facility-source" : "state-official",
      title: input.prison.name,
      withdrawn: false,
    };
  }

  if (input.authority.kind === "federal-bop") {
    if (!input.bopLocations?.length) {
      return {
        ok: false,
        error: "Federal BOP authority identified but the official BOP directory was not available.",
      };
    }
    const match = matchBopLocation(input.prison, input.bopLocations);
    if (!match) {
      return {
        ok: false,
        error:
          "BOP is the identified authority, but this facility could not be uniquely matched on the official BOP directory (missing, renamed, split, or closed). Not guessing from other websites.",
      };
    }
    const url = bopPublicUrl(match);
    return {
      ok: true,
      url,
      basePath: match.url || `/locations/institutions/${match.code.toLowerCase()}/`,
      method: "bop-directory",
      title: match.nameDisplay || match.nameTitle || input.prison.name,
      withdrawn: false,
    };
  }

  return {
    ok: false,
    error: `${input.authority.name} is the identified authority, but no official facility page is confirmed on ${input.authority.allowedHosts.join(", ")}. Not searching the open web.`,
  };
}

export function matchedBopLocation(
  prison: PrisonVerificationInput,
  locations: BopLocation[] | undefined,
): BopLocation | undefined {
  if (!locations?.length) return undefined;
  return matchBopLocation(prison, locations);
}
