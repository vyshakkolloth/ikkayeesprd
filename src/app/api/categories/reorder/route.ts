import { NextResponse } from "next/server";
import { categoryRepository } from "@/lib/db/repositories/category.repository";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
      return NextResponse.json(
        { error: "Invalid orderedIds array provided" },
        { status: 400 }
      );
    }

    const success = await categoryRepository.reorderCategories(orderedIds);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update category order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Category order updated successfully" });
  } catch (error: any) {
    console.error("PATCH /api/categories/reorder error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
