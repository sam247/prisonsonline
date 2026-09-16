import type { FacilityFactField, FacilityVerificationRecord } from "@/types/facilitySource";
import { ukVerificationOverlay } from "./generated/ukVerificationOverlay.generated";
import { usVerificationOverlay } from "./generated/usVerificationOverlay.generated";

const CHECKED_AT = "2026-08-20";
const GOV = "GOV.UK — HM Prison and Probation Service";
const GOV_FIELDS = {
  address: ["official"],
  postcode: ["official"],
  phone: ["official"],
  operator: ["official"],
  category: ["official"],
} as const;

function govRecord(
  prisonSlug: string,
  guidanceSlug: string,
  options: Partial<FacilityVerificationRecord> = {},
): FacilityVerificationRecord {
  return {
    countrySlug: "uk",
    prisonSlug,
    sources: [
      {
        id: "official",
        name: GOV,
        url: `https://www.gov.uk/guidance/${guidanceSlug}`,
        checkedAt: CHECKED_AT,
      },
    ],
    fieldSources: { ...GOV_FIELDS },
    ...options,
  };
}

export const facilityVerificationRecords: FacilityVerificationRecord[] = [
  govRecord("hmp-berwyn", "berwyn-prison"),
  govRecord("hmp-elmley", "elmley-prison"),
  govRecord("hmp-isle-of-wight", "isle-of-wight-prison", {
    fieldSources: { address: ["official"], postcode: ["official"], operator: ["official"], category: ["official"] },
  }),
  govRecord("hmp-erlestoke", "erlestoke-prison"),
  govRecord("hmp-liverpool", "liverpool-prison"),
  govRecord("hmp-hewell", "hewell-prison"),
  govRecord("hmp-bullingdon", "bullingdon-prison"),
  govRecord("hmp-bedford", "bedford-prison"),
  govRecord("hmp-coldingley", "coldingley-prison"),
  govRecord("hmp-preston", "preston-prison", {
    fieldSources: { ...GOV_FIELDS, legalVisits: ["official"] },
    legalVisits: {
      summary: "Preston publishes a dedicated official video-call route for legal and professional visitors.",
      contacts: [{ label: "Official video visits", email: "VCC.Preston@justice.gov.uk", sourceId: "official" }],
    },
  }),
  govRecord("hmp-oakwood", "oakwood-prison", {
    fieldSources: { operator: ["official"], category: ["official"] },
  }),
  govRecord("hmp-thameside", "thameside-prison", {
    sources: [
      {
        id: "official",
        name: "Serco — HMP Thameside legal visits",
        url: "https://www.serco.com/uk/sector-expertise/justice/hmp-thameside/legal-visits-thameside",
        checkedAt: CHECKED_AT,
      },
    ],
    fieldSources: { legalVisits: ["official"], operator: ["official"] },
    legalVisits: {
      summary: "Serco publishes separate booking routes for official video and face-to-face legal visits.",
      contacts: [
        {
          label: "Official video visits",
          email: "TSI-Legal-VCC@serco.com",
          schedule: ["Monday to Friday: 08:45, 09:45, 10:45, 14:15 and 15:15"],
          sourceId: "official",
        },
        {
          label: "Face-to-face official visits",
          email: "TSI-Legal-Vis@serco.com",
          schedule: ["Monday to Friday morning sessions; see the official source for current cut-off times"],
          sourceId: "official",
        },
      ],
    },
  }),
  govRecord("hmp-guys-marsh", "guys-marsh-prison"),
  govRecord("hmp-garth", "garth-prison"),
  govRecord("hmp-five-wells", "five-wells-prison", {
    fieldSources: { operator: ["official"], category: ["official"] },
  }),
  govRecord("hmp-humber", "humber-prison"),
  govRecord("hmp-wayland", "wayland-prison"),
  govRecord("hmp-lancaster-farms", "lancaster-farms-prison"),
  govRecord("hmp-littlehey", "littlehey-prison", {
    overrides: { phone: "01480 335 000" },
  }),
  govRecord("hmp-huntercombe", "huntercombe-prison"),
  govRecord("hmp-leeds", "leeds-prison"),
  govRecord("hmp-highpoint", "highpoint-prison"),
  govRecord("hmp-wandsworth", "wandsworth-prison"),
  govRecord("hmp-ranby", "ranby-prison"),
  govRecord("hmp-gartree", "gartree-prison"),
  govRecord("hmp-belmarsh", "belmarsh-prison", {
    fieldSources: { ...GOV_FIELDS, email: ["official"], legalVisits: ["official"] },
    overrides: { phone: "020 8331 4400", email: "communications.Belmarsh@justice.gov.uk" },
    legalVisits: {
      summary: "Belmarsh publishes separate official routes for video and face-to-face legal visits.",
      contacts: [
        { label: "Official video visits", email: "videolinkbelmarsh@justice.gov.uk", sourceId: "official" },
        { label: "Face-to-face legal visits", email: "legalvisits.belmarsh@justice.gov.uk", sourceId: "official" },
      ],
    },
  }),
  govRecord("hmp-yoi-pentonville", "pentonville-prison", {
    fieldSources: { ...GOV_FIELDS, legalVisits: ["official"] },
    legalVisits: {
      summary: "Pentonville publishes a dedicated email route for official and legal visit bookings.",
      contacts: [{ label: "Legal visits", email: "LegalVisits.Pentonville@justice.gov.uk", sourceId: "official" }],
    },
  }),
  govRecord("hmp-yoi-new-hall", "new-hall-prison", {
    fieldSources: { ...GOV_FIELDS, legalVisits: ["official"] },
    legalVisits: {
      summary: "New Hall publishes separate official video and face-to-face booking routes.",
      contacts: [
        { label: "Official video visits", email: "VCCNewhall@justice.gov.uk", sourceId: "official" },
        { label: "Face-to-face official visits", email: "hmppsvisitbooking@justice.gov.uk", sourceId: "official" },
      ],
    },
  }),
  {
    countrySlug: "uk",
    prisonSlug: "hmp-peterborough",
    sources: [
      {
        id: "official",
        name: "HMP Peterborough — Sodexo Justice",
        url: "https://www.hmppeterborough.co.uk/Visitors/Legal-and-Professional-Visits",
        checkedAt: CHECKED_AT,
      },
      {
        id: "contact",
        name: "HMP Peterborough — official contact page",
        url: "https://www.hmppeterborough.co.uk/Contact-Us/How-to-get-in-contact",
        checkedAt: CHECKED_AT,
      },
    ],
    fieldSources: { address: ["contact"], postcode: ["contact"], phone: ["contact"], operator: ["official"], legalVisits: ["official"] },
    legalVisits: {
      summary: "HMP Peterborough publishes both face-to-face and virtual legal-visit booking routes.",
      contacts: [
        { label: "Face-to-face legal visits", email: "pblegalvisits@sodexogov.co.uk", schedule: ["Monday to Friday: 09:00 to 11:45 and 14:00 to 16:00"], sourceId: "official" },
        { label: "Virtual legal visits", email: "peterboroughvcc@sodexogov.co.uk", phone: "01733 271631", schedule: ["Monday to Friday: 08:30 to 17:30"], sourceId: "official" },
      ],
    },
  },
  govRecord("hmp-risley", "risley-prison", {
    fieldSources: { ...GOV_FIELDS, legalVisits: ["official"] },
    legalVisits: {
      summary: "Risley publishes email and telephone booking routes for official face-to-face visits.",
      contacts: [
        {
          label: "Official visits",
          email: "legalvisits.risley@justice.gov.uk",
          phone: "01925 733 284 or 01925 733 285",
          schedule: ["Booking lines: Monday to Friday, 09:00 to 11:30 and 13:30 to 15:30", "Face-to-face visits: Tuesday and Thursday, 09:00 to 11:00"],
          sourceId: "official",
        },
      ],
    },
  }),
];

