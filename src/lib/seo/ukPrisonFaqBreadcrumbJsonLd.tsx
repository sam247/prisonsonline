import type { FacilityVerificationRecord } from "@/types/facilitySource";
import type { Prison } from "@/types/prison";
import { getFacilityVerification } from "@/data/facilitySources";
import { getBaseUrl } from "@/lib/site";
import { buildIntentPageTitle } from "@/lib/seo/prisonIntentCopy";
import { contactVisitingRecord, verifiedBlock } from "@/lib/seo/prisonContactVisiting";

/**
 * FAQPage + BreadcrumbList for UK prison profiles and contact-details pages.
 * Every answer is a verified record value. A missing or unverified field adds no question.
 */

export type UkPrisonSchemaPage = "profile" | "contact-details";

const QUESTIONS = {
  address: "What is the address?",
  postcode: "What is the postcode?",
  phone: "What is the phone number?",
  email: "What is the email address?",
  postalAddress: "What is the postal address for letters?",
  bookingMethods: "Which visit booking methods are listed?",
  bookingUrl: "What is the visit booking page?",
  bookingPhone: "What is the visits booking line?",
  bookingPhoneHours: "What are the visits booking line hours?",
  bookingEmail: "What is the visits booking email?",
  bookingEnquiriesEmail: "What is the visits enquiries email?",
  bookingNote: "What is the visit booking note?",
  postInstructions: "What are the letter instructions?",
  emailAPrisoner: "What is the email a prisoner page?",
  sendMoney: "What is the send money page?",
  visitingHours: "What are the visiting hours?",
  visitingHoursNote: "What is the visiting hours note?",
  visitingRules: "What is the visiting rules page?",
} as const;

type FaqQuestion = {
  "@type": "Question";
  name: string;
  acceptedAnswer: { "@type": "Answer"; text: string };
};

function clean(value?: string | null): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  return /^(none|n\/a|null|undefined|-)$/i.test(text) ? "" : text;
}

function question(name: string, text?: string | null): FaqQuestion | undefined {
  const answer = (text ?? "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim();
  if (!answer || /^(none|n\/a|null|undefined|-)$/i.test(answer)) return undefined;
  return { "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: answer } };
}

function verifiedText(
  record: FacilityVerificationRecord | undefined,
  field: "address" | "postcode" | "phone" | "email",
  value?: string | null,
): string {
  if (!record?.fieldSources?.[field]?.length) return "";
  return clean(value);
}

function faqQuestions(prison: Prison, record: FacilityVerificationRecord | undefined): FaqQuestion[] {
  const items: Array<FaqQuestion | undefined> = [];

  items.push(question(QUESTIONS.address, verifiedText(record, "address", prison.address)));
  items.push(question(QUESTIONS.postcode, verifiedText(record, "postcode", prison.postcode)));
  items.push(question(QUESTIONS.phone, verifiedText(record, "phone", prison.phone)));
  items.push(question(QUESTIONS.email, verifiedText(record, "email", record?.overrides?.email)));

  const postal = verifiedBlock(record, "postalAddress");
  if (postal) {
    const lines = [postal.recipientFormat, ...postal.lines, postal.postcode].map(clean).filter(Boolean);
    if (lines.length) items.push(question(QUESTIONS.postalAddress, lines.join("\n")));
  }

  const booking = verifiedBlock(record, "visitBooking");
  if (booking) {
    if (booking.methods.length) items.push(question(QUESTIONS.bookingMethods, booking.methods.join(", ")));
    items.push(question(QUESTIONS.bookingUrl, booking.url));
    items.push(question(QUESTIONS.bookingPhone, booking.phone));
    items.push(question(QUESTIONS.bookingPhoneHours, booking.phoneHours));
    items.push(
      question(
        booking.emailEnquiriesOnly ? QUESTIONS.bookingEnquiriesEmail : QUESTIONS.bookingEmail,
        booking.email,
      ),
    );
    items.push(question(QUESTIONS.bookingNote, booking.note));
  }

  const contact = verifiedBlock(record, "prisonerContact");
  if (contact) {
    items.push(question(QUESTIONS.postInstructions, contact.postInstructions));
    items.push(question(QUESTIONS.emailAPrisoner, contact.emailAPrisonerUrl));
    items.push(question(QUESTIONS.sendMoney, contact.sendMoneyUrl));
  }

  const hours = verifiedBlock(record, "visitingHours");
  if (hours) {
    const schedule = hours.schedule.map(clean).filter(Boolean);
    if (schedule.length) items.push(question(QUESTIONS.visitingHours, schedule.join("\n")));
    items.push(question(QUESTIONS.visitingHoursNote, hours.note));
  }

  const rules = verifiedBlock(record, "visitingRulesUrl");
  if (rules) items.push(question(QUESTIONS.visitingRules, rules.url));

  return items.filter((item): item is FaqQuestion => Boolean(item));
}

function breadcrumb(prison: Prison, page: UkPrisonSchemaPage, base: string) {
  const profilePath = `/prisons/${prison.countrySlug}/${prison.slug}`;
  const items = [
    { name: "Prisons", path: "/prisons" },
    { name: prison.country, path: `/prisons/${prison.countrySlug}` },
    { name: prison.name, path: profilePath },
  ];
  if (page === "contact-details") {
    items.push({
      name: buildIntentPageTitle(prison, "contact-details"),
      path: `${profilePath}/contact-details`,
    });
  }
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}

export function ukPrisonFaqBreadcrumbJsonLd(
  prison: Prison,
  page: string,
  verification?: FacilityVerificationRecord,
) {
  if (prison.countrySlug !== "uk") return null;
  if (page !== "profile" && page !== "contact-details") return null;

  const record = contactVisitingRecord(
    prison,
    verification ?? getFacilityVerification(prison.countrySlug, prison.slug),
  );
  const mainEntity = faqQuestions(prison, record);
  const graph: Record<string, unknown>[] = [breadcrumb(prison, page, getBaseUrl())];
  if (mainEntity.length) {
    graph.push({ "@type": "FAQPage", mainEntity });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function UkPrisonFaqBreadcrumbJsonLd({ prison, page }: { prison: Prison; page: string }) {
  const data = ukPrisonFaqBreadcrumbJsonLd(prison, page);
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
