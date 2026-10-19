/**
 * Contact & visiting facts for BOP facilities: inmate mail address (postalAddress),
 * visiting hours and visiting rules URL. Shape follows #77: blocks carry a sourceId
 * into sources[], and fieldSources lists the block keys.
 *
 * Source of truth is the bop.gov facility page (https://www.bop.gov/locations/institutions/<code>/).
 * That page is a static template filled in by bop.gov's own script from the
 * same-origin data feed /PublicInfo/execute/phyloc?todo=query&output=json&code=<CODE>
 * (Addresses / Visiting / Lockdown). We parse that feed exactly the way the page
 * renders it, and the visiting-rules PDF link straight from the page HTML.
 *
 * A value is SAFE_AUTO_CHANGE only when it parses unambiguously. Anything else is
 * REVIEW_REQUIRED / NO_SOURCE_VALUE / UNSUPPORTED: recorded, never written.
 * Writes go to the US overlay only, behind the existing VERIFY write gate.
 */
import type { FacilitySource, PostalAddress, PostalAddressUnit, VisitingHours, VisitingRulesLink } from "@/types/facilitySource";
import type { OverlayStore } from "./applyChanges";
import { emptyUsOverlay, overlayKey } from "./applyChanges";
import type { HttpGet } from "./govukClient";
import { collapseSpace, isoNow } from "./normalize";
import { isUkPrison, isUsPrison } from "./selectPrison";
import { BOP_ORIGIN, isBopGovUrl } from "./usSourcePolicy";
import type {
  ContactVisitingBlocks,
  ContactVisitingField,
  ContactVisitingFieldResult,
  ContactVisitingReport,
} from "./types";

export const CONTACT_VISITING_FIELDS: readonly ContactVisitingField[] = [
  "postalAddress",
  "visitingHours",
  "visitingRulesUrl",
];

export const INMATE_MAIL_PLACEHOLDER = "INMATE NAME & REGISTER NUMBER";
export const BOP_CONTACT_VISITING_SOURCE_ID = "bop-contact-visiting";
export const BOP_SOURCE_NAME = "Federal Bureau of Prisons";

export function bopContactVisitingSource(code: string, checkedAt: string): FacilitySource {
  return { id: BOP_CONTACT_VISITING_SOURCE_ID, name: BOP_SOURCE_NAME, url: bopFacilityPageUrl(code), checkedAt };
}

/** USPS state / territory codes. BOP's internal "RQ" (Puerto Rico) is deliberately absent. */
const USPS_STATES = new Set(
  (
    "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY " +
    "PR GU VI AS MP"
  ).split(" "),
);

const ZIP_RE = /^\d{5}(-\d{4})?$/;

export function bopFacilityPageUrl(code: string): string {
  return `${BOP_ORIGIN}/locations/institutions/${code.toLowerCase()}/`;
}

export function bopPhylocUrl(code: string): string {
  return `${BOP_ORIGIN}/PublicInfo/execute/phyloc?todo=query&output=json&code=${code.toUpperCase()}`;
}

// ---------- phyloc feed ----------

export interface BopPhylocAddress {
  code: string;
  addressType: string;
  addressTypeName: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface BopVisitDay {
  day: number;
  startTime: string;
  endTime: string;
  camp?: boolean;
  fsl?: boolean;
  fdc?: boolean;
  sff?: boolean;
}

export interface BopPhyloc {
  location?: {
    code: string;
    type: string;
    nameTitle: string;
    faclTypeDescription: string;
    hasCamp: boolean;
    hasFsl: boolean;
  };
  addresses: BopPhylocAddress[];
  visitDays: BopVisitDay[];
  visitingNotes?: string;
  lockdown: unknown[];
}

function rec(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}
function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}
function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true" || value === "t";
}

