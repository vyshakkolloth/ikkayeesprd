import { productRepository } from "@/lib/db/repositories/product.repository";
import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { settingsRepository } from "@/lib/db/repositories/settings.repository";
import HomePageClient from "./home-page-client";

export const revalidate = 0; // Disable caching on the admin dashboard page so updates are immediately visible

export default async function HomePageManagement() {
  // 1. Fetch active products
  const productsResult = await productRepository.findWithFilters({
    page: 1,
    limit: 500,
    active: true,
  });

  // 2. Fetch active categories
  const categoriesResult = await categoryRepository.findWithFilters({
    page: 1,
    limit: 100,
    status: "active",
  });

  // 3. Fetch home settings
  const settings = await settingsRepository.getHomeSettings();

  // 4. Default settings if none are found in the database
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

  // 5. Serialize products for client-side component safety
  const serializedProducts = productsResult.items.map((prod: any) => ({
    _id: prod._id.toString(),
    name: prod.name,
    description: prod.description,
    price: prod.price,
    image: prod.image || "",
    categoryId: prod.categoryId.toString(),
    chefRecommended: prod.chefRecommended || false,
    topPick: prod.topPick || false,
    tags: prod.tags || [],
    active: prod.active || false,
  }));

  // 6. Serialize categories
  const serializedCategories = categoriesResult.items.map((cat: any) => ({
    _id: cat._id ? cat._id.toString() : "",
    name: cat.name,
  }));

  return (
    <div className="py-6 space-y-6">
      <HomePageClient
        initialSettings={currentSettings}
        products={serializedProducts}
        categories={serializedCategories}
      />
    </div>
  );
}