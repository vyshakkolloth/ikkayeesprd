"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, ShoppingCart, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Unified Menu dataset supporting both Mobile (INR) and Desktop (USD) views
interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceINR: number;
  priceUSD: number;
  rating: number;
  isChefRecommended: boolean;
  isVeg: boolean;
  image: string;
  categoryMobile: string; // Mapping to mobile category tabs
  categoryDesktop: string; // Mapping to desktop category tabs
  isTopPick: boolean;
}

const MOBILE_CATEGORIES = ["Popular", "Biriyani", "Grill", "Mandi", "Seafood"] as const;
type MobileCategory = (typeof MOBILE_CATEGORIES)[number];

const DESKTOP_CATEGORIES = ["All Dishes", "Mandi", "Grills", "Seafood", "Shawarma", "Biryani", "Desserts", "Drinks"] as const;
type DesktopCategory = (typeof DESKTOP_CATEGORIES)[number];

export { MOBILE_CATEGORIES, DESKTOP_CATEGORIES };
export type { MenuItem, MobileCategory, DesktopCategory };

export default function MenuShell({ initialDishes = [] }: { initialDishes?: MenuItem[] }) {
  const [mobileCategory, setMobileCategory] = useState<MobileCategory>("Mandi");
  const [desktopCategory, setDesktopCategory] = useState<DesktopCategory>("All Dishes");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleAddItem = (itemId: string) => {
    setCartCount((prev) => prev + 1);
    setAddedItems((prev) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [itemId]: false }));
    }, 1200);
  };

  // ----------------------------------------------------
  // FILTER LOGIC FOR BOTH VIEWS
  // ----------------------------------------------------
  const filteredMobileItems = initialDishes.filter((dish) => {
    const matchesCategory = dish.categoryMobile === mobileCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredDesktopItems = initialDishes.filter((dish) => {
    const matchesCategory =
      desktopCategory === "All Dishes" || dish.categoryDesktop === desktopCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const topPicks = initialDishes.filter(
    (dish) => dish.isTopPick && (desktopCategory === "All Dishes" || dish.categoryDesktop === desktopCategory)
  );

  // Group desktop dishes by category for structured layout
  const categoriesToShowOnDesktop = DESKTOP_CATEGORIES.filter(
    (cat) => cat !== "All Dishes" && (desktopCategory === "All Dishes" || desktopCategory === cat)
  );

  return (
    <div className="w-full h-full">
      {/* ----------------------------------------------------
          MOBILE VIEW (Viewports < 768px)
          ---------------------------------------------------- */}
      <div className="md:hidden flex flex-col w-full h-full bg-[#FDFBF7]">
        {/* Sticky Mobile Header */}
        <header className="sticky top-0 z-30 bg-brand-cream/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-brand-gold/5">
          <Link href="/" className="p-1 hover:bg-brand-gold/10 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="size-5 text-brand-dark" />
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
              Menu
            </h1>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-brand-gold/10 rounded-full transition-colors text-brand-dark" aria-label="Search">
              <Search className="size-5" />
            </button>
            <div className="relative">
              <button className="p-1 hover:bg-brand-gold/10 rounded-full transition-colors text-brand-dark" aria-label="Cart">
                <ShoppingCart className="size-5" />
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold size-3.5 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="px-4 flex flex-col gap-5 pt-3">
          {/* Mobile Search Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
              <Search className="size-4 text-brand-dark-light/50" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-[#F4EFE5] text-brand-dark placeholder-brand-dark-light/50 rounded-full ps-11 pe-4 text-sm font-sans focus:outline-none border border-transparent transition-all"
              placeholder="Search dishes, drinks, desserts..."
            />
          </div>

          {/* Mobile Categories Scrollbar */}
          <div className="w-full overflow-x-auto scrollbar-none flex items-center gap-6 py-1 px-1 border-b border-brand-gold/5">
            {MOBILE_CATEGORIES.map((cat) => {
              const isActive = mobileCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setMobileCategory(cat)}
                  className={cn(
                    "font-sans text-sm pb-2 whitespace-nowrap transition-all duration-300 relative border-b-2",
                    isActive
                      ? "text-brand-dark font-bold border-brand-dark"
                      : "text-brand-dark-light/60 hover:text-brand-dark border-transparent"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Mobile Bestseller Featured Banner */}
          <div className="w-full relative h-[180px] rounded-2xl overflow-hidden shadow-md group">
            <Image
              src="/images/restaurant_interior.png"
              alt="Warm ambient restaurant interior"
              fill
              sizes="(max-w-md) 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute inset-0 p-4 flex items-end justify-between z-10">
              <div className="flex flex-col items-start gap-1 max-w-[65%]">
                <span className="bg-brand-gold/90 text-brand-cream text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                  BESTSELLER
                </span>
                <span className="text-[11px] text-brand-cream/80 font-medium tracking-wide">
                  Most Ordered Today
                </span>
                <h2 className="font-playfair text-xl font-bold text-white leading-tight">
                  Family Mandi Feast
                </h2>
              </div>

              <button
                onClick={() => handleAddItem("mandi-3")}
                className={cn(
                  "h-9 px-5 bg-white text-brand-dark hover:bg-brand-cream font-sans text-xs font-semibold rounded-full shadow transition-all duration-200 active:scale-95 cursor-pointer",
                  addedItems["mandi-3"] && "bg-green-600 text-white hover:bg-green-600"
                )}
              >
                {addedItems["mandi-3"] ? "Added ✓" : "Add ₹1250"}
              </button>
            </div>
          </div>

          {/* Mobile Heading */}
          <div className="mt-2">
            <h3 className="font-playfair text-lg font-bold text-brand-dark tracking-wide">
              {mobileCategory} Collection
            </h3>
          </div>

          {/* Mobile Dish Cards */}
          <div className="flex flex-col gap-6 pb-8">
            {filteredMobileItems.length > 0 ? (
              filteredMobileItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full bg-white rounded-[20px] overflow-hidden border border-brand-gold/10 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-md hover:border-brand-gold/20"
                >
                  {/* Image section with overlays */}
                  <div className="relative w-full h-[220px] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-w-md) 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-103"
                    />

                    {/* Left Badges */}
                    <div className="absolute top-3 start-3 flex items-center gap-1.5 z-10">
                      <div className="bg-white/95 backdrop-blur-sm shadow px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Star className="size-3 text-brand-gold fill-brand-gold" />
                        <span className="text-[10px] font-bold text-brand-dark font-sans leading-none">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>

                      {item.isChefRecommended && (
                        <span className="bg-[#8A5A36] text-white text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase leading-none shadow">
                          CHEF RECOMMENDED
                        </span>
                      )}
                    </div>

                    {/* Right Veg/Non-veg indicator */}
                    <div className="absolute top-3 end-3 z-10">
                      <div className={cn(
                        "size-5 border-2 flex items-center justify-center bg-white/95 backdrop-blur-sm p-0.5 rounded shadow",
                        item.isVeg ? "border-green-600" : "border-red-600"
                      )}>
                        <div className={cn("size-2.5 rounded-full", item.isVeg ? "bg-green-600" : "bg-red-600")} />
                      </div>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="p-4 flex flex-col gap-1.5 bg-white">
                    <h4 className="font-playfair text-lg font-bold text-brand-dark leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-brand-dark-light/75 leading-relaxed font-sans font-light">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-1">
                      <span className="font-playfair text-base font-bold text-brand-dark">
                        ₹{item.priceINR}
                      </span>
                      <button
                        onClick={() => handleAddItem(item.id)}
                        className={cn(
                          "h-8 px-5 rounded-full border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white font-sans text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center",
                          addedItems[item.id] && "bg-brand-gold text-white border-brand-gold"
                        )}
                      >
                        {addedItems[item.id] ? "Added ✓" : "Add +"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
                <p className="text-brand-dark-light font-sans text-sm">No dishes found matching your search.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-brand-gold font-semibold hover:underline"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          DESKTOP VIEW (Viewports >= 768px)
          ---------------------------------------------------- */}
      <div className="hidden md:flex flex-col w-full bg-[#FDFBF7] px-8 lg:px-12 py-12">
        {/* Desktop Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-8">
          <h1 className="font-playfair text-4xl lg:text-[42px] font-bold text-brand-dark tracking-tight">
            Explore Our Menu
          </h1>
          <p className="text-sm text-brand-dark-light/80 leading-relaxed font-sans font-light">
            Discover the authentic flavors of Malabar, crafted with tradition and passion.
          </p>
        </div>

        {/* Desktop Search Input */}
        <div className="relative w-full max-w-xl mx-auto mb-8">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
            <Search className="size-4 text-brand-dark-light/50" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-[#F4EFE5] text-brand-dark placeholder-brand-dark-light/55 rounded-full ps-11 pe-4 text-sm font-sans focus:outline-none border border-transparent focus:ring-1 focus:ring-brand-gold/30 transition-all shadow-sm"
            placeholder="Search dishes..."
          />
        </div>

        {/* Desktop Categories Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-4xl mx-auto">
          {DESKTOP_CATEGORIES.map((cat) => {
            const isActive = desktopCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setDesktopCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-full font-sans text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm",
                  isActive
                    ? "bg-[#B88E4C] text-white"
                    : "bg-[#F3EFE6]/80 text-brand-dark hover:bg-brand-gold/15"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Top Picks Section (only visible if there are top picks to show) */}
        {topPicks.length > 0 && (
          <div className="mb-14">
            <h2 className="font-playfair text-2xl font-bold text-brand-dark mb-6 tracking-wide">
              Top Picks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topPicks.map((pick) => (
                <div
                  key={pick.id}
                  className="bg-white rounded-[20px] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-col group hover:shadow-md hover:border-brand-gold/20 transition-all duration-300"
                >
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={pick.image}
                      alt={pick.name}
                      fill
                      sizes="(max-w-lg) 50vw, 25vw"
                      className="object-cover transition-transform duration-750 group-hover:scale-103"
                    />
                    {/* Rating Overlay top right */}
                    <div className="absolute top-3 end-3 bg-white/95 backdrop-blur-sm shadow px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
                      <Star className="size-3 text-brand-gold fill-brand-gold" />
                      <span className="text-[10px] font-bold text-brand-dark leading-none font-sans">
                        {pick.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-playfair text-[17px] font-bold text-brand-dark leading-snug">
                        {pick.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-brand-dark-light/75 leading-relaxed font-sans font-light line-clamp-2">
                        {pick.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-playfair text-[15px] font-bold text-brand-dark">
                        ${pick.priceUSD.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddItem(pick.id)}
                        className={cn(
                          "size-8 rounded-full bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-sm border border-transparent",
                          addedItems[pick.id] && "bg-brand-gold text-white"
                        )}
                        aria-label={`Add ${pick.name}`}
                      >
                        {addedItems[pick.id] ? "✓" : <Plus className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section-by-Section Category Groups */}
        <div className="flex flex-col gap-12">
          {categoriesToShowOnDesktop.map((cat) => {
            const categoryItems = filteredDesktopItems.filter((dish) => dish.categoryDesktop === cat);
            if (categoryItems.length === 0) return null;

            // Section subtitle dictionary based on mock design
            const sectionSubtitles: Record<string, string> = {
              Mandi: "Traditional slow-cooked meats served over fragrant rice.",
              Grills: "Marinated overnight and charcoal-grilled to perfection.",
              Seafood: "Fresh catches seasoned with coastal spices.",
              Biryani: "Aromatic layered rice dishes, a true Malabar specialty.",
              Shawarma: "Tasty street-style wraps with savory spit-roasted meat.",
              Desserts: "Traditional Middle Eastern desserts sweet treats.",
              Drinks: "Refreshing cold beverages and juice creations."
            };

            return (
              <div key={cat} className="flex flex-col">
                <div className="border-b border-brand-gold/10 pb-3 mb-6">
                  <h2 className="font-playfair text-2xl font-bold text-brand-dark capitalize">
                    {cat}
                  </h2>
                  {sectionSubtitles[cat] && (
                    <p className="text-xs text-brand-dark-light/75 mt-1 font-sans font-light">
                      {sectionSubtitles[cat]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-[20px] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-row items-stretch group hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 min-h-[120px]"
                    >
                      {/* Left: Square Image */}
                      <div className="relative w-28 sm:w-36 shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-w-md) 30vw, 15vw"
                          className="object-cover transition-transform duration-750 group-hover:scale-103"
                        />
                      </div>

                      {/* Right: Info Details */}
                      <div className="p-4 flex-grow flex flex-col justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-playfair text-base font-bold text-brand-dark leading-snug">
                              {item.name}
                            </h3>
                            {/* Rating overlay inside details top-right */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Star className="size-3 text-brand-gold fill-brand-gold" />
                              <span className="text-[10px] font-bold text-brand-dark font-sans leading-none">
                                {item.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] sm:text-xs text-brand-dark-light/75 leading-relaxed font-sans font-light line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="font-playfair text-sm font-bold text-brand-dark">
                            ${item.priceUSD.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleAddItem(item.id)}
                            className={cn(
                              "size-7 rounded-full bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-sm border border-transparent",
                              addedItems[item.id] && "bg-brand-gold text-white"
                            )}
                            aria-label={`Add ${item.name}`}
                          >
                            {addedItems[item.id] ? "✓" : <Plus className="size-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Empty State */}
        {filteredDesktopItems.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
            <p className="text-brand-dark-light font-sans text-base">No dishes found matching your search query.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-brand-gold font-semibold hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
