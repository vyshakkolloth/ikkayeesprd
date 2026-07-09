import { z } from "zod";
import { ObjectId } from "mongodb";

const OrderItemSchema = z.object({
  dishId: z.string(),
  name: z.string(),
  priceINR: z.number(),
  quantity: z.number().int().positive(),
});

export const OrderSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  tableNumber: z.string().optional(),
  items: z.array(OrderItemSchema),
  specialRequests: z.string().optional(),
  status: z.enum(["pending", "preparing", "served", "cancelled"]).default("pending"),
  totalAmountINR: z.number(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Order = z.infer<typeof OrderSchema>;
