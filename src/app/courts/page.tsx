import { Suspense } from "react";
import { CourtsDirectoryIndexView } from "@/components/pages/CourtsDirectoryViews";
import { CourtsFinderClient } from "@/app/courts/courts-finder-client";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getIndexableCourts, listCourtTypeHubSummaries } from "@/lib/queries/courts";

export function generateMetadata() {
  return buildPageMetadata({
    title: "Courts in England and Wales",
    description:
      "Directory of Crown Courts, Magistrates' Courts, County Courts, combined centres and tribunals with addresses and official links.",
    path: "/courts",
  });
}

export default function CourtsDirectoryPage() {
  const courts = getIndexableCourts();
  const hubs = listCourtTypeHubSummaries();

  return (
    <CourtsDirectoryIndexView hubs={hubs} total={courts.length}>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading court search…</p>}>
        <CourtsFinderClient
          courts={courts}
          hubs={hubs.map((h) => ({ slug: h.slug, label: h.label }))}
        />
      </Suspense>
    </CourtsDirectoryIndexView>
  );
}