const recordsByKey = new Map(
  facilityVerificationRecords.map((record) => [`${record.countrySlug}/${record.prisonSlug}`, record]),
);

function overlayFor(countrySlug: string, key: string) {
  if (countrySlug === "uk") return ukVerificationOverlay.entries?.[key];
  if (countrySlug === "us" || countrySlug === "united-states") return usVerificationOverlay.entries?.[key];
  return undefined;
}

function overlaySourceName(countrySlug: string, url?: string): string {
  if (countrySlug === "uk") return GOV;
  if (!url) return "Official US government source";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "bop.gov") return "Federal Bureau of Prisons";
  } catch {
    return "Official US government source";
  }
  return "Official US government source";
}

export function getFacilityVerification(
  countrySlug: string,
  prisonSlug: string,
): FacilityVerificationRecord | undefined {
  const key = `${countrySlug}/${prisonSlug}`;
  const base = recordsByKey.get(key);
  const overlay = overlayFor(countrySlug, key);
  if (!overlay?.overrides || Object.keys(overlay.overrides).length === 0) return base;

  const overlayFields = Object.keys(overlay.overrides) as FacilityFactField[];
  const overlayFieldSources = Object.fromEntries(
    overlayFields.map((field) => [field, ["official"]]),
  ) as FacilityVerificationRecord["fieldSources"];
  const overlaySource = overlay.sourceUrl
    ? {
        id: "official",
        name: overlaySourceName(countrySlug, overlay.sourceUrl),
        url: overlay.sourceUrl,
        checkedAt: overlay.appliedAt.slice(0, 10),
      }
    : undefined;

  if (!base) {
    return {
      countrySlug,
      prisonSlug,
      sources: overlaySource ? [overlaySource] : [],
      fieldSources: overlayFieldSources,
      overrides: overlay.overrides,
    };
  }

  const sources = overlaySource
    ? [overlaySource, ...base.sources.filter((source) => source.url !== overlaySource.url)]
    : base.sources;

  return {
    ...base,
    sources,
    fieldSources: { ...base.fieldSources, ...overlayFieldSources },
    overrides: { ...base.overrides, ...overlay.overrides },
  };
}
