const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

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

async function main() {
  console.log("=== Testing S3 Bucket Integration ===");
  console.log("Region:", process.env.AWS_REGION);
  console.log("Bucket:", process.env.AWS_BUCKET_NAME);
  console.log("Access Key ID:", process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 6)}...` : "NOT DEFINED");

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const bucket = process.env.AWS_BUCKET_NAME;
  const testKey = `test/test-${Date.now()}.txt`;
  const testContent = "Hello from Ikkayes S3 setup test!";

  try {
    console.log(`\n1. Uploading test object to s3://${bucket}/${testKey}...`);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: Buffer.from(testContent),
        ContentType: "text/plain",
      })
    );
    console.log("✓ Upload SUCCESSFUL!");

    console.log(`\n2. Verifying object headers (HeadObject)...`);
    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: testKey,
      })
    );
    console.log("✓ HeadObject SUCCESSFUL! Content length:", head.ContentLength);

    console.log(`\n3. Cleaning up test object...`);
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: testKey,
      })
    );
    console.log("✓ Cleanup SUCCESSFUL!");

    const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${testKey}`;
    console.log(`\n=== S3 BUCKET IS FULLY WORKING AND OPERATIONAL! ===`);
    console.log(`Public URL format: ${publicUrl}`);
  } catch (err) {
    console.error("\n❌ S3 Test FAILED:", err.message);
    process.exit(1);
  }
}

main();
