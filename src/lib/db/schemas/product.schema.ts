import { z } from "zod";
import { ObjectId } from "mongodb";

// Helper to validate and convert ObjectId string or instance
const ObjectIdSchema = z.union([
  z.instanceof(ObjectId),
  z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId").transform((val) => new ObjectId(val)),
]);

export const ProductSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.object({
    en: z.string().min(2, "English name must be at least 2 characters").max(100, "English name must be under 100 characters"),
    ar: z.string().min(2, "Arabic name must be at least 2 characters").max(100, "Arabic name must be under 100 characters"),
  }),
  description: z.object({
    en: z.string().min(1, "English description is required").max(1000, "English description must be under 1000 characters"),
    ar: z.string().min(1, "Arabic description is required").max(1000, "Arabic description must be under 1000 characters"),
  }),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  categoryId: ObjectIdSchema,
  image: z.string().min(1, "Product image is required"),
  imageAlt: z.object({
    en: z.string().min(1, "English alt text is required"),
    ar: z.string().min(1, "Arabic alt text is required"),
  }),
  price: z.number().positive("Price must be greater than zero"),
  hasPortions: z.boolean().default(false),
  portions: z.array(
    z.object({
      name: z.object({
        en: z.string().min(1, "Portion name is required"),
        ar: z.string().min(1, "Portion name is required"),
      }),
      price: z.number().positive("Portion price must be greater than zero"),
    })
  ).default([]),
  chefRecommended: z.boolean().default(false),
  topPick: z.boolean().default(false),
  spiceLevel: z.enum(["low", "medium", "high"]).default("medium"),
  servingSize: z.string().optional().default(""),
  prepTime: z.string().optional().default(""),
  isVeg: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().min(0, "Sort order must be at least 0").default(0),
  active: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Product = z.infer<typeof ProductSchema>;
