"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock menu items grouped by category
const MENU_DATA = {
  Mandi: [
    {
      id: "mandi-1",
      name: "Chicken Kuzhi Mandi",
      description: "Authentic slow-cooked spiced chicken served over fragrant, smoky basmati rice",
      price: 320,
      rating: 4.9,
      isChefRecommended: true,
      isVeg: false,
      image: "/images/chicken_mandi.png",
    },
    {
      id: "mandi-2",
      name: "Mutton Juicy Mandi",
      description: "Tender, succulent mutton slow-cooked in traditional style served with spiced rice",
      price: 480,
      rating: 4.8,
      isChefRecommended: false,
      isVeg: false,
      image: "/images/chicken_mandi.png",
    },
  ],
  Biriyani: [
    {
      id: "biriyani-1",
      name: "Thalassery Chicken Biriyani",
      description: "Fragrant Kaima rice cooked with ghee, crispy fried onions, and marinated chicken",
      price: 280,
      rating: 4.9,
      isChefRecommended: true,
      isVeg: false,
      image: "/images/chicken_mandi.png",
    },
    {
      id: "biriyani-2",
      name: "Malabar Mutton Biriyani",
      description: "Traditional Malabar style biriyani featuring tender mutton pieces and spices",
      price: 390,
      rating: 4.7,
      isChefRecommended: false,
      isVeg: false,
      image: "/images/chicken_mandi.png",
    },
  ],
  Grill: [
    {
      id: "grill-1",
      name: "Al Faham Chicken",
      description: "Arabic barbecued chicken marinated in house spices, grilled over natural charcoal",
      price: 260,
      rating: 4.8,
      isChefRecommended: true,
      isVeg: false,
      image: "/images/chicken_mandi.png",
    },
    {
      id: "grill-2",
      name: "Kanthari Al Faham",
      description: "Spicy bird's eye chili marinated charcoal grilled chicken, served with garlic paste",
      price: 280,
      rating: 4.6,
      isChefRecommended: false,
      isVeg: false,
      image: "/images/chicken_mandi.png",
    },
  ],
  Popular: [
    {
      id: "popular-1",
      name: "Family Mandi Feast",
      description: "Large platter of Kuzhi Mandi with double portions of chicken, salad, and special sauces",
      price: 1250,
      rating: 4.9,
      isChefRecommended: true,
      isVeg: false,
      image: "/images/restaurant_interior.png",
    },
    {
      id: "popular-2",
      name: "Chicken Kuzhi Mandi",
      description: "Authentic slow-cooked spiced chicken served over fragrant, smoky basmati rice",
      price: 320,
      rating: 4.9,
      isChefRecommended: true,
      isVeg: false,
      image: "/images/chicken_mandi.png",
    },
  ],
  Seafood: [
    {
      id: "seafood-1",
      name: "Tawa Grilled Hammour",
      description: "Fresh catch Hammour marinated in local coastal spices and seared on a flat top",
      price: 550,
      rating: 4.9,
      isChefRecommended: true,
      isVeg: false,
      image: "/images/chicken_mandi.png",
    },
  ],
};

const CATEGORIES = ["Popular", "Biriyani", "Grill", "Mandi", "Seafood"] as const;
type Category = (typeof CATEGORIES)[number];

