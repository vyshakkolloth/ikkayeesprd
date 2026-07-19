import type { Metadata } from "next";
import Header from "@/components/clientLayout/header";
import Footer from "@/components/clientLayout/footer";
import MenuClient from "@/components/menu/MenuClient";
import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { productRepository } from "@/lib/db/repositories/product.repository";

// Dynamic page revalidation interval (SSR, cache-busting after 60s)
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore Our Culinary Menu | Ikkayes Kitchen",
  description: "Discover the authentic flavors of Malabar, crafted with tradition and passion. Explore our signature Mandi, charcoal grills, fresh seafood, shawarma wraps, aromatic biryani, desserts, and drinks.",
  keywords: ["Malabar food", "Kuzhi Mandi", "Biryani", "Arabian Grills", "Seafood", "Kunafa", "Desserts", "Ikkayes Menu"],
  openGraph: {
    title: "Culinary Menu - Ikkayes Kitchen",
    description: "Discover the authentic flavors of Malabar, crafted with tradition and passion.",
    images: [{ url: "/images/restaurant_interior.png", width: 1200, height: 630, alt: "Ikkayes Kitchen Interior" }],
  },
};

export default async function MenuPage() {
  let categories: any[] = [];
  let products: any[] = [];

  try {
    // Fetch active categories (up to 100 items)
    const categoriesResult = await categoryRepository.findWithFilters({
      status: "active",
      limit: 100,
      sortBy: "priority",
      sortOrder: "asc"
    });

    // Fetch active products (up to 500 items)
    const productsResult = await productRepository.findWithFilters({
      active: true,
      limit: 500,
      sortBy: "sortOrder",
      sortOrder: "asc"
    });

    // Serialize MongoDB ObjectIds to clean strings for client compatibility
    categories = categoriesResult.items.map((cat: any) => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      priority: cat.priority,
      isActive: cat.isActive,
      image: cat.image || "",
      description: cat.description || null,
    }));

    products = productsResult.items.map((prod: any) => ({
      id: prod._id.toString(),
      name: prod.name,
      description: prod.description,
      slug: prod.slug,
      categoryId: prod.categoryId.toString(),
      price: prod.price,
      chefRecommended: prod.chefRecommended,
      topPick: prod.topPick,
      spiceLevel: prod.spiceLevel,
      isVeg: prod.isVeg,
      tags: prod.tags,
      active: prod.active,
      image: prod.image || "",
      servingSize: prod.servingSize || "",
      prepTime: prod.prepTime || "",
      hasPortions: prod.hasPortions || false,
      portions: prod.portions ? prod.portions.map((p: any) => ({
        name: p.name,
        price: p.price,
      })) : [],
    }));
  } catch (err) {
    console.error("Error loading menu data from database:", err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream">
      {/* Site-wide navigation header */}
      {/* <Header /> */}

      {/* Dynamic interactive menu body */}
      <main className="flex-grow">
        <MenuClient categories={categories} products={products} />
      </main>

      {/* Premium Footer */}
      {/* <Footer /> */}
    </div>
  );
}