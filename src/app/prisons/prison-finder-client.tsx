"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PrisonCard } from "@/components/PrisonCard";
import { SearchBar } from "@/components/SearchBar";
import { prisons, countries, securityLevels, getCountrySlug, getRegionsByCountry } from "@/data/prisons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export function PrisonFinderClient() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(qParam);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedSecurity, setSelectedSecurity] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  const regions = useMemo(() => {
    if (selectedCountry === "all") return [];
    return getRegionsByCountry(selectedCountry);
  }, [selectedCountry]);

  const filtered = useMemo(() => {
    let results = [...prisons];
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.stateOrRegion.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q),
      );
    }
    if (selectedCountry !== "all") results = results.filter((p) => p.countrySlug === selectedCountry);
    if (selectedRegion !== "all") results = results.filter((p) => p.regionSlug === selectedRegion);
    if (selectedSecurity !== "all") results = results.filter((p) => p.securityLevel === selectedSecurity);
    return results;
  }, [query, selectedCountry, selectedRegion, selectedSecurity]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setQuery("");
    setSelectedCountry("all");
    setSelectedRegion("all");
    setSelectedSecurity("all");
    setPage(1);
  };

  const hasFilters = query || selectedCountry !== "all" || selectedRegion !== "all" || selectedSecurity !== "all";

  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-2">Prison Finder</h1>
          <p className="text-primary-foreground/70">Search and filter prisons from our global directory</p>
        </div>
      </section>

      <div className="container py-8">
        <div className="flex flex-col gap-4 mb-8">
          <SearchBar
            placeholder="Search by prison name, country, or region..."
            onSearch={(q) => {
              setQuery(q);
              setPage(1);
            }}
          />
          <div className="flex flex-wrap gap-3">
            <Select
              value={selectedCountry}
              onValueChange={(v) => {
                setSelectedCountry(v);
                setSelectedRegion("all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={getCountrySlug(c)}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {regions.length > 0 && (
              <Select
                value={selectedRegion}
                onValueChange={(v) => {
                  setSelectedRegion(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((r) => (
                    <SelectItem key={r.slug} value={r.slug}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={selectedSecurity}
              onValueChange={(v) => {
                setSelectedSecurity(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Security Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Security Levels</SelectItem>
                {securityLevels.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" /> Clear filters
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {filtered.length} {filtered.length === 1 ? "prison" : "prisons"} found
        </p>

        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {paginated.map((p) => (
              <PrisonCard key={p.slug} prison={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium mb-2">No prisons found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
