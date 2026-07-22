const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// 1. Manually parse and load .env.local if variables are not already in process.env
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
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    });
  }
}

loadEnv();

// Helper to determine MIME type from filename/extension
function getMimeType(filePathOrExt) {
  const lower = filePathOrExt.toLowerCase();
  if (lower.endsWith(".png") || lower.includes("image/png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.includes("image/jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp") || lower.includes("image/webp")) return "image/webp";
  if (lower.endsWith(".svg") || lower.includes("image/svg+xml")) return "image/svg+xml";
  if (lower.endsWith(".gif") || lower.includes("image/gif")) return "image/gif";
  return "image/png";
}

// Helper to derive file extension from MIME type
function getExtFromMime(mimeType) {
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("svg")) return "svg";
  if (mimeType.includes("gif")) return "gif";
  return "png";
}

// Helper to parse base64 data URL
function parseBase64(dataUrl) {
  if (typeof dataUrl !== "string") return null;
  const matches = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!matches) return null;
  return {
    mime: matches[1],
    buffer: Buffer.from(matches[2], "base64"),
  };
}

// Generate unique S3 Key
function generateS3Key(folder, doc, ext) {
  const identifier = doc.slug || (doc._id ? doc._id.toString() : Date.now().toString());
  const sanitized = identifier.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${folder}/${sanitized}_${Date.now()}.${ext}`;
}

async function main() {
  console.log("=========================================");
  console.log("  OLD DB TO NEW DB MIGRATION WITH S3     ");
  console.log("=========================================\n");

  const oldUri = process.env.MONGODB_URI2;
  const newUri = process.env.MONGODB_URI;
  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION || "ap-south-1";
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!oldUri) {
    console.error("❌ Error: MONGODB_URI2 (old database URI) is not defined in environment or .env.local");
    process.exit(1);
  }
  if (!newUri) {
    console.error("❌ Error: MONGODB_URI (new database URI) is not defined in environment or .env.local");
    process.exit(1);
  }
  if (!bucket || !awsAccessKeyId || !awsSecretAccessKey) {
    console.error("❌ Error: AWS S3 environment variables (AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are missing.");
    process.exit(1);
  }

  console.log("Old DB URI (MONGODB_URI2):", oldUri.replace(/:[^:@]+@/, ":***@"));
  console.log("New DB URI (MONGODB_URI): ", newUri.replace(/:[^:@]+@/, ":***@"));
  console.log("AWS S3 Bucket:             ", bucket);
  console.log("AWS S3 Region:             ", region);
  console.log("\nConnecting to databases...");

  const oldClient = new MongoClient(oldUri);
  const newClient = new MongoClient(newUri);

  await oldClient.connect();
  await newClient.connect();

  const oldDb = oldClient.db();
  const newDb = newClient.db();

  console.log(`✓ Connected to Old DB: "${oldDb.databaseName}"`);
  console.log(`✓ Connected to New DB: "${newDb.databaseName}"`);

  // Initialize S3 Client
  const s3 = new S3Client({
    region: region,
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
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

  // Helper function to process and convert base64 or local image paths to S3 URL
  async function processImageField(imageVal, folderName, doc) {
    if (!imageVal || typeof imageVal !== "string") {
      return imageVal;
    }

    // Already on S3
    if (imageVal.startsWith("https://") && imageVal.includes("amazonaws.com")) {
      return imageVal;
    }

    let buffer = null;
    let mimeType = "image/png";
    let fileExt = "png";

    if (imageVal.startsWith("data:")) {
      const parsed = parseBase64(imageVal);
      if (parsed) {
        buffer = parsed.buffer;
        mimeType = parsed.mime;
        fileExt = getExtFromMime(mimeType);
      }
    } else if (imageVal.startsWith("/") || imageVal.startsWith("images/")) {
      const relativePath = imageVal.startsWith("/") ? imageVal.substring(1) : imageVal;
      const localPath = path.join(publicDir, decodeURIComponent(relativePath));
      if (fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
        mimeType = getMimeType(localPath);
        fileExt = getExtFromMime(mimeType);
      }
    }

    if (buffer) {
      const s3Key = generateS3Key(folderName, doc, fileExt);
      const s3Url = await uploadToS3(buffer, mimeType, s3Key);
      return s3Url;
    }

    return imageVal;
  }

  // Get list of all collections in the old database
  const collections = await oldDb.listCollections().toArray();
  console.log(`\nFound ${collections.length} collections to migrate:`, collections.map((c) => c.name).join(", "));

  const summary = {
    collectionsMigrated: 0,
    totalDocuments: 0,
    s3Uploads: 0,
    errors: 0,
  };

  for (const colInfo of collections) {
    const colName = colInfo.name;
    // Skip system collections if any
    if (colName.startsWith("system.")) continue;

    console.log(`\n-----------------------------------------`);
    console.log(` Migrating collection: "${colName}"`);
    console.log(`-----------------------------------------`);

    const docs = await oldDb.collection(colName).find({}).toArray();
    console.log(`Fetched ${docs.length} documents from old DB.`);

    if (docs.length === 0) {
      console.log(`No documents found in "${colName}". Skipping.`);
      summary.collectionsMigrated++;
      continue;
    }

    const bulkOps = [];
    let colS3Uploads = 0;

    for (const doc of docs) {
      const docCopy = { ...doc };

      // Process main "image" field if present (especially in products, categories, banners, etc.)
      if (docCopy.image && typeof docCopy.image === "string") {
        try {
          const originalImg = docCopy.image;
          const newImgUrl = await processImageField(docCopy.image, colName, docCopy);
          if (newImgUrl !== originalImg && newImgUrl.includes("amazonaws.com")) {
            colS3Uploads++;
            summary.s3Uploads++;
            console.log(`  ✓ Image uploaded to S3 for [${docCopy.name?.en || docCopy.slug || docCopy._id}]:`);
            console.log(`    -> ${newImgUrl}`);
          }
          docCopy.image = newImgUrl;
        } catch (err) {
          console.error(`  ❌ Failed to upload image for document [${docCopy._id}]:`, err.message);
          summary.errors++;
        }
      }

      // Also process "images" array field if present (e.g. product gallery)
      if (Array.isArray(docCopy.images)) {
        const updatedImages = [];
        for (let i = 0; i < docCopy.images.length; i++) {
          const imgItem = docCopy.images[i];
          if (typeof imgItem === "string") {
            try {
              const s3Url = await processImageField(imgItem, `${colName}_gallery`, docCopy);
              if (s3Url !== imgItem && s3Url.includes("amazonaws.com")) {
                colS3Uploads++;
                summary.s3Uploads++;
              }
              updatedImages.push(s3Url);
            } catch (err) {
              console.error(`  ❌ Failed gallery image upload:`, err.message);
              updatedImages.push(imgItem);
            }
          } else {
            updatedImages.push(imgItem);
          }
        }
        docCopy.images = updatedImages;
      }

      // Prepare upsert operation preserving exact _id
      bulkOps.push({
        replaceOne: {
          filter: { _id: docCopy._id },
          replacement: docCopy,
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) {
      const result = await newDb.collection(colName).bulkWrite(bulkOps);
      console.log(`  ✓ Migrated ${docs.length} documents into "${colName}" (Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount})`);
      if (colS3Uploads > 0) {
        console.log(`  ✓ Total S3 uploads for "${colName}": ${colS3Uploads}`);
      }
    }

    summary.collectionsMigrated++;
    summary.totalDocuments += docs.length;
  }

  console.log("\n=========================================");
  console.log("         MIGRATION SUMMARY               ");
  console.log("=========================================");
  console.log(`Collections Migrated: ${summary.collectionsMigrated}`);
  console.log(`Total Documents:     ${summary.totalDocuments}`);
  console.log(`Total S3 Uploads:    ${summary.s3Uploads}`);
  console.log(`Errors:              ${summary.errors}`);
  console.log("=========================================\n");

  await oldClient.close();
  await newClient.close();

  console.log("✓ Migration completed successfully!");
}

main().catch((err) => {
  console.error("❌ Migration failed with error:", err);
  process.exit(1);
});
