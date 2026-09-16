import type { FacilityVerificationRecord } from "@/types/facilitySource";
import type { GovukCollectionEntry, PrisonVerificationInput, SourceDiscovery } from "./types";
import {
  canOverrideFromSourceUrl,
  isAuthoritativeUkGovUrl,
  isLikelyGovUkPrisonGuidancePath,
  toGovUkAbsoluteUrl,
} from "./sourcePolicy";
import { coreEstablishmentName, levenshtein } from "./normalize";
import { searchGovukPrisonGuides, type HttpGet, type SearchHit } from "./govukClient";

function guidanceSlugCandidates(prison: PrisonVerificationInput): string[] {
  const slug = prison.slug
    .replace(/^hmp-yoi-/, "")
    .replace(/^hmyoi-/, "")
    .replace(/^hmp-/, "")
    .replace(/^yoi-/, "");
  const core = coreEstablishmentName(prison.name) || slug.replace(/-/g, " ");
  const dashed = core.replace(/\s+/g, "-");
  return [
    `${slug}-prison`,
    `${dashed}-prison`,
    `${slug}-yoi`,
    `${dashed}-yoi`,
    `${slug}-young-offender-institution`,
    `${dashed}-prison-and-yoi`,
    slug,
    dashed,
  ].filter((value, index, all) => value && all.indexOf(value) === index);
}

export function matchCollectionEntry(
  prison: PrisonVerificationInput,
  collection: GovukCollectionEntry[],
): GovukCollectionEntry | undefined {
  const core = coreEstablishmentName(prison.name);
  if (!core) return undefined;
  const exact = collection.find((entry) => coreEstablishmentName(entry.title) === core);
  if (exact) return exact;

  const slugCore = prison.slug
    .replace(/^hmp-yoi-/, "")
    .replace(/^hmyoi-/, "")
    .replace(/^hmp-/, "")
    .replace(/-/g, " ");
  const slugMatch = collection.find((entry) => coreEstablishmentName(entry.title) === coreEstablishmentName(slugCore));
  if (slugMatch) return slugMatch;

  const close = collection.filter((entry) => {
    const other = coreEstablishmentName(entry.title);
    const distance = levenshtein(core, other);
    return other.startsWith(core.slice(0, 4)) && distance > 0 && distance <= 2 && Math.abs(other.length - core.length) <= 2;
  });
  return close.length === 1 ? close[0] : undefined;
}

export function knownGovukUrlFromFacilitySource(
  verification?: FacilityVerificationRecord,
): string | undefined {
  const urls = verification?.sources.map((source) => source.url) ?? [];
  return urls.find((url) => canOverrideFromSourceUrl(url));
}

function acceptSearchHit(prison: PrisonVerificationInput, hit: SearchHit): boolean {
  if (!hit.link || !isLikelyGovUkPrisonGuidancePath(hit.link)) return false;
  const orgOk =
    hit.organisationSlugs.length === 0 ||
    hit.organisationSlugs.includes("hm-prison-and-probation-service") ||
    hit.organisationSlugs.includes("ministry-of-justice") ||
    hit.organisationSlugs.includes("hm-prison-service");
  if (!orgOk) return false;
  const prisonCore = coreEstablishmentName(prison.name);
  const titleCore = coreEstablishmentName(hit.title);
  if (!prisonCore || !titleCore) return false;
  if (titleCore === prisonCore) return true;
  return levenshtein(prisonCore, titleCore) <= 2 && titleCore.includes(prisonCore.slice(0, 4));
}

export async function discoverAuthoritativeSource(input: {
  prison: PrisonVerificationInput;
  verification?: FacilityVerificationRecord;
  collection?: GovukCollectionEntry[];
  http?: HttpGet;
}): Promise<SourceDiscovery> {
  const { prison } = input;

  const known = knownGovukUrlFromFacilitySource(input.verification);
  if (known && isAuthoritativeUkGovUrl(known)) {
    const url = new URL(known);
    return {
      ok: true,
      url: known,
      basePath: url.pathname,
      method: "facility-source",
      title: prison.name,
      withdrawn: false,
    };
  }

  if (input.collection?.length) {
    const match = matchCollectionEntry(prison, input.collection);
    if (match) {
      return {
        ok: true,
        url: match.webUrl || toGovUkAbsoluteUrl(match.basePath),
        basePath: match.basePath,
        method: "govuk-collection",
        title: match.title,
        withdrawn: match.withdrawn,
      };
    }
  }

  if (input.http) {
    try {
      const hits = await searchGovukPrisonGuides(input.http, prison.name || prison.slug);
      const hit = hits.find((row) => acceptSearchHit(prison, row));
      if (hit) {
        return {
          ok: true,
          url: toGovUkAbsoluteUrl(hit.link),
          basePath: hit.link,
          method: "govuk-search",
          title: hit.title,
          withdrawn: false,
        };
      }
    } catch {
      // Search is a fallback; fail closed only after every method is exhausted.
    }
  }

  const heuristic = guidanceSlugCandidates(prison)[0];
  if (heuristic) {
    const basePath = `/guidance/${heuristic}`;
    return {
      ok: true,
      url: toGovUkAbsoluteUrl(basePath),
      basePath,
      method: "slug-heuristic",
      title: prison.name,
      withdrawn: false,
    };
  }

  return { ok: false, error: "No authoritative GOV.UK/HMPPS source could be identified." };
}
