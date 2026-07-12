import { NextResponse } from "next/server";
import { productRepository } from "@/lib/db/repositories/product.repository";
import { ProductSchema } from "@/lib/db/schemas/product.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    
    const isVegParam = searchParams.get("isVeg");
    const isVeg = isVegParam === "true" ? true : isVegParam === "false" ? false : null;

    const activeParam = searchParams.get("active");
    const active = activeParam === "true" ? true : activeParam === "false" ? false : null;

    const chefRecommendedParam = searchParams.get("chefRecommended");
    const chefRecommended = chefRecommendedParam === "true" ? true : null;

    const topPickParam = searchParams.get("topPick");
    const topPick = topPickParam === "true" ? true : null;

    const spiceLevel = searchParams.get("spiceLevel") || undefined;

    const sortByParam = searchParams.get("sortBy") || "sortOrder";
    const sortBy = ["name", "price", "sortOrder", "updatedAt", "createdAt"].includes(sortByParam)
      ? (sortByParam as any)
      : "sortOrder";

    const sortOrderParam = searchParams.get("sortOrder") || "asc";
    const sortOrder = ["asc", "desc"].includes(sortOrderParam)
      ? (sortOrderParam as any)
      : "asc";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await productRepository.findWithFilters({
      search,
      categoryId,
      isVeg,
      active,
      chefRecommended,
      topPick,
      spiceLevel,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate payload structure
    const result = ProductSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: fieldErrors },
        { status: 400 }
      );
    }

    const productData = result.data;

    // Check slug duplicate
    const existing = await productRepository.findBySlug(productData.slug);
    if (existing) {
      return NextResponse.json(
        { error: "Product slug must be unique" },
        { status: 400 }
      );
    }

    // Create new product
    const id = await productRepository.createNewProduct(productData);

    return NextResponse.json(
      { success: true, id, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
