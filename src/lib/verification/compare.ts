import type { FieldDiff, MissingOfficialField, OfficialFacts, PublishedFacts, VerifiableField } from "./types";
import {
  addressesEquivalent,
  collapseSpace,
  emailsEqual,
  namesEquivalent,
  phonesEqual,
  postcodesEqual,
} from "./normalize";
import { canOverrideFromSourceUrl } from "./sourcePolicy";

const SAFE_FIELDS = new Set<VerifiableField>(["phone", "postcode", "email"]);

function present(value?: string): string | undefined {
  const v = collapseSpace(value);
  return v ? v : undefined;
}

function diff(partial: Omit<FieldDiff, "wouldAutoApply"> & { writesEnabled?: boolean }): FieldDiff {
  const wouldAutoApply = partial.classification === "SAFE_AUTO_CHANGE";
  return { ...partial, wouldAutoApply };
}

function categoriesCompatible(current?: string, official?: string): boolean {
  const cur = (current ?? "").toLowerCase();
  const off = (official ?? "").toLowerCase();
  if (!cur || !off) return true;
  if (cur === off) return true;
  if (cur.includes("category a") && (off.includes("high security") || off.includes("category a"))) return true;
  if (cur.includes("category d") && off.includes("open")) return true;
  if (off.includes("category a") && cur.includes("high")) return true;
  if (off.includes("category c") && cur.includes("category c")) return true;
  if (off.includes("category b") && cur.includes("category b")) return true;
  return false;
}

