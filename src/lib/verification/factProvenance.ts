import type { FacilityFactField, FacilityVerificationRecord } from "@/types/facilitySource";

/** Source name, URL and checked date for one verified fact. Display and JSON-LD both use this. */
export type FactProvenance = {
  name: string;
  url: string;
  checkedAt: string;
};

const DATE = /^(\d{4}-\d{2}-\d{2})/;

/**
 * Provenance for a field only when the record names a source with an https URL and a calendar date.
 * Missing or malformed provenance is omitted. Nothing is inferred.
 */
export function provenanceForField(
  record: FacilityVerificationRecord | undefined,
  field: FacilityFactField,
): FactProvenance | undefined {
  if (!record) return undefined;
  const ids = record.fieldSources?.[field];
  if (!ids?.length) return undefined;
  const source = record.sources.find((item) => item.id === ids[0]);
  if (!source) return undefined;
  const name = source.name?.trim();
  const url = source.url?.trim();
  const checkedAt = source.checkedAt?.trim().match(DATE)?.[1];
  if (!name || !url || !checkedAt) return undefined;
  try {
    if (new URL(url).protocol !== "https:") return undefined;
  } catch {
    return undefined;
  }
  return { name, url, checkedAt };
}

export function citationForProvenance(provenance: FactProvenance) {
  return {
    "@type": "CreativeWork" as const,
    name: provenance.name,
    url: provenance.url,
    datePublished: provenance.checkedAt,
  };
}

/** One citation per distinct source name, URL and checked date, in first-seen order. */
export function citationsForFields(
  record: FacilityVerificationRecord | undefined,
  fields: readonly FacilityFactField[],
) {
  const citations: ReturnType<typeof citationForProvenance>[] = [];
  for (const field of fields) {
    const provenance = provenanceForField(record, field);
    if (!provenance) continue;
    const citation = citationForProvenance(provenance);
    const seen = citations.some(
      (item) => item.name === citation.name && item.url === citation.url && item.datePublished === citation.datePublished,
    );
    if (!seen) citations.push(citation);
  }
  return citations;
}
