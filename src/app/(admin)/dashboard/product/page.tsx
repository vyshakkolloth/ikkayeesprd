import { productRepository } from "@/lib/db/repositories/product.repository";
import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { ProductList } from "@/features/products/components/product-list";

export const dynamic = "force-dynamic";

export default async function ProductPage() {
  // 1. Fetch initial product data on the server (SSR) to speed up initial render
  const productsResult = await productRepository.findWithFilters({
    page: 1,
    limit: 20,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });

  // 2. Fetch all categories to populate product filters and select inputs
  const categoriesResult = await categoryRepository.findWithFilters({
    page: 1,
    limit: 100,
    sortBy: "priority",
    sortOrder: "asc",
    status: "active",
  });

  // 3. Fetch all active products (names and IDs) to populate recommended pairing selectors
  const allActiveProductsResult = await productRepository.findWithFilters({
    page: 1,
    limit: 500,
    active: true,
  });

  // 4. Serialize products for transmission to client components
  const initialProducts = productsResult.items.map((prod: any) => ({
    _id: prod._id,
    name: prod.name,
    description: prod.description,
    slug: prod.slug,
    categoryId: prod.categoryId,
    categoryName: prod.categoryName,
    image: prod.image,
    imageAlt: prod.imageAlt,
    price: prod.price,
    hasPortions: prod.hasPortions,
    portions: prod.portions || [],
    chefRecommended: prod.chefRecommended,
    topPick: prod.topPick || false,
    spiceLevel: prod.spiceLevel,
    pairedProductId: prod.pairedProductId ? prod.pairedProductId.toString() : null,
    servingSize: prod.servingSize,
    prepTime: prod.prepTime,
    isVeg: prod.isVeg,
    tags: prod.tags || [],
    sortOrder: prod.sortOrder,
    active: prod.active,
    updatedAt: prod.updatedAt ? new Date(prod.updatedAt).toISOString() : new Date().toISOString(),
  }));

  // 5. Serialize categories
  const categories = categoriesResult.items.map((cat: any) => ({
    _id: cat._id ? cat._id.toString() : "",
    name: cat.name,
  }));

  // 6. Serialize active products list
  const allProducts = allActiveProductsResult.items.map((prod: any) => ({
    _id: prod._id,
    name: prod.name,
  }));

  return (
    <div className="py-6 p space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <p className="text-muted-foreground text-sm">
          Create, edit, search, and arrange restaurant food items.
        </p>
      </div>

      <ProductList
        initialProducts={initialProducts as any}
        initialTotal={productsResult.total}
        categories={categories}
        allProducts={allProducts}
      />
    </div>
  );
}