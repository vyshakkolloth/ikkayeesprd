import { z } from "zod";
import { ObjectId } from "mongodb";

export const DishSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1, "Dish name is required"),
  description: z.string(),
  priceINR: z.number().positive(),
  priceUSD: z.number().positive(),
  rating: z.number().min(0).max(5).default(5),
  isChefRecommended: z.boolean().default(false),
  isVeg: z.boolean().default(false),
  image: z.string(),
  categoryMobile: z.string(),
  categoryDesktop: z.string(),
  isTopPick: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

export type Dish = z.infer<typeof DishSchema>;
