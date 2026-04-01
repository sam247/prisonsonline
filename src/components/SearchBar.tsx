"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendGtagEvent } from "@/lib/analytics/gtag";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  size?: "default" | "large";
  onSearch?: (query: string) => void;
}

export function SearchBar({
  placeholder = "Search by prison name, country, or region...",
  className = "",
  size = "default",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    sendGtagEvent("search", { search_term: trimmed });

    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/prisons?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground ${size === "large" ? "h-5 w-5" : "h-4 w-4"}`}
      />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`${size === "large" ? "h-14 pl-12 pr-4 text-base rounded-xl shadow-lg border-border/50 bg-card" : "h-10 pl-10 pr-4"}`}
      />
    </form>
  );
}
