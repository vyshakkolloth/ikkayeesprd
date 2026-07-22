import { NextResponse } from "next/server";
import { settingsRepository } from "@/lib/db/repositories/settings.repository";

const DEFAULT_SETTINGS = {
  hero: {
    title: {
      en: "A Culinary Journey to Malabar",
      ar: "رحلة طهي إلى مليبار",
    },
    subtitle: {
      en: "Experience the authentic rich flavours of Malabar traditional dishes and desserts.",
      ar: "تجربة النكهات الغنية والأصيلة لأطباق مليبار التقليدية والحلويات.",
    },
    imageUrl: "/images/all_dishes.png",
    ctaText: {
      en: "Explore Menu",
      ar: "استكشف القائمة",
    },
  },
};

export async function GET() {
  try {
    const settings = await settingsRepository.getHomeSettings();
    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET /api/home-settings error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { title, subtitle, imageUrl, ctaText } = body;

  // If imageUrl is a base64 data URL, upload to S3 and replace with S3 key
  if (imageUrl && isDataUrl(imageUrl)) {
    const { mime, buffer } = dataUrlToBuffer(imageUrl);
    const s3Key = await uploadImage(buffer, mime, "home-settings/");
    imageUrl = s3Key;
  }

    // Validate request fields
    if (!title?.en || !title?.ar || !subtitle?.en || !subtitle?.ar || !imageUrl) {
      return NextResponse.json(
        { error: "Validation failed: English and Arabic titles, subtitles and imageUrl are required" },
        { status: 400 }
      );
    }

    const success = await settingsRepository.updateHomeSettings({
      title,
      subtitle,
      imageUrl,
      ctaText: ctaText || { en: "Explore Menu", ar: "استكشف القائمة" },
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update home settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Home settings updated successfully" });
  } catch (error: any) {
    console.error("POST /api/home-settings error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