/** Parse the phyloc feed for one facility code. Returns null when the payload is not the expected shape. */
export function parseBopPhyloc(raw: unknown, code: string): BopPhyloc | null {
  const root = rec(raw);
  if (!root) return null;
  const wanted = code.toUpperCase();
  const locations = Array.isArray(root.Locations) ? root.Locations : null;
  const addresses = Array.isArray(root.Addresses) ? root.Addresses : null;
  if (!locations || !addresses) return null;
  const locRow = locations.map(rec).find((row) => row && str(row.code).toUpperCase() === wanted && str(row.type) !== "FCC");
  const visiting = Array.isArray(root.Visiting) ? root.Visiting.map(rec).filter(Boolean) as Record<string, unknown>[] : [];
  const visitRow = visiting.find((row) => str(row.code).toUpperCase() === wanted) ?? visiting[0];
  const visitDaysRaw = visitRow && Array.isArray(visitRow.visitDays) ? visitRow.visitDays : [];
  return {
    location: locRow
      ? {
          code: str(locRow.code).toUpperCase(),
          type: str(locRow.type),
          nameTitle: collapseSpace(str(locRow.nameTitle)),
          faclTypeDescription: collapseSpace(str(locRow.faclTypeDescription)),
          hasCamp: truthy(locRow.hasCamp),
          hasFsl: truthy(locRow.hasFsl),
        }
      : undefined,
    addresses: addresses
      .map(rec)
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map((row) => ({
        code: str(row.code).toUpperCase(),
        addressType: str(row.addressType),
        addressTypeName: str(row.addressTypeName),
        street: collapseSpace(str(row.street)),
        street2: collapseSpace(str(row.street2)),
        city: collapseSpace(str(row.city)),
        state: collapseSpace(str(row.state)).toUpperCase(),
        zipCode: collapseSpace(str(row.zipCode)),
      })),
    visitDays: visitDaysRaw
      .map(rec)
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map((row) => ({
        day: Number(row.day),
        startTime: collapseSpace(str(row.startTime)),
        endTime: collapseSpace(str(row.endTime)),
        camp: truthy(row.camp),
        fsl: truthy(row.fsl),
        fdc: truthy(row.fdc),
        sff: truthy(row.sff),
      })),
    visitingNotes: visitRow ? collapseSpace(str(visitRow.visitingNotes)) || undefined : undefined,
    lockdown: Array.isArray(root.Lockdown) ? root.Lockdown : [],
  };
}

// ---------- field parsers (pure) ----------

export type ParseOutcome<T> =
  | { ok: true; value: T; evidence: string }
  | { ok: false; classification: "REVIEW_REQUIRED" | "NO_SOURCE_VALUE" | "UNSUPPORTED"; evidence: string };

/** BOP address types used by the facility page script. */
const MAIL_MAIN = "3";
const MAIL_CAMP = "6";
const MAIL_FSL = "9";

function addressProblem(row: BopPhylocAddress): string | null {
  if (!row.street) return "street/P.O. Box is empty";
  if (!row.city) return "city is empty";
  if (!USPS_STATES.has(row.state)) return `state code "${row.state}" is not a USPS state code`;
  if (!ZIP_RE.test(row.zipCode)) return `ZIP "${row.zipCode}" is not a valid ZIP`;
  return null;
}

function normStreet(value: string | undefined): string {
  return collapseSpace(value).toUpperCase().replace(/[.,]/g, "").replace(/\bP ?O\b/g, "PO");
}

/**
 * Inmate mail address in the PostalAddress shape (#77): lines exactly as the bop.gov
 * page renders them minus the recipient line and ZIP; recipientFormat holds
 * "INMATE NAME & REGISTER NUMBER"; ZIP goes in postcode.
 */
