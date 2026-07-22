import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db/client";
import { uploadImage } from "./s3Client";

function getMimeAndExt(filePathOrData: string) {
  const lower = filePathOrData.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.includes("image/jpeg")) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (lower.endsWith(".webp") || lower.includes("image/webp")) {
    return { mime: "image/webp", ext: "webp" };
  }
  if (lower.endsWith(".svg") || lower.includes("image/svg+xml")) {
    return { mime: "image/svg+xml", ext: "svg" };
  }
  return { mime: "image/png", ext: "png" };
}

let isMigrating = false;
let hasMigrated = false;

export async function migrateImagesToS3(): Promise<{
  catMigrated: number;
  prodMigrated: number;
  catTotal: number;
  prodTotal: number;
}> {
  if (hasMigrated || isMigrating) {
    return { catMigrated: 0, prodMigrated: 0, catTotal: 0, prodTotal: 0 };
  }

  isMigrating = true;
  let catMigrated = 0;
  let prodMigrated = 0;

  try {
    const db = await getDb();
    const publicDir = path.join(process.cwd(), "public");

    // 1. Categories
    const categories = await db.collection("categories").find({}).toArray();
    for (const cat of categories) {
      const img = cat.image;
      if (!img || (typeof img === "string" && img.startsWith("https://") && img.includes("amazonaws.com"))) {
        continue;
      }

      let buffer: Buffer | null = null;
      let mimeType = "image/png";

      if (typeof img === "string" && img.startsWith("data:")) {
        const matches = img.match(/^data:(.+);base64,(.*)$/);
        if (matches) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], "base64");
        }
      } else if (typeof img === "string") {
        const cleanPath = decodeURIComponent(img.startsWith("/") ? img.substring(1) : img);
        const localPath = path.join(publicDir, cleanPath);
        if (fs.existsSync(localPath)) {
          buffer = fs.readFileSync(localPath);
          const info = getMimeAndExt(localPath);
          mimeType = info.mime;
        }
      }

      if (buffer) {
        try {
          const s3Url = await uploadImage(buffer, mimeType, "categories/");
          await db.collection("categories").updateOne(
            { _id: cat._id },
            { $set: { image: s3Url, updatedAt: new Date() } }
          );
          catMigrated++;
          console.log(`[S3 Migration] Category '${cat.name?.en || cat.slug}' -> ${s3Url}`);
        } catch (err: any) {
          console.error(`[S3 Migration Error] Category '${cat.name?.en || cat.slug}':`, err.message);
        }
      }
    }

    // 2. Products
    const products = await db.collection("products").find({}).toArray();
    for (const prod of products) {
      const img = prod.image;
      if (!img || (typeof img === "string" && img.startsWith("https://") && img.includes("amazonaws.com"))) {
        continue;
      }

      let buffer: Buffer | null = null;
      let mimeType = "image/png";

      if (typeof img === "string" && img.startsWith("data:")) {
        const matches = img.match(/^data:(.+);base64,(.*)$/);
        if (matches) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], "base64");
        }
      } else if (typeof img === "string") {
        const cleanPath = decodeURIComponent(img.startsWith("/") ? img.substring(1) : img);
        const localPath = path.join(publicDir, cleanPath);
        if (fs.existsSync(localPath)) {
          buffer = fs.readFileSync(localPath);
          const info = getMimeAndExt(localPath);
          mimeType = info.mime;
        }
      }

      if (buffer) {
        try {
          const s3Url = await uploadImage(buffer, mimeType, "products/");
          await db.collection("products").updateOne(
            { _id: prod._id },
            { $set: { image: s3Url, updatedAt: new Date() } }
          );
          prodMigrated++;
          console.log(`[S3 Migration] Product '${prod.name?.en || prod.slug}' -> ${s3Url}`);
        } catch (err: any) {
          console.error(`[S3 Migration Error] Product '${prod.name?.en || prod.slug}':`, err.message);
        }
      }
    }

    hasMigrated = true;
    console.log(`[S3 Migration Finished] Categories migrated: ${catMigrated}/${categories.length}, Products migrated: ${prodMigrated}/${products.length}`);
    return {
      catMigrated,
      prodMigrated,
      catTotal: categories.length,
      prodTotal: products.length,
    };
  } catch (err: any) {
    console.error("[S3 Migration Exception]:", err);
    return { catMigrated, prodMigrated, catTotal: 0, prodTotal: 0 };
  } finally {
    isMigrating = false;
  }
}
