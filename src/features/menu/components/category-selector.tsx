"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: { en: string; ar: string };
  slug: string;
  image: string;
}

interface CategorySelectorProps {
  categories: Category[];
  locale?: string;
  activeCategory?: string;
}

export function CategorySelector({
  categories = [],
  locale = "en",
  activeCategory = "all",
}: CategorySelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAr = locale === "ar";

  // Define virtual category "All Dishes"
  const allDishesCategory: Category = {
    _id: "all",
    name: {
      en: "All Dishes",
      ar: "كل الأصناف",
    },
    slug: "all",
    image: "/images/all_dishes.png",
  };

  const list = [allDishesCategory, ...categories];

  const handleSelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    // Maintain search term
    router.replace(`/menu?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Mobile view categories scroll strip */}
      <div className="md:hidden sticky top-[60px] z-20 bg-[#FDFBF7]/95 backdrop-blur-md w-full overflow-x-auto scrollbar-none flex items-center gap-5 py-3 px-4 border-b border-[#FAF6EE] select-none -mx-4">
        {list.map((cat) => {
          const isActive = activeCategory === cat.slug;
          const label = isAr ? cat.name.ar : cat.name.en;
          
          return (
            <button
              key={cat._id}
              onClick={() => handleSelect(cat.slug)}
              className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none shrink-0"
            >
              <div className="relative">
                <div
                  className={cn(
                    "size-[72px] rounded-full overflow-hidden border-2 transition-all duration-300 p-0.5 bg-white",
                    isActive
                      ? "border-[#B88E4C] scale-105 shadow-md"
                      : "border-transparent group-hover:border-[#B88E4C]/40"
                  )}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    {cat.image && (
                      <Image
                        src={cat.image}
                        alt={label}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="absolute -top-1 -right-1 bg-[#B88E4C] text-white rounded-full size-5.5 flex items-center justify-center border border-white shadow">
                    <Check className="size-3.5 stroke-[3.5]" />
                  </div>
                )}
              </div>

              <span
                className={cn(
                  "font-sans text-[11px] tracking-wide transition-colors duration-300",
                  isActive
                    ? "text-[#B88E4C] font-bold"
                    : "text-brand-dark-light/75 group-hover:text-brand-dark"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop view categories circle strip */}
      <div className="hidden md:block sticky top-20 z-20 bg-[#FDFBF7]/95 backdrop-blur-md w-full py-5 border-b border-brand-gold/5 -mx-8 px-8 lg:-mx-12 lg:px-12 mb-10 select-none">
        <div className="flex flex-wrap justify-center gap-7 max-w-4xl mx-auto">
          {list.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const label = isAr ? cat.name.ar : cat.name.en;

            return (
              <button
                key={cat._id}
                onClick={() => handleSelect(cat.slug)}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
              >
                <div className="relative">
                  <div
                    className={cn(
                      "size-[80px] rounded-full overflow-hidden border-2 transition-all duration-300 p-0.5 bg-white",
                      isActive
                        ? "border-[#B88E4C] scale-105 shadow-md"
                        : "border-transparent group-hover:border-[#B88E4C]/40"
                    )}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      {cat.image && (
                        <Image
                          src={cat.image}
                          alt={label}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute -top-1 -right-1 bg-[#B88E4C] text-white rounded-full size-6.5 flex items-center justify-center border border-white shadow">
                      <Check className="size-4 stroke-[3.5]" />
                    </div>
                  )}
                </div>

                <span
                  className={cn(
                    "font-sans text-xs tracking-wide transition-colors duration-300",
                    isActive
                      ? "text-[#B88E4C] font-bold"
                      : "text-brand-dark-light/75 group-hover:text-brand-dark"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
