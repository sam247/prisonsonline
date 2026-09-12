import { getBaseUrl } from "@/lib/site";
import { canonicalUrl } from "@/lib/seo/canonical";
import type { Court } from "@/types/court";
import { courtJurisdictionLabel } from "@/lib/queries/courts";

export function courtJsonLd(court: Court) {
  const url = canonicalUrl(`/courts/${court.slug}`);
  const addressParts = [court.address, court.postcode].filter(Boolean);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Courthouse",
    name: court.name,
    url,
    ...(courtJurisdictionLabel(court)
      ? { description: `${court.name} — ${courtJurisdictionLabel(court)}` }
      : {}),
  };

  if (addressParts.length || court.postcode) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: court.address,
      postalCode: court.postcode,
      addressCountry: "GB",
      ...(court.town ? { addressLocality: court.town } : {}),
    };
  }

  if (typeof court.latitude === "number" && typeof court.longitude === "number") {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: court.latitude,
      longitude: court.longitude,
    };
  }

  if (court.officialUrl) {
    data.sameAs = court.officialUrl;
  }

  // Ensure absolute @id for consumers that prefer it
  data["@id"] = `${getBaseUrl()}/courts/${court.slug}`;

  return data;
}
