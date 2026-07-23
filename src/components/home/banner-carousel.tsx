"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerItem } from "@/lib/db/repositories/settings.repository";

interface BannerCarouselProps {
  banners?: BannerItem[];
  lang?: string;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: "default_1",
    title: {
      en: "Authentic Malabar Feast",
      ar: "وليمة مليبار الأصيلة",
    },
    subtitle: {
      en: "Discover rich traditional spices, slow-cooked Biriyanis, and artisanal seafood delights.",
      ar: "اكتشف التوابل التقليدية الغنية، والبرياني المطبوخ ببطء، ولذائذ المأكولات البحرية.",
    },
    desktopImageUrl: "/images/all_dishes.png",
    mobileImageUrl: "/images/all_dishes.png",
    linkUrl: "/menu",
    ctaText: {
      en: "Explore Menu",
      ar: "استكشف القائمة",
    },
    active: true,
    sortOrder: 1,
  },
  {
    id: "default_2",
    title: {
      en: "Signature Mandi Collection",
      ar: "مجموعة المندي المتميزة",
    },
    subtitle: {
      en: "Tender meat slow-cooked to perfection over open embers.",
      ar: "لحم طري مطبوخ ببطء وعناية فائقة على الجمر.",
    },
    desktopImageUrl: "/images/restaurant_interior.png",
    mobileImageUrl: "/images/restaurant_interior.png",
    linkUrl: "/menu",
    ctaText: {
      en: "Order Mandi",
      ar: "اطلب المندي",
    },
    active: true,
    sortOrder: 2,
  },
];

export default function BannerCarousel({ banners = [], lang = "en" }: BannerCarouselProps) {
  const isRTL = lang === "ar";
  
  // Filter active banners and sort
  const activeBanners = React.useMemo(() => {
    const list = banners.filter((b) => b.active !== false);
    if (list.length === 0) return DEFAULT_BANNERS;
    return list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [banners]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Auto-play timer
  useEffect(() => {
    if (isHovered || activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, activeBanners.length]);

  // Touch handlers for swipe on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left
        if (isRTL) prevSlide();
        else nextSlide();
      } else {
        // Swiped right
        if (isRTL) nextSlide();
        else prevSlide();
      }
    }
  };

  if (activeBanners.length === 0) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#1A1613]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-out h-[360px] sm:h-[480px] md:h-[540px] lg:h-[600px]"
        style={{
          transform: isRTL
            ? `translateX(${currentIndex * 100}%)`
            : `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {activeBanners.map((banner, index) => {
          const title = banner.title?.[lang as "en" | "ar"] || banner.title?.en || "";
          const subtitle = banner.subtitle?.[lang as "en" | "ar"] || banner.subtitle?.en || "";
          const cta = banner.ctaText?.[lang as "en" | "ar"] || banner.ctaText?.en || (lang === "ar" ? "استكشف" : "Explore");
          const desktopImg = banner.desktopImageUrl || "/images/all_dishes.png";
          const mobileImg = banner.mobileImageUrl || desktopImg;

          return (
            <div key={banner.id || index} className="relative w-full h-full flex-shrink-0">
              {/* Responsive Images: Mobile Image on <768px, Desktop Image on >=768px */}
              <picture className="absolute inset-0 w-full h-full">
                <source media="(min-width: 768px)" srcSet={desktopImg} />
                <img
                  src={mobileImg}
                  alt={title || "Banner"}
                  className="w-full h-full object-cover"
                />
              </picture>

              {/* Dark Gradient Overlay for optimal text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(184,142,76,0.15)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Banner Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-12 z-10 max-w-4xl mx-auto">
                {title && (
                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4 leading-tight drop-shadow-md">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-base md:text-lg text-gray-200 max-w-2xl mb-8 leading-relaxed font-sans font-light drop-shadow-sm line-clamp-3 sm:line-clamp-none">
                    {subtitle}
                  </p>
                )}
                {banner.linkUrl && (
                  <Link
                    href={banner.linkUrl}
                    className="inline-flex h-10 sm:h-12 items-center justify-center rounded-full bg-[#B88E4C] px-6 sm:px-8 text-xs sm:text-sm font-semibold text-[#FAF6EE] shadow-lg hover:bg-[#B88E4C]/95 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    {cta}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Only if more than 1 banner) */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={isRTL ? nextSlide : prevSlide}
            aria-label="Previous Slide"
            className="absolute top-1/2 start-4 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all border border-white/10 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className={`size-6 ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={isRTL ? prevSlide : nextSlide}
            aria-label="Next Slide"
            className="absolute top-1/2 end-4 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all border border-white/10 hover:scale-110 active:scale-95"
          >
            <ChevronRight className={`size-6 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center items-center gap-2">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === idx
                  ? "w-8 h-2.5 bg-[#B88E4C]"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
