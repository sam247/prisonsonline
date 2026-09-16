import { hostnameOf, isDiscoveryOnlyUrl, parseHttpUrl } from "./sourcePolicy";
import type { UsAuthorityKind } from "./types";
import {
  addressesEquivalent,
  usNamesEquivalent,
  usPhonesEqual,
  usZipsEqual,
} from "./normalize";
import type { ComparePolicy } from "./compare";
import { usCategoriesCompatible } from "./usAuthority";

const BOP_HOSTS = new Set(["bop.gov", "www.bop.gov"]);

/** Hosts that may appear in search results but must never overwrite published facts. */
const US_DISCOVERY_ONLY_FRAGMENTS = [
  "wikipedia.org",
  "wikimedia.org",
  "prisoninsight",
  "prison-insight",
  "prisonpro",
  "prisonfinder",
  "inmateaid",
  "inmatesearch",
  "federalpay.org",
  "prisonhandbook",
  "facebook.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "tripadvisor",
  "bing.com",
  "google.com",
  "yelp.com",
  "yellowpages",
];

export function isBopGovUrl(raw: string | undefined | null): boolean {
  if (!raw) return false;
  const url = parseHttpUrl(raw);
  if (!url || url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  return BOP_HOSTS.has(host);
}

export function isUsDiscoveryOnlyUrl(raw: string | undefined | null): boolean {
  if (!raw) return false;
  if (isDiscoveryOnlyUrl(raw)) return true;
  const host = hostnameOf(raw);
  return US_DISCOVERY_ONLY_FRAGMENTS.some((frag) => host.includes(frag));
}

export function hostAllowedForAuthority(
  raw: string | undefined | null,
  allowedHosts: readonly string[],
  pathPrefix?: string,
): boolean {
  if (!raw) return false;
  const url = parseHttpUrl(raw);
  if (!url || url.protocol !== "https:") return false;
  if (isUsDiscoveryOnlyUrl(raw)) return false;
  const host = url.hostname.toLowerCase();
  const hostBare = host.replace(/^www\./, "");
  const ok = allowedHosts.some((allowed) => {
    const a = allowed.toLowerCase().replace(/^www\./, "");
    return hostBare === a || host === allowed.toLowerCase();
  });
  if (!ok) return false;
  if (pathPrefix && !url.pathname.toLowerCase().startsWith(pathPrefix.toLowerCase())) return false;
  return true;
}

/**
 * Non-government evidence cannot override. The URL must also belong to the
 * already-identified authority (BOP vs a specific state/local DOC).
 */
export function canOverrideFromUsSourceUrl(
  raw: string | undefined | null,
  authority: { kind: UsAuthorityKind; allowedHosts: readonly string[]; pathPrefix?: string },
): boolean {
  if (!raw || isUsDiscoveryOnlyUrl(raw)) return false;
  if (authority.kind === "federal-bop") return isBopGovUrl(raw);
  return hostAllowedForAuthority(raw, authority.allowedHosts, authority.pathPrefix);
}

export function toBopAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("http://")) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `https://www.bop.gov${path}`;
}

export function usComparePolicy(
  canOverride: (url: string) => boolean,
): ComparePolicy {
  return {
    canOverride,
    phonesEqual: usPhonesEqual,
    postcodesEqual: usZipsEqual,
    namesEquivalent: usNamesEquivalent,
    addressesEquivalent,
    categoriesCompatible: usCategoriesCompatible,
    sourceName: "the official US authority",
    nameMatchEvidence: "Official name matches after facility-type normalisation.",
    nonAuthoritativeBlock:
      "Blocked: source is not the identified official US government authority.",
  };
}

export const BOP_LOCATIONS_PATH = "/PublicInfo/execute/locations?todo=query&output=json";
export const BOP_LOCATIONS_URL = `https://www.bop.gov${BOP_LOCATIONS_PATH}`;
export const BOP_ORIGIN = "https://www.bop.gov";
