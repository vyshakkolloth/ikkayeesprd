import { BaseRepository } from "./base.repository";
import { Category, CategorySchema } from "../schemas/category.schema";
import { Filter, Sort, ObjectId } from "mongodb";

class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super("categories");
    this.setupIndexes();
  }

  private async setupIndexes() {
    try {
      const col = await this.getCollection();
      // Unique index for slug
      await col.createIndex({ slug: 1 }, { unique: true });
      // Index for priority sorting
      await col.createIndex({ priority: 1 });
      // Index to support status filter (isActive) and text search on name fields
      await col.createIndex({ isActive: 1 });
      await col.createIndex({ "name.en": "text", "name.ar": "text" });
    } catch (err) {
      console.error("Failed to setup category indexes:", err);
    }
  }

  async getNextPriority(): Promise<number> {
    const col = await this.getCollection();
    const highest = await col.find().sort({ priority: -1 } as any).limit(1).toArray();
    if (highest.length > 0) {
      return (highest[0].priority ?? 0) + 1;
    }
    return 0;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const doc = await this.findOne({ slug });
    if (doc) {
      return CategorySchema.parse(doc);
    }
    return null;
  }

  async findWithFilters(options: {
    search?: string;
    status?: "active" | "inactive" | "all";
    sortBy?: "priority" | "name" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) {
    const col = await this.getCollection();
    const query: Filter<Category> = {};

    // 1. Search filter
    if (options.search) {
      const searchRegex = new RegExp(options.search, "i");
      query.$or = [
        { "name.en": searchRegex },
        { "name.ar": searchRegex },
        { slug: searchRegex }
      ];
    }

    // 2. Status filter
    if (options.status === "active") {
      query.isActive = true;
    } else if (options.status === "inactive") {
      query.isActive = false;
    }

    // 3. Sorting
    const sort: Record<string, any> = {};
    const sortBy = options.sortBy || "priority";
    const sortOrder = options.sortOrder === "desc" ? -1 : 1;
    
    if (sortBy === "name") {
      sort["name.en"] = sortOrder;
    } else {
      sort[sortBy as any] = sortOrder;
    }

    // 4. Pagination
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 20);
    const skip = (page - 1) * limit;

    // Use aggregation with $facet to fetch paginated items and total count in a single round-trip
    const aggregation = await col
      .aggregate([
        { $match: query },
        { $sort: sort },
        {
          $facet: {
            items: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: "count" }],
          },
        },
        // Keep the raw facet result; we'll extract total in code
        { $project: { items: 1, totalCount: 1 } },
      ])
      .toArray();

    const aggResult = aggregation[0] || { items: [], totalCount: [] };
    const items = aggResult.items;
    const total = aggResult.totalCount?.[0]?.count ?? 0;

    const validatedItems = items.map((item:any) => CategorySchema.parse(item));

    return {
      items: validatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createNewCategory(categoryData: Omit<Category, "createdAt" | "updatedAt">): Promise<string> {
    const validated = CategorySchema.parse({
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.insertOne(validated);
  }

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<boolean> {
    const updatePayload = {
      ...categoryData,
      updatedAt: new Date()
    };
    // Ensure _id is not in update payload
    delete (updatePayload as any)._id;

    return this.updateOne({ _id: new ObjectId(id) } as any, updatePayload as any);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.deleteOne({ _id: new ObjectId(id) } as any);
  }

  async reorderCategories(orderedIds: string[]): Promise<boolean> {
    const col = await this.getCollection();
    
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $set: { priority: index, updatedAt: new Date() } }
      }
    }));

    if (bulkOps.length === 0) return true;

    const result = await col.bulkWrite(bulkOps as any);
    return result.modifiedCount > 0;
  }
}

export const categoryRepository = new CategoryRepository();
