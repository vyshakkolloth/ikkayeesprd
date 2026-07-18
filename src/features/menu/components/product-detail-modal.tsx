import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductDetailActions } from "./product-detail-actions";

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
  pairedProductId?: string | null;
  categoryId: string;
  categoryName?: { en: string; ar: string };
}

interface ProductDetailModalProps {
  product: Product;
  pairedProduct?: { _id: string; name: { en: string; ar: string } } | null;
  locale?: string;
  activeCategory?: string;
  activeSearch?: string;
}

export function ProductDetailModal({
  product,
  pairedProduct = null,
  locale = "en",
  activeCategory = "all",
  activeSearch = "",
}: ProductDetailModalProps) {
  const isAr = locale === "ar";
  const name = isAr ? product.name.ar : product.name.en;
  const description = isAr ? product.description.ar : product.description.en;

  const basePrice = product.hasPortions
    ? Math.min(...(product.portions?.map((p) => p.price) || [0]))
    : product.price;

  const priceKWD = basePrice; // Assuming stored price is KWD

  // Determine nut warning
  const containsNuts =
    name.toLowerCase().includes("mandi") ||
    description.toLowerCase().includes("nuts") ||
    name.toLowerCase().includes("kunafa") ||
    description.toLowerCase().includes("pistachio");

  // Build the close URL (removes product from params, retains category and search)
  const params = new URLSearchParams();
  if (activeCategory && activeCategory !== "all") params.set("category", activeCategory);
  if (activeSearch) params.set("search", activeSearch);
  const closeUrl = `/menu?${params.toString()}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-200"
    >
      {/* Backdrop Link to close */}
      <Link href={closeUrl} scroll={false} className="absolute inset-0 cursor-default" />

      <div
        className="relative bg-[#FDFBF7] w-full max-w-[460px] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] z-10"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Scrollable Container */}
        <div className="overflow-y-auto w-full scrollbar-thin text-left">
          {/* Header Image */}
          <div className="relative h-[220px] w-full shrink-0">
            {product.image && (
              <Image
                src={product.image}
                alt={isAr ? product.imageAlt.ar : product.imageAlt.en}
                fill
                sizes="460px"
                className="object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Close Button Link */}
            <Link
              href={closeUrl}
              scroll={false}
              className={cn(
                "absolute top-4 z-10 size-8 rounded-full bg-white hover:bg-brand-cream text-brand-dark flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 border border-brand-gold/10",
                isAr ? "left-4" : "right-4"
              )}
              aria-label="Close modal"
            >
              <X className="size-4 stroke-[2.5]" />
            </Link>
          </div>

          {/* Content Panel */}
          <div className="px-6 py-5 flex flex-col">
            {/* Bestseller / Chef Recommended Badge */}
            <div className="text-left">
              {product.topPick ? (
                <span className="inline-block border border-[#B88E4C]/30 bg-[#B88E4C]/5 text-[#B88E4C] text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded uppercase font-sans">
                  {isAr ? "الأكثر مبيعاً" : "Bestseller"}
                </span>
              ) : product.chefRecommended ? (
                <span className="inline-block border border-[#8A5A36]/30 bg-[#8A5A36]/5 text-[#8A5A36] text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded uppercase font-sans">
                  {isAr ? "توصية الشيف" : "Chef Recommended"}
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h2 className="font-playfair text-2xl font-bold text-brand-dark leading-tight mt-2.5 text-left">
              {name}
            </h2>

            {/* Serving Size & Prep Time Section */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-brand-gold/10 py-3.5 my-4 text-left">
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-[9px] font-bold tracking-widest text-[#8A6D3B] uppercase">
                  {isAr ? "حجم الوجبة" : "Serving Size"}
                </span>
                <span className="font-sans text-xs font-semibold text-brand-dark">
                  {product.servingSize || (isAr ? "شخص أو شخصين" : "1-2 People")}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-[9px] font-bold tracking-widest text-[#8A6D3B] uppercase">
                  {isAr ? "وقت التحضير" : "Prep Time"}
                </span>
                <span className="font-sans text-xs font-semibold text-brand-dark">
                  {product.prepTime || (isAr ? "١٥ دقيقة" : "15 Mins")}
                </span>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-left">
              <span className="block md:hidden font-sans text-2xl font-bold text-[#B88E4C]">
                KD {priceKWD}
              </span>
              <span className="hidden md:block font-sans text-2xl font-bold text-[#B88E4C]">
                KD {priceKWD}
              </span>
            </div>

            {/* Description */}
            <p className="font-sans text-[12px] font-light text-brand-dark-light/90 leading-relaxed mt-2 text-left">
              {description}
            </p>

            {/* Dietary Badges */}
            <div className="flex flex-wrap gap-2 mt-4 text-left">
              <span className="bg-[#F4EFE5] text-brand-dark text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-brand-gold/10">
                <span className={cn("size-1.5 rounded-full", product.isVeg ? "bg-green-600" : "bg-red-600")} />
                {product.isVeg
                  ? (isAr ? "١٠٠٪ نباتي" : "100% Veg")
                  : (isAr ? "١٠٠٪ حلال" : "100% Halal")
                }
              </span>

              {containsNuts && (
                <span className="bg-[#F4EFE5] text-[#8A5A36] text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-brand-gold/10">
                  🥜 {isAr ? "يحتوي على مكسرات" : "Contains Nuts"}
                </span>
              )}
            </div>

            {/* Chef Recommendation / Pairing Card */}
            {pairedProduct && (
              <div className="bg-[#F6EFE2] rounded-xl p-3.5 mt-4 border border-[#B88E4C]/10 flex flex-col gap-0.5 text-left">
                <span className="font-sans text-[10px] font-bold tracking-wider text-[#8D6B3E] uppercase">
                  {isAr ? "توصية الشيف" : "Chef Recommendation"}
                </span>
                <span className="font-sans text-xs text-brand-dark font-medium">
                  {isAr ? "شريك مع: " : "Pair with: "}{isAr ? pairedProduct.name.ar : pairedProduct.name.en}
                </span>
              </div>
            )}

            {/* Actions Stepper and Add to Selection Button */}
            <ProductDetailActions product={product as any} locale={locale} />

            {/* Continue Browsing Link */}
            <Link
              href={closeUrl}
              scroll={false}
              className="w-full text-center text-[11px] text-brand-dark-light/70 hover:text-brand-dark transition-colors mt-3.5 font-sans font-medium cursor-pointer block"
            >
              {isAr ? "مواصلة التصفح" : "Continue Browsing"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
