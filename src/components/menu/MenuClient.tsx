"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, Star, Plus, Check, Minus, X, ChevronLeft, ChevronRight, Globe, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/store/cartStore";


interface Product {
  active: boolean;
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  slug: string;
  categoryId: string;
  price: number;
  chefRecommended: boolean;
  topPick: boolean;
  spiceLevel?: "none" | "low" | "medium" | "high" | string;
  isVeg: boolean;
  tags: string[];
  servingSize?: string;
  prepTime?: string;
  image: string;
  hasPortions?: boolean;
  portions?: Array<{
    name: { en: string; ar: string };
    price: number;
  }>;
}

interface Category {
  description?: { en: string; ar: string };
  id: string;
  name: { en: string; ar: string };
  slug: string;
  priority: number;
  isActive: boolean;
  image?: string;
}

interface MenuClientProps {
  categories: Category[];
  products: Product[];
}

interface CartItem {
  id: string;
  name: string;
  priceINR: number;
  description: string;
  prepTime: string;
  serves: string;
  image: string;
  quantity: number;
}

// Translations dictionary
const TRANSLATIONS = {
  en: {
    title: "Explore Our Menu",
    subtitle: "Discover the authentic flavors of Malabar, crafted with tradition and passion.",
    allDishes: "All Dishes",
    topPicks: "Top Picks",
    searchPlaceholder: "Search dishes, drinks, desserts...",
    spiceLevel: "Spice Level",
    servingSize: "Serving Size",
    prepTime: "Prep Time",
    quantity: "Quantity",
    addToSelection: "Add To Selection",
    continueBrowsing: "Continue Browsing",
    bestseller: "Bestseller",
    chefRecommended: "Chef Recommended",
    veg: "100% Veg",
    halal: "100% Halal",
    added: "Added ✓",
    addedToCart: "Added to selection",
    noItems: "No dishes found matching your search query.",
    clearSearch: "Clear Search",
    itemsSelected: "items selected",
    viewSelection: "View Selection",
    spiceLow: "Low",
    spiceMedium: "Medium",
    spiceHigh: "High",
    servingDefault: "1-2 People",
    prepDefault: "15-20 Mins",
    currency: "KWD",
    portions: "Portions",
    selectPortion: "Select Portion",
    customize: "Customize",
    add: "ADD",
    done: "Done"
  },
  ar: {
    title: "استكشف قائمتنا",
    subtitle: "اكتشف النكهات الأصيلة لمالابار، المصنوعة بالتقاليد والشغف.",
    allDishes: "جميع الأطباق",
    topPicks: "أفضل الاختيارات",
    searchPlaceholder: "ابحث عن الأطباق، المشروبات، الحلويات...",
    spiceLevel: "مستوى التوابل",
    servingSize: "حجم الوجبة",
    prepTime: "وقت التحضير",
    quantity: "الكمية",
    addToSelection: "أضف إلى اختياراتي",
    continueBrowsing: "متابعة التصفح",
    bestseller: "الأكثر مبيعاً",
    chefRecommended: "توصية الشيف",
    veg: "١٠٠٪ نباتي",
    halal: "١٠٠٪ حلال",
    added: "تمت الإضافة ✓",
    addedToCart: "تمت الإضافة إلى الاختيارات",
    noItems: "لم يتم العثور على أطباق مطابقة لبحثك.",
    clearSearch: "مسح البحث",
    itemsSelected: "أطباق تم اختيارها",
    viewSelection: "عرض الاختيارات",
    spiceLow: "خفيف",
    spiceMedium: "متوسط",
    spiceHigh: "حار",
    servingDefault: "١-٢ أشخاص",
    prepDefault: "١٥-٢٠ دقيقة",
    currency: "د.ك",
    portions: "الأحجام",
    selectPortion: "اختر الحجم",
    customize: "تخصيص",
    add: "إضافة",
    done: "تم"
  }
};

