import { collapseSpace } from "./normalize";
import type { PrisonVerificationInput, UsAuthorityKind, UsAuthoritySummary } from "./types";

export interface ResolvedUsAuthority {
  ok: true;
  kind: UsAuthorityKind;
  name: string;
  jurisdiction?: string;
  allowedHosts: readonly string[];
  pathPrefix?: string;
  evidence: string;
}

export interface UnresolvedUsAuthority {
  ok: false;
  reason: string;
  summary: UsAuthoritySummary;
}

export type UsAuthorityResolution = ResolvedUsAuthority | UnresolvedUsAuthority;

interface StateAuthoritySpec {
  kind: UsAuthorityKind;
  name: string;
  jurisdiction: string;
  allowedHosts: readonly string[];
  pathPrefix?: string;
  operatorPattern: RegExp;
}

/**
 * Curated official US corrections authorities. Geography alone never selects
 * one of these — the published operator (or BOP import provenance) must match.
 */
const STATE_AND_LOCAL_AUTHORITIES: readonly StateAuthoritySpec[] = [
  {
    kind: "state-corrections",
    name: "California Department of Corrections and Rehabilitation",
    jurisdiction: "CA",
    allowedHosts: ["cdcr.ca.gov", "www.cdcr.ca.gov"],
    operatorPattern: /\bcalifornia department of corrections(?: and rehabilitation)?\b/i,
  },
  {
    kind: "state-corrections",
    name: "New York State Department of Corrections and Community Supervision",
    jurisdiction: "NY",
    allowedHosts: ["doccs.ny.gov", "www.doccs.ny.gov"],
    operatorPattern: /\bnew york state department of corrections(?: and community supervision)?\b/i,
  },
  {
    kind: "state-corrections",
    name: "Louisiana Department of Public Safety and Corrections",
    jurisdiction: "LA",
    allowedHosts: ["doc.la.gov", "www.doc.la.gov"],
    operatorPattern: /\blouisiana department of public safety(?: and corrections)?\b/i,
  },
  {
    kind: "local-corrections",
    name: "New York City Department of Correction",
    jurisdiction: "NYC",
    allowedHosts: ["nyc.gov", "www.nyc.gov"],
    pathPrefix: "/site/doc",
    operatorPattern: /\bnew york city department of correction\b/i,
  },
];

const BOP_OPERATOR = /\bfederal bureau of prisons\b/i;
const CLOSED_MARKER = /\bclosed\b/i;

function review(reason: string): UnresolvedUsAuthority {
  return {
    ok: false,
    reason,
    summary: {
      identified: false,
      allowedHosts: [],
      evidence: reason,
      reviewRequired: true,
    },
  };
}

function operatorText(prison: PrisonVerificationInput): string {
  return collapseSpace(prison.operator);
}

function isBopImport(prison: PrisonVerificationInput): boolean {
  return prison.dataProvenance === "bop_import" || prison.countrySlug === "us";
}

function matchingStateAuthorities(operator: string): StateAuthoritySpec[] {
  if (!operator) return [];
  return STATE_AND_LOCAL_AUTHORITIES.filter((spec) => spec.operatorPattern.test(operator));
}

/**
 * Identify the official US authority from the published record only.
 * Does not consult Wikipedia, directories, or the open web.
 *
 * Federal (BOP import / Federal Bureau of Prisons) → BOP.
 * State/local → the matching official corrections host allowlist.
 * Geography (California, New York, …) is never enough on its own.
 */
export function resolveUsAuthority(prison: PrisonVerificationInput): UsAuthorityResolution {
  if (prison.countrySlug === "uk") {
    return review("US authority resolver refuses UK records.");
  }

  const operator = operatorText(prison);
  const stateHits = matchingStateAuthorities(operator);
  const bopOperator = BOP_OPERATOR.test(operator);
  const closed = CLOSED_MARKER.test(operator);
  const federalDirectory = isBopImport(prison);

  if (stateHits.length > 1) {
    return review(
      `Published operator matched more than one corrections authority (${stateHits.map((s) => s.name).join("; ")}). Not guessing. REVIEW_REQUIRED.`,
    );
  }

  if (stateHits.length === 1 && (bopOperator || federalDirectory)) {
    return review(
      `Published record mixes federal BOP signals with ${stateHits[0].name}. Authority is ambiguous. REVIEW_REQUIRED — no web consensus.`,
    );
  }

  if (stateHits.length === 1) {
    const spec = stateHits[0];
    return {
      ok: true,
      kind: spec.kind,
      name: spec.name,
      jurisdiction: spec.jurisdiction,
      allowedHosts: spec.allowedHosts,
      pathPrefix: spec.pathPrefix,
      evidence: `Published operator identifies ${spec.name}. Only ${spec.allowedHosts.join(", ")} may override.`,
    };
  }

  if (closed && bopOperator) {
    return review(
      "Published operator is Federal Bureau of Prisons but marked closed. Current operational authority is not confidently BOP. REVIEW_REQUIRED.",
    );
  }

  if (bopOperator || federalDirectory) {
    return {
      ok: true,
      kind: "federal-bop",
      name: "Federal Bureau of Prisons",
      jurisdiction: "US",
      allowedHosts: ["bop.gov", "www.bop.gov"],
      evidence: federalDirectory
        ? "BOP federal directory provenance. Only bop.gov may override."
        : "Published operator is the Federal Bureau of Prisons. Only bop.gov may override.",
    };
  }

  if (!operator) {
    return review(
      "No published operator or BOP import provenance. State vs federal authority cannot be established from geography. REVIEW_REQUIRED — no web consensus.",
    );
  }

  return review(
    `Published operator "${operator}" is not a curated official US corrections authority. Not inferring from Wikipedia, directories, or the facility's US state. REVIEW_REQUIRED.`,
  );
}

export function authoritySummary(resolution: UsAuthorityResolution): UsAuthoritySummary {
  if (!resolution.ok) return resolution.summary;
  return {
    identified: true,
    kind: resolution.kind,
    name: resolution.name,
    jurisdiction: resolution.jurisdiction,
    allowedHosts: [...resolution.allowedHosts],
    evidence: resolution.evidence,
    reviewRequired: false,
  };
}

export function usCategoriesCompatible(current?: string, official?: string): boolean {
  const cur = (current ?? "").toLowerCase();
  const off = (official ?? "").toLowerCase();
  if (!cur || !off) return true;
  if (cur === off) return true;
  if (off === "n/a" && (cur === "multi" || cur === "not specified")) return true;
  if (cur === "multi" && (off === "administrative" || off === "n/a")) return true;
  if (cur === "low" && (off === "minimum" || off === "low")) return true;
  if (cur === "minimum" && (off === "minimum" || off === "low")) return true;
  if (cur === "medium" && off === "medium") return true;
  if (cur === "high" && (off === "high" || off === "maximum")) return true;
  if (cur === "maximum" && (off === "maximum" || off === "high")) return true;
  if (cur === "supermax" && (off.includes("admin") || off.includes("maximum") || off.includes("admax"))) {
    return true;
  }
  return false;
}
