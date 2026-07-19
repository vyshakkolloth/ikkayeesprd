"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, ShoppingCart, Star, Plus, Check, Minus, X } from "lucide-react";
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

const CATEGORY_IMAGES: Record<string, string> = {
  "All Dishes": "/images/all_dishes.png",
  "Popular": "/images/all_dishes.png",
  "Mandi": "/images/chicken_mandi.png",
  "Grills": "/images/mixed_grill.png",
  "Grill": "/images/mixed_grill.png",
  "Seafood": "/images/seafood_platter.png",
  "Shawarma": "/images/chicken_shawarma.png",
  "Biryani": "/images/thalassery_biryani.png",
  "Biriyani": "/images/thalassery_biryani.png",
  "Desserts": "/images/kunafa.png",
  "Drinks": "/images/mint_limeade.png"
};

// Helper functions for dynamic details shown in the detail modal
const getServingSize = (item: MenuItem) => {
  if (item.id === "mandi-3") return "4-5 People";
  const cat = item.categoryDesktop.toLowerCase();
  if (cat.includes("mandi")) return "2-3 People";
  if (cat.includes("grill") || cat.includes("seafood") || cat.includes("dessert")) return "1-2 People";
  return "1 Person";
};

const getPrepTime = (item: MenuItem) => {
  const cat = item.categoryDesktop.toLowerCase();
  if (cat.includes("mandi")) return "25-30 Mins";
  if (cat.includes("grill")) return "20-25 Mins";
  if (cat.includes("seafood")) return "15-20 Mins";
  if (cat.includes("biryani")) return "15 Mins";
  if (cat.includes("shawarma")) return "5-10 Mins";
  if (cat.includes("dessert")) return "5 Mins";
  return "3-5 Mins";
};

const getChefRecommendation = (item: MenuItem) => {
  const cat = item.categoryDesktop.toLowerCase();
  if (
    cat.includes("mandi") ||
    cat.includes("grill") ||
    cat.includes("seafood") ||
    cat.includes("biryani") ||
    cat.includes("shawarma")
  ) {
    return "Pair with: Fresh Mint Mojito";
  }
  if (cat.includes("dessert")) {
    return "Pair with: Cardamom Karak Chai";
  }
  return "Pair with: Authentic Kunafa";
};

const getContainsNuts = (item: MenuItem) => {
  const name = item.name.toLowerCase();
  const desc = item.description.toLowerCase();
  return (
    name.includes("mandi") ||
    desc.includes("nuts") ||
    name.includes("kunafa") ||
    desc.includes("pistachio")
  );
};

const needsSpiceLevel = (item: MenuItem) => {
  const cat = item.categoryDesktop.toLowerCase();
  return !["drinks", "desserts"].includes(cat);
};

