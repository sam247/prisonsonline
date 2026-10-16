import { legacyRootRedirects } from "./config/legacy-root-redirects.mjs";
import { intlCountryRedirects } from "./config/intl-country-redirects.mjs";
import { withConsentManifest } from "c15t/next/build";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["src"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
    ],
  },
  async redirects() {
    return [...legacyRootRedirects, ...intlCountryRedirects];
  },
};

export default withConsentManifest(nextConfig);
