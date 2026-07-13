"use client";

import React from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface SearchBarProps {
  initialSearch?: string;
  placeholder?: string;
  isMobile?: boolean;
}

export function SearchBar({
  initialSearch = "",
  placeholder = "Search dishes...",
  isMobile = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialSearch);
  const [, startTransition] = useTransition();

  // Sync state if initial value changes
  React.useEffect(() => {
    setQuery(initialSearch);
  }, [initialSearch]);

  // Debounced router replacement
  React.useEffect(() => {
    // Skip initial run if query is same as search param
    const currentParam = searchParams.get("search") || "";
    if (query === currentParam) return;

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set("search", query);
        } else {
          params.delete("search");
        }
        router.replace(`/menu?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  if (isMobile) {
    return (
      <div className="relative w-full md:hidden">
        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
          <Search className="size-4 text-brand-dark-light/50" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-11 bg-[#F4EFE5] text-brand-dark placeholder-brand-dark-light/50 rounded-full ps-11 pe-4 text-sm font-sans focus:outline-none border border-transparent transition-all"
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8 hidden md:block">
      <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
        <Search className="size-4 text-brand-dark-light/50" />
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-11 bg-[#F4EFE5] text-brand-dark placeholder-brand-dark-light/55 rounded-full ps-11 pe-4 text-sm font-sans focus:outline-none border border-transparent focus:ring-1 focus:ring-brand-gold/30 transition-all shadow-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
