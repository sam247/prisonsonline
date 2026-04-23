import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getProbationCentresByServiceType,
  listProbationServiceTypeHubSlugs,
  MIN_PROBATION_HUB_GROUP_SIZE,
} from "@/lib/queries/probation";

type Props = { params: { typeSlug: string } };

export function generateStaticParams() {
  return listProbationServiceTypeHubSlugs("uk").map((typeSlug) => ({ typeSlug }));
}

export function generateMetadata({ params }: Props) {
  return buildPageMetadata({
    title: `Probation service type: ${params.typeSlug.replace(/-/g, " ")}`,
    description: "Directory of probation centres grouped by service type.",
    path: `/probation/uk/service-type/${params.typeSlug}`,
  });
}

export default function ProbationServiceTypePage({ params }: Props) {
  const centres = getProbationCentresByServiceType("uk", params.typeSlug);
  if (centres.length < MIN_PROBATION_HUB_GROUP_SIZE) notFound();
  const prettyType = params.typeSlug.replace(/-/g, " ");

  return (
    <div className="container py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Probation centres: {prettyType}</h1>
        <p className="text-muted-foreground mt-2">
          {centres.length} listings in this service-type grouping (threshold: {MIN_PROBATION_HUB_GROUP_SIZE}+).
        </p>
      </header>
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {centres.map((centre) => (
          <li key={centre.slug}>
            <Card className="h-full border-border/60">
              <CardContent className="p-5 space-y-1">
                <h2 className="font-semibold">
                  <Link href={`/probation/uk/${centre.slug}`} className="text-accent hover:underline">
                    {centre.name}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground">{centre.region || "United Kingdom"}</p>
                {centre.address ? <p className="text-sm text-muted-foreground">{centre.address}</p> : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

