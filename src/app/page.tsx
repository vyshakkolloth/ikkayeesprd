import Header from "@/components/clientLayout/header";
import Footer from "@/components/clientLayout/footer";
import Link from "next/link";
import { productRepository } from "@/lib/db/repositories/product.repository";
import { settingsRepository } from "@/lib/db/repositories/settings.repository";
import { Sparkles, ChefHat, TrendingUp, UtensilsCrossed, Compass, Layers, Heart } from "lucide-react";

export const revalidate = 60; // ISR cache-busting after 60s for high performance and fast load times

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function Home(props: PageProps) {
  // Read search parameters for language (defaults to English 'en')
  const { lang = "en" } = await props.searchParams;
  const isRTL = lang === "ar";

  // Fetch Homepage hero settings and products from the database on the server
  const settings = await settingsRepository.getHomeSettings();
  const productsResult = await productRepository.findWithFilters({
    page: 1,
    limit: 100, // Fetch up to 100 active products to populate homepage sections
    active: true,
  });

  const products = productsResult.items;

  // Default values matching the visual mockup
  const defaultSettings = {
    hero: {
      title: {
        en: "A Culinary Journey to Malabar",
        ar: "رحلة طهي إلى مليبار",
      },
      subtitle: {
        en: "Experience the authentic rich flavours of Malabar traditional dishes and desserts.",
        ar: "تجربة النكهات الغنية والأصيلة لأطباق مليبار التقليدية والحلويات.",
      },
      imageUrl: "/images/all_dishes.png",
      ctaText: {
        en: "Explore Menu",
        ar: "استكشف القائمة",
      },
    },
  };

  const currentSettings = settings
    ? {
        hero: {
          title: settings.hero?.title || defaultSettings.hero.title,
          subtitle: settings.hero?.subtitle || defaultSettings.hero.subtitle,
          imageUrl: settings.hero?.imageUrl || defaultSettings.hero.imageUrl,
          ctaText: settings.hero?.ctaText || defaultSettings.hero.ctaText,
        },
      }
    : defaultSettings;

  // Translation helpers
  const dictMap = {
    en: {
      topDishes: "Top Dishes",
      topDishesSub: "Bestselling favorites loved by our guests",
      bestseller: "BESTSELLER",
      chefRec: "Chef's Recommendations",
      chefRecSub: "Artisanal signature dishes selected by our head chef",
      chefSpecial: "CHEF'S SPECIAL",
      trending: "Trending Today",
      trendingSub: "Freshly prepared local favorites",
      trendingBadge: "TRENDING",
      mandi: "Signature Mandi Collection",
      mandiSub: "Slow-cooked to perfection",
      mandiBadge: "POPULAR",
      seafood: "Seafood Highlights",
      seafoodSub: "Fresh from the Arabian Sea",
      seafoodBadge: "FRESH CATCH",
      heritage: "Heritage Classics",
      heritageSub: "Authentic recipes passed down generations",
      heritageBadge: "HERITAGE",
      finish: "The Perfect Finish",
      finishSub: "Sweet treats to end your meal",
      finishBadge: "SWEET ENDINGS",
      viewAll: "View All Menu",
      orderNow: "Order Now",
    },
    ar: {
      topDishes: "الأطباق المميزة",
      topDishesSub: "أكثر الأطباق مبيعاً ومحبة من ضيوفنا",
      bestseller: "الأكثر مبيعاً",
      chefRec: "توصيات الشيف",
      chefRecSub: "أطباق حصرية مختارة بعناية من قبل رئيس الطهاة لدينا",
      chefSpecial: "توصية الشيف",
      trending: "الأكثر طلباً اليوم",
      trendingSub: "المأكولات المحلية المفضلة والمحضرة طازجة",
      trendingBadge: "رائج الآن",
      mandi: "مجموعة المندي المتميزة",
      mandiSub: "أرز ولحوم مطبوخة ببطء وعلى نيران هادئة لدرجة الكمال",
      mandiBadge: "شعبي",
      seafood: "روائع المأكولات البحرية",
      seafoodSub: "صيد اليوم الطازج من البحر العربي والمعد بالتوابل التقليدية",
      seafoodBadge: "صيد طازج",
      heritage: "كلاسيكيات التراث",
      heritageSub: "وصفات أصيلة متوارثة عبر الأجيال",
      heritageBadge: "تراثي",
      finish: "الخاتمة المثالية",
      finishSub: "حلويات ومشروبات منعشة لتتوج بها وجبتك",
      finishBadge: "الحلو",
      viewAll: "عرض القائمة كاملة",
      orderNow: "اطلب الآن",
    },
  };
  const dict = dictMap[lang as "en" | "ar"] || dictMap.en;

  // In-memory filters matching the Admin configuration logic
  const topPickProducts = products.filter((p) => p.topPick);
  const chefRecProducts = products.filter((p) => p.chefRecommended);
  const trendingProducts = products.filter((p) => p.tags.includes("Trending"));
  
  const mandiProducts = products.filter((p) => {
    return p.tags.includes("Mandi") || p.categoryName?.[lang as "en" | "ar"]?.toLowerCase().includes("mandi") || p.categoryName?.en?.toLowerCase().includes("mandi") || p.categoryName?.ar?.includes("مندي");
  });

  const seafoodProducts = products.filter((p) => {
    return p.tags.includes("Seafood") || p.categoryName?.[lang as "en" | "ar"]?.toLowerCase().includes("seafood") || p.categoryName?.en?.toLowerCase().includes("seafood") || p.categoryName?.en?.toLowerCase().includes("fish") || p.categoryName?.ar?.includes("بحري");
  });

  const heritageProducts = products.filter((p) => p.tags.includes("Heritage"));
  
  const dessertProducts = products.filter((p) => {
    return p.tags.includes("Dessert") || p.tags.includes("Sweet") || p.categoryName?.[lang as "en" | "ar"]?.toLowerCase().includes("dessert") || p.categoryName?.en?.toLowerCase().includes("dessert") || p.categoryName?.en?.toLowerCase().includes("beverage") || p.categoryName?.ar?.includes("حلويات") || p.categoryName?.ar?.includes("مشروب");
  });

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream text-brand-dark overflow-x-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Site-wide navigation Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-grow">
        
        {/* HERO BANNER BLOCK */}
        <section 
          className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center text-center px-4 py-24 bg-cover bg-center transition-all duration-300"
          style={{ backgroundImage: `linear-gradient(rgba(44, 37, 32, 0.7), rgba(44, 37, 32, 0.7)), url(${currentSettings.hero.imageUrl})` }}
        >
          {/* Subtle grid background pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(184,142,76,0.15)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
            <span className="text-[#B88E4C] font-semibold tracking-widest text-xs uppercase mb-4 bg-[#B88E4C]/15 px-4 py-2 rounded-full border border-[#B88E4C]/25 inline-block font-sans">
              {lang === "en" ? "Welcome to Ikkaye's Kitchen" : "مرحباً بكم في مطبخ إيكايز"}
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-white mb-6 leading-tight max-w-3xl drop-shadow-md">
              {currentSettings.hero.title[lang as "en" | "ar"]}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mb-10 leading-relaxed font-sans font-light drop-shadow-sm">
              {currentSettings.hero.subtitle[lang as "en" | "ar"]}
            </p>

            <Link
              href="/menu"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#B88E4C] px-8 text-sm font-semibold text-[#FAF6EE] shadow-lg hover:bg-[#B88E4C]/95 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {currentSettings.hero.ctaText[lang as "en" | "ar"]}
            </Link>
          </div>
        </section>

        {/* Dynamic Homepage Sections */}
        <div className="py-20 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 1. TOP DISHES */}
          {topPickProducts.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-[#B88E4C]" />
                  <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C2520]">{dict.topDishes}</h2>
                </div>
                <p className="text-sm text-[#5A4E46] font-sans font-light">{dict.topDishesSub}</p>
              </div>

              {/* Native responsive horizontal scrolling without heavy JS */}
              <div className="flex overflow-x-auto gap-5 pb-4 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
                {topPickProducts.map((p) => (
                  <div key={p._id} className="min-w-[240px] w-[240px] sm:min-w-[280px] sm:w-[280px] bg-white rounded-2xl overflow-hidden border border-amber-900/10 shadow-sm relative snap-start hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                      <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[lang as "en" | "ar"]} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 bg-[#B88E4C] text-[#FAF6EE] text-[9px] px-2 py-0.5 rounded font-sans tracking-wide">
                        {dict.bestseller}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-playfair font-bold text-base text-[#2C2520] truncate">{p.name[lang as "en" | "ar"]}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#B88E4C] font-sans">${p.price.toFixed(2)}</span>
                        <Link href="/menu" className="text-xs text-[#B88E4C] hover:underline font-sans font-medium">{dict.orderNow} →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. CHEF'S RECOMMENDATIONS */}
          {chefRecProducts.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <ChefHat className="size-5 text-[#B88E4C]" />
                  <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C2520]">{dict.chefRec}</h2>
                </div>
                <p className="text-sm text-[#5A4E46] font-sans font-light">{dict.chefRecSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {chefRecProducts.slice(0, 3).map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl overflow-hidden border border-[#B88E4C]/25 shadow-sm relative flex flex-col hover:shadow-md transition-all">
                    <span className="absolute top-3 left-3 bg-[#B88E4C] text-[#FAF6EE] text-[9px] px-2 py-1 rounded font-sans font-semibold tracking-wider">
                      {dict.chefSpecial}
                    </span>
                    <div className="aspect-[16/10] w-full bg-muted overflow-hidden">
                      <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[lang as "en" | "ar"]} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <h4 className="font-playfair font-bold text-lg text-[#2C2520]">{p.name[lang as "en" | "ar"]}</h4>
                        <p className="text-xs sm:text-sm text-[#5A4E46] line-clamp-3 leading-relaxed font-sans font-light">{p.description[lang as "en" | "ar"]}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#B88E4C]/10">
                        <span className="text-base font-bold text-[#B88E4C] font-sans">${p.price.toFixed(2)}</span>
                        <Link href="/menu" className="inline-flex h-9 items-center justify-center rounded-full bg-[#B88E4C] px-4 text-xs font-semibold text-[#FAF6EE] hover:bg-[#B88E4C]/95 transition-all">
                          {dict.orderNow}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. TRENDING TODAY */}
          {trendingProducts.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-[#B88E4C]" />
                  <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C2520]">{dict.trending}</h2>
                </div>
                <p className="text-sm text-[#5A4E46] font-sans font-light">{dict.trendingSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trendingProducts.slice(0, 2).map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl overflow-hidden border shadow-sm flex flex-col sm:flex-row items-stretch hover:shadow-md transition-all">
                    <div className="w-full sm:w-44 h-48 sm:h-auto bg-muted relative flex-shrink-0">
                      <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[lang as "en" | "ar"]} className="object-cover w-full h-full" />
                    </div>
                    <div className="p-5 flex-grow space-y-3 flex flex-col justify-between min-w-0">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-playfair font-bold text-base text-[#2C2520] truncate">{p.name[lang as "en" | "ar"]}</h4>
                          <span className="bg-[#B88E4C]/10 text-[#B88E4C] text-[9px] px-1.5 py-0.5 font-sans font-semibold rounded">{dict.trendingBadge}</span>
                        </div>
                        <p className="text-xs text-[#5A4E46] line-clamp-3 leading-relaxed font-sans font-light">{p.description[lang as "en" | "ar"]}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[#B88E4C] font-sans">${p.price.toFixed(2)}</span>
                        <Link href="/menu" className="text-xs font-semibold text-[#B88E4C] hover:underline font-sans">{dict.orderNow} →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. SIGNATURE MANDI COLLECTION */}
          {mandiProducts.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="size-5 text-[#B88E4C]" />
                  <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C2520]">{dict.mandi}</h2>
                </div>
                <p className="text-sm text-[#5A4E46] font-sans font-light">{dict.mandiSub}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mandiProducts.slice(0, 4).map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl overflow-hidden border border-[#2C2520]/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                      <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[lang as "en" | "ar"]} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-2 left-2 bg-[#2C2520]/80 text-[#FAF6EE] text-[8px] px-1.5 py-0.5 rounded font-sans">{dict.mandiBadge}</span>
                    </div>
                    <div className="p-4 space-y-2 bg-gradient-to-b from-white to-[#FAF6EE]/20">
                      <h4 className="font-playfair font-bold text-sm text-[#2C2520] truncate">{p.name[lang as "en" | "ar"]}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-semibold text-[#B88E4C] font-sans">${p.price.toFixed(2)}</span>
                        <Link href="/menu" className="text-[10px] text-[#B88E4C] font-sans hover:underline">{dict.orderNow}</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. SEAFOOD HIGHLIGHTS */}
          {seafoodProducts.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Compass className="size-5 text-[#B88E4C]" />
                  <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C2520]">{dict.seafood}</h2>
                </div>
                <p className="text-sm text-[#5A4E46] font-sans font-light">{dict.seafoodSub}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {seafoodProducts.slice(0, 4).map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl overflow-hidden border border-[#2C2520]/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                      <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[lang as "en" | "ar"]} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-2 left-2 bg-[#B88E4C] text-[#FAF6EE] text-[8px] px-1.5 py-0.5 rounded font-sans">{dict.seafoodBadge}</span>
                    </div>
                    <div className="p-4 space-y-2 bg-gradient-to-b from-white to-[#FAF6EE]/20">
                      <h4 className="font-playfair font-bold text-sm text-[#2C2520] truncate">{p.name[lang as "en" | "ar"]}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-semibold text-[#B88E4C] font-sans">${p.price.toFixed(2)}</span>
                        <Link href="/menu" className="text-[10px] text-[#B88E4C] font-sans hover:underline">{dict.orderNow}</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. HERITAGE CLASSICS */}
          {heritageProducts.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Layers className="size-5 text-[#B88E4C]" />
                  <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C2520]">{dict.heritage}</h2>
                </div>
                <p className="text-sm text-[#5A4E46] font-sans font-light">{dict.heritageSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {heritageProducts.slice(0, 3).map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl overflow-hidden border border-amber-950/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="aspect-[4/3] w-full bg-muted overflow-hidden">
                      <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[lang as "en" | "ar"]} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-playfair font-bold text-base text-[#2C2520]">{p.name[lang as "en" | "ar"]}</h4>
                          <span className="text-sm font-bold text-[#B88E4C] font-sans">${p.price.toFixed(2)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#5A4E46] line-clamp-3 leading-relaxed font-sans font-light">{p.description[lang as "en" | "ar"]}</p>
                      </div>
                      <Link href="/menu" className="text-xs font-semibold text-[#B88E4C] hover:underline font-sans">{dict.orderNow} →</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. THE PERFECT FINISH */}
          {dessertProducts.length > 0 && (
            <section className="space-y-8">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Heart className="size-5 text-[#B88E4C]" />
                  <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C2520]">{dict.finish}</h2>
                </div>
                <p className="text-sm text-[#5A4E46] font-sans font-light">{dict.finishSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Left Side: Large Featured Sweet (2 cols) */}
                <div className="md:col-span-2 bg-[#2C2520] text-[#FAF6EE] rounded-2xl overflow-hidden shadow-sm relative flex flex-col justify-end min-h-[300px] border border-amber-950/15 group">
                  <img src={dessertProducts[0].image || "/images/restaurant_interior.png"} alt={dessertProducts[0].name[lang as "en" | "ar"]} className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2520] via-[#2C2520]/20 to-transparent" />
                  <div className="p-6 space-y-2 relative z-10">
                    <span className="bg-[#B88E4C] text-[#FAF6EE] text-[8px] font-sans tracking-wide px-2 py-0.5 rounded uppercase font-semibold">
                      {dict.finishBadge}
                    </span>
                    <h4 className="font-playfair font-bold text-xl sm:text-2xl">{dessertProducts[0].name[lang as "en" | "ar"]}</h4>
                    <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed font-sans font-light">{dessertProducts[0].description[lang as "en" | "ar"]}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-bold text-[#B88E4C] font-sans">${dessertProducts[0].price.toFixed(2)}</span>
                      <Link href="/menu" className="text-xs font-semibold text-white hover:text-brand-gold transition-colors">{dict.orderNow} →</Link>
                    </div>
                  </div>
                </div>

                {/* Right Side: List of Desserts (3 cols) */}
                <div className="md:col-span-3 flex flex-col gap-3 justify-center">
                  {dessertProducts.slice(1, 4).map((p) => (
                    <div key={p._id} className="bg-white border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all shadow-xs">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img src={p.image || "/images/restaurant_interior.png"} alt={p.name[lang as "en" | "ar"]} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-grow space-y-1 min-w-0">
                        <h4 className="font-playfair font-bold text-base text-[#2C2520] truncate">{p.name[lang as "en" | "ar"]}</h4>
                        <p className="text-xs text-[#5A4E46] font-sans line-clamp-1 font-light leading-relaxed">{p.description[lang as "en" | "ar"]}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-semibold text-[#B88E4C] font-sans">${p.price.toFixed(2)}</span>
                          <Link href="/menu" className="text-xs text-[#B88E4C] hover:underline font-sans">{dict.orderNow}</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Bottom Call To Action */}
          <section className="text-center py-12 border-t border-[#B88E4C]/15">
            <h3 className="text-xl sm:text-2xl font-playfair font-bold mb-4">
              {lang === "en" ? "Explore our entire culinary collection" : "استكشف مجموعتنا الكاملة من فنون الطهي"}
            </h3>
            <Link
              href="/menu"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#B88E4C] px-8 text-sm font-semibold text-[#FAF6EE] shadow-md hover:bg-[#B88E4C]/95 transition-all"
            >
              {dict.viewAll}
            </Link>
          </section>

        </div>
      </main>

      {/* Premium site-wide Footer */}
      <Footer />
    </div>
  );
}
