import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// Using native crypto for UUID generation (no external dependency)
const uuidv4 = () => {
  // Node's crypto module provides randomUUID in newer versions
  // Fallback to simple random if not available
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Very simple fallback (not RFC compliant but sufficient for key uniqueness)
  return Math.random().toString(36).substring(2, 15);
};

// Initialise S3 client from environment variables. Ensure they are defined in your .env file.
const s3 = new S3Client({
  region: (process.env.AWS_REGION || "ap-south-1").trim(),
  credentials: {
    accessKeyId: (process.env.AWS_ACCESS_KEY_ID || "").trim(),
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || "").trim(),
  },
});

const bucket = (process.env.AWS_BUCKET_NAME || "").trim();

/**
 * Uploads an image buffer/stream to S3 and returns the full public HTTPS S3 URL.
 * The caller stores this URL in the DB.
 */
export async function uploadImage(
  file: Buffer | Uint8Array | string,
  mimeType: string,
  folder = ""
): Promise<string> {
  const ext = mimeType.split("/")[1] ?? "bin";
  const key = `${folder}${uuidv4()}.${ext}`;
  const bucketName = process.env.AWS_BUCKET_NAME!;
  const region = process.env.AWS_REGION || "ap-south-1";

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
    })
  );

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Returns a signed URL for a private object. Adjust expiresInSec as needed.
 */
export async function getImageUrl(key: string, expiresInSec = 300): Promise<string> {
  const cleanKey = key.replace(/^https:\/\/[^/]+\.amazonaws\.com\//, "");
  const command = new GetObjectCommand({ Bucket: bucket, Key: cleanKey });
  return await getSignedUrl(s3, command, { expiresIn: expiresInSec });
}

/**
 * Deletes an object from the bucket.
 */
export async function deleteImage(key: string): Promise<void> {
  const cleanKey = key.replace(/^https:\/\/[^/]+\.amazonaws\.com\//, "");
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: cleanKey }));
}
