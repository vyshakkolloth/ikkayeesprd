"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuHeaderProps {
  locale?: string;
}

export function MenuHeader({ locale = "en" }: MenuHeaderProps) {
  const [cartCount, setCartCount] = React.useState(0);
  const isAr = locale === "ar";

  const updateCartCount = () => {
    try {
      const selection = JSON.parse(localStorage.getItem("menu-selection") || "[]");
      const count = selection.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (e) {
      // Ignore
    }
  };

  React.useEffect(() => {
    updateCartCount();

    // Listen to changes
    window.addEventListener("menu-selection-changed", updateCartCount);
    return () => {
      window.removeEventListener("menu-selection-changed", updateCartCount);
    };
  }, []);

  return (
    <>
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-30 bg-brand-cream/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-brand-gold/5 md:hidden">
        <Link href="/" className="p-1 hover:bg-brand-gold/10 rounded-full transition-colors" aria-label="Go back">
          <ArrowLeft className={cn("size-5 text-brand-dark", isAr && "rotate-180")} />
        </Link>

        {/* Center Logo and Title */}
        <div className="flex items-center gap-2">
          <div className="relative size-7 rounded-full bg-brand-dark border border-brand-gold/30 flex items-center justify-center overflow-hidden">
            <Image
              src="/logos/ikkayeslogo.png"
              alt="Logo"
              width={28}
              height={28}
              className="object-cover scale-110"
            />
          </div>
          <h1 className="font-playfair text-[19px] font-bold tracking-wide text-brand-dark">
            {isAr ? "القائمة" : "Menu"}
          </h1>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Link href="/selection" className="p-1 hover:bg-brand-gold/10 rounded-full transition-colors text-brand-dark block" aria-label="Cart">
              <ShoppingCart className="size-5" />
            </Link>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold size-3.5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col text-center max-w-2xl mx-auto gap-3 mb-8" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="font-playfair text-4xl lg:text-[42px] font-bold text-brand-dark tracking-tight">
          {isAr ? "استكشف قائمتنا" : "Explore Our Menu"}
        </h1>
        <p className="text-sm text-brand-dark-light/80 leading-relaxed font-sans font-light">
          {isAr 
            ? "اكتشف النكهات الأصيلة من مالابار، المحضرة بالتقاليد والشغف."
            : "Discover the authentic flavors of Malabar, crafted with tradition and passion."
          }
        </p>
      </div>
    </>
  );
}
