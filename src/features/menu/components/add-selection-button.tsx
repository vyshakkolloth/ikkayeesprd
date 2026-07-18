"use client";

import React from "react";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface AddSelectionButtonProps {
  product: Product;
  locale?: string;
  isMobile?: boolean;
}

export function AddSelectionButton({
  product,
  locale = "en",
  isMobile = false,
}: AddSelectionButtonProps) {
  const [isAdded, setIsAdded] = React.useState(false);
  const isAr = locale === "ar";

  // Check if item is already in selection on mount
  React.useEffect(() => {
    try {
      const selection = JSON.parse(localStorage.getItem("menu-selection") || "[]");
      const exists = selection.some((item: any) => item.id === product._id);
      setIsAdded(exists);
    } catch (e) {
      // Ignore storage errors
    }
  }, [product._id]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const selection = JSON.parse(localStorage.getItem("menu-selection") || "[]");
      const exists = selection.some((item: any) => item.id === product._id);

      if (!exists) {
        // Resolve prices
        const price = product.hasPortions
          ? Math.min(...(product.portions?.map((p) => p.price) || [0]))
          : product.price;

const priceKWD = price; // Assuming stored price is KWD

  const itemToAdd = {
    id: product._id,
    name: isAr ? product.name.ar : product.name.en,
    priceKWD,
    description: isAr ? product.description.ar : product.description.en,
    prepTime: product.prepTime || "15-20 Mins",
    serves: product.servingSize || "1 Person",
    image: product.image,
    quantity: 1,
  };

        selection.push(itemToAdd);
        localStorage.setItem("menu-selection", JSON.stringify(selection));
        setIsAdded(true);
        
        // Dispatch event to sync other components
        window.dispatchEvent(new Event("menu-selection-changed"));
      }
    } catch (e) {
      console.error("Failed to update cart selection:", e);
    }
  };

  if (isMobile) {
    return (
      <button
        onClick={handleAdd}
        className={cn(
          "h-8 px-5 rounded-full border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white font-sans text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center",
          isAdded && "bg-brand-gold text-white border-brand-gold"
        )}
      >
        {isAdded ? (isAr ? "تم ✓" : "Added ✓") : (isAr ? "إضافة +" : "Add +")}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={cn(
        "size-7 rounded-full bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-sm border border-transparent",
        isAdded && "bg-brand-gold text-white"
      )}
      aria-label="Add to selection"
    >
      {isAdded ? "✓" : <Plus className="size-3.5" />}
    </button>
  );
}
