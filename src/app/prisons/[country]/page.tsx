import { CountryPrisonsView } from "@/components/pages/CountryPrisonsView";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { prisons } from "@/data/prisons";
import { countriesData } from "@/data/countries";
import { getPrisonsByCountry, getCountry } from "@/lib/queries";

type Props = { params: { country: string } };

export function generateStaticParams() {
  const fromPrisons = Array.from(new Set(prisons.map((p) => p.countrySlug)));
  const fromProfiles = countriesData.map((c) => c.slug);
  return Array.from(new Set([...fromPrisons, ...fromProfiles])).map((country) => ({ country }));
}

export function generateMetadata({ params }: Props) {
  const { country } = params;
  const list = getPrisonsByCountry(country);
  const meta = getCountry(country);
  const name = list[0]?.country || meta?.name || country;
  return buildPageMetadata({
    title: `Prisons in ${name}`,
    description: `Browse prisons in ${name}. Facilities, regions, and directory listings.`,
    path: `/prisons/${country}`,
  });
}

export default function CountryPage({ params }: Props) {
  const { country } = params;
  return <CountryPrisonsView countrySlug={country} />;
}
