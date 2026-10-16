import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Terms of Use",
  description: "Terms for using Prisons Online, including directory information, Google AdSense, and Google Analytics.",
  path: "/terms",
});

const linkClass = "text-accent hover:underline";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
          <p className="text-primary-foreground/70">Terms for using Prisons Online</p>
        </div>
      </section>
      <article className="container max-w-3xl py-10 space-y-8 text-muted-foreground leading-relaxed">
        <p>Last updated: 16 October 2026</p>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Agreement</h2>
          <p>
            These terms apply to your use of prisonsonline.com, wherever you access it. By using the site you agree to them. If you do not agree, do not use the site. Mandatory consumer or privacy rights in your country still apply. The <Link className={linkClass} href="/privacy">Privacy Policy</Link> and <Link className={linkClass} href="/cookies">Cookie Policy</Link> explain personal information, Google Analytics 4, and Google AdSense, and form part of these terms for that subject.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What the site is</h2>
          <p>
            Prisons Online is an independent educational directory. It is not HM Prison and Probation Service, the Scottish Prison Service, the Northern Ireland Prison Service, the US Bureau of Prisons, any state department of corrections, a court, or a law firm. Nothing on the site is legal advice, official visiting advice, or an instruction about a particular prisoner. Addresses, regimes, visiting rules, and phone numbers change. Confirm anything you intend to rely on with the authority that runs the facility.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Advertising</h2>
          <p>
            Some pages show ads through Google AdSense after marketing consent, as described in the Cookie Policy. Ads are provided by Google and by advertisers. We do not control, endorse, or guarantee ads, the sites they link to, or products they promote. Ad content can differ by country, language, and the consents and ad settings on your Google account. An ad appearing next to a prison page does not mean that prison, or any government, is connected with the advertiser.
          </p>
          <p className="mt-3">
            You must not click ads except out of genuine interest, encourage others to click ads, or use automated means to view or click them. That kind of activity breaches these terms and Google&apos;s advertising rules. Where the law lets you refuse advertising cookies, you can do that in Privacy settings and still use the directory.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Analytics</h2>
          <p>
            After measurement consent, Google Analytics 4 measures how the site is used, including pages and events such as searches and link clicks. We use those reports to operate and improve the directory. We do not sell Analytics reports that identify you. Rejecting measurement consent stops that tag on later loads.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Break the law, or help someone else break the law, by using the site</li>
            <li>Try to disrupt, probe, or bypass security, rate limits, or consent controls</li>
            <li>Scrape, harvest, or mirror the site in a way that degrades it for other people, or ignore robot rules to do that</li>
            <li>Send malware, or use the contact form for spam, phishing, or to impersonate another person</li>
            <li>Post or transmit another person&apos;s private information without a proper basis</li>
            <li>Use the site to locate a person in order to harass, threaten, or harm them</li>
          </ul>
          <p className="mt-3">We may block access, remove a message, or report abuse when we reasonably believe these terms have been broken.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Information you send us</h2>
          <p>
            If you use the contact form, you confirm that what you send is accurate to the best of your knowledge and that you have any permission needed to include another person&apos;s details. Do not send confidential case papers or special-category information unless you need to for a privacy request. We use the message to respond and to keep ordinary records, as the Privacy Policy describes. You keep ownership of your message. You give us permission to store and process it for those purposes.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Our content and other sites</h2>
          <p>
            The directory text, compilation, and site design are protected by copyright and database rights. You may share links to pages and quote short extracts with attribution. You may not copy the directory in bulk or present it as your own service. Facility names and official facts are used for information. Photographs are credited where a credit is shown and may be under a separate licence.
          </p>
          <p className="mt-3">
            Links to official services, maps, and advertisers leave this site, or load a third party such as OpenStreetMap tiles or Google advertising. Those services have their own terms. We are not responsible for them.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">No warranty</h2>
          <p>
            The site is provided as available and as an information aid. We do not warrant that listings are complete, current, or free of error, that the site will be uninterrupted, or that ads and analytics scripts will load in every country. To the extent the law allows, we exclude implied warranties of accuracy, fitness for a particular purpose, and non-infringement. We do not exclude warranties or rights that the law of your country says cannot be excluded.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Liability</h2>
          <p>
            To the extent the law allows, Prisons Online is not liable for loss of profit, loss of data, or indirect or consequential loss arising from use of the site, from reliance on a listing, or from a third-party ad or link. Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for any other liability that cannot legally be limited. If you are a consumer, you also keep any remedies you have under the law where you live.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Law and disputes</h2>
          <p>
            These terms are governed by the laws of England and Wales. Courts in England and Wales can hear disputes, except that if you live in another country you may also use any mandatory right to bring a claim in your local courts, and you keep any mandatory protection of your local consumer law. Privacy complaints can go to the regulator named in the Privacy Policy as well as, or instead of, a court.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Changes</h2>
          <p>
            We may change these terms, the directory, or the advertising and analytics tools. The date above changes when these terms change. The new terms apply from your next visit. If a change is not acceptable to you, stop using the site.
          </p>
          <p className="mt-3">
            Questions about these terms can be sent through the <Link className={linkClass} href="/contact">contact page</Link>.
          </p>
        </section>
      </article>
    </div>
  );
}
