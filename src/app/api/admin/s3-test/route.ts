import { NextResponse } from "next/server";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

export async function GET() {
  const bucket = (process.env.AWS_BUCKET_NAME || "").trim();
  const region = (process.env.AWS_REGION || "ap-south-1").trim();
  const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();

  try {
    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    const res = await s3.send(new ListBucketsCommand({}));

    return NextResponse.json({
      success: true,
      bucket,
      region,
      buckets: (res.Buckets || []).map((b) => b.Name),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
