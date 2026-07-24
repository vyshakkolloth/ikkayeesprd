"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface TopDishProduct {
  _id: string;
  name: { en: string; ar: string };
  price: number;
  image?: string;
}

interface TopDishesCarouselProps {
  products: TopDishProduct[];
  lang?: string;
  dict: {
    topDishes: string;
    topDishesSub: string;
    bestseller: string;
    orderNow: string;
  };
}

export default function TopDishesCarousel({
  products = [],
  lang = "en",
  dict,
}: TopDishesCarouselProps) {
  const isRTL = lang === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Drag tracking refs
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Update scroll arrow state
  const checkScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (isRTL) {
      const absScroll = Math.abs(scrollLeft);
      setCanScrollLeft(absScroll < maxScroll - 5);
      setCanScrollRight(absScroll > 5);
    } else {
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < maxScroll - 5);
    }
  }, [isRTL]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollState();
    el.addEventListener("scroll", checkScrollState);
    window.addEventListener("resize", checkScrollState);

    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState]);

  // Auto-scroll effect (step auto-scroll every 3.2 seconds)
  useEffect(() => {
    if (isHovered || isDragging || products.length <= 1) return;

    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const cardWidth = el.querySelector("div")?.clientWidth || 280;
      const scrollAmount = cardWidth + 20; // card width + gap

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;

      if (isRTL) {
        // RTL logic
        const currentAbs = Math.abs(scrollLeft);
        if (currentAbs >= maxScroll - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        }
      } else {
        // LTR logic
        if (scrollLeft >= maxScroll - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isHovered, isDragging, products.length, isRTL]);

  // Manual scroll button handlers
  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = el.querySelector("div")?.clientWidth || 280;
    const scrollAmount = cardWidth + 20;

    let multiplier = direction === "right" ? 1 : -1;
    if (isRTL) multiplier *= -1;

    el.scrollBy({ left: scrollAmount * multiplier, behavior: "smooth" });
  };

  // Mouse Drag Handlers for Cursor Interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = scrollRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;

    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }

    el.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  // Suppress link navigation if user was dragging
  const handleCardClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header with Title and Scroll Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-[#B88E4C]" />
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C2520]">
              {dict.topDishes}
            </h2>
          </div>
          <p className="text-sm text-[#5A4E46] font-sans font-light">
            {dict.topDishesSub}
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className={`size-10 rounded-full border border-amber-900/15 bg-white flex items-center justify-center text-[#2C2520] transition-all shadow-sm active:scale-95 ${
              canScrollLeft
                ? "hover:bg-[#B88E4C] hover:text-white hover:border-[#B88E4C] cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className={`size-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>

          <button
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className={`size-10 rounded-full border border-amber-900/15 bg-white flex items-center justify-center text-[#2C2520] transition-all shadow-sm active:scale-95 ${
              canScrollRight
                ? "hover:bg-[#B88E4C] hover:text-white hover:border-[#B88E4C] cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <ChevronRight className={`size-5 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Auto-scroll Cursor Carousel Track */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseUpOrLeave();
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        className={`flex overflow-x-auto gap-5 pb-4 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 select-none ${
          isDragging ? "cursor-grabbing snap-none" : "cursor-grab"
        }`}
        style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
      >
        {products.map((p) => {
          const name = p.name[lang as "en" | "ar"] || p.name.en || "";
          return (
            <div
              key={p._id}
              onClick={handleCardClick}
              className="min-w-[240px] w-[240px] sm:min-w-[280px] sm:w-[280px] bg-white rounded-2xl overflow-hidden border border-amber-900/10 shadow-sm relative snap-start hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                <img
                  src={p.image || "/images/restaurant_interior.png"}
                  alt={name}
                  draggable={false}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                />
                <span className="absolute top-3 start-3 bg-[#B88E4C] text-[#FAF6EE] text-[10px] px-2.5 py-0.5 rounded-full font-sans tracking-wide shadow-sm">
                  {dict.bestseller}
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <h4 className="font-playfair font-bold text-base text-[#2C2520] truncate group-hover:text-[#B88E4C] transition-colors">
                  {name}
                </h4>
                <div className="flex justify-between items-center pt-1 border-t border-amber-900/5">
                  <span className="text-sm font-bold text-[#B88E4C] font-sans">
                    ${p.price.toFixed(2)}
                  </span>
                  <Link
                    href="/menu"
                    className="text-xs text-[#B88E4C] hover:underline font-sans font-medium flex items-center gap-1"
                  >
                    <span>{dict.orderNow}</span>
                    <span>{isRTL ? "←" : "→"}</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
