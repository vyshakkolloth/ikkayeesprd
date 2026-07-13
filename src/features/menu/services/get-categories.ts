import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { cache } from "react";

/**
 * Fetches all active categories from MongoDB, sorted by priority.
 * Cached to prevent redundant database hits within a single request.
 */
export const getActiveCategories = cache(async () => {
  try {
    const result = await categoryRepository.findWithFilters({
      status: "active",
      sortBy: "priority",
      sortOrder: "asc",
      limit: 100,
    });
    return result.items.map((cat: any) => ({
      _id: cat._id ? cat._id.toString() : "",
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      alt: cat.alt,
      priority: cat.priority,
      isActive: cat.isActive,
    }));
  } catch (err) {
    console.error("Error in getActiveCategories:", err);
    return [];
  }
});