export default function MenuShell() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Mandi");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Filter items based on category and search query
  const currentItems = (MENU_DATA[selectedCategory] || []).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = (itemId: string) => {
    setCartCount((prev) => prev + 1);
    setAddedItems((prev) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [itemId]: false }));
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full h-full relative pb-12">
      {/* Header section matching Figma screenshot */}
      <header className="sticky top-0 z-30 bg-brand-cream/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-brand-gold/5">
        <Link href="/" className="p-1 hover:bg-brand-gold/10 rounded-full transition-colors" aria-label="Go back">
          <ArrowLeft className="size-5 text-brand-dark" />
        </Link>

        {/* Center Logo and Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative size-7 rounded-full bg-brand-dark border border-brand-gold/30 flex items-center justify-center overflow-hidden">
            <Image
              src="/logos/ikkayeslogo.png"
              alt="Logo"
              width={28}
              height={28}
              className="object-cover scale-110"
            />
          </div>
          <h1 className="font-playfair text-xl font-semibold tracking-wide text-brand-dark">
            Menu
          </h1>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-brand-gold/10 rounded-full transition-colors text-brand-dark" aria-label="Search">
            <Search className="size-5" />
          </button>
          <div className="relative">
            <button className="p-1 hover:bg-brand-gold/10 rounded-full transition-colors text-brand-dark" aria-label="Cart">
              <ShoppingCart className="size-5" />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold size-4 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-4 flex flex-col gap-5 pt-3">
        {/* Search input container */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
            <Search className="size-4.5 text-brand-dark-light/50" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-[#F4EFE5] text-brand-dark placeholder-brand-dark-light/50 rounded-full ps-11 pe-4 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-brand-gold/30 border border-transparent transition-all"
            placeholder="Search dishes, drinks, desserts..."
          />
        </div>

        {/* Categories scrollbar */}
        <div className="w-full overflow-x-auto scrollbar-none flex items-center gap-6 py-1 px-1 border-b border-brand-gold/5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "font-sans text-sm pb-2.5 whitespace-nowrap transition-all duration-300 relative border-b-2",
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

        {/* Featured Bestseller Banner (Most Ordered Today) */}
        <div className="w-full relative h-[180px] rounded-2xl overflow-hidden shadow-md group">
          <Image
            src="/images/restaurant_interior.png"
            alt="Warm ambient restaurant interior"
            fill
            sizes="(max-w-md) 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/45" />

          {/* Banner Contents */}
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
              onClick={() => handleAddItem("popular-1")}
              className={cn(
                "h-9 px-5 bg-white text-brand-dark hover:bg-brand-cream font-sans text-xs font-semibold rounded-full shadow transition-all duration-200 active:scale-95 cursor-pointer",
                addedItems["popular-1"] && "bg-green-600 text-white hover:bg-green-600"
              )}
            >
              {addedItems["popular-1"] ? "Added ✓" : "Add ₹1250"}
            </button>
          </div>
        </div>

        {/* Active Category Heading */}
        <div className="mt-2">
          <h3 className="font-playfair text-lg font-bold text-brand-dark tracking-wide">
            {selectedCategory} Collection
          </h3>
        </div>

        {/* Dishes Grid */}
        <div className="flex flex-col gap-6">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div
                key={item.id}
                className="w-full bg-[#FDFBF7] rounded-[20px] overflow-hidden border border-brand-gold/10 shadow-sm flex flex-col group transition-all duration-300 hover:shadow-md hover:border-brand-gold/20"
              >
                {/* Product Image section with badges */}
                <div className="relative w-full h-[220px] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-w-md) 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  {/* Badges on Top-Left */}
                  <div className="absolute top-3 start-3 flex items-center gap-1.5 z-10">
                    {/* Rating Badge */}
                    <div className="bg-white/95 backdrop-blur-sm shadow px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="size-3 text-brand-gold fill-brand-gold" />
                      <span className="text-[10px] font-bold text-brand-dark font-sans leading-none">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Chef Recommended Badge */}
                    {item.isChefRecommended && (
                      <span className="bg-[#8A5A36] text-white text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase leading-none shadow">
                        CHEF RECOMMENDED
                      </span>
                    )}
                  </div>

                  {/* Veg/Non-veg marker on Top-Right */}
                  <div className="absolute top-3 end-3 z-10">
                    <div className="size-5 border-2 border-red-600 flex items-center justify-center bg-white/95 backdrop-blur-sm p-0.5 rounded shadow">
                      <div className="size-2.5 rounded-full bg-red-600" />
                    </div>
                  </div>
                </div>

                {/* Product Info details */}
                <div className="p-4 flex flex-col gap-1.5 bg-white">
                  <h4 className="font-playfair text-lg font-bold text-brand-dark leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-brand-dark-light/75 leading-relaxed font-sans font-light">
                    {item.description}
                  </p>

                  {/* Pricing and CTA button */}
                  <div className="flex items-center justify-between mt-3 pt-1">
                    <span className="font-playfair text-base font-bold text-brand-dark">
                      ₹{item.price}
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
  );
}