export function parseBopPostalAddress(
  phyloc: BopPhyloc,
  code: string,
  sourceId: string,
  site?: { address?: string; postcode?: string },
): ParseOutcome<PostalAddress> {
  const wanted = code.toUpperCase();
  const loc = phyloc.location;
  if (!loc || loc.code !== wanted) {
    return { ok: false, classification: "REVIEW_REQUIRED", evidence: `BOP feed has no location row for ${wanted}.` };
  }
  if (!loc.nameTitle || !loc.faclTypeDescription) {
    return { ok: false, classification: "REVIEW_REQUIRED", evidence: "BOP feed is missing the facility title or type description." };
  }
  const own = phyloc.addresses.filter((row) => row.code === wanted);
  const mains = own.filter((row) => row.addressType === MAIL_MAIN);
  if (mains.length === 0) {
    return { ok: false, classification: "NO_SOURCE_VALUE", evidence: "bop.gov publishes no inmate mail address for this facility." };
  }
  if (mains.length > 1) {
    return { ok: false, classification: "REVIEW_REQUIRED", evidence: `bop.gov lists ${mains.length} main inmate mail addresses; ambiguous.` };
  }
  const main = mains[0];
  const problem = addressProblem(main);
  if (problem) {
    return { ok: false, classification: "REVIEW_REQUIRED", evidence: `Inmate mail address not written: ${problem}.` };
  }

  const notes: string[] = [];
  const unitSpecs = [
    { type: MAIL_CAMP, label: "Camp", line: "SATELLITE CAMP", declared: loc.hasCamp, flag: "hasCamp" },
    { type: MAIL_FSL, label: "FSL", line: "FEDERAL SATELLITE LOW", declared: loc.hasFsl, flag: "hasFsl" },
  ];
  const units: PostalAddressUnit[] = [];
  for (const spec of unitSpecs) {
    const rows = own.filter((row) => row.addressType === spec.type);
    if (rows.length === 0) continue;
    if (!spec.declared) {
      notes.push(`${spec.label} mail row ignored: facility row has ${spec.flag}=false, so bop.gov's page context is inconsistent.`);
      continue;
    }
    if (rows.length > 1) {
      return { ok: false, classification: "REVIEW_REQUIRED", evidence: `bop.gov lists ${rows.length} ${spec.label} inmate mail addresses; ambiguous.` };
    }
    const unitProblem = addressProblem(rows[0]);
    if (unitProblem) {
      return { ok: false, classification: "REVIEW_REQUIRED", evidence: `${spec.label} inmate mail address not written: ${unitProblem}.` };
    }
    const unit = rows[0];
    // Lines exactly as the bop.gov page renders the unit block (unit line after the facility type).
    const unitLines = [loc.nameTitle, loc.faclTypeDescription.toUpperCase(), spec.line, unit.street];
    if (unit.street2) unitLines.push(unit.street2);
    unitLines.push(`${unit.city}, ${unit.state}`);
    units.push({ label: spec.label, lines: unitLines, postcode: unit.zipCode, sourceId });
  }

  if (
    site?.address &&
    normStreet(site.address) === normStreet(main.street) &&
    (site.postcode ?? "").trim() === main.zipCode
  ) {
    return {
      ok: false,
      classification: "UNSUPPORTED",
      evidence:
        "Inmate mail street/ZIP equal the site address; PostalAddress is only stored when the official postal address differs from the site address (#77 rule).",
    };
  }

  const lines = [loc.nameTitle, loc.faclTypeDescription.toUpperCase(), main.street];
  if (main.street2) lines.push(main.street2);
  lines.push(`${main.city}, ${main.state}`);
  return {
    ok: true,
    value: {
      lines,
      postcode: main.zipCode,
      recipientFormat: INMATE_MAIL_PLACEHOLDER,
      ...(units.length ? { units } : {}),
      sourceId,
    },
    evidence: ["Parsed from the bop.gov facility page inmate-mail block (Addresses type 3).", ...notes].join(" "),
  };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Federal holidays"];

export function parseBopVisitingHours(phyloc: BopPhyloc, sourceId: string): ParseOutcome<VisitingHours> {
  if (phyloc.lockdown.length > 0) {
    return { ok: false, classification: "REVIEW_REQUIRED", evidence: "bop.gov shows a visiting suspension/lockdown notice; hours not written." };
  }
  if (phyloc.visitDays.length === 0) {
    return {
      ok: false,
      classification: "NO_SOURCE_VALUE",
      evidence:
        "bop.gov publishes no structured visiting schedule for this facility (empty visitDays); hours exist only as prose in the visiting-rules PDF, which is not auto-extracted.",
    };
  }
  const mainLabel = phyloc.location?.type || "Main";
  const groups = new Map<string, Map<number, string[]>>();
  for (const row of phyloc.visitDays) {
    if (!Number.isInteger(row.day) || row.day < 0 || row.day > 7 || !row.startTime || !row.endTime) {
      return { ok: false, classification: "REVIEW_REQUIRED", evidence: "Malformed visiting-day row in the bop.gov feed." };
    }
    const label = row.camp ? "Camp" : row.fsl ? "FSL" : row.fdc ? "FDC" : row.sff ? "SFF" : mainLabel;
    const days = groups.get(label) ?? new Map<number, string[]>();
    const slots = days.get(row.day) ?? [];
    slots.push(`${row.startTime} - ${row.endTime}`);
    days.set(row.day, slots);
    groups.set(label, days);
  }
  const multi = groups.size > 1;
  const schedule: string[] = [];
  for (const [label, days] of Array.from(groups.entries())) {
    for (const [day, slots] of Array.from(days.entries()).sort(([a], [b]) => a - b)) {
      schedule.push(`${multi ? `${label} — ` : ""}${DAY_LABELS[day]}: ${slots.join(", ")}`);
    }
  }
  return {
    ok: true,
    value: { schedule, ...(phyloc.visitingNotes ? { note: phyloc.visitingNotes } : {}), sourceId },
    evidence: "Parsed from the bop.gov facility page visiting schedule (Visiting.visitDays).",
  };
}

/** Find the single English "Visiting Schedule & Procedures" PDF linked from the facility page. */
export function parseBopVisitingRulesUrl(html: string, code: string, sourceId: string): ParseOutcome<VisitingRulesLink> {
  const lower = code.toLowerCase();
  const pageCode = html.match(/faclCode\s*=\s*\(\s*["']([a-z0-9]+)["']\s*\)/i)?.[1]?.toLowerCase();
  if (!pageCode || pageCode !== lower) {
    return {
      ok: false,
      classification: "REVIEW_REQUIRED",
      evidence: `Facility page identity mismatch (page code ${pageCode ?? "missing"}, expected ${lower}).`,
    };
  }
  const re = new RegExp(`href=["'](/locations/institutions/${lower}/[^"'?#]*visit[^"'?#]*\\.pdf)(?:\\?[^"']*)?["']`, "gi");
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const path = match[1];
    if (/_sp\.pdf$|spanish/i.test(path)) continue;
    found.add(path);
  }
  if (found.size === 0) {
    return { ok: false, classification: "NO_SOURCE_VALUE", evidence: "Facility page links no visiting-rules PDF." };
  }
  if (found.size > 1) {
    return {
      ok: false,
      classification: "REVIEW_REQUIRED",
      evidence: `Facility page links ${found.size} candidate visiting PDFs (${Array.from(found).join(", ")}); ambiguous.`,
    };
  }
  return {
    ok: true,
    value: { url: `${BOP_ORIGIN}${Array.from(found)[0]}`, sourceId },
    evidence: "Single English visiting-regulations PDF linked from the bop.gov facility page.",
  };
}

// ---------- evaluation + write ----------

type Block = NonNullable<ContactVisitingBlocks[ContactVisitingField]>;

function toResult(
  field: ContactVisitingField,
  outcome: ParseOutcome<Block>,
  current: Block | undefined,
): ContactVisitingFieldResult {
  if (!outcome.ok) {
    return { field, classification: outcome.classification, currentValue: current, evidence: outcome.evidence, wouldWrite: false };
  }
  if (current && JSON.stringify(current) === JSON.stringify(outcome.value)) {
    return { field, classification: "NO_CHANGE", currentValue: current, officialValue: outcome.value, evidence: outcome.evidence, wouldWrite: false };
  }
  return { field, classification: "SAFE_AUTO_CHANGE", currentValue: current, officialValue: outcome.value, evidence: outcome.evidence, wouldWrite: true };
}

function failAll(classification: "REVIEW_REQUIRED" | "UNSUPPORTED", evidence: string, current?: ContactVisitingBlocks) {
  return CONTACT_VISITING_FIELDS.map<ContactVisitingFieldResult>((field) => ({
    field,
    classification,
    currentValue: current?.[field],
    evidence,
    wouldWrite: false,
  }));
}

export function suppressedContactVisiting(reason: string): ContactVisitingReport {
  return { suppressed: true, suppressReason: reason, fields: [], applied: [], mutated: false };
}

/** Fetch + classify contact/visiting facts for one BOP facility code. Never writes. */
export async function evaluateBopContactVisiting(input: {
  code: string;
  http: HttpGet;
  current?: ContactVisitingBlocks;
  site?: { address?: string; postcode?: string };
  now: Date;
}): Promise<{ source: FacilitySource; fields: ContactVisitingFieldResult[] }> {
  const checkedAt = isoNow(input.now).slice(0, 10);
  const source = bopContactVisitingSource(input.code, checkedAt);
  const sourceId = source.id;
  const pageUrl = source.url;
  const feedUrl = bopPhylocUrl(input.code);
  if (!isBopGovUrl(pageUrl) || !isBopGovUrl(feedUrl)) {
    return { source, fields: failAll("UNSUPPORTED", "Contact/visiting source is not bop.gov.", input.current) };
  }

  let phyloc: BopPhyloc | null = null;
  let feedError = "";
  try {
    const res = await input.http(feedUrl);
    if (!res.ok) feedError = `HTTP ${res.status} for ${feedUrl}`;
    else phyloc = parseBopPhyloc(JSON.parse(res.text) as unknown, input.code);
    if (!feedError && !phyloc) feedError = `Unexpected payload shape from ${feedUrl}`;
  } catch (error) {
    feedError = error instanceof Error ? error.message : "feed fetch failed";
  }

  let html: string | null = null;
  let pageError = "";
  try {
    const res = await input.http(pageUrl);
    if (!res.ok) pageError = `HTTP ${res.status} for ${pageUrl}`;
    else html = res.text;
  } catch (error) {
    pageError = error instanceof Error ? error.message : "page fetch failed";
  }

  const fields: ContactVisitingFieldResult[] = [];
  if (phyloc) {
    fields.push(toResult("postalAddress", parseBopPostalAddress(phyloc, input.code, sourceId, input.site), input.current?.postalAddress));
    fields.push(toResult("visitingHours", parseBopVisitingHours(phyloc, sourceId), input.current?.visitingHours));
  } else {
    for (const field of ["postalAddress", "visitingHours"] as const) {
      fields.push({
        field,
        classification: "REVIEW_REQUIRED",
        currentValue: input.current?.[field],
        evidence: `bop.gov facility data unavailable (${feedError}); nothing written.`,
        wouldWrite: false,
      });
    }
  }

  if (html) {
    let rules = parseBopVisitingRulesUrl(html, input.code, sourceId);
    if (rules.ok) {
      // The linked document must actually resolve on bop.gov before we publish it.
      const pdfUrl = rules.value.url;
      try {
        const res = await input.http(pdfUrl);
        if (!res.ok) {
          rules = { ok: false, classification: "REVIEW_REQUIRED", evidence: `Visiting PDF returned HTTP ${res.status}: ${pdfUrl}` };
        }
      } catch (error) {
        rules = {
          ok: false,
          classification: "REVIEW_REQUIRED",
          evidence: `Visiting PDF unreachable (${error instanceof Error ? error.message : "error"}): ${pdfUrl}`,
        };
      }
    }
    fields.push(toResult("visitingRulesUrl", rules, input.current?.visitingRulesUrl));
  } else {
    fields.push({
      field: "visitingRulesUrl",
      classification: "REVIEW_REQUIRED",
      currentValue: input.current?.visitingRulesUrl,
      evidence: `bop.gov facility page unavailable (${pageError}); nothing written.`,
      wouldWrite: false,
    });
  }
  return { source, fields };
}

/**
 * Write SAFE contact/visiting blocks into the US overlay entry's contactVisiting
 * (#77 shape: sources[] + fieldSources + blocks with sourceId). Merge only: existing
 * overrides, appliedAt and sourceUrl of the entry are preserved. No-op unless writesEnabled.
 */
export function applyUsContactVisiting(input: {
  countrySlug: string;
  prisonSlug: string;
  sourceUrl: string;
  source: FacilitySource;
  fields: ContactVisitingFieldResult[];
  writesEnabled: boolean;
  now: Date;
  store: OverlayStore;
}): { applied: ContactVisitingField[]; overlayWritten: boolean } {
  if (!input.writesEnabled) return { applied: [], overlayWritten: false };
  if (isUkPrison({ countrySlug: input.countrySlug }) || !isUsPrison({ countrySlug: input.countrySlug })) {
    return { applied: [], overlayWritten: false };
  }
  const safe = input.fields.filter((row) => row.classification === "SAFE_AUTO_CHANGE" && row.officialValue);
  if (safe.length === 0) return { applied: [], overlayWritten: false };
  // The shared source's checkedAt is refreshed on write, so every already-stored block must have been
  // re-confirmed (NO_CHANGE) or replaced (SAFE) in this run; otherwise write nothing.
  const unconfirmed = input.fields.some(
    (row) => row.currentValue && row.classification !== "NO_CHANGE" && row.classification !== "SAFE_AUTO_CHANGE",
  );
  if (unconfirmed) return { applied: [], overlayWritten: false };
  if (safe.some((row) => (row.officialValue as { sourceId?: string }).sourceId !== input.source.id)) {
    return { applied: [], overlayWritten: false };
  }

  const current = input.store.read() ?? emptyUsOverlay();
  if (current.generatedBy === "uk-prison-verifier") return { applied: [], overlayWritten: false };

  const countrySlug = input.countrySlug === "united-states" ? "united-states" : "us";
  const key = overlayKey(countrySlug, input.prisonSlug);
  const previous = current.entries[key];
  const prevCv = previous?.contactVisiting;
  const cv: ContactVisitingBlocks = {
    sources: [...(prevCv?.sources ?? []).filter((s) => s.id !== input.source.id), { ...input.source }],
    fieldSources: { ...prevCv?.fieldSources },
    ...(prevCv?.postalAddress ? { postalAddress: prevCv.postalAddress } : {}),
    ...(prevCv?.visitingHours ? { visitingHours: prevCv.visitingHours } : {}),
    ...(prevCv?.visitingRulesUrl ? { visitingRulesUrl: prevCv.visitingRulesUrl } : {}),
  };
  for (const row of safe) {
    (cv as Record<string, unknown>)[row.field] = row.officialValue;
    cv.fieldSources[row.field] = [input.source.id];
  }
  const stamp = isoNow(input.now);
  current.generatedBy = "us-prison-verifier";
  current.entries[key] = {
    prisonSlug: input.prisonSlug,
    countrySlug,
    appliedAt: previous?.appliedAt ?? stamp,
    sourceUrl: previous?.sourceUrl ?? input.sourceUrl,
    overrides: { ...previous?.overrides },
    contactVisiting: cv,
  };
  current.updatedAt = stamp;
  input.store.write(current);
  return { applied: safe.map((row) => row.field), overlayWritten: true };
}
