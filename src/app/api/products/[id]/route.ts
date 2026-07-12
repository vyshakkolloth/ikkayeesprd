import { NextResponse } from "next/server";
import { productRepository } from "@/lib/db/repositories/product.repository";
import { ProductSchema } from "@/lib/db/schemas/product.schema";

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate request schema
    const result = ProductSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: fieldErrors },
        { status: 400 }
      );
    }

    const productData = result.data;

    // Check duplicate slug (excluding self)
    const existing = await productRepository.findBySlug(productData.slug);
    if (existing && existing._id?.toString() !== id) {
      return NextResponse.json(
        { error: "Product slug is already in use by another product" },
        { status: 400 }
      );
    }

    const success = await productRepository.updateProduct(id, productData);
    if (!success) {
      return NextResponse.json(
        { error: "Product not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;

    const success = await productRepository.softDeleteProduct(id);
    if (!success) {
      return NextResponse.json(
        { error: "Product not found or delete failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Product soft deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
