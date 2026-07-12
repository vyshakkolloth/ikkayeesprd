import { z } from "zod";
import { ObjectId } from "mongodb";

export const UserSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  passwordHash: z.string(),
  role: z.enum(["super admin", "admin", "waiter", "customer"]).default("customer"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof UserSchema>;
