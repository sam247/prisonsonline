import { gtag } from "@c15t/integrations/google-tag";
import { defineConsentConfig } from "c15t/next";

const ADSENSE_CLIENT = "ca-pub-3865452541027172";

export default defineConsentConfig({
  scripts: [
    gtag({
      id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-RCEGDLDF2C",
      category: "measurement",
      loadMode: "after-consent",
    }),
    {
      id: "google-adsense",
      src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
      category: "marketing",
      async: true,
      attributes: { crossorigin: "anonymous" },
    },
  ],
  options: {
    legalLinks: {
      privacyPolicy: { href: "/privacy", label: "Privacy policy" },
      cookiePolicy: { href: "/cookies", label: "Cookie policy" },
    },
  },
});
