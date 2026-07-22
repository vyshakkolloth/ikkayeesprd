import { NextResponse } from "next/server";
import { productRepository } from "@/lib/db/repositories/product.repository";
import { ProductSchema } from "@/lib/db/schemas/product.schema";
import { uploadImage } from "@/lib/aws/s3Client";

function isDataUrl(str: string): boolean {
  return /^data:.+;base64,/.test(str);
}

function dataUrlToBuffer(dataUrl: string): { mime: string; buffer: Buffer } {
  const matches = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!matches) throw new Error("Invalid data URL");
  const mime = matches[1];
  const base64 = matches[2];
  const buffer = Buffer.from(base64, "base64");
  return { mime, buffer };
}

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

    let productData = result.data;

    // Upload base64 image to S3 if updated
    if (productData.image && isDataUrl(productData.image)) {
      const { mime, buffer } = dataUrlToBuffer(productData.image);
      const s3Url = await uploadImage(buffer, mime, "products/");
      productData = { ...productData, image: s3Url };
    }

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
