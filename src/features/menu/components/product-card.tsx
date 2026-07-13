import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddSelectionButton } from "./add-selection-button";

interface Product {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  image: string;
  imageAlt: { en: string; ar: string };
  price: number;
  hasPortions: boolean;
  portions: { name: { en: string; ar: string }; price: number }[];
  chefRecommended: boolean;
  topPick: boolean;
  spiceLevel: "low" | "medium" | "high";
  isVeg: boolean;
  servingSize?: string;
  prepTime?: string;
}

interface ProductCardProps {
  product: Product;
  locale: string;
  activeCategory: string;
  activeSearch: string;
}

export function ProductCard({
  product,
  locale = "en",
  activeCategory = "all",
  activeSearch = "",
}: ProductCardProps) {
  const isAr = locale === "ar";
  const name = isAr ? product.name.ar : product.name.en;
  const description = isAr ? product.description.ar : product.description.en;
  
  // Calculate price conversions
  const basePrice = product.hasPortions
    ? Math.min(...(product.portions?.map((p) => p.price) || [0]))
    : product.price;

  const isUSD = basePrice < 100;
  const priceINR = isUSD ? Math.round(basePrice * 75) : basePrice;
  const priceUSD = isUSD ? basePrice : Number((basePrice / 75).toFixed(2));

  // Deterministic rating between 4.5 and 4.9 based on _id
  let idSum = 0;
  for (let i = 0; i < product._id.length; i++) {
    idSum += product._id.charCodeAt(i);
  }
  const rating = 4.5 + (idSum % 5) * 0.1;

  // Build the modal URL trigger
  const searchParams = new URLSearchParams();
  if (activeCategory && activeCategory !== "all") searchParams.set("category", activeCategory);
  if (activeSearch) searchParams.set("search", activeSearch);
  searchParams.set("product", product._id);
  const cardUrl = `/menu?${searchParams.toString()}`;

  return (
    <>
      {/* Mobile view card (shown on mobile, hidden on desktop) */}
      <Link
        href={cardUrl}
        scroll={false}
        className="md:hidden w-full bg-white rounded-[20px] overflow-hidden border border-brand-gold/10 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-md hover:border-brand-gold/20 cursor-pointer"
      >
        {/* Image and overlays */}
        <div className="relative w-full h-[220px] overflow-hidden">
          {product.image && (
            <Image
              src={product.image}
              alt={isAr ? product.imageAlt.ar : product.imageAlt.en}
              fill
              sizes="(max-w-md) 100vw"
              className="object-cover transition-transform duration-775 group-hover:scale-103"
            />
          )}

          {/* Left Badges */}
          <div className={cn("absolute top-3 flex items-center gap-1.5 z-10", isAr ? "right-3" : "left-3")}>
            <div className="bg-white/95 backdrop-blur-sm shadow px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star className="size-3 text-brand-gold fill-brand-gold" />
              <span className="text-[10px] font-bold text-brand-dark font-sans leading-none">
                {rating.toFixed(1)}
              </span>
            </div>

            {product.chefRecommended && (
              <span className="bg-[#8A5A36] text-white text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase leading-none shadow">
                {isAr ? "توصية الشيف" : "CHEF RECOMMENDED"}
              </span>
            )}
          </div>

          {/* Right Veg/Non-veg indicator */}
          <div className={cn("absolute top-3 z-10", isAr ? "left-3" : "right-3")}>
            <div className={cn(
              "size-5 border-2 flex items-center justify-center bg-white/95 backdrop-blur-sm p-0.5 rounded shadow",
              product.isVeg ? "border-green-600" : "border-red-600"
            )}>
              <div className={cn("size-2.5 rounded-full", product.isVeg ? "bg-green-600" : "bg-red-600")} />
            </div>
          </div>
        </div>

        {/* Info details */}
        <div className="p-4 flex flex-col gap-1.5 bg-white text-left" dir={isAr ? "rtl" : "ltr"}>
          <h4 className="font-playfair text-lg font-bold text-brand-dark leading-snug">
            {name}
          </h4>
          <p className="text-[11px] sm:text-xs text-brand-dark-light/75 leading-relaxed font-sans font-light line-clamp-2">
            {description}
          </p>

          <div className="flex items-center justify-between mt-3 pt-1" dir="ltr">
            <span className="font-playfair text-base font-bold text-brand-dark">
              ₹{priceINR}{product.hasPortions && "+"}
            </span>
            <AddSelectionButton product={product as any} locale={locale} isMobile={true} />
          </div>
        </div>
      </Link>

      {/* Desktop view card (hidden on mobile, shown on desktop) */}
      <div
        className="hidden md:flex bg-white rounded-[20px] border border-brand-gold/10 overflow-hidden shadow-sm flex-row items-stretch group hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 min-h-[120px] cursor-pointer"
      >
        {/* Left: Square Image */}
        <Link href={cardUrl} scroll={false} className="relative w-28 sm:w-36 shrink-0 overflow-hidden">
          {product.image && (
            <Image
              src={product.image}
              alt={isAr ? product.imageAlt.ar : product.imageAlt.en}
              fill
              sizes="(max-w-md) 30vw, 15vw"
              className="object-cover transition-transform duration-750 group-hover:scale-103"
            />
          )}
        </Link>

        {/* Right: Info Details */}
        <div className="p-4 flex-grow flex flex-col justify-between gap-2 text-left" dir={isAr ? "rtl" : "ltr"}>
          <Link href={cardUrl} scroll={false} className="flex flex-col gap-1 flex-grow">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-playfair text-base font-bold text-brand-dark leading-snug">
                {name}
              </h3>
              {/* Rating */}
              <div className="flex items-center gap-1 shrink-0">
                <Star className="size-3 text-brand-gold fill-brand-gold" />
                <span className="text-[10px] font-bold text-brand-dark font-sans leading-none">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-brand-dark-light/75 leading-relaxed font-sans font-light line-clamp-2">
              {description}
            </p>
          </Link>

          <div className="flex items-center justify-between pt-1" dir="ltr">
            <span className="font-playfair text-sm font-bold text-brand-dark">
              ${priceUSD.toFixed(2)}{product.hasPortions && "+"}
            </span>
            <AddSelectionButton product={product as any} locale={locale} isMobile={false} />
          </div>
        </div>
      </div>
    </>
  );
}
