import { getBaseUrl, siteName } from "@/lib/site";

/** Public editorial and sourcing policy. Linked from the footer and Organization JSON-LD. */
export const EDITORIAL_POLICY_PATH = "/editorial-policy";

/**
 * Site-wide Organization node. No named people: the repo does not publish
 * authors or reviewers for the directory.
 */
export function organizationJsonLd() {
  const base = getBaseUrl();
  const policyUrl = `${base}${EDITORIAL_POLICY_PATH}`;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: siteName,
    url: base,
    description:
      "Independent prison directory. UK facility checks use GOV.UK and HM Prison and Probation Service pages. US federal checks use bop.gov. Each checked source keeps the date it was compared with the facts on the page.",
    logo: {
      "@type": "ImageObject",
      url: `${base}/logo-full.png`,
    },
    publishingPrinciples: policyUrl,
    correctionsPolicy: policyUrl,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "corrections",
      url: `${base}/contact`,
    },
  };
}
