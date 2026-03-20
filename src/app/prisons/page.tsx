import { Suspense } from "react";
import { PrisonFinderClient } from "./prison-finder-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Prison Finder",
  description: "Search and filter prisons from our global directory.",
  path: "/prisons",
});

export default function PrisonsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <section className="bg-primary text-primary-foreground">
            <div className="container py-12">
              <h1 className="text-3xl font-bold mb-2">Prison Finder</h1>
              <p className="text-primary-foreground/70">Loading…</p>
            </div>
          </section>
        </div>
      }
    >
      <PrisonFinderClient />
    </Suspense>
  );
}