export function compareFacts(input: {
  published: PublishedFacts;
  official: OfficialFacts;
  sourceUrl: string;
}): { fields: FieldDiff[]; missingOfficialFields: MissingOfficialField[] } {
  const { published, official, sourceUrl } = input;
  const govOk = canOverrideFromSourceUrl(sourceUrl);
  const fields: FieldDiff[] = [];

  const currentName = present(published.name);
  const officialName = present(official.officialName);
  if (!officialName) {
    fields.push(
      diff({
        field: "name",
        classification: "NO_CHANGE",
        currentValue: currentName,
        evidence: "Official page did not expose a comparable title; existing name kept.",
        confidence: "medium",
      }),
    );
  } else if (namesEquivalent(currentName, officialName)) {
    fields.push(
      diff({
        field: "name",
        classification: "NO_CHANGE",
        currentValue: currentName,
        officialValue: officialName,
        evidence: "Official name matches after HMP/Prison normalisation.",
        confidence: "high",
      }),
    );
  } else {
    fields.push(
      diff({
        field: "name",
        classification: "REVIEW_REQUIRED",
        currentValue: currentName,
        officialValue: officialName,
        evidence: "Official name differs after normalisation. Possible mismatch or typo — not auto-applied.",
        confidence: "medium",
      }),
    );
  }

  const currentAddress = present(published.address);
  const officialAddress = present(official.address);
  if (!officialAddress) {
    fields.push(
      diff({
        field: "address",
        classification: "NO_CHANGE",
        currentValue: currentAddress,
        evidence: "GOV.UK omitted an address. Existing value is not treated as wrong and is not deleted.",
        confidence: "high",
      }),
    );
  } else if (!currentAddress) {
    fields.push(
      diff({
        field: "address",
        classification: "REVIEW_REQUIRED",
        officialValue: officialAddress,
        evidence: "Official address exists and we publish none. Filling a blank address is queued for review rather than auto-applied.",
        confidence: "medium",
      }),
    );
  } else if (addressesEquivalent(currentAddress, officialAddress)) {
    fields.push(
      diff({
        field: "address",
        classification: "NO_CHANGE",
        currentValue: currentAddress,
        officialValue: officialAddress,
        evidence: "Address tokens match the official contact address.",
        confidence: "high",
      }),
    );
  } else {
    fields.push(
      diff({
        field: "address",
        classification: "REVIEW_REQUIRED",
        currentValue: currentAddress,
        officialValue: officialAddress,
        evidence: "Address strings differ enough to risk a destructive edit. Queued for review.",
        confidence: "medium",
      }),
    );
  }

  const currentPostcode = present(published.postcode);
  const officialPostcode = present(official.postcode);
  if (!officialPostcode) {
    fields.push(
      diff({
        field: "postcode",
        classification: "NO_CHANGE",
        currentValue: currentPostcode,
        evidence: "GOV.UK omitted a postcode. Existing value is not auto-deleted.",
        confidence: "high",
      }),
    );
  } else if (!currentPostcode) {
    fields.push(
      diff({
        field: "postcode",
        classification: govOk ? "SAFE_AUTO_CHANGE" : "REVIEW_REQUIRED",
        officialValue: officialPostcode,
        evidence: "Official postcode present and we publish none.",
        confidence: "high",
      }),
    );
  } else if (postcodesEqual(currentPostcode, officialPostcode)) {
    fields.push(
      diff({
        field: "postcode",
        classification: "NO_CHANGE",
        currentValue: currentPostcode,
        officialValue: officialPostcode,
        evidence: "Postcode matches after normalisation.",
        confidence: "high",
      }),
    );
  } else {
    fields.push(
      diff({
        field: "postcode",
        classification: govOk ? "SAFE_AUTO_CHANGE" : "REVIEW_REQUIRED",
        currentValue: currentPostcode,
        officialValue: officialPostcode,
        evidence: govOk
          ? "Clear postcode replacement from the official GOV.UK contact address."
          : "Non-government evidence cannot override postcode.",
        confidence: "high",
      }),
    );
  }

  const currentPhone = present(published.phone);
  const officialPhone = present(official.phone);
  if (!officialPhone) {
    fields.push(
      diff({
        field: "phone",
        classification: "NO_CHANGE",
        currentValue: currentPhone,
        evidence: "GOV.UK contact block did not include a switchboard number. Existing phone is not deleted.",
        confidence: "high",
      }),
    );
  } else if (!currentPhone) {
    fields.push(
      diff({
        field: "phone",
        classification: govOk ? "SAFE_AUTO_CHANGE" : "REVIEW_REQUIRED",
        officialValue: officialPhone,
        evidence: "Official contact telephone present and we publish none.",
        confidence: "high",
      }),
    );
  } else if (phonesEqual(currentPhone, officialPhone)) {
    fields.push(
      diff({
        field: "phone",
        classification: "NO_CHANGE",
        currentValue: currentPhone,
        officialValue: officialPhone,
        evidence: "Telephone matches after digit normalisation.",
        confidence: "high",
      }),
    );
  } else {
    fields.push(
      diff({
        field: "phone",
        classification: govOk ? "SAFE_AUTO_CHANGE" : "REVIEW_REQUIRED",
        currentValue: currentPhone,
        officialValue: officialPhone,
        evidence: govOk
          ? "Clear telephone replacement from the GOV.UK Contact section (not the visits booking line)."
          : "Non-government evidence cannot override telephone.",
        confidence: "high",
      }),
    );
  }

  const currentEmail = present(published.email);
  const officialEmail = present(official.email);
  if (!officialEmail) {
    fields.push(
      diff({
        field: "email",
        classification: "NO_CHANGE",
        currentValue: currentEmail,
        evidence: "GOV.UK omitted an establishment email. Existing value is not deleted.",
        confidence: "high",
      }),
    );
  } else if (!currentEmail) {
    fields.push(
      diff({
        field: "email",
        classification: govOk ? "SAFE_AUTO_CHANGE" : "REVIEW_REQUIRED",
        officialValue: officialEmail,
        evidence: "Official contact email can be stored on the existing facility overlay email field.",
        confidence: "high",
      }),
    );
  } else if (emailsEqual(currentEmail, officialEmail)) {
    fields.push(
      diff({
        field: "email",
        classification: "NO_CHANGE",
        currentValue: currentEmail,
        officialValue: officialEmail,
        evidence: "Email matches.",
        confidence: "high",
      }),
    );
  } else {
    fields.push(
      diff({
        field: "email",
        classification: govOk ? "SAFE_AUTO_CHANGE" : "REVIEW_REQUIRED",
        currentValue: currentEmail,
        officialValue: officialEmail,
        evidence: "Official contact email differs from the published overlay value.",
        confidence: "high",
      }),
    );
  }

  const currentOperator = present(published.operator);
  const officialOperator = present(official.operator);
  if (!officialOperator) {
    fields.push(
      diff({
        field: "operator",
        classification: "NO_CHANGE",
        currentValue: currentOperator,
        evidence:
          "GOV.UK did not publish a comparable operator field (publishing organisation is not the prison operator). Existing value kept.",
        confidence: "high",
      }),
    );
  } else if (!currentOperator || currentOperator.toLowerCase() === officialOperator.toLowerCase()) {
    fields.push(
      diff({
        field: "operator",
        classification: "NO_CHANGE",
        currentValue: currentOperator,
        officialValue: officialOperator,
        evidence: "Operator matches the official mention.",
        confidence: "medium",
      }),
    );
  } else {
    fields.push(
      diff({
        field: "operator",
        classification: "REVIEW_REQUIRED",
        currentValue: currentOperator,
        officialValue: officialOperator,
        evidence: "Operator disagreement is substantial and can affect hub membership. Not auto-applied.",
        confidence: "medium",
      }),
    );
  }

  const currentCategory = present(published.category);
  const officialCategory = present(official.category);
  if (!officialCategory) {
    fields.push(
      diff({
        field: "category",
        classification: "NO_CHANGE",
        currentValue: currentCategory,
        evidence: "GOV.UK did not publish a structured security category. Inferred HMPPS mapping is left unchanged.",
        confidence: "high",
      }),
    );
  } else if (categoriesCompatible(currentCategory, officialCategory)) {
    fields.push(
      diff({
        field: "category",
        classification: "NO_CHANGE",
        currentValue: currentCategory,
        officialValue: officialCategory,
        evidence: "Official wording is compatible with the published category.",
        confidence: "medium",
      }),
    );
  } else {
    fields.push(
      diff({
        field: "category",
        classification: "REVIEW_REQUIRED",
        currentValue: currentCategory,
        officialValue: officialCategory,
        evidence: "Category wording conflicts. Security-level mapping is inferred and never auto-overwritten.",
        confidence: "low",
      }),
    );
  }

  if (!govOk) {
    for (let i = 0; i < fields.length; i += 1) {
      if (fields[i].classification === "SAFE_AUTO_CHANGE") {
        fields[i] = {
          ...fields[i],
          classification: "REVIEW_REQUIRED",
          wouldAutoApply: false,
          evidence: `${fields[i].evidence} Blocked: source is not an authoritative UK government URL.`,
        };
      }
    }
  }

  const missingOfficialFields: MissingOfficialField[] = [];
  if (official.governor) {
    missingOfficialFields.push({
      field: "governor",
      officialValue: official.governor,
      note: "GOV.UK publishes a governor name; we have no governor field. Reported only — not invented on the prison model.",
    });
  }
  if (official.visitingTelephone) {
    missingOfficialFields.push({
      field: "visitingTelephone",
      officialValue: official.visitingTelephone,
      note: "GOV.UK publishes a visits booking number separate from the establishment switchboard. No dedicated field exists.",
    });
  }
  if (official.gettingThere) {
    missingOfficialFields.push({
      field: "gettingThere",
      officialValue: official.gettingThere.slice(0, 160),
      note: "GOV.UK publishes getting-there notes. We do not add this as a new schema field.",
    });
  }

  return { fields, missingOfficialFields };
}

export function overallStatus(fields: FieldDiff[], failed: boolean): "CURRENT" | "CHANGED" | "REVIEW_REQUIRED" | "VERIFICATION_FAILED" {
  if (failed) return "VERIFICATION_FAILED";
  if (fields.some((f) => f.classification === "REVIEW_REQUIRED")) return "REVIEW_REQUIRED";
  if (fields.some((f) => f.classification === "SAFE_AUTO_CHANGE")) return "CHANGED";
  return "CURRENT";
}

export function safeAutoChanges(fields: FieldDiff[]): FieldDiff[] {
  return fields.filter((f) => f.classification === "SAFE_AUTO_CHANGE" && SAFE_FIELDS.has(f.field));
}

export function minConfidence(fields: FieldDiff[]): "high" | "medium" | "low" | "none" {
  if (fields.length === 0) return "none";
  if (fields.some((f) => f.confidence === "low")) return "low";
  if (fields.some((f) => f.confidence === "medium")) return "medium";
  return "high";
}

export function isSafeAutoField(field: VerifiableField): boolean {
  return SAFE_FIELDS.has(field);
}
