import type { Prison } from "@/types/prison";
import { getBaseUrl } from "@/lib/site";
import { getFacilityVerification } from "@/data/facilitySources";

/** Factual WebPage JSON-LD for prison profiles (no ratings or claims). */
export function prisonProfileWebPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
}) {
  const base = getBaseUrl();
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description.slice(0, 500),
    url: `${base}${path}`,
  };
}

function postalAddressForPrison(p: Prison): Record<string, string> | null {
  const street = p.address?.trim();
  const postal = p.postcode?.trim();
  const locality = p.city?.trim();
  const region = p.stateOrRegion?.trim();
  const country = p.country?.trim();
  if (!street && !postal) return null;
  const o: Record<string, string> = { "@type": "PostalAddress" };
  if (street) o.streetAddress = street;
  if (postal) o.postalCode = postal;
  if (locality) o.addressLocality = locality;
  if (region) o.addressRegion = region;
  if (country) o.addressCountry = country;
  return o;
}

function breadcrumbListForPrison(p: Prison, profilePath: string, base: string) {
  const path = profilePath.startsWith("/") ? profilePath : `/${profilePath}`;
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Prisons",
        item: `${base}/prisons`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: p.country,
        item: `${base}/prisons/${p.countrySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: p.name,
        item: `${base}${path}`,
      },
    ],
  };
}

/** GovernmentBuilding + BreadcrumbList for prison profiles (no WebPage). */
export function prisonProfileJsonLdGraph(opts: { prison: Prison; path: string; description: string }) {
  const base = getBaseUrl();
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const url = `${base}${path}`;

  const building: Record<string, unknown> = {
    "@type": "GovernmentBuilding",
    "@id": `${url}#facility`,
    name: opts.prison.name,
    description: opts.description.slice(0, 500),
    url,
  };

  const verification = getFacilityVerification(opts.prison.countrySlug, opts.prison.slug);
  const officialSource = verification?.sources[0];
  if (officialSource) building.sameAs = officialSource.url;
  if (opts.prison.operator?.trim() && verification?.fieldSources.operator?.length) {
    building.parentOrganization = { "@type": "Organization", name: opts.prison.operator.trim() };
  }
  if (opts.prison.phone?.trim() && verification?.fieldSources.phone?.length) {
    building.telephone = opts.prison.phone.trim();
  }

  const addr = postalAddressForPrison(opts.prison);
  if (addr) building.address = addr;

  const hasGeo = opts.prison.latitude !== 0 || opts.prison.longitude !== 0;
  if (hasGeo) {
    building.geo = {
      "@type": "GeoCoordinates",
      latitude: opts.prison.latitude,
      longitude: opts.prison.longitude,
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [building, breadcrumbListForPrison(opts.prison, path, base)],
  };
}
