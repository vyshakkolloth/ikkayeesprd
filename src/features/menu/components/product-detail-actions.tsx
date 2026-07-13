"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
  _id: string;
  name: { en: string; ar: string };
  price: number;
  image: string;
  description: { en: string; ar: string };
  prepTime?: string;
  servingSize?: string;
  hasPortions: boolean;
  portions: { name: { en: string; ar: string }; price: number }[];
  spiceLevel: "low" | "medium" | "high";
  categoryId: string;
  categoryName?: { en: string; ar: string };
}

interface ProductDetailActionsProps {
  product: Product;
  locale?: string;
}

export function ProductDetailActions({
  product,
  locale = "en",
}: ProductDetailActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [spiceLevel, setSpiceLevel] = React.useState<"Low" | "Medium" | "High">("Medium");
  const [quantity, setQuantity] = React.useState<number>(1);
  const isAr = locale === "ar";

  // Check if this category needs spice level
  const catName = product.categoryName?.en?.toLowerCase() || "";
  const needsSpice = !["drinks", "desserts"].includes(catName);

  const handleAdd = () => {
    try {
      const selection = JSON.parse(localStorage.getItem("menu-selection") || "[]");
      const exists = selection.some((item: any) => item.id === product._id);

      if (!exists) {
        // Resolve prices
        const price = product.hasPortions
          ? Math.min(...(product.portions?.map((p) => p.price) || [0]))
          : product.price;

        const isUSD = price < 100;
        const priceINR = isUSD ? Math.round(price * 75) : price;

        const itemToAdd = {
          id: product._id,
          name: isAr ? product.name.ar : product.name.en,
          priceINR,
          description: isAr ? product.description.ar : product.description.en,
          prepTime: product.prepTime || "15-20 Mins",
          serves: product.servingSize || "1 Person",
          image: product.image,
          quantity: quantity,
          spiceLevel: needsSpice ? spiceLevel : undefined,
        };

        selection.push(itemToAdd);
        localStorage.setItem("menu-selection", JSON.stringify(selection));
        
        // Dispatch sync event
        window.dispatchEvent(new Event("menu-selection-changed"));
      } else {
        // Update quantity if already exists
        const updated = selection.map((item: any) => {
          if (item.id === product._id) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
        localStorage.setItem("menu-selection", JSON.stringify(updated));
        window.dispatchEvent(new Event("menu-selection-changed"));
      }

      // Close modal by removing product search param
      const params = new URLSearchParams(searchParams.toString());
      params.delete("product");
      router.replace(`/menu?${params.toString()}`, { scroll: false });
    } catch (e) {
      console.error("Failed to add from detail modal:", e);
    }
  };

  return (
    <div className="flex flex-col gap-5 mt-4" dir={isAr ? "rtl" : "ltr"}>
      {/* Spice Level Selection */}
      {needsSpice && (
        <div className="text-left">
          <span className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark-light/65 uppercase">
            {isAr ? "درجة الحرارة (الفلفل)" : "Spice Level"}
          </span>
          <div className="flex gap-2.5 mt-1.5" dir="ltr">
            {(["Low", "Medium", "High"] as const).map((level) => {
              const isSelected = spiceLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpiceLevel(level)}
                  className={cn(
                    "px-5 py-1.5 rounded-full border text-xs font-sans transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-[#B88E4C] text-[#B88E4C] bg-[#B88E4C]/5 font-semibold"
                      : "border-brand-gold/15 text-brand-dark-light/80 hover:border-[#B88E4C]/50 hover:bg-brand-gold/5 font-medium"
                  )}
                >
                  {isAr 
                    ? (level === "Low" ? "خفيف" : level === "Medium" ? "متوسط" : "حار") 
                    : level
                  }
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Stepper */}
      <div className="flex items-center justify-between pt-3.5 border-t border-brand-gold/10">
        <span className="font-sans text-sm font-semibold text-brand-dark">
          {isAr ? "الكمية" : "Quantity"}
        </span>
        
        <div className="flex items-center gap-3.5 bg-[#F4EFE5] px-3.5 py-1.5 rounded-full border border-brand-gold/5" dir="ltr">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className={cn(
              "size-5 rounded-full flex items-center justify-center text-brand-dark transition-colors cursor-pointer",
              quantity <= 1 ? "opacity-35 cursor-not-allowed" : "hover:bg-brand-gold/10"
            )}
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5 stroke-[2.5]" />
          </button>
          <span className="font-sans text-sm font-bold w-4 text-center text-brand-dark">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="size-5 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-gold/10 transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAdd}
        className="w-full h-11 bg-[#2A1E17] hover:bg-[#3B2C24] text-white font-sans text-sm font-semibold rounded-full shadow-md transition-all duration-200 mt-2 active:scale-[0.98] cursor-pointer"
      >
        {isAr ? "أضف إلى اختياري" : "Add To Selection"}
      </button>
    </div>
  );
}