export default function MenuShell({ initialDishes = [] }: { initialDishes?: MenuItem[] }) {
  const [mobileCategory, setMobileCategory] = useState<MobileCategory>("Mandi");
  const [desktopCategory, setDesktopCategory] = useState<DesktopCategory>("All Dishes");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Detail Modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [spiceLevel, setSpiceLevel] = useState<"Low" | "Medium" | "High">("Medium");
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddItem = (itemId: string, qty: number = 1) => {
    setCartCount((prev) => prev + qty);
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

          {/* Mobile Categories Scrollbar (Sticky) */}
          <div className="sticky top-[60px] z-20 bg-[#FDFBF7]/95 backdrop-blur-md w-full overflow-x-auto scrollbar-none flex items-center gap-5 py-3 px-4 border-b border-[#FAF6EE] select-none -mx-4">
            {MOBILE_CATEGORIES.map((cat) => {
              const isActive = mobileCategory === cat;
              const img = CATEGORY_IMAGES[cat] || "/images/all_dishes.png";
              return (
                <button
                  key={cat}
                  onClick={() => setMobileCategory(cat)}
                  className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none shrink-0"
                >
                  <div className="relative">
                    {/* Circle Image Wrapper */}
                    <div
                      className={cn(
                        "size-[72px] rounded-full overflow-hidden border-2 transition-all duration-300 p-0.5 bg-white",
                        isActive
                          ? "border-[#B88E4C] scale-105 shadow-md"
                          : "border-transparent group-hover:border-[#B88E4C]/40"
                      )}
                    >
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={img}
                          alt={cat}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Active Tick Badge */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 bg-[#B88E4C] text-white rounded-full size-5.5 flex items-center justify-center border border-white shadow">
                        <Check className="size-3.5 stroke-[3.5]" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "font-sans text-[11px] tracking-wide transition-colors duration-300",
                      isActive
                        ? "text-[#B88E4C] font-bold"
                        : "text-brand-dark-light/75 group-hover:text-brand-dark"
                    )}
                  >
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Bestseller Featured Banner */}
          <div
            onClick={() => {
              const item = initialDishes.find((d) => d.id === "mandi-3");
              if (item) {
                setSelectedItem(item);
                setSpiceLevel("Medium");
                setQuantity(1);
              }
            }}
            className="w-full relative h-[180px] rounded-2xl overflow-hidden shadow-md group cursor-pointer"
          >
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddItem("mandi-3");
                }}
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
                  onClick={() => {
                    setSelectedItem(item);
                    setSpiceLevel("Medium");
                    setQuantity(1);
                  }}
                  className="w-full bg-white rounded-[20px] overflow-hidden border border-brand-gold/10 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-md hover:border-brand-gold/20 cursor-pointer"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(item.id);
                        }}
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

        {/* Desktop Categories Circular Triggers (Sticky Wrapper) */}
        <div className="sticky top-20 z-20 bg-[#FDFBF7]/95 backdrop-blur-md w-full py-5 border-b border-brand-gold/5 -mx-8 px-8 lg:-mx-12 lg:px-12 mb-10 select-none">
          <div className="flex flex-wrap justify-center gap-7 max-w-4xl mx-auto">
            {DESKTOP_CATEGORIES.map((cat) => {
              const isActive = desktopCategory === cat;
              const img = CATEGORY_IMAGES[cat] || "/images/all_dishes.png";
              return (
                <button
                  key={cat}
                  onClick={() => setDesktopCategory(cat)}
                  className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <div className="relative animate-fade-in duration-300">
                    {/* Circle Image Wrapper */}
                    <div
                      className={cn(
                        "size-[80px] rounded-full overflow-hidden border-2 transition-all duration-300 p-0.5 bg-white",
                        isActive
                          ? "border-[#B88E4C] scale-105 shadow-md"
                          : "border-transparent group-hover:border-[#B88E4C]/40"
                      )}
                    >
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={img}
                          alt={cat}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Active Tick Badge */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 bg-[#B88E4C] text-white rounded-full size-6.5 flex items-center justify-center border border-white shadow">
                        <Check className="size-4 stroke-[3.5]" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "font-sans text-xs tracking-wide transition-colors duration-300",
                      isActive
                        ? "text-[#B88E4C] font-bold"
                        : "text-brand-dark-light/75 group-hover:text-brand-dark"
                    )}
                  >
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
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
                  onClick={() => {
                    setSelectedItem(pick);
                    setSpiceLevel("Medium");
                    setQuantity(1);
                  }}
                  className="bg-white rounded-[20px] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-col group hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 cursor-pointer"
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
                        KWD${pick.priceUSD.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(pick.id);
                        }}
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
                      onClick={() => {
                        setSelectedItem(item);
                        setSpiceLevel("Medium");
                        setQuantity(1);
                      }}
                      className="bg-white rounded-[20px] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-row items-stretch group hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 min-h-[120px] cursor-pointer"
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
                            KWD${item.priceUSD.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddItem(item.id);
                            }}
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

      {/* ----------------------------------------------------
          PRODUCT DETAIL MODAL
          ---------------------------------------------------- */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative bg-[#FDFBF7] w-full max-w-[460px] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Container */}
            <div className="overflow-y-auto w-full scrollbar-thin">
              {/* Header Image */}
              <div className="relative h-[220px] w-full shrink-0">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  sizes="460px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-10 size-8 rounded-full bg-white hover:bg-brand-cream text-brand-dark flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 cursor-pointer border border-brand-gold/10"
                  aria-label="Close modal"
                >
                  <X className="size-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Content Panel */}
              <div className="px-6 py-5 flex flex-col">
                {/* Bestseller / Chef Recommended Badge */}
                <div>
                  {selectedItem.isTopPick ? (
                    <span className="inline-block border border-[#B88E4C]/30 bg-[#B88E4C]/5 text-[#B88E4C] text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded uppercase font-sans">
                      Bestseller
                    </span>
                  ) : selectedItem.isChefRecommended ? (
                    <span className="inline-block border border-[#8A5A36]/30 bg-[#8A5A36]/5 text-[#8A5A36] text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded uppercase font-sans">
                      Chef Recommended
                    </span>
                  ) : null}
                </div>

                {/* Title */}
                <h2 className="font-playfair text-2xl font-bold text-brand-dark leading-tight mt-2.5">
                  {selectedItem.name}
                </h2>

                {/* Spice Level Selection (only for savory items) */}
                {needsSpiceLevel(selectedItem) && (
                  <div className="mt-4">
                    <span className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark-light/65 uppercase">
                      Spice Level
                    </span>
                    <div className="flex gap-2.5 mt-1.5">
                      {(["Low", "Medium", "High"] as const).map((level) => {
                        const isSelected = spiceLevel === level;
                        return (
                          <button
                            key={level}
                            onClick={() => setSpiceLevel(level)}
                            className={cn(
                              "px-5 py-1.5 rounded-full border text-xs font-sans transition-all duration-200 cursor-pointer",
                              isSelected
                                ? "border-[#B88E4C] text-[#B88E4C] bg-[#B88E4C]/5 font-semibold"
                                : "border-brand-gold/15 text-brand-dark-light/80 hover:border-[#B88E4C]/50 hover:bg-brand-gold/5 font-medium"
                            )}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Serving Size & Prep Time Section */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-brand-gold/10 py-3.5 my-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[9px] font-bold tracking-widest text-[#8A6D3B] uppercase">
                      Serving Size
                    </span>
                    <span className="font-sans text-xs font-semibold text-brand-dark">
                      {getServingSize(selectedItem)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[9px] font-bold tracking-widest text-[#8A6D3B] uppercase">
                      Prep Time
                    </span>
                    <span className="font-sans text-xs font-semibold text-brand-dark">
                      {getPrepTime(selectedItem)}
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div>
                  {/* Responsive price: shows INR on mobile layout (hidden on md), USD on desktop layout (hidden on mobile) */}
                  <span className="block md:hidden font-sans text-2xl font-bold text-[#B88E4C]">
                    ₹{selectedItem.priceINR}
                  </span>
                  <span className="hidden md:block font-sans text-2xl font-bold text-[#B88E4C]">
                    KWD${selectedItem.priceUSD.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <p className="font-sans text-[12px] font-light text-brand-dark-light/90 leading-relaxed mt-2">
                  {selectedItem.description}
                </p>

                {/* Dietary and Prep Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {/* Veg / Non-Veg Badge */}
                  <span className="bg-[#F4EFE5] text-brand-dark text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-brand-gold/10">
                    <span className={cn(
                      "size-1.5 rounded-full",
                      selectedItem.isVeg ? "bg-green-600" : "bg-red-600"
                    )} />
                    {selectedItem.isVeg ? "100% Veg" : "100% Halal"}
                  </span>

                  {/* Contains Nuts Badge */}
                  {getContainsNuts(selectedItem) && (
                    <span className="bg-[#F4EFE5] text-[#8A5A36] text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-brand-gold/10">
                      🥜 Contains Nuts
                    </span>
                  )}
                </div>

                {/* Chef Recommendation / Pairing Card */}
                <div className="bg-[#F6EFE2] rounded-xl p-3.5 mt-4 border border-[#B88E4C]/10 flex flex-col gap-0.5">
                  <span className="font-sans text-[10px] font-bold tracking-wider text-[#8D6B3E] uppercase">
                    Chef Recommendation
                  </span>
                  <span className="font-sans text-xs text-brand-dark font-medium">
                    {getChefRecommendation(selectedItem)}
                  </span>
                </div>

                {/* Quantity Selector Section */}
                <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-brand-gold/10">
                  <span className="font-sans text-sm font-semibold text-brand-dark">
                    Quantity
                  </span>
                  
                  {/* Stepper */}
                  <div className="flex items-center gap-3.5 bg-[#F4EFE5] px-3.5 py-1.5 rounded-full border border-brand-gold/5">
                    <button
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
                      onClick={() => setQuantity((q) => q + 1)}
                      className="size-5 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-gold/10 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Add to Selection Button */}
                <button
                  onClick={() => {
                    handleAddItem(selectedItem.id, quantity);
                    setSelectedItem(null);
                  }}
                  className="w-full h-11 bg-[#2A1E17] hover:bg-[#3B2C24] text-white font-sans text-sm font-semibold rounded-full shadow-md transition-all duration-200 mt-5 active:scale-[0.98] cursor-pointer"
                >
                  Add To Selection
                </button>

                {/* Continue Browsing */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full text-center text-[11px] text-brand-dark-light/70 hover:text-brand-dark transition-colors mt-3.5 font-sans font-medium cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
