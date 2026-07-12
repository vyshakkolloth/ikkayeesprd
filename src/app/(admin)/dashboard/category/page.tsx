import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { CategoryList } from "@/features/categories/components/category-list";

export const dynamic = "force-dynamic";

export default async function CategoryPage() {
  // Fetch initial category list on the server (SSR) to optimize page load speeds
  const result = await categoryRepository.findWithFilters({
    page: 1,
    limit: 20,
    sortBy: "priority",
    sortOrder: "asc",
    status: "all",
  });

  // Serialize MongoDB ObjectId and Date fields to avoid React Server Component transfer errors
  const initialCategories = result.items.map((cat) => ({
    _id: cat._id ? cat._id.toString() : "",
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    alt: cat.alt,
    description: cat.description || { en: "", ar: "" },
    priority: cat.priority,
    isActive: cat.isActive,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }));

  return (
    <div className="py-6">
      <CategoryList
        initialCategories={initialCategories}
        initialTotal={result.total}
      />
    </div>
  );
}