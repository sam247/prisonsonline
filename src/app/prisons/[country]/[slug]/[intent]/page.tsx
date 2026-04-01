import { notFound } from "next/navigation";
import { PrisonIntentView } from "@/components/pages/PrisonIntentView";
import { getPrisonByCountryAndSlug } from "@/data/prisons";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  intentGenerateStaticParams,
  isPrisonInIntentRollout,
  isPrisonIntentSlug,
} from "@/lib/seo/intentRollout";
import { buildIntentMetaDescription, buildIntentPageTitle } from "@/lib/seo/prisonIntentCopy";

type Props = { params: { country: string; slug: string; intent: string } };

export function generateStaticParams() {
  return intentGenerateStaticParams();
}

export function generateMetadata({ params }: Props) {
  const { country, slug, intent: intentParam } = params;
  const path = `/prisons/${country}/${slug}/${intentParam}`;
  if (!isPrisonIntentSlug(intentParam)) {
    return buildPageMetadata({ title: "Not found", path });
  }
  const prison = getPrisonByCountryAndSlug(country, slug);
  if (!prison || !isPrisonInIntentRollout(prison)) {
    return buildPageMetadata({ title: "Not found", path });
  }
  return buildPageMetadata({
    title: buildIntentPageTitle(prison, intentParam),
    description: buildIntentMetaDescription(prison, intentParam),
    path,
  });
}

export default function PrisonIntentPage({ params }: Props) {
  const { country, slug, intent: intentParam } = params;
  if (!isPrisonIntentSlug(intentParam)) notFound();
  const prison = getPrisonByCountryAndSlug(country, slug);
  if (!prison || !isPrisonInIntentRollout(prison)) notFound();
  return <PrisonIntentView prison={prison} intent={intentParam} />;
}
