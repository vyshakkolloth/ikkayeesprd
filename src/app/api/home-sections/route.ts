import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { section, productIds } = body;

    if (!section || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "Validation failed: 'section' and 'productIds' (array) are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const col = db.collection("products");

    const objectIds = productIds.map((id: string) => new ObjectId(id));

    if (section === "topPick") {
      // Set topPick = true for selected products
      await col.updateMany(
        { _id: { $in: objectIds } },
        { $set: { topPick: true, updatedAt: new Date() } }
      );
      // Set topPick = false for all other non-deleted products
      await col.updateMany(
        { _id: { $nin: objectIds }, isDeleted: { $ne: true } },
        { $set: { topPick: false, updatedAt: new Date() } }
      );
    } else if (section === "chefRecommended") {
      // Set chefRecommended = true for selected products
      await col.updateMany(
        { _id: { $in: objectIds } },
        { $set: { chefRecommended: true, updatedAt: new Date() } }
      );
      // Set chefRecommended = false for all other non-deleted products
      await col.updateMany(
        { _id: { $nin: objectIds }, isDeleted: { $ne: true } },
        { $set: { chefRecommended: false, updatedAt: new Date() } }
      );
    } else {
      // Section represents a tag. Map section key to actual tag string
      const tagMapping: Record<string, string> = {
        trending: "Trending",
        mandi: "Mandi",
        seafood: "Seafood",
        heritage: "Heritage",
        finish: "Dessert",
      };

      const tagName = tagMapping[section];
      if (!tagName) {
        return NextResponse.json(
          { error: `Invalid section key: ${section}` },
          { status: 400 }
        );
      }

      // Add tag to selected products (use $addToSet to avoid duplicates)
      await col.updateMany(
        { _id: { $in: objectIds } },
        { 
          $addToSet: { tags: tagName } as any,
          $set: { updatedAt: new Date() }
        }
      );
      // Remove tag from other products (use $pull)
      await col.updateMany(
        { _id: { $nin: objectIds }, isDeleted: { $ne: true } },
        { 
          $pull: { tags: tagName } as any,
          $set: { updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json({ success: true, message: `Homepage section '${section}' updated successfully` });
  } catch (error: any) {
    console.error("POST /api/home-sections error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
