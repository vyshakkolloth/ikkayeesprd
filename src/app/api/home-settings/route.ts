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
    const { hero, banners, title, subtitle, imageUrl, ctaText } = body;

    const payload: {
      hero?: {
        title: { en: string; ar: string };
        subtitle: { en: string; ar: string };
        imageUrl: string;
        ctaText?: { en: string; ar: string };
      };
      banners?: any[];
    } = {};

    // 1. Process Hero settings if provided or flat title/subtitle/imageUrl
    const heroData = hero || (title && subtitle && imageUrl ? { title, subtitle, imageUrl, ctaText } : null);

    if (heroData) {
      let heroImage = heroData.imageUrl;
      if (heroImage && isDataUrl(heroImage)) {
        const { mime, buffer } = dataUrlToBuffer(heroImage);
        heroImage = await uploadImage(buffer, mime, "home-settings/");
      }
      payload.hero = {
        title: heroData.title,
        subtitle: heroData.subtitle,
        imageUrl: heroImage,
        ctaText: heroData.ctaText || { en: "Explore Menu", ar: "استكشف القائمة" },
      };
    }

    // 2. Process Banners array if provided
    if (Array.isArray(banners)) {
      const processedBanners = [];
      for (const banner of banners) {
        let desktopImg = banner.desktopImageUrl;
        let mobileImg = banner.mobileImageUrl;

        if (desktopImg && isDataUrl(desktopImg)) {
          const { mime, buffer } = dataUrlToBuffer(desktopImg);
          desktopImg = await uploadImage(buffer, mime, "home-banners/");
        }

        if (mobileImg && isDataUrl(mobileImg)) {
          const { mime, buffer } = dataUrlToBuffer(mobileImg);
          mobileImg = await uploadImage(buffer, mime, "home-banners/");
        }

        processedBanners.push({
          id: banner.id || `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: banner.title || { en: "", ar: "" },
          subtitle: banner.subtitle || { en: "", ar: "" },
          desktopImageUrl: desktopImg || "",
          mobileImageUrl: mobileImg || desktopImg || "",
          linkUrl: banner.linkUrl || "",
          ctaText: banner.ctaText || { en: "Explore", ar: "استكشف" },
          active: banner.active !== undefined ? banner.active : true,
          sortOrder: typeof banner.sortOrder === "number" ? banner.sortOrder : 0,
        });
      }
      payload.banners = processedBanners;
    }

    if (!payload.hero && !payload.banners) {
      return NextResponse.json(
        { error: "Validation failed: Neither hero nor banners payload provided" },
        { status: 400 }
      );
    }

    const success = await settingsRepository.updateHomeSettings(payload);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update home settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Home settings updated successfully", payload });
  } catch (error: any) {
    console.error("POST /api/home-settings error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
