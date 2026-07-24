import { BaseRepository } from "./base.repository";
import { Document } from "mongodb";
import { settingsRepository } from "./settings.repository";

export interface BannerItem {
  id: string;
  title?: {
    en: string;
    ar: string;
  };
  subtitle?: {
    en: string;
    ar: string;
  };
  desktopImageUrl: string;
  mobileImageUrl: string;
  linkUrl?: string;
  ctaText?: {
    en: string;
    ar: string;
  };
  active: boolean;
  sortOrder: number;
}

export interface HomepageData extends Document {
  key: string;
  hero: {
    title: {
      en: string;
      ar: string;
    };
    subtitle: {
      en: string;
      ar: string;
    };
    imageUrl: string;
    ctaText?: {
      en: string;
      ar: string;
    };
  };
  banners?: BannerItem[];
  sectionsOrder?: string[];
  updatedAt: Date;
}

class HomepageRepository extends BaseRepository<HomepageData> {
  constructor() {
    super("homepage");
  }

  async getHomepageData(): Promise<HomepageData | null> {
    // Attempt to fetch from dedicated 'homepage' collection first
    const doc = await this.findOne({ key: "home_settings" } as any);
    if (doc) {
      return doc;
    }

    // Fallback/migration path: read from existing 'settings' collection if homepage collection is not yet populated
    try {
      const fallbackSettings = await settingsRepository.getHomeSettings();
      if (fallbackSettings) {
        return {
          key: "home_settings",
          hero: fallbackSettings.hero,
          banners: fallbackSettings.banners || [],
          sectionsOrder: ["topPick", "chefRecommended", "trending", "mandi", "seafood", "heritage", "finish"],
          updatedAt: fallbackSettings.updatedAt || new Date(),
        } as HomepageData;
      }
    } catch (err) {
      console.error("Error reading fallback home settings from settings collection:", err);
    }

    return null;
  }

  async updateHomepageData(data: {
    hero?: {
      title: { en: string; ar: string };
      subtitle: { en: string; ar: string };
      imageUrl: string;
      ctaText?: { en: string; ar: string };
    };
    banners?: BannerItem[];
    sectionsOrder?: string[];
  }): Promise<boolean> {
    try {
      const updateDoc: Record<string, any> = {
        key: "home_settings",
        updatedAt: new Date(),
      };
      if (data.hero) {
        updateDoc.hero = data.hero;
      }
      if (data.banners !== undefined) {
        updateDoc.banners = data.banners;
      }
      if (data.sectionsOrder !== undefined) {
        updateDoc.sectionsOrder = data.sectionsOrder;
      }

      const result = await this.runWithRetry((col) =>
        col.updateOne(
          { key: "home_settings" } as any,
          {
            $set: updateDoc,
          } as any,
          { upsert: true }
        )
      );
      return result.upsertedCount > 0 || result.modifiedCount > 0 || result.matchedCount > 0;
    } catch (err) {
      console.error("Failed to execute updateHomepageData in HomepageRepository after retries.", err);
      return false;
    }
  }
}

export const homepageRepository = new HomepageRepository();
export default homepageRepository;
