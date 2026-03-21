import Link from "next/link";
import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Country } from "@/data/countries";
import { getCountryEditorialImage } from "@/lib/media/resolvers";

interface CountryCardProps {
  country: Country;
  /** When set, overrides static `country.prisonCount` (e.g. live directory length). */
  listedPrisonCount?: number;
}

export function CountryCard({ country, listedPrisonCount }: CountryCardProps) {
  const prisonCount = listedPrisonCount ?? country.prisonCount;
  const cover = country.coverImage ?? getCountryEditorialImage(country.slug);
  return (
    <Link href={`/prisons/${country.slug}`}>
      <Card className="group h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60 overflow-hidden">
        {cover && (
          <div className="relative aspect-[2.2/1] w-full bg-muted border-b border-border/50">
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 280px"
              unoptimized={cover.src.endsWith(".svg")}
            />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">{country.name}</h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{country.region}</span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{country.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {prisonCount} {prisonCount === 1 ? "prison" : "prisons"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{country.prisonPopulation.toLocaleString()} inmates</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
