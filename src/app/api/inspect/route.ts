import { NextResponse } from "next/server";
import { categoryRepository } from "@/lib/db/repositories/category.repository";

export async function GET() {
  try {
    const result = await categoryRepository.findWithFilters({
      status: "active",
      limit: 100,
    });
    
    const categories = result.items.map((c: any) => ({
      id: c._id.toString(),
      nameEn: c.name.en,
      nameAr: c.name.ar,
      slug: c.slug,
    }));
    
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
