import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Cookie Policy",
  description: "Cookies and similar technologies used by Prisons Online, including consent storage, Google Analytics 4, and Google AdSense.",
  path: "/cookies",
});

const linkClass = "text-accent hover:underline";

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-primary-foreground/70">Cookies, local storage, and similar technologies</p>
        </div>
      </section>
      <article className="container py-10 space-y-8 text-muted-foreground leading-relaxed">
        <p>Last updated: 16 October 2026</p>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">What we use</h2>
          <p>
            Cookies are small text files stored on your device. We also use local storage, which the browser keeps for this site. Some technologies are strictly necessary. Measurement and marketing technologies are optional and are described below. Details of why we use the information are in the <Link className={linkClass} href="/privacy">Privacy Policy</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How consent works</h2>
          <p>
            c15t, connected to our Inth project, shows the banner and the Privacy settings control in the footer. It stores your choice in a cookie and in local storage so later visits remember it. That storage is necessary.
          </p>
          <p className="mt-3">
            Where the law requires a choice first, including in the United Kingdom, the EEA, and Switzerland, Google Analytics 4 and Google AdSense are not requested until you allow the matching category. In other countries the same categories are available, and rejecting a category stops that technology on later loads even where the law would have allowed it until you opted out. Necessary technologies are not optional.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Necessary</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Consent cookie and local storage entry set by c15t, so we know whether you have chosen and what you allowed. Kept until you change the choice or clear site data.</li>
            <li>Technical cookies the host may set to route traffic, keep a connection secure, or resist abuse. These do not advertise and are not used to build a profile of you.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Measurement: Google Analytics 4</h2>
          <p>
            Provider: Google LLC. Category: measurement. Loaded only after that category is allowed. Measurement ID: G-RCEGDLDF2C. We use it for page views and on-site events such as searches and link clicks, so we can see which parts of the directory are used.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>_ga distinguishes users. Typical lifetime: 2 years.</li>
            <li>_ga_RCEGDLDF2C keeps session state for this property. Typical lifetime: 2 years.</li>
          </ul>
          <p className="mt-3">
            Google Analytics 4 uses a truncated IP address and does not log the full IP in reports. Reject measurement consent, or use the <a className={linkClass} href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">Analytics opt-out add-on</a>, to stop this collection. See <a className={linkClass} href="https://policies.google.com/technologies/cookies" rel="noopener noreferrer" target="_blank">Google&apos;s cookie information</a>.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Marketing: Google AdSense</h2>
          <p>
            Provider: Google LLC and advertising partners Google works with. Category: marketing. Publisher ID: ca-pub-3865452541027172. The adsbygoogle.js script loads only after marketing consent. It can set or read cookies and local storage to show ads, cap how often you see an ad, measure views and clicks, and prevent fraud.
          </p>
          <p className="mt-3">Cookies Google may set when ads are allowed include:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>IDE, on doubleclick.net, used to show and measure ads. Typical lifetime: about 13 months in the EEA and UK, and up to about 24 months elsewhere, as set by Google.</li>
            <li>DSID, used to link activity across devices if you are signed in to Google and have allowed personalised ads.</li>
            <li>__gads and __gpi, used to measure ads and limit how often an ad is shown. Typical lifetime: about 13 months.</li>
            <li>test_cookie, a short-lived cookie that checks whether the browser accepts cookies.</li>
          </ul>
          <p className="mt-3">
            Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website and other websites. Rejecting marketing consent means we do not load AdSense on later page views. Ads you already received in a session can remain until you reload. You can also opt out of personalised Google ads at <a className={linkClass} href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>, and through <a className={linkClass} href="https://www.youronlinechoices.eu/" rel="noopener noreferrer" target="_blank">Your Online Choices</a>, <a className={linkClass} href="https://optout.aboutads.info/" rel="noopener noreferrer" target="_blank">DAA WebChoices</a>, <a className={linkClass} href="https://optout.networkadvertising.org/" rel="noopener noreferrer" target="_blank">the NAI</a>, or <a className={linkClass} href="https://youradchoices.ca/" rel="noopener noreferrer" target="_blank">youradchoices.ca</a>. Google explains partner use of data from this site at <a className={linkClass} href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">policies.google.com/technologies/partner-sites</a>.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Map tiles</h2>
          <p>
            Opening the prison map loads images from OpenStreetMap, or from another tile host named in the map. That is a network request, not a cookie we set. Your IP address is visible to the tile provider for that request. See the <a className={linkClass} href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" rel="noopener noreferrer" target="_blank">OpenStreetMap Foundation privacy policy</a>.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Change or delete them</h2>
          <p>
            Use the Privacy settings control in the footer to change measurement and marketing. You can also delete cookies and site data in your browser. Blocking all cookies can stop the consent store from remembering your choice, so the banner will return. Browser controls do not remove data already sent to Google. Use the opt-out links above for that.
          </p>
        </section>
      </article>
    </div>
  );
}
