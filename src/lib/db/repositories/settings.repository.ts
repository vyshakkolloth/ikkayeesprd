import { BaseRepository } from "./base.repository";
import { Document } from "mongodb";

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

  async updateHomeSettings(heroData: {
    title: { en: string; ar: string };
    subtitle: { en: string; ar: string };
    imageUrl: string;
    ctaText?: { en: string; ar: string };
  }): Promise<boolean> {
    const col = await this.getCollection();
    const result = await col.updateOne(
      { key: "home_settings" } as any,
      {
        $set: {
          key: "home_settings",
          hero: heroData,
          updatedAt: new Date(),
        },
      } as any,
      { upsert: true }
    );
    return result.upsertedCount > 0 || result.modifiedCount > 0 || result.matchedCount > 0;
  }
}

export const settingsRepository = new SettingsRepository();
export default settingsRepository;
