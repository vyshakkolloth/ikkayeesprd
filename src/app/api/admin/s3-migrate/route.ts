import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db/client";
import { uploadImage } from "@/lib/aws/s3Client";

export const dynamic = "force-dynamic";

function getMimeType(filePathOrExt: string) {
  const lower = filePathOrExt.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/png";
}

function parseBase64(dataUrl: string) {
  const matches = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!matches) return null;
  return { mime: matches[1], buffer: Buffer.from(matches[2], "base64") };
}

export async function POST() {
  return handleMigration();
}

export async function GET() {
  return handleMigration();
}

async function handleMigration() {
  try {
    const db = await getDb();
    const publicDir = path.join(process.cwd(), "public");

    // 1. Migrate Categories
    const categories = await db.collection("categories").find({}).toArray();
    let catSuccess = 0, catSkipped = 0, catFailed = 0;
    const catLogs: string[] = [];

    for (const cat of categories) {
      const img = cat.image;
      if (!img) {
        catSkipped++;
        continue;
      }

      if (typeof img === "string" && img.startsWith("https://") && img.includes("amazonaws.com")) {
        catSkipped++;
        catLogs.push(`Category '${cat.name?.en || cat.slug}': Already on S3`);
        continue;
      }

      let buffer: Buffer | null = null;
      let mimeType = "image/png";

      if (typeof img === "string" && img.startsWith("data:")) {
        const parsed = parseBase64(img);
        if (parsed) {
          buffer = parsed.buffer;
          mimeType = parsed.mime;
        }
      } else if (typeof img === "string") {
        const relativePath = img.startsWith("/") ? img.substring(1) : img;
        const localPath = path.join(publicDir, relativePath);
        if (fs.existsSync(localPath)) {
          buffer = fs.readFileSync(localPath);
          mimeType = getMimeType(localPath);
        } else {
          catLogs.push(`Category '${cat.name?.en || cat.slug}': File not found (${relativePath})`);
        }
      }

      if (buffer) {
        try {
          const s3Url = await uploadImage(buffer, mimeType, "categories/");
          await db.collection("categories").updateOne(
            { _id: cat._id },
            { $set: { image: s3Url, updatedAt: new Date() } }
          );
          catSuccess++;
          catLogs.push(`Category '${cat.name?.en || cat.slug}': Migrated -> ${s3Url}`);
        } catch (err: any) {
          catFailed++;
          catLogs.push(`Category '${cat.name?.en || cat.slug}': Upload error (${err.message})`);
        }
      } else {
        catFailed++;
      }
    }

    // 2. Migrate Products
    const products = await db.collection("products").find({}).toArray();
    let prodSuccess = 0, prodSkipped = 0, prodFailed = 0;
    const prodLogs: string[] = [];

    for (const prod of products) {
      const img = prod.image;
      if (!img) {
        prodSkipped++;
        continue;
      }

      if (typeof img === "string" && img.startsWith("https://") && img.includes("amazonaws.com")) {
        prodSkipped++;
        prodLogs.push(`Product '${prod.name?.en || prod.slug}': Already on S3`);
        continue;
      }

      let buffer: Buffer | null = null;
      let mimeType = "image/png";

      if (typeof img === "string" && img.startsWith("data:")) {
        const parsed = parseBase64(img);
        if (parsed) {
          buffer = parsed.buffer;
          mimeType = parsed.mime;
        }
      } else if (typeof img === "string") {
        const relativePath = img.startsWith("/") ? img.substring(1) : img;
        const localPath = path.join(publicDir, relativePath);
        if (fs.existsSync(localPath)) {
          buffer = fs.readFileSync(localPath);
          mimeType = getMimeType(localPath);
        } else {
          prodLogs.push(`Product '${prod.name?.en || prod.slug}': File not found (${relativePath})`);
        }
      }

      if (buffer) {
        try {
          const s3Url = await uploadImage(buffer, mimeType, "products/");
          await db.collection("products").updateOne(
            { _id: prod._id },
            { $set: { image: s3Url, updatedAt: new Date() } }
          );
          prodSuccess++;
          prodLogs.push(`Product '${prod.name?.en || prod.slug}': Migrated -> ${s3Url}`);
        } catch (err: any) {
          prodFailed++;
          prodLogs.push(`Product '${prod.name?.en || prod.slug}': Upload error (${err.message})`);
        }
      } else {
        prodFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "S3 Image Migration completed!",
      summary: {
        categories: { total: categories.length, migrated: catSuccess, skipped: catSkipped, failed: catFailed },
        products: { total: products.length, migrated: prodSuccess, skipped: prodSkipped, failed: prodFailed },
      },
      catLogs,
      prodLogs,
    });
  } catch (err: any) {
    console.error("Migration Error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || String(err),
      stack: err.stack,
    }, { status: 200 });
  }
}
