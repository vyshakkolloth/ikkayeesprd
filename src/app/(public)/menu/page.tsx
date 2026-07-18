import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { getActiveCategories } from "@/features/menu/services/get-categories";
import { getActiveProducts } from "@/features/menu/services/get-products";
import { productRepository } from "@/lib/db/repositories/product.repository";
import { MenuHeader } from "@/features/menu/components/menu-header";
import { CategorySelector } from "@/features/menu/components/category-selector";
import { SearchBar } from "@/features/menu/components/search-bar";
import { ProductGrid } from "@/features/menu/components/product-grid";
import { ProductDetailModal } from "@/features/menu/components/product-detail-modal";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang = "en" } = await searchParams;
  const isAr = lang === "ar";
  return {
    title: isAr ? "القائمة | مطبخ إكايز" : "Menu | Ikkaye's Kitchen",
    description: isAr
      ? "استكشف قائمتنا الغنية التي تتميز بمجموعات المندي التقليدية، والبرياني العطري، وشوايات الفحم، والمأكولات البحرية الطازجة في مطبخ إكايز."
      : "Explore our rich menu featuring traditional Mandi collections, fragrant Biriyani, Al Faham grills, and fresh seafood specialties at Ikkaye's Kitchen.",
    alternates: {
      canonical: "/menu",
    },
    openGraph: {
      title: isAr ? "القائمة | مطبخ إكايز" : "Menu | Ikkaye's Kitchen",
      description: isAr
        ? "استكشف قائمتنا الغنية التي تتميز بمجموعات المندي التقليدية..."
        : "Explore our rich menu featuring traditional Mandi collections...",
      type: "website",
      url: "/menu",
    },
  };
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; category?: string; search?: string; product?: string }>;
}) {

  const { lang = "en", category: categorySlug = "all", search = "", product: productParam = "" } = await searchParams;
  const isAr = lang === "ar";

  // 1. Fetch categories
  const categories = await getActiveCategories();

  // Find Category ID if slug is not "all"
  let categoryId: string | undefined;
  if (categorySlug && categorySlug !== "all") {
    const matched = categories.find((c:any) => c.slug === categorySlug);
    if (matched) categoryId = matched._id;
  }

  // 2. Fetch products
  const products = await getActiveProducts({
    categoryId,
    search,
  });

  // 3. Fetch selected product detail (if requested)
  let selectedProduct = null;
  let pairedProduct = null;
  if (productParam) {
    try {
      const rawDoc = await productRepository.findOne({ _id: new ObjectId(productParam), isDeleted: { $ne: true } } as any);
      if (rawDoc) {
        selectedProduct = {
          ...rawDoc,
          _id: rawDoc._id.toString(),
          categoryId: rawDoc.categoryId.toString(),
          categoryName: categories.find((c:any) => c._id === rawDoc.categoryId.toString())?.name || { en: "Uncategorized", ar: "غير مصنف" },
          pairedProductId: rawDoc.pairedProductId ? rawDoc.pairedProductId.toString() : null,
        };

        if (rawDoc.pairedProductId) {
          const rawPair = await productRepository.findOne({ _id: rawDoc.pairedProductId } as any);
          if (rawPair) {
            pairedProduct = {
              _id: rawPair._id.toString(),
              name: rawPair.name,
            };
          }
        }
      }
    } catch (e) {
      console.error("Failed to query product modal:", e);
    }
  }

  // 4. Resolve Featured Bestseller product for mobile banner
  const featuredProduct = products.find((p: any) => p.topPick || p.chefRecommended) || products[0];

  // 5. Generate JSON-LD FoodMenu schemas
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodMenu",
    "name": "Ikkaye's Kitchen Menu",
    "description": "Authentic Malabar and Arabian dining selections.",
    "hasMenuItem": products.map((p: any) => ({
      "@type": "MenuItem",
      "name": isAr ? p.name.ar : p.name.en,
      "description": isAr ? p.description.ar : p.description.en,
      "offers": {
        "@type": "Offer",
        "price": p.price,
        "priceCurrency": "INR"
      }
    }))
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-brand-dark flex justify-center w-full" dir={isAr ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full min-h-screen flex flex-col relative max-w-7xl mx-auto px-4 md:px-8 py-4">
        {/* Header Display */}
        <MenuHeader locale={lang} />

        {/* Search bar inside content grid */}
        <div className="mt-4">
          <SearchBar initialSearch={search} isMobile={true} placeholder={isAr ? "البحث عن أطباق..." : "Search dishes, drinks, desserts..."} />
          <SearchBar initialSearch={search} isMobile={false} placeholder={isAr ? "البحث عن أطباق..." : "Search dishes..."} />
        </div>

        {/* Categories strip */}
        <CategorySelector categories={categories} locale={lang} activeCategory={categorySlug} />

        {/* Mobile Bestseller Featured Banner */}
        {featuredProduct && (
          <div className="md:hidden mt-2 mb-6">
            <Link
              href={`/menu?category=${categorySlug}&search=${search}&product=${featuredProduct._id}`}
              scroll={false}
              className="w-full relative h-[180px] rounded-2xl overflow-hidden shadow-md group cursor-pointer block"
            >
              {featuredProduct.image && (
                <Image
                  src={featuredProduct.image}
                  alt={isAr ? featuredProduct.imageAlt.ar : featuredProduct.imageAlt.en}
                  fill
                  sizes="(max-w-md) 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-black/45" />

              <div className="absolute inset-0 p-4 flex items-end justify-between z-10">
                <div className="flex flex-col items-start gap-1 max-w-[65%] text-left">
                  <span className="bg-brand-gold/90 text-brand-cream text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                    {isAr ? "الأكثر مبيعاً" : "BESTSELLER"}
                  </span>
                  <span className="text-[11px] text-brand-cream/80 font-medium tracking-wide">
                    {isAr ? "الأكثر طلباً اليوم" : "Most Ordered Today"}
                  </span>
                  <h2 className="font-playfair text-xl font-bold text-white leading-tight">
                    {isAr ? featuredProduct.name.ar : featuredProduct.name.en}
                  </h2>
                </div>

                <span className="h-9 px-5 bg-white text-brand-dark hover:bg-brand-cream font-sans text-xs font-semibold rounded-full shadow transition-all duration-200 cursor-pointer flex items-center justify-center">
                  {isAr ? "عرض التفاصيل" : "View Details"}
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Products Display Grid */}
        <div className="mt-4">
          <ProductGrid
            products={products}
            categories={categories}
            locale={lang}
            activeCategory={categorySlug}
            activeSearch={search}
          />
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct as any}
            pairedProduct={pairedProduct}
            locale={lang}
            activeCategory={categorySlug}
            activeSearch={search}
          />
        )}
      </div>
    </main>
  );
}