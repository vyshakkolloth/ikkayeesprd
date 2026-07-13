import { productRepository } from "@/lib/db/repositories/product.repository";
import { cache } from "react";

interface GetProductsOptions {
  categoryId?: string;
  search?: string;
}

/**
 * Fetches active products from MongoDB, with optional category and search filters.
 * Cached to optimize page loads.
 */
export const getActiveProducts = cache(async (options: GetProductsOptions = {}) => {
  try {
    const result = await productRepository.findWithFilters({
      categoryId: options.categoryId,
      search: options.search,
      active: true,
      sortBy: "sortOrder",
      sortOrder: "asc",
      limit: 500, // retrieve up to 500 active products
    });
    return result.items;
  } catch (err) {
    console.error("Error in getActiveProducts:", err);
    return [];
  }
});