export default function MenuClient({ categories = [], products = [] }: MenuClientProps) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const getValidSpiceLevel = (level?: string): "low" | "medium" | "high" => {
    if (level === "low" || level === "high") return level;
    return "medium";
  };

  // Detail Modal state
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [spiceLevel, setSpiceLevel] = useState<"low" | "medium" | "high">("medium");
  const [quantity, setQuantity] = useState<number>(1);

  const t = TRANSLATIONS[lang];

  // Carousel ref for Top Picks
  const topPicksContainerRef = useRef<HTMLDivElement>(null);

  // Cart count derived from global store
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCart();
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddItem = (product: Product, qty: number = 1) => {
    try {
      const nameString = lang === "ar" ? product.name.ar : product.name.en;
      const descString = lang === "ar" ? product.description.ar : product.description.en;

      const cartProduct = {
        id: product.id,
        name: nameString,
        priceINR: product.price,
        description: descString,
        prepTime: product.prepTime || t.prepDefault,
        serves: product.servingSize || t.servingDefault,
        image: product.image,
      };

      addItem(cartProduct, qty);
      toast.success(`${nameString} - ${t.addedToCart}`);

      setAddedItems((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);
    } catch (e) {
      console.error("Failed to add item:", e);
    }
  };

  const getProductCartQty = (productId: string) => {
    return cartItems
      .filter((item) => item.id === productId || item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSimpleProductCartItem = (productId: string) => {
    return cartItems.find((item) => item.id === productId);
  };

  const updatePortionQty = (
    product: Product,
    portion: { name: { en: string; ar: string }; price: number },
    delta: number
  ) => {
    try {
      const cartItemId = `${product.id}-${portion.name.en}`;
      const existing = cartItems.find((i) => i.id === cartItemId);
      const portionNameString = lang === "ar" ? portion.name.ar : portion.name.en;
      const productNameString = lang === "ar" ? product.name.ar : product.name.en;

      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          removeItem(cartItemId);
          toast.success(`${productNameString} (${portionNameString}) removed`);
        } else {
          updateQuantity(cartItemId, delta);
        }
      } else if (delta > 0) {
        const descString = lang === "ar" ? product.description.ar : product.description.en;
        addItem(
          {
            id: cartItemId,
            productId: product.id,
            portionName: portion.name,
            name: `${productNameString} (${portionNameString})`,
            priceINR: portion.price,
            description: descString,
            prepTime: product.prepTime || t.prepDefault,
            serves: product.servingSize || t.servingDefault,
            image: product.image,
          },
          delta
        );
        toast.success(`${productNameString} (${portionNameString}) - ${t.addedToCart}`);
      }
    } catch (e) {
      console.error("Failed to update portion quantity:", e);
    }
  };

  const renderProductButton = (product: Product) => {
    const isPortioned = product.hasPortions && product.portions && product.portions.length > 0;
    const prodName = lang === "ar" ? product.name.ar : product.name.en;

    if (isPortioned) {
      const totalQty = getProductCartQty(product.id);
      if (totalQty > 0) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(product);
              setSpiceLevel(getValidSpiceLevel(product.spiceLevel));
              setQuantity(1);
            }}
            className="h-8 px-2.5 rounded-full bg-[#FAF6EE] text-[#B88E4C] hover:bg-brand-gold/5 border border-brand-gold/20 flex items-center gap-1.5 text-[10px] font-bold tracking-wide transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <span>{totalQty} {t.added}</span>
            <span className="text-[9px] text-[#B88E4C]/60 font-medium">({t.customize})</span>
          </button>
        );
      } else {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(product);
              setSpiceLevel(getValidSpiceLevel(product.spiceLevel));
              setQuantity(1);
            }}
            className="h-8 px-3 rounded-full border border-brand-gold/35 text-brand-gold hover:bg-brand-gold/10 hover:border-brand-gold flex items-center justify-center text-2xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm bg-white"
            aria-label={`Select portions for ${prodName}`}
          >
            {t.add}
          </button>
        );
      }
    } else {
      const cartItem = getSimpleProductCartItem(product.id);
      const qty = cartItem ? cartItem.quantity : 0;

      if (qty > 0) {
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 bg-[#F4EFE5] px-2 py-0.5 rounded-full border border-brand-gold/5 h-8 select-none"
          >
            <button
              onClick={() => {
                if (qty > 1) {
                  updateQuantity(product.id, -1);
                } else {
                  removeItem(product.id);
                }
              }}
              className="size-5 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-gold/10 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3 stroke-[2.5]" />
            </button>
            <span className="font-sans text-xs font-bold w-4 text-center text-brand-dark">
              {qty}
            </span>
            <button
              onClick={() => {
                updateQuantity(product.id, 1);
              }}
              className="size-5 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-gold/10 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="size-3 stroke-[2.5]" />
            </button>
          </div>
        );
      } else {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddItem(product);
            }}
            className="h-8 px-4 rounded-full bg-brand-gold text-white hover:bg-brand-gold/90 flex items-center justify-center text-2xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm border border-transparent"
            aria-label={`Add ${prodName}`}
          >
            {t.add}
          </button>
        );
      }
    }
  };

  const handleCarouselScroll = (direction: "left" | "right") => {
    if (topPicksContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      topPicksContainerRef.current.scrollBy({
        left: lang === "ar" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Filter products based on Category and Search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === "all" || prod.categoryId === selectedCategory;
    const prodName = (prod.name.en + " " + prod.name.ar).toLowerCase();
    const prodDesc = (prod.description.en + " " + prod.description.ar).toLowerCase();
    const matchesSearch =
      prodName.includes(searchQuery.toLowerCase()) || prodDesc.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const topPicks = products.filter((prod) => prod.topPick && prod.active);

  // Helper to generate a realistic-looking stable rating (e.g. 4.5 - 4.9) based on item ID
  const getRating = (id: string) => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    return (4.5 + (sum % 5) * 0.1).toFixed(1);
  };

  const isRTL = lang === "ar";

  return (
    <div className="w-full min-h-screen bg-brand-cream text-brand-dark overflow-x-hidden" dir={isRTL ? "rtl" : "ltr"}>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:py-16">
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-8 sm:mb-12">
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-[42px] font-bold text-brand-dark tracking-tight leading-tight">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark-light/80 leading-relaxed font-sans font-light">
            {t.subtitle}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-xl mx-auto mb-8 sm:mb-12">
          <div className={cn("absolute inset-y-0 flex items-center pointer-events-none text-brand-dark-light/50", isRTL ? "right-4" : "left-4")}>
            <Search className="size-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-11 bg-[#F4EFE5] text-brand-dark placeholder-brand-dark-light/50 rounded-full text-xs sm:text-sm font-sans focus:outline-none border border-transparent focus:ring-1 focus:ring-brand-gold/30 transition-all shadow-sm",
              isRTL ? "pr-11 pl-4" : "pl-11 pr-4"
            )}
            placeholder={t.searchPlaceholder}
          />
        </div>

        {/* Desktop View: Custom Category Tabs (Top Inline) */}
        <div className="hidden md:flex w-full justify-center py-3 px-2 mb-10 select-none">
          <div className="flex gap-8 max-w-full">
            {/* "All Dishes" Trigger */}
            <button
              onClick={() => setSelectedCategory("all")}
              className="flex flex-col items-center gap-2 group cursor-pointer transition-transform shrink-0"
            >
              <div className={cn(
                "relative size-[72px] rounded-full flex items-center justify-center border-2 transition-all duration-300 overflow-hidden shadow-sm",
                selectedCategory === "all"
                  ? "border-brand-gold bg-[#FAF6EE] scale-105 ring-2 ring-brand-gold/15"
                  : "border-transparent bg-white hover:border-brand-gold/40"
              )}>
                <UtensilsCrossed className={cn("size-7 transition-colors", selectedCategory === "all" ? "text-brand-gold" : "text-brand-dark-light/60")} />
              </div>
              <span className={cn(
                "text-xs font-semibold tracking-wide transition-colors uppercase font-sans mt-0.5",
                selectedCategory === "all" ? "text-brand-gold font-bold" : "text-brand-dark-light/85 group-hover:text-brand-dark"
              )}>
                {t.allDishes}
              </span>
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const catName = lang === "ar" ? cat.name.ar : cat.name.en;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-2 group cursor-pointer transition-transform shrink-0"
                >
                  <div className={cn(
                    "relative size-[72px] rounded-full flex items-center justify-center border-2 transition-all duration-300 overflow-hidden shadow-sm bg-white",
                    isActive
                      ? "border-brand-gold scale-105 ring-2 ring-brand-gold/15"
                      : "border-transparent hover:border-brand-gold/40"
                  )}>
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={catName}
                        fill
                        sizes="80px"
                        className="object-cover p-0.5 rounded-full bg-white"
                        unoptimized={cat.image.startsWith("data:")}
                      />
                    ) : (
                      <UtensilsCrossed className={cn("size-7 transition-colors", isActive ? "text-brand-gold" : "text-brand-dark-light/60")} />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold tracking-wide transition-colors uppercase font-sans mt-0.5",
                    isActive ? "text-brand-gold font-bold" : "text-brand-dark-light/85 group-hover:text-brand-dark"
                  )}>
                    {catName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile View: Sticky Bottom Category Bar */}
        <div className="fixed bottom-0 start-0 end-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-t border-brand-gold/10 px-4 py-2.5 flex md:hidden items-center gap-5 overflow-x-auto scrollbar-none shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none">
          {/* "All Dishes" Trigger */}
          <button
            onClick={() => setSelectedCategory("all")}
            className="flex flex-col items-center gap-1 group cursor-pointer transition-transform shrink-0"
          >
            <div className={cn(
              "relative size-12 rounded-full flex items-center justify-center border transition-all duration-300 overflow-hidden shadow-sm",
              selectedCategory === "all"
                ? "border-brand-gold bg-[#FAF6EE] scale-105 ring-1 ring-brand-gold/15"
                : "border-transparent bg-white"
            )}>
              <UtensilsCrossed className={cn("size-5 transition-colors", selectedCategory === "all" ? "text-brand-gold" : "text-brand-dark-light/60")} />
            </div>
            <span className={cn(
              "text-[9px] font-semibold tracking-wide transition-colors uppercase font-sans mt-0.5",
              selectedCategory === "all" ? "text-brand-gold font-bold" : "text-brand-dark-light/85"
            )}>
              {t.allDishes}
            </span>
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const catName = lang === "ar" ? cat.name.ar : cat.name.en;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center gap-1 group cursor-pointer transition-transform shrink-0"
              >
                <div className={cn(
                  "relative size-12 rounded-full flex items-center justify-center border transition-all duration-300 overflow-hidden shadow-sm bg-white",
                  isActive
                    ? "border-brand-gold scale-105 ring-1 ring-brand-gold/15"
                    : "border-transparent"
                )}>
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={catName}
                      fill
                      sizes="48px"
                      className="object-cover p-0.5 rounded-full bg-white"
                      unoptimized={cat.image.startsWith("data:")}
                    />
                  ) : (
                    <UtensilsCrossed className={cn("size-5 transition-colors", isActive ? "text-brand-gold" : "text-brand-dark-light/60")} />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-semibold tracking-wide transition-colors uppercase font-sans mt-0.5",
                  isActive ? "text-brand-gold font-bold" : "text-brand-dark-light/85"
                )}>
                  {catName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Picks Section - Custom Horizontal Carousel Layout */}
        {topPicks.length > 0 && selectedCategory === "all" && !searchQuery && (
          <div className="mb-14 sm:mb-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-playfair text-xl sm:text-2xl font-bold text-brand-dark tracking-wide">
                {t.topPicks}
              </h2>
              {/* Navigation controls for desktop */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCarouselScroll("left")}
                  className="size-8.5 rounded-full border border-brand-gold/20 hover:border-brand-gold bg-white flex items-center justify-center text-brand-dark transition-all active:scale-95 cursor-pointer shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="size-4.5" />
                </button>
                <button
                  onClick={() => handleCarouselScroll("right")}
                  className="size-8.5 rounded-full border border-brand-gold/20 hover:border-brand-gold bg-white flex items-center justify-center text-brand-dark transition-all active:scale-95 cursor-pointer shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="size-4.5" />
                </button>
              </div>
            </div>

            {/* Custom Snap Scroll View */}
            <div
              ref={topPicksContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-4 px-1"
            >
              {topPicks.map((pick) => {
                const prodName = lang === "ar" ? pick.name.ar : pick.name.en;
                const prodDesc = lang === "ar" ? pick.description.ar : pick.description.en;
                const displayPrice = pick.price;

                return (
                  <div
                    key={pick.id}
                    onClick={() => {
                      setSelectedItem(pick);
                      setSpiceLevel(getValidSpiceLevel(pick.spiceLevel));
                      setQuantity(1);
                    }}
                    className="snap-start shrink-0 w-[270px] sm:w-[310px] bg-white rounded-[20px] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-col group hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 cursor-pointer"
                  >
                    {/* Square-ish top image */}
                    <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-white">
                      {pick.image && (
                        <Image
                          src={pick.image}
                          alt={prodName}
                          fill
                          sizes="(max-w-md) 80vw, 300px"
                          unoptimized={pick.image.startsWith("data:")}
                          className="object-cover bg-white transition-transform duration-700 group-hover:scale-103"
                        />
                      )}
                      {/* Rating Overlay */}
                      <div className={cn(
                        "absolute top-3 bg-white/95 backdrop-blur-sm shadow px-2.5 py-1 rounded-full flex items-center gap-1 z-10",
                        isRTL ? "left-3" : "right-3"
                      )}>
                        <Star className="size-3 text-brand-gold fill-brand-gold" />
                        <span className="text-[10px] font-bold text-brand-dark leading-none font-sans">
                          {getRating(pick.id)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-playfair text-base sm:text-[17px] font-bold text-brand-dark leading-snug">
                          {prodName}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-brand-dark-light/75 leading-relaxed font-sans font-light line-clamp-2">
                          {prodDesc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#FAF6EE]">
                        <span className="font-playfair text-[15px] sm:text-base font-bold text-[#B88E4C]">
                          {displayPrice.toFixed(3)} {t.currency}
                        </span>
                        {renderProductButton(pick)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section-by-Section Category Groups */}
        <div className="flex flex-col gap-12 sm:gap-16">
          {categories
            .filter((cat) => selectedCategory === "all" || selectedCategory === cat.id)
            .map((cat) => {
              const categoryItems = filteredProducts.filter((prod) => prod.categoryId === cat.id && prod.active);
              if (categoryItems.length === 0) return null;

              const catName = lang === "ar" ? cat.name.ar : cat.name.en;
              const catDesc = lang === "ar" ? cat.description?.ar : cat.description?.en;

              return (
                <div key={cat.id} className="flex flex-col">
                  {/* Category Header */}
                  <div className="border-b border-brand-gold/10 pb-3 mb-6 flex flex-col gap-1">
                    <h2 className="font-playfair text-xl sm:text-2xl font-bold text-brand-dark">
                      {catName}
                    </h2>
                    {catDesc && (
                      <p className="text-xs text-brand-dark-light/75 font-sans font-light">
                        {catDesc}
                      </p>
                    )}
                  </div>

                  {/* Horizontal Product Cards in Grid (2-column layout on desktop) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryItems.map((item) => {
                      const prodName = lang === "ar" ? item.name.ar : item.name.en;
                      const prodDesc = lang === "ar" ? item.description.ar : item.description.en;
                      const displayPrice = item.price;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setSpiceLevel(getValidSpiceLevel(item.spiceLevel));
                            setQuantity(1);
                          }}
                          className="bg-white rounded-[20px] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-row items-stretch group hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 min-h-[110px] sm:min-h-[125px] cursor-pointer"
                        >
                          {/* Left: Square Image */}
                          <div className="relative w-24 sm:w-32 shrink-0 overflow-hidden bg-white">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={prodName}
                                fill
                                sizes="128px"
                                unoptimized={item.image.startsWith("data:")}
                                className="object-cover bg-white transition-transform duration-700 group-hover:scale-103"
                              />
                            )}
                          </div>

                          {/* Right: Info Details */}
                          <div className="p-3.5 flex-grow flex flex-col justify-between gap-2 min-w-0">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-playfair text-[14px] sm:text-base font-bold text-brand-dark leading-snug truncate">
                                  {prodName}
                                </h3>
                                {/* Rating indicator */}
                                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                  <Star className="size-3 text-brand-gold fill-brand-gold" />
                                  <span className="text-[10px] font-bold text-brand-dark font-sans leading-none">
                                    {getRating(item.id)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[10px] sm:text-xs text-brand-dark-light/75 leading-relaxed font-sans font-light line-clamp-2">
                                {prodDesc}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-[#FAF6EE]">
                              <span className="font-playfair text-[13px] sm:text-sm font-bold text-[#B88E4C]">
                                {displayPrice.toFixed(3)} {t.currency}
                              </span>
                              {renderProductButton(item)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center justify-center gap-4 select-none">
            <p className="text-brand-dark-light font-sans text-sm sm:text-base">
              {t.noItems}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs sm:text-sm text-brand-gold font-semibold hover:underline cursor-pointer"
            >
              {t.clearSearch}
            </button>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------
          PRODUCT DETAIL MODAL
          ---------------------------------------------------- */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative bg-brand-cream w-full max-w-[440px] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Container */}
            <div className="overflow-y-auto w-full scrollbar-thin">
              {/* Header Image */}
              <div className="relative h-[200px] sm:h-[220px] w-full shrink-0 bg-white">
                {selectedItem.image && (
                  <Image
                    src={selectedItem.image}
                    alt={lang === "ar" ? selectedItem.name.ar : selectedItem.name.en}
                    fill
                    sizes="440px"
                    unoptimized={selectedItem.image.startsWith("data:")}
                    className="object-cover bg-white"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className={cn(
                    "absolute top-4 z-10 size-8 rounded-full bg-white hover:bg-[#FAF6EE] text-brand-dark flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 cursor-pointer border border-brand-gold/10",
                    isRTL ? "left-4" : "right-4"
                  )}
                  aria-label="Close modal"
                >
                  <X className="size-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Content Panel */}
              <div className="px-5 sm:px-6 py-5 flex flex-col">
                {/* Bestseller / Chef Recommended Badge */}
                <div>
                  {selectedItem.topPick ? (
                    <span className="inline-block border border-[#B88E4C]/30 bg-[#B88E4C]/5 text-[#B88E4C] text-[9px] sm:text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded uppercase font-sans">
                      {t.bestseller}
                    </span>
                  ) : selectedItem.chefRecommended ? (
                    <span className="inline-block border border-[#8A5A36]/30 bg-[#8A5A36]/5 text-[#8A5A36] text-[9px] sm:text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded uppercase font-sans">
                      {t.chefRecommended}
                    </span>
                  ) : null}
                </div>

                {/* Title */}
                <h2 className="font-playfair text-xl sm:text-2xl font-bold text-brand-dark leading-tight mt-2.5">
                  {lang === "ar" ? selectedItem.name.ar : selectedItem.name.en}
                </h2>

                {/* Spice Level Selection */}
                {selectedItem.spiceLevel && selectedItem.spiceLevel !== "none" && (
                    <div className="mt-4">
                      <span className="block font-sans text-[9px] sm:text-[10px] font-bold tracking-widest text-brand-dark-light/65 uppercase">
                        {t.spiceLevel}
                      </span>
                      <div className="flex gap-2 mt-1.5">
                        {([
                          { key: "low", label: t.spiceLow },
                          { key: "medium", label: t.spiceMedium },
                          { key: "high", label: t.spiceHigh },
                        ] as const).map((level) => {
                          const isSelected = spiceLevel === level.key;
                          return (
                            <button
                              key={level.key}
                              onClick={() => setSpiceLevel(level.key)}
                              className={cn(
                                "px-4 py-1.5 rounded-full border text-2xs sm:text-xs font-sans transition-all duration-200 cursor-pointer",
                                isSelected
                                  ? "border-brand-gold text-brand-gold bg-brand-gold/5 font-semibold"
                                  : "border-brand-gold/15 text-brand-dark-light/80 hover:border-brand-gold/50 hover:bg-brand-gold/5 font-medium"
                              )}
                            >
                              {level.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Serving Size & Prep Time Section */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-brand-gold/10 py-3 my-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[8px] sm:text-[9px] font-bold tracking-widest text-[#8A6D3B] uppercase">
                      {t.servingSize}
                    </span>
                    <span className="font-sans text-xs font-semibold text-brand-dark">
                      {selectedItem.servingSize || t.servingDefault}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[8px] sm:text-[9px] font-bold tracking-widest text-[#8A6D3B] uppercase">
                      {t.prepTime}
                    </span>
                    <span className="font-sans text-xs font-semibold text-brand-dark">
                      {selectedItem.prepTime || t.prepDefault}
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2">
                  {selectedItem.hasPortions && selectedItem.portions && selectedItem.portions.length > 0 ? (
                    <span className="font-sans text-xs sm:text-sm font-semibold text-brand-dark-light/70 uppercase tracking-wider">
                      {isRTL ? "تبدأ من:" : "Starting from:"}{" "}
                      <span className="font-sans text-lg sm:text-xl font-bold text-[#B88E4C] ml-1">
                        {Math.min(...selectedItem.portions.map(p => p.price)).toFixed(3)} {t.currency}
                      </span>
                    </span>
                  ) : (
                    <span className="font-sans text-xl sm:text-2xl font-bold text-[#B88E4C]">
                      {selectedItem.price.toFixed(3)} {t.currency}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="font-sans text-[11px] sm:text-xs font-light text-brand-dark-light/90 leading-relaxed mt-2.5">
                  {lang === "ar" ? selectedItem.description.ar : selectedItem.description.en}
                </p>

                {/* Dietary and Prep Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {/* Veg / Non-Veg Badge */}
                  <span className="bg-[#F4EFE5] text-brand-dark text-[9px] sm:text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-brand-gold/10">
                    <span className={cn(
                      "size-1.5 rounded-full",
                      selectedItem.isVeg ? "bg-green-600" : "bg-red-600"
                    )} />
                    {selectedItem.isVeg ? t.veg : t.halal}
                  </span>

                  {/* Tags */}
                  {selectedItem.tags.map((tag) => (
                    <span key={tag} className="bg-[#F4EFE5] text-brand-gold text-[9px] sm:text-[10px] font-semibold px-3 py-1 rounded-full border border-brand-gold/10">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Portions Selection Section vs Simple Stepper Section */}
                {selectedItem.hasPortions && selectedItem.portions && selectedItem.portions.length > 0 ? (
                  <>
                    <div className="mt-5 pt-4 border-t border-brand-gold/10">
                      <span className="block font-sans text-[9px] sm:text-[10px] font-bold tracking-widest text-[#8A6D3B] uppercase mb-3">
                        {t.portions}
                      </span>
                      <div className="flex flex-col gap-3">
                        {selectedItem.portions.map((portion) => {
                          const cartItemId = `${selectedItem.id}-${portion.name.en}`;
                          const portionItem = cartItems.find((i) => i.id === cartItemId);
                          const pQty = portionItem ? portionItem.quantity : 0;
                          const portionNameStr = lang === "ar" ? portion.name.ar : portion.name.en;

                          return (
                            <div
                              key={portion.name.en}
                              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-brand-gold/10 hover:border-brand-gold/25 transition-all shadow-2xs"
                            >
                              <div className="flex flex-col">
                                <span className="font-sans text-xs sm:text-sm font-semibold text-brand-dark">
                                  {portionNameStr}
                                </span>
                                <span className="font-sans text-xs text-[#B88E4C] font-semibold mt-0.5">
                                  {portion.price.toFixed(3)} {t.currency}
                                </span>
                              </div>

                              {pQty > 0 ? (
                                <div className="flex items-center gap-3 bg-[#F4EFE5] px-3 py-1.5 rounded-full border border-brand-gold/5">
                                  <button
                                    onClick={() => updatePortionQty(selectedItem, portion, -1)}
                                    className="size-5 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-gold/10 transition-colors cursor-pointer"
                                    aria-label={`Decrease quantity of ${portionNameStr}`}
                                  >
                                    <Minus className="size-3.5 stroke-[2.5]" />
                                  </button>
                                  <span className="font-sans text-xs sm:text-sm font-bold w-4 text-center text-brand-dark">
                                    {pQty}
                                  </span>
                                  <button
                                    onClick={() => updatePortionQty(selectedItem, portion, 1)}
                                    className="size-5 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-gold/10 transition-colors cursor-pointer"
                                    aria-label={`Increase quantity of ${portionNameStr}`}
                                  >
                                    <Plus className="size-3.5 stroke-[2.5]" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => updatePortionQty(selectedItem, portion, 1)}
                                  className="h-8 px-3 rounded-full border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-white flex items-center justify-center text-2xs font-bold transition-all duration-200 active:scale-95 cursor-pointer bg-white"
                                >
                                  {t.add}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Done Button */}
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="w-full h-11 bg-brand-dark hover:bg-brand-dark-light text-white font-sans text-xs sm:text-sm font-semibold rounded-full shadow-md transition-all duration-200 mt-6 active:scale-[0.98] cursor-pointer"
                    >
                      {t.done}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Quantity Selector Section */}
                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-brand-gold/10">
                      <span className="font-sans text-xs sm:text-sm font-semibold text-brand-dark">
                        {t.quantity}
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
                        <span className="font-sans text-xs sm:text-sm font-bold w-4 text-center text-brand-dark">
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
                        handleAddItem(selectedItem, quantity);
                        setSelectedItem(null);
                      }}
                      className="w-full h-11 bg-brand-dark hover:bg-brand-dark-light text-white font-sans text-xs sm:text-sm font-semibold rounded-full shadow-md transition-all duration-200 mt-5 active:scale-[0.98] cursor-pointer"
                    >
                      {t.addToSelection}
                    </button>
                  </>
                )}

                {/* Continue Browsing */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full text-center text-[10px] sm:text-[11px] text-brand-dark-light/70 hover:text-brand-dark transition-colors mt-3.5 font-sans font-medium cursor-pointer"
                >
                  {t.continueBrowsing}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
