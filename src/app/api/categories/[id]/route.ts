import { NextResponse } from "next/server";
import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { CategorySchema } from "@/lib/db/schemas/category.schema";
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

    let updateData = { ...body };

    // Upload base64 image to S3 if updated
    if (updateData.image && isDataUrl(updateData.image)) {
      const { mime, buffer } = dataUrlToBuffer(updateData.image);
      const s3Url = await uploadImage(buffer, mime, "categories/");
      updateData.image = s3Url;
    }

    // Verify slug uniqueness if slug is being updated
    if (updateData.slug) {
      const existing = await categoryRepository.findBySlug(updateData.slug);
      if (existing && existing._id?.toString() !== id) {
        return NextResponse.json(
          { error: "Category slug must be unique" },
          { status: 400 }
        );
      }
    }

    const success = await categoryRepository.updateCategory(id, updateData);
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
