import type { Prison } from "@/types/prison";

/**
 * Clean, human-readable wording for UK (HMPPS-import) establishment type lines.
 *
 * HMPPS listing fields are terse administrative codes ("Cat B Trainer", "Mens Prison",
 * "Trainer & Resettlement"). Interpolating them verbatim produced garbled copy such as
 * "Category B Trainer · Cat B Trainer facility for Mens Prison prisoners". These helpers
 * translate the codes into plain English without repeating the category.
 *
 * Security wording rule: "high-security" is only used when the data explicitly records the
 * establishment as high security (predominant function "High Security", i.e. the Category A
 * / dispersal High Security Estate). A Category B or C site is never described as high
 * security by this logic, regardless of its administrative region or sub-group name
 * (e.g. "LONG TERM & HIGH SECURITY ESTATE").
 */

function clean(v: string | undefined | null): string {
  if (v == null) return "";
  const t = v.replace(/\s+/g, " ").trim();
  return /^none$/i.test(t) ? "" : t;
}

/** "Category A".."Category D" only; "Multi" / "Not specified" carry no category wording. */
export function ukCategoryLabel(p: Pick<Prison, "securityLevel">): string {
  const s = clean(p.securityLevel);
  return /^Category [ABCD]$/.test(s) ? s : "";
}

/** True only when the listing explicitly marks the site as high-security estate. */
export function isExplicitHighSecurity(p: Pick<Prison, "predominantFunction">): boolean {
  return /\bhigh security\b/i.test(clean(p.predominantFunction));
}

type NounKind = "trainer" | "reception" | "resettlement" | "open" | "female" | "yoi" | "youth" | "stc" | "high" | "other";

function nounKind(fn: string): NounKind {
  const f = fn.toLowerCase();
  if (/\bhigh security\b/.test(f)) return "high";
  if (/\bsecure training centre\b/.test(f)) return "stc";
  if (/\byjb\b/.test(f)) return "youth";
  if (/\byoi\b/.test(f)) return "yoi";
  if (/\bfemale\b|\bwomen/.test(f)) return "female";
  if (/\bopen\b/.test(f)) return "open";
  if (/\btrainer\b|\btraining\b/.test(f)) return "trainer";
  if (/\breception\b|\blocal\b/.test(f)) return "reception";
  if (/\bresettlement\b/.test(f)) return "resettlement";
  return "other";
}

const NOUNS: Record<NounKind, string> = {
  high: "high-security prison",
  stc: "secure training centre",
  youth: "youth custody establishment",
  yoi: "young offender institution",
  female: "women’s prison",
  open: "open prison",
  trainer: "training prison",
  reception: "local prison",
  resettlement: "resettlement prison",
  other: "prison",
};

/** Role implied by the noun, so the cohort sentence does not repeat it. */
const NOUN_ROLE: Partial<Record<NounKind, Role>> = {
  trainer: "training",
  reception: "reception",
  resettlement: "resettlement",
};

/** e.g. "Category B training prison", "young offender institution", "women’s prison". */
export function ukEstablishmentNoun(p: Pick<Prison, "securityLevel" | "predominantFunction">): string {
  const kind = nounKind(clean(p.predominantFunction));
  const cat = ukCategoryLabel(p);
  const noun = NOUNS[kind];
  // Women's and youth estates are not categorised A–D; only prefix a category when the row has one.
  return cat ? `${cat} ${noun}` : noun;
}

/** Population wording from raw HMPPS gender/cohort values ("Mens Prison" -> "adult men"). */
export function ukPopulationPhrase(p: Pick<Prison, "gender" | "cohort" | "predominantFunction">): string {
  const g = clean(p.gender).toLowerCase();
  const cohort = clean(p.cohort).toLowerCase();
  const kind = nounKind(clean(p.predominantFunction));
  if (/young people/.test(cohort) || kind === "stc" || kind === "youth" || /secure training centre/.test(g)) {
    return "young people";
  }
  const men = /\bmen'?s?\b|\bmale\b/.test(g.replace(/\bwomen'?s?\b|\bfemale\b/g, ""));
  const women = /\bwomen'?s?\b|\bfemale\b/.test(g);
  if (men && women) return "men and women";
  if (women) return kind === "female" ? "" : "women"; // avoid "women's prison for women"
  if (men) return kind === "yoi" ? "young men" : "adult men";
  return "";
}

type Role = "reception" | "training" | "resettlement" | "local";

function cohortRoles(cohort: string): { roles: Role[]; foreignNational: boolean } {
  const tokens = cohort
    .split(/,|&|\band\b/i)
    .map((t) => t.replace(/\s+/g, " ").trim().toLowerCase())
    .filter(Boolean);
  const roles: Role[] = [];
  let foreignNational = false;
  for (const t of tokens) {
    let r: Role | null = null;
    if (/^reception\b/.test(t)) r = "reception";
    else if (/^trainer\b|^training\b/.test(t)) r = "training";
    else if (/^resettlement\b/.test(t)) r = "resettlement";
    else if (/^local\b/.test(t)) r = "local";
    else if (/foreign national/.test(t)) foreignNational = true;
    if (r && !roles.includes(r)) roles.push(r);
  }
  return { roles, foreignNational };
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function withIndefiniteArticle(phrase: string): string {
  return /^[aeio]/i.test(phrase) ? `an ${phrase}` : `a ${phrase}`;
}

/** Full descriptor, e.g. "Category B training prison for adult men". */
export function ukPrisonTypeLabel(p: Prison): string {
  const noun = ukEstablishmentNoun(p);
  const pop = ukPopulationPhrase(p);
  return pop ? `${noun} for ${pop}` : noun;
}

/** Optional follow-up sentence describing extra cohort roles not implied by the noun. */
export function ukCohortSentence(p: Prison): string {
  const kind = nounKind(clean(p.predominantFunction));
  const { roles, foreignNational } = cohortRoles(clean(p.cohort));
  const implied = NOUN_ROLE[kind];
  const extra = roles.filter((r) => r !== implied && !(implied === "reception" && r === "local"));
  const out: string[] = [];
  if (extra.length) {
    const also = implied ? " also" : "";
    out.push(
      extra.length === 1
        ? `It${also} has ${withIndefiniteArticle(`${extra[0]} role`)}.`
        : `It${also} has ${joinList(extra)} roles.`,
    );
  }
  if (foreignNational) out.push("Its listed cohort is foreign national prisoners.");
  return out.join(" ");
}

/** True when the row carries HMPPS-style fields this module can describe. */
export function hasUkHmppsTypeFields(p: Prison): boolean {
  return p.countrySlug === "uk" && Boolean(clean(p.predominantFunction) || clean(p.gender));
}
