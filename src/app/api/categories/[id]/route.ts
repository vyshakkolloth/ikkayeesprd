import { NextResponse } from "next/server";
import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { CategorySchema } from "@/lib/db/schemas/category.schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate update payload partial schemas
    const result = CategorySchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify slug uniqueness if slug is being updated
    if (body.slug) {
      const existing = await categoryRepository.findBySlug(body.slug);
      if (existing && existing._id?.toString() !== id) {
        return NextResponse.json(
          { error: "Category slug must be unique" },
          { status: 400 }
        );
      }
    }

    const success = await categoryRepository.updateCategory(id, body);
    if (!success) {
      return NextResponse.json(
        { error: "Category not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Category updated successfully" });
  } catch (error: any) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await categoryRepository.deleteCategory(id);
    if (!success) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
