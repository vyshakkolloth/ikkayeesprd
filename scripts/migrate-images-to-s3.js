const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Load .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

function getMimeType(filePathOrExt) {
  const lower = filePathOrExt.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/png";
}

function getExtFromMime(mimeType) {
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("svg")) return "svg+xml";
  if (mimeType.includes("gif")) return "gif";
  return "png";
}

function parseBase64(dataUrl) {
  const matches = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!matches) return null;
  return { mime: matches[1], buffer: Buffer.from(matches[2], "base64") };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION || "ap-south-1";

  if (!mongoUri || !bucket) {
    console.error("Error: MONGODB_URI or AWS_BUCKET_NAME not set in .env.local");
    process.exit(1);
  }

  console.log("=== Starting S3 Image Migration ===");
  console.log("Database URI:", mongoUri.replace(/:[^:@]+@/, ":***@"));
  console.log("S3 Bucket:", bucket);
  console.log("S3 Region:", region);

  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db();

  const s3 = new S3Client({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  async function uploadToS3(buffer, mimeType, key) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  const publicDir = path.join(__dirname, "..", "public");

  // 1. Migrate Categories
  console.log("\n--- Migrating Categories ---");
  const categories = await db.collection("categories").find({}).toArray();
  console.log(`Found ${categories.length} categories.`);

  let catSuccess = 0, catSkipped = 0, catFailed = 0;

  for (const cat of categories) {
    const img = cat.image;
    if (!img) {
      catSkipped++;
      continue;
    }

    if (img.startsWith("https://") && img.includes("amazonaws.com")) {
      console.log(`[Category] ${cat.name?.en || cat.slug}: Already on S3 (${img})`);
      catSkipped++;
      continue;
    }

    let buffer = null;
    let mimeType = "image/png";
    let fileExt = "png";

    if (img.startsWith("data:")) {
      const parsed = parseBase64(img);
      if (parsed) {
        buffer = parsed.buffer;
        mimeType = parsed.mime;
        fileExt = getExtFromMime(mimeType);
      }
    } else {
      // Local path e.g. "/images/kunafa.png"
      const relativePath = img.startsWith("/") ? img.substring(1) : img;
      const localPath = path.join(publicDir, relativePath);
      if (fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
        mimeType = getMimeType(localPath);
        fileExt = getExtFromMime(mimeType);
      } else {
        console.warn(`[Category] ${cat.name?.en || cat.slug}: Local file not found at ${localPath}`);
      }
    }

    if (buffer) {
      try {
        const key = `categories/${cat.slug || cat._id.toString()}_${Date.now()}.${fileExt}`;
        const s3Url = await uploadToS3(buffer, mimeType, key);
        await db.collection("categories").updateOne(
          { _id: cat._id },
          { $set: { image: s3Url, updatedAt: new Date() } }
        );
        console.log(`✓ [Category] ${cat.name?.en || cat.slug} -> S3: ${s3Url}`);
        catSuccess++;
      } catch (err) {
        console.error(`❌ [Category] ${cat.name?.en || cat.slug} upload failed:`, err.message);
        catFailed++;
      }
    } else {
      catFailed++;
    }
  }

  // 2. Migrate Products
  console.log("\n--- Migrating Products ---");
  const products = await db.collection("products").find({}).toArray();
  console.log(`Found ${products.length} products.`);

  let prodSuccess = 0, prodSkipped = 0, prodFailed = 0;

  for (const prod of products) {
    const img = prod.image;
    if (!img) {
      prodSkipped++;
      continue;
    }

    if (img.startsWith("https://") && img.includes("amazonaws.com")) {
      console.log(`[Product] ${prod.name?.en || prod.slug}: Already on S3 (${img})`);
      prodSkipped++;
      continue;
    }

    let buffer = null;
    let mimeType = "image/png";
    let fileExt = "png";

    if (img.startsWith("data:")) {
      const parsed = parseBase64(img);
      if (parsed) {
        buffer = parsed.buffer;
        mimeType = parsed.mime;
        fileExt = getExtFromMime(mimeType);
      }
    } else {
      // Local path e.g. "/images/kunafa.png"
      const relativePath = img.startsWith("/") ? img.substring(1) : img;
      const localPath = path.join(publicDir, relativePath);
      if (fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
        mimeType = getMimeType(localPath);
        fileExt = getExtFromMime(mimeType);
      } else {
        console.warn(`[Product] ${prod.name?.en || prod.slug}: Local file not found at ${localPath}`);
      }
    }

    if (buffer) {
      try {
        const key = `products/${prod.slug || prod._id.toString()}_${Date.now()}.${fileExt}`;
        const s3Url = await uploadToS3(buffer, mimeType, key);
        await db.collection("products").updateOne(
          { _id: prod._id },
          { $set: { image: s3Url, updatedAt: new Date() } }
        );
        console.log(`✓ [Product] ${prod.name?.en || prod.slug} -> S3: ${s3Url}`);
        prodSuccess++;
      } catch (err) {
        console.error(`❌ [Product] ${prod.name?.en || prod.slug} upload failed:`, err.message);
        prodFailed++;
      }
    } else {
      prodFailed++;
    }
  }

  console.log("\n=== Migration Summary ===");
  console.log(`Categories: ${catSuccess} migrated, ${catSkipped} skipped, ${catFailed} failed`);
  console.log(`Products:   ${prodSuccess} migrated, ${prodSkipped} skipped, ${prodFailed} failed`);

  await mongoClient.close();
  console.log("\nMigration completed!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
