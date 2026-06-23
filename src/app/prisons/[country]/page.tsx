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
  if (country === "uk") {
    return buildPageMetadata({
      title: "UK prisons in England & Wales",
      description:
        "Browse UK prisons in England and Wales by prison name, region, category, operator, and prison type.",
      path: `/prisons/${country}`,
    });
  }
  if (country === "us") {
    return buildPageMetadata({
      title: "Federal prisons in the United States",
      description:
        "Browse Federal Bureau of Prisons facilities by prison name, state, and facility type across the United States.",
      path: `/prisons/${country}`,
    });
  }
  return buildPageMetadata({
    title: `Prisons in ${name}`,
    description: `Browse prisons in ${name} by prison name, region, and directory listing.`,
    path: `/prisons/${country}`,
  });
}

export default function CountryPage({ params }: Props) {
  const { country } = params;
  return <CountryPrisonsView countrySlug={country} />;
}
