import { BaseRepository } from "./base.repository";
import { Document } from "mongodb";

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

export interface HomeSettings extends Document {
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
  updatedAt: Date;
}

class SettingsRepository extends BaseRepository<HomeSettings> {
  constructor() {
    super("settings");
  }

  async getHomeSettings(): Promise<HomeSettings | null> {
    const doc = await this.findOne({ key: "home_settings" } as any);
    return doc;
  }

  async updateHomeSettings(settingsData: {
    hero?: {
      title: { en: string; ar: string };
      subtitle: { en: string; ar: string };
      imageUrl: string;
      ctaText?: { en: string; ar: string };
    };
    banners?: BannerItem[];
  }): Promise<boolean> {
    try {
      const updateDoc: Record<string, any> = {
        key: "home_settings",
        updatedAt: new Date(),
      };
      if (settingsData.hero) {
        updateDoc.hero = settingsData.hero;
      }
      if (settingsData.banners !== undefined) {
        updateDoc.banners = settingsData.banners;
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
      console.error("Failed to execute updateHomeSettings in SettingsRepository after retries.", err);
      return false;
    }
  }
}

export const settingsRepository = new SettingsRepository();
export default settingsRepository;
