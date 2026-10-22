import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { EDITORIAL_POLICY_PATH } from "@/lib/seo/organizationJsonLd";

export const metadata = buildPageMetadata({
  title: "Editorial and sourcing policy",
  description:
    "How Prisons Online checks facility facts against GOV.UK and HM Prison and Probation Service pages and bop.gov, and how each source checked date is shown.",
  path: EDITORIAL_POLICY_PATH,
});

const linkClass = "text-accent hover:underline";

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Editorial and sourcing policy</h1>
          <p className="text-primary-foreground/70">How facility facts are checked, and what a source checked date means</p>
        </div>
      </section>
      <article className="container py-10 space-y-8 text-muted-foreground leading-relaxed">
        <p>Last updated: 22 October 2026</p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What this site is</h2>
          <p>
            Prisons Online is an independent directory of prisons and related public information. It is separate from HM Prison and Probation Service, the Scottish Prison Service, the Northern Ireland Prison Service, the US Federal Bureau of Prisons, state departments of corrections, courts, and law firms. Profiles that list an official source also say that Prisons Online is an independent directory. Nothing here is legal advice or an official instruction about a particular prisoner.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">United Kingdom: HMPPS records and GOV.UK checks</h2>
          <p>
            UK prison rows start as an import of HM Prison and Probation Service data. That import is the baseline for the listing: name, address, operator, and the other directory fields. A later check compares those published facts with an authoritative GOV.UK page.
          </p>
          <p className="mt-3">
            An authoritative UK page is an HTTPS URL on gov.uk, justice.gov.uk, or hmpps.gov.uk. Prison guidance is the usual page, including guidance published for{" "}
            <a className={linkClass} href="https://www.gov.uk/government/organisations/hm-prison-and-probation-service" rel="noopener noreferrer" target="_blank">
              HM Prison and Probation Service
            </a>
            . The checker looks first for a GOV.UK URL already stored for that prison, then for a match in the{" "}
            <a className={linkClass} href="https://www.gov.uk/government/collections/prisons-in-england-and-wales" rel="noopener noreferrer" target="_blank">
              GOV.UK prisons in England and Wales collection
            </a>
            , then for a GOV.UK search result limited to HM Prison and Probation Service, the Ministry of Justice, or HM Prison Service. When none of those identifies a page, the prison is left without a replacement source.
          </p>
          <p className="mt-3">
            Wikipedia, commercial directories, and social networks can suggest that a page exists. Published facts are updated from an authoritative government page. Contact, visiting, and prisoner-contact details that are shown as verified are taken from the GOV.UK guidance page for that prison.
          </p>
          <p className="mt-3">
            A few England and Wales profiles also link an operator page that was opened for a legal-visit route. Those pages include the Serco legal-visits page for HMP Thameside and the Sodexo visitor pages for HMP Peterborough. Each of those links is shown with its own checked date and supports only the fields listed under it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">United States: bop.gov and identified authorities</h2>
          <p>
            Federal facilities imported from the Bureau of Prisons, and facilities whose published operator is the Federal Bureau of Prisons, are checked against{" "}
            <a className={linkClass} href="https://www.bop.gov/" rel="noopener noreferrer" target="_blank">
              bop.gov
            </a>
            . The checker matches the facility to the official BOP locations directory and to that facility&apos;s page on bop.gov. A missing or ambiguous directory match is left for review, and the published facts stay as they are.
          </p>
          <p className="mt-3">
            Inmate mail addresses, visiting hours, and visiting-rules links that are shown as verified come from the bop.gov page for that facility. On the profile that source is named Federal Bureau of Prisons, with the date the page was checked.
          </p>
          <p className="mt-3">
            A state or city department is used when the operator already published on the record matches an official authority the checker identifies, and the page is on that authority&apos;s official site. The current matches include the California Department of Corrections and Rehabilitation, the New York State Department of Corrections and Community Supervision, the Louisiana Department of Public Safety and Corrections, and the New York City Department of Correction. The published operator has to match before that site is used. When the authority cannot be identified, the record is left for review. Wikipedia and commercial directories stay outside the sources that can overwrite a published fact.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What you see on a profile</h2>
          <p>
            When a UK or US profile has been checked, the Official information list shows the source name, a link, the date that source was opened and compared, and the fields that source supports. The date line reads &quot;Source checked&quot; followed by that date. Only the fields named under the source were verified in that check. Other displayed fields remain values from the directory import.
          </p>
          <p className="mt-3">
            A profile with no linked primary source says that those directory fields have not yet been individually verified against a linked primary source.
          </p>
          <p className="mt-3">
            Profiles for other countries that store an official source URL show that source. When the record also stores a checked date, the page says the details were checked against that source on that date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Checked dates</h2>
          <p>
            A checked date is the date the source was opened and compared with the facts displayed for that facility. It is stored on the source. Where the government page prints its own update date, that publisher date is kept separately and is not substituted for the checked date.
          </p>
          <p className="mt-3">
            After a written update, the checked date shown for that source is the date the official value was applied.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What a check can change</h2>
          <p>
            Each compared field is recorded as matching, differing, or absent on the official page. When the official page omits a value, the directory value stays. A difference in the prison name is recorded for review and is left unpublished as an automatic change.
          </p>
          <p className="mt-3">
            Writing results back to the public directory stays off unless that verification run is explicitly set to write. The fields that run can write are telephone, postcode or ZIP, and email, and only when the official page states the value unambiguously. The HMPPS import, the BOP import, profile prose, titles, and URL slugs stay as they are.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Guides and articles</h2>
          <p>
            Guides and articles explain a process in general, such as how visits are booked in England and Wales through the GOV.UK prison visits service. Facility-specific addresses, phones, and visiting arrangements are on the prison profile and on the official page that profile links. Those details change. Confirm anything you will rely on with the authority that runs the facility.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Corrections</h2>
          <p>
            Use the <Link className={linkClass} href="/contact">contact form</Link> to report a correction. The form is for the directory, a correction, or a privacy request. Prisons Online cannot look up a prisoner, change an official government record, or give legal advice.
          </p>
        </section>
      </article>
    </div>
  );
}
