import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "How Prisons Online collects, uses, and shares personal information, including Google Analytics 4 and Google AdSense.",
  path: "/privacy",
});

const linkClass = "text-accent hover:underline";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-primary-foreground/70">How Prisons Online handles personal information</p>
        </div>
      </section>
      <article className="container max-w-3xl py-10 space-y-8 text-muted-foreground leading-relaxed">
        <p>Last updated: 16 October 2026</p>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Who we are</h2>
          <p>
            Prisons Online (prisonsonline.com) is an independent informational directory. This policy applies to visitors anywhere in the world. We are the controller of personal information we collect through the site, except where a named provider acts as an independent controller, which we identify below. Contact us through the <Link className={linkClass} href="/contact">contact form</Link> for privacy requests.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Information we collect</h2>
          <p className="mb-3">Information you give us on the contact form:</p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Name, email address, and message</li>
            <li>Phone number, if you choose to provide one</li>
            <li>The page you submitted from, the referring page, and advertising click identifiers in the address bar when present (such as utm parameters, gclid, fbclid, or msclkid)</li>
          </ul>
          <p className="mb-3">Information collected automatically when you use the site:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address, approximate location derived from it, date and time, browser, device, operating system, language, and the pages and files requested</li>
            <li>Security and diagnostic logs kept by our host</li>
            <li>Cookie and similar-technology data described in the <Link className={linkClass} href="/cookies">Cookie Policy</Link>, only for the categories you allow</li>
          </ul>
          <p className="mt-3">We do not ask you to create an account. We do not knowingly collect government identity numbers, precise GPS location, or information about your criminal record. Directory pages describe facilities, not the people reading them.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Google Analytics 4</h2>
          <p>
            With measurement consent, we use Google Analytics 4, provided by Google LLC, measurement ID G-RCEGDLDF2C. The Google tag is not requested until that category is allowed. Until then, page-view and click events on this site are not sent to Google.
          </p>
          <p className="mt-3">When allowed, Google Analytics 4 may process:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Pages viewed, referring URLs, and on-site events such as searches and link clicks</li>
            <li>Browser, device, screen, language, and approximate location</li>
            <li>A client identifier stored in cookies such as _ga and _ga_RCEGDLDF2C</li>
            <li>Cookie-less technical signals Google uses to provide the service, such as truncated IP address. Google Analytics 4 does not store a full IP address in its reports</li>
          </ul>
          <p className="mt-3">
            We use this to understand which pages are used, to measure the directory, and to improve content. We do not use Analytics to identify a named visitor. If Google signals or a similar Google setting is turned on for the property, Google may associate events with signed-in Google users under Google&apos;s own controls. You can limit that in your Google account and by rejecting measurement consent.
          </p>
          <p className="mt-3">
            Google processes Analytics data as our service provider and also under its own terms where it determines the purposes. Event data is kept for the retention period set on the property, which is 2 months or 14 months. See <a className={linkClass} href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">Google&apos;s privacy policy</a> and <a className={linkClass} href="https://support.google.com/analytics/answer/6004245" rel="noopener noreferrer" target="_blank">how Google Analytics uses data</a>.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Google AdSense</h2>
          <p>
            With marketing consent, we use Google AdSense, publisher ID ca-pub-3865452541027172, to show ads. The AdSense script is not loaded until that category is allowed. Ads are not required to read the directory.
          </p>
          <p className="mt-3">
            Google and other advertising vendors, working through Google, use cookies and similar technologies to serve and measure ads, including ads based on previous visits to this site and other sites. Those technologies can include cookies such as IDE, DSID, __gads, and __gpi, and local storage used by the Google tag. Vendors may receive your IP address, device and browser details, coarse location, ad interactions, and a cookie identifier.
          </p>
          <p className="mt-3">
            We do not sell personal information for money. Allowing personalised advertising can be treated as &quot;sharing&quot; personal information or processing it for targeted advertising under US state laws, and as consent-based advertising under UK, EEA, and Swiss law. Rejecting marketing consent is how you opt out of that on this site. You can also control Google ads at <a className={linkClass} href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>. How Google uses information from sites that use its services is explained at <a className={linkClass} href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">policies.google.com/technologies/partner-sites</a>.
          </p>
          <p className="mt-3">
            Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on visits to this site and other sites on the Internet.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Other providers</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Vercel hosts the site and processes connection logs, including IP address, to deliver pages and protect the service. See <a className={linkClass} href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer" target="_blank">Vercel&apos;s privacy policy</a>.</li>
            <li>c15t, connected to our Inth project, stores your consent choice, a subject identifier, the time of the choice, and the coarse location used to select the consent rules that apply to you.</li>
            <li>Better Ranking Communications receives contact-form submissions so we can read and reply to them.</li>
            <li>The prison map requests map tiles from OpenStreetMap, or another tile host configured for the site. Your browser sends your IP address with those tile requests. See the <a className={linkClass} href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" rel="noopener noreferrer" target="_blank">OpenStreetMap Foundation privacy policy</a>.</li>
          </ul>
          <p className="mt-3">Fonts are served with the site. We do not load a separate Google Fonts request.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Why we use information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To answer contact messages and keep a record of that correspondence. Legal basis, where UK or EU law applies: steps you asked us to take, and our legitimate interest in handling enquiries.</li>
            <li>To run, secure, and debug the site, including host logs and strictly necessary consent storage. Legal basis: legitimate interests, and, for consent storage, providing a service you request.</li>
            <li>To measure the site with Google Analytics 4. Legal basis: consent where consent is required. Where the law allows measurement until you object, you can still reject it in Privacy settings.</li>
            <li>To show and measure ads with Google AdSense. Legal basis: consent where consent is required. Rejecting marketing stops the AdSense script on later page loads.</li>
            <li>To meet legal duties, such as responding to a lawful request or keeping a record of a rights request.</li>
          </ul>
          <p className="mt-3">We do not use personal information to make decisions that produce legal or similarly significant effects about you. We do not sell contact-form contents.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Where information is processed</h2>
          <p>
            We and our providers may process information in the United Kingdom, the European Economic Area, the United States, and other countries where those providers operate. Google and Vercel are established in the United States. Where UK or EEA law requires a transfer tool, we rely on an adequacy decision or on standard contractual clauses, together with the provider&apos;s supplementary measures. US providers may be required to disclose information to authorities under US law.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How long we keep it</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Contact messages: for as long as needed to handle the enquiry and for a reasonable period afterwards for records, disputes, and security, then deleted or de-identified.</li>
            <li>Host and security logs: for the period set by the host, typically days to a few months, unless we need a specific log to investigate abuse.</li>
            <li>Consent records: until you change or withdraw the choice, and for a limited period afterwards so we can show what was stored.</li>
            <li>Google Analytics 4 events: for the property retention period of 2 or 14 months. Google AdSense cookie lifetimes are set by Google and are described in the Cookie Policy.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Your choices</h2>
          <p>
            Use Privacy settings in the footer, or the controls in the <Link className={linkClass} href="/cookies">Cookie Policy</Link>, to allow or reject measurement and marketing. Rejecting a category takes effect on the next load. Necessary cookies stay on because the site and the consent record need them.
          </p>
          <p className="mt-3">You can also use:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><a className={linkClass} href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">Google Ads Settings</a> for Google advertising personalisation</li>
            <li><a className={linkClass} href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">Google Analytics opt-out browser add-on</a></li>
            <li><a className={linkClass} href="https://www.youronlinechoices.eu/" rel="noopener noreferrer" target="_blank">Your Online Choices</a> (EEA and UK)</li>
            <li><a className={linkClass} href="https://optout.aboutads.info/" rel="noopener noreferrer" target="_blank">DAA WebChoices</a> and <a className={linkClass} href="https://optout.networkadvertising.org/" rel="noopener noreferrer" target="_blank">NAI opt-out</a> (United States)</li>
            <li><a className={linkClass} href="https://youradchoices.ca/" rel="noopener noreferrer" target="_blank">Digital Advertising Alliance of Canada</a></li>
          </ul>
          <p className="mt-3">Industry opt-out pages are separate from this site&apos;s consent store. Use Privacy settings on this site as well.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Rights where you live</h2>
          <h3 className="font-semibold text-foreground mb-2">United Kingdom, EEA, and Switzerland</h3>
          <p>
            You can ask for access, correction, deletion, restriction, or a copy of personal information we hold, and you can object to processing based on legitimate interests. Where we rely on consent, you can withdraw it at any time without affecting earlier lawful processing. You can complain to the UK Information Commissioner&apos;s Office, your EEA supervisory authority, or the Swiss Federal Data Protection and Information Commissioner. We respond within one month, or we tell you if we need longer.
          </p>
          <h3 className="font-semibold text-foreground mt-4 mb-2">United States</h3>
          <p>
            Residents of states with consumer privacy laws, including California, Colorado, Connecticut, Virginia, Utah, Texas, Oregon, Montana, and others that grant similar rights, can ask to access, correct, or delete personal information, and to opt out of sale, sharing, and targeted advertising. We do not sell personal information for money. Personalised AdSense is the activity most likely to count as sharing or targeted advertising. Reject marketing cookies to opt out. We will not discriminate against you for exercising these rights. You may use an authorised agent. We may ask for information to verify the request. If we deny a request, you can appeal by replying through the contact form, and we will explain the outcome and, where the law provides it, how to contact your state attorney general.
          </p>
          <p className="mt-3">
            California residents can also request the categories of personal information collected, the sources, the purposes, and the categories of recipients. In the last 12 months those categories are identifiers and internet activity from browsing and forms, and commercial information limited to the fact that an ad was eligible to be shown. We do not collect precise geolocation or use sensitive personal information to infer characteristics for advertising.
          </p>
          <h3 className="font-semibold text-foreground mt-4 mb-2">Canada, Brazil, Australia, and elsewhere</h3>
          <p>
            If the law where you live gives you access, correction, deletion, or a right to challenge our handling of personal information, including under Canada&apos;s PIPEDA and Quebec&apos;s Law 25, Brazil&apos;s LGPD, or the Australian Privacy Principles, contact us and we will honour the rights that apply. You may also complain to the privacy regulator in your country. Nothing in this policy limits rights that cannot legally be waived.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Children</h2>
          <p>
            The site is a general information resource. It is not directed at children under 16, and we do not knowingly collect personal information from children. Advertising on the site is not child-directed. If you believe a child has sent us personal information, contact us and we will delete it.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Security and changes</h2>
          <p>
            We use HTTPS and limit access to contact messages to the tools that receive them. No website can guarantee absolute security. We may update this policy when the site or the law changes. The date at the top is the latest version. Continued use after an update means the new policy applies to later visits. Consent-based processing still depends on the choice stored in Privacy settings.
          </p>
        </section>
      </article>
    </div>
  );
}
