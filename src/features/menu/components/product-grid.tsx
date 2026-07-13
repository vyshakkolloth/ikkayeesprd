import React from "react";
import { ProductCard } from "./product-card";
import { EmptyState } from "./empty-state";

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
  categoryId: string;
  categoryName?: { en: string; ar: string };
  servingSize?: string;
  prepTime?: string;
}

interface Category {
  _id: string;
  name: { en: string; ar: string };
  slug: string;
  image: string;
  description?: { en: string; ar: string };
}

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  locale?: string;
  activeCategory?: string;
  activeSearch?: string;
}

export function ProductGrid({
  products = [],
  categories = [],
  locale = "en",
  activeCategory = "all",
  activeSearch = "",
}: ProductGridProps) {
  const isAr = locale === "ar";

  // Section subtitle fallbacks based on design
  const sectionSubtitles: Record<string, { en: string; ar: string }> = {
    Mandi: {
      en: "Traditional slow-cooked meats served over fragrant rice.",
      ar: "لحوم مطبوخة ببطء تقدم مع الأرز العطري اللذيذ.",
    },
    Grills: {
      en: "Marinated overnight and charcoal-grilled to perfection.",
      ar: "متبلة طوال الليل ومشاوي على الفحم إلى الكمال.",
    },
    Seafood: {
      en: "Fresh catches seasoned with coastal spices.",
      ar: "صيد طازج متبل بالبهارات الساحلية.",
    },
    Biryani: {
      en: "Aromatic layered rice dishes, a true Malabar specialty.",
      ar: "أطباق الأرز العطري المطبق، تخصص مالابار الحقيقي.",
    },
    Shawarma: {
      en: "Tasty street-style wraps with savory spit-roasted meat.",
      ar: "لفائف لذيذة على طريقة الشارع مع اللحم المشوي الشهي.",
    },
    Desserts: {
      en: "Traditional Middle Eastern desserts sweet treats.",
      ar: "حلويات الشرق الأوسط التقليدية اللذيذة.",
    },
    Drinks: {
      en: "Refreshing cold beverages and juice creations.",
      ar: "مشروبات باردة منعشة وعصائر طازجة.",
    },
  };

  // 1. Filter Top Picks (only when topPick is true, and matches filtered category)
  const topPicks = products.filter(
    (prod) => prod.topPick
  );

  // 2. Determine which categories to show
  // If activeCategory is "all", we show categories that contain at least one product
  // Otherwise we show only the selected category
  const categoriesToShow = categories.filter((cat) => {
    if (activeCategory !== "all" && cat.slug !== activeCategory) {
      return false;
    }
    // Check if category has any products in the filtered list
    return products.some((prod) => prod.categoryId === cat._id);
  });

  // Calculate clear URL for empty state
  const clearUrl = "/menu";

  if (products.length === 0) {
    return (
      <EmptyState
        message={
          isAr
            ? "لم يتم العثور على أطباق تطابق بحثك."
            : "No dishes found matching your search query."
        }
        clearLabel={isAr ? "مسح البحث" : "Clear Search"}
        clearUrl={clearUrl}
      />
    );
  }

  return (
    <div className="w-full space-y-12">
      {/* ----------------------------------------------------
          1. TOP PICKS SECTION (Desktop & Mobile)
          ---------------------------------------------------- */}
      {topPicks.length > 0 && (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-brand-dark mb-6 tracking-wide text-left" dir={isAr ? "rtl" : "ltr"}>
            {isAr ? "أفضل الاختيارات" : "Top Picks"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topPicks.map((pick) => (
              <ProductCard
                key={pick._id}
                product={pick}
                locale={locale}
                activeCategory={activeCategory}
                activeSearch={activeSearch}
              />
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          2. MOBILE VIEW DISH GRID (Flat list)
          ---------------------------------------------------- */}
      <div className="md:hidden flex flex-col gap-6 pb-8">
        <h3 className="font-playfair text-lg font-bold text-brand-dark tracking-wide text-left" dir={isAr ? "rtl" : "ltr"}>
          {activeCategory === "all"
            ? (isAr ? "كل الأصناف" : "All Dishes")
            : (isAr 
                ? categories.find(c => c.slug === activeCategory)?.name.ar
                : categories.find(c => c.slug === activeCategory)?.name.en)
          } Collection
        </h3>
        {products.map((item) => (
          <ProductCard
            key={item._id}
            product={item}
            locale={locale}
            activeCategory={activeCategory}
            activeSearch={activeSearch}
          />
        ))}
      </div>

      {/* ----------------------------------------------------
          3. DESKTOP VIEW DISH GRID (Section by Section groups)
          ---------------------------------------------------- */}
      <div className="hidden md:flex flex-col gap-12">
        {categoriesToShow.map((cat) => {
          const categoryItems = products.filter((prod) => prod.categoryId === cat._id);
          if (categoryItems.length === 0) return null;

          const catName = isAr ? cat.name.ar : cat.name.en;
          
          // Get localized description or fallback
          const fallbackDesc = sectionSubtitles[cat.name.en] || { en: "", ar: "" };
          const catDescription = cat.description
            ? (isAr ? cat.description.ar : cat.description.en)
            : (isAr ? fallbackDesc.ar : fallbackDesc.en);

          return (
            <div key={cat._id} className="flex flex-col">
              <div className="border-b border-brand-gold/10 pb-3 mb-6 text-left" dir={isAr ? "rtl" : "ltr"}>
                <h2 className="font-playfair text-2xl font-bold text-brand-dark capitalize">
                  {catName}
                </h2>
                {catDescription && (
                  <p className="text-xs text-brand-dark-light/75 mt-1 font-sans font-light">
                    {catDescription}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categoryItems.map((item) => (
                  <ProductCard
                    key={item._id}
                    product={item}
                    locale={locale}
                    activeCategory={activeCategory}
                    activeSearch={activeSearch}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
