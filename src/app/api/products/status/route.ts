import { NextResponse } from "next/server";
import { productRepository } from "@/lib/db/repositories/product.repository";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, active } = body;

    if (!id || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Missing required parameters: id and active (boolean)" },
        { status: 400 }
      );
    }

    const success = await productRepository.updateProductStatus(id, active);
    if (!success) {
      return NextResponse.json(
        { error: "Product not found or status update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Product status updated successfully" });
  } catch (error: any) {
    console.error("PATCH /api/products/status error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
