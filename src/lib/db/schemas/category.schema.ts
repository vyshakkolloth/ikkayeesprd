import { z } from "zod";
import { ObjectId } from "mongodb";

export const CategorySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.object({
    en: z.string().min(2, "English name must be at least 2 characters").max(100, "English name must be under 100 characters"),
    ar: z.string().min(2, "Arabic name must be at least 2 characters").max(100, "Arabic name must be under 100 characters"),
  }),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  image: z.string().min(1, "Image is required"),
  alt: z.object({
    en: z.string().min(1, "English alt text is required"),
    ar: z.string().min(1, "Arabic alt text is required"),
  }),
  description: z.object({
    en: z.string().default(""),
    ar: z.string().default(""),
  }).default({ en: "", ar: "" }),
  priority: z.number().min(0, "Priority must be at least 0").default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Category = z.infer<typeof CategorySchema>;
