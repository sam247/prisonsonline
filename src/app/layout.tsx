import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { siteName } from "@/lib/site";
import { ConsentBanner, ConsentDialog, ConsentRoot } from "c15t/next";
import { resolveConsent } from "c15t/next/server";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://prisonsonline.com"),
  ...buildPageMetadata({
    title: siteName,
    description:
      "Find prison information worldwide. Search prisons, learn about prison systems, and understand how prisons operate around the world.",
    path: "/",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ConsentRoot state={resolveConsent()}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ConsentBanner legalLinks={["privacyPolicy", "cookiePolicy"]} />
            <ConsentDialog legalLinks={["privacyPolicy", "cookiePolicy"]} />
          </Providers>
        </ConsentRoot>
      </body>
    </html>
  );
}
