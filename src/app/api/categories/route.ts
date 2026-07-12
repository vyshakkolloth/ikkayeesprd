import { NextResponse } from "next/server";
import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { CategorySchema } from "@/lib/db/schemas/category.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as "active" | "inactive" | "all") || "all";
    const sortBy = (searchParams.get("sortBy") as any) || "priority";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await categoryRepository.findWithFilters({
      search,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Fetch next sequential priority index from repository
    const nextPriority = await categoryRepository.getNextPriority();

    // 2. Validate payload structure using Zod
    const result = CategorySchema.safeParse({
      ...body,
      priority: nextPriority,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: fieldErrors },
        { status: 400 }
      );
    }

    const categoryData = result.data;

    // 3. Check duplicate slug
    const existing = await categoryRepository.findBySlug(categoryData.slug);
    if (existing) {
      return NextResponse.json(
        { error: "Category slug must be unique" },
        { status: 400 }
      );
    }

    // 4. Create new category
    const id = await categoryRepository.createNewCategory({
      name: categoryData.name,
      slug: categoryData.slug,
      image: categoryData.image,
      alt: categoryData.alt,
      description: categoryData.description,
      priority: categoryData.priority,
      isActive: categoryData.isActive,
    });

    return NextResponse.json(
      { success: true, id, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
