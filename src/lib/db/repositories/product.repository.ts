import { BaseRepository } from "./base.repository";
import { Product, ProductSchema } from "../schemas/product.schema";
import { Filter, Sort, ObjectId } from "mongodb";

class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super("products");
    this.setupIndexes();
  }

  private async setupIndexes() {
    try {
      const col = await this.getCollection();
      await col.createIndex({ slug: 1 }, { unique: true });
      await col.createIndex({ categoryId: 1 });
      await col.createIndex({ sortOrder: 1 });
    } catch (err) {
      console.error("Failed to setup product indexes:", err);
    }
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const doc = await this.findOne({ slug, isDeleted: { $ne: true } } as any);
    if (doc) {
      return ProductSchema.parse(doc);
    }
    return null;
  }

  async findWithFilters(options: {
    search?: string;
    categoryId?: string;
    isVeg?: boolean | null;
    active?: boolean | null;
    chefRecommended?: boolean | null;
    topPick?: boolean | null;
    spiceLevel?: string;
    sortBy?: "name" | "price" | "sortOrder" | "updatedAt" | "createdAt";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) {
    const col = await this.getCollection();
    
    // Base match criteria: exclude soft deleted
    const match: Filter<Product> = { isDeleted: { $ne: true } };

    // categoryId filter
    if (options.categoryId && options.categoryId !== "all") {
      match.categoryId = new ObjectId(options.categoryId);
    }

    // isVeg filter
    if (options.isVeg !== undefined && options.isVeg !== null) {
      match.isVeg = options.isVeg;
    }

    // active status filter
    if (options.active !== undefined && options.active !== null) {
      match.active = options.active;
    }

    // chefRecommended filter
    if (options.chefRecommended) {
      match.chefRecommended = true;
    }

    // topPick filter
    if (options.topPick) {
      match.topPick = true;
    }

    // spiceLevel filter
    if (options.spiceLevel && options.spiceLevel !== "all") {
      match.spiceLevel = options.spiceLevel;
    }

    // Setup sorting options
    const sort: Sort = {};
    const sortBy = options.sortBy || "sortOrder";
    const sortOrder = options.sortOrder === "desc" ? -1 : 1;

    if (sortBy === "name") {
      sort["name.en"] = sortOrder;
    } else {
      sort[sortBy as any] = sortOrder;
    }

    // Pagination bounds
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 20);
    const skip = (page - 1) * limit;

    // Build aggregation pipeline to lookup categories for name matches and display context
    const pipeline: any[] = [];

    // Match main product filters first (best for performance, uses indexes)
    pipeline.push({ $match: match });

    // Lookup Category details
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryDetails"
      }
    });

    // Unwind category details array
    pipeline.push({
      $unwind: {
        path: "$categoryDetails",
        preserveNullAndEmptyArrays: true
      }
    });

    // Search query matches: name (en/ar), tags, or category name (en/ar)
    if (options.search) {
      const searchRegex = new RegExp(options.search, "i");
      pipeline.push({
        $match: {
          $or: [
            { "name.en": searchRegex },
            { "name.ar": searchRegex },
            { tags: searchRegex },
            { "categoryDetails.name.en": searchRegex },
            { "categoryDetails.name.ar": searchRegex }
          ]
        }
      });
    }

    // Facet pagination: fetch data & count documents in one query
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: sort },
          { $skip: skip },
          { $limit: limit }
        ]
      }
    });

    const result = await col.aggregate(pipeline).toArray();
    
    const total = result[0]?.metadata[0]?.total || 0;
    const rawItems = result[0]?.data || [];

    const items = rawItems.map((item: any) => {
      // Map category fields
      const categoryName = item.categoryDetails
        ? { en: item.categoryDetails.name.en, ar: item.categoryDetails.name.ar }
        : { en: "Uncategorized", ar: "غير مصنف" };
        
      const parsed = ProductSchema.parse(item);
      
      return {
        ...parsed,
        _id: item._id.toString(),
        categoryId: item.categoryId.toString(),
        categoryName
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createNewProduct(productData: Omit<Product, "createdAt" | "updatedAt">): Promise<string> {
    const validated = ProductSchema.parse({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.insertOne(validated);
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<boolean> {
    const updatePayload = {
      ...productData,
      updatedAt: new Date()
    };
    delete (updatePayload as any)._id;
    return this.updateOne({ _id: new ObjectId(id) } as any, updatePayload as any);
  }

  async softDeleteProduct(id: string): Promise<boolean> {
    return this.updateProduct(id, { isDeleted: true });
  }

  async updateProductStatus(id: string, active: boolean): Promise<boolean> {
    return this.updateProduct(id, { active });
  }

  async getNextSortOrder(categoryId: string): Promise<number> {
    const col = await this.getCollection();
    const highest = await col
      .find({ categoryId: new ObjectId(categoryId), isDeleted: { $ne: true } })
      .sort({ sortOrder: -1 })
      .limit(1)
      .toArray();

    if (highest.length > 0) {
      return (highest[0].sortOrder ?? 0) + 1;
    }
    return 0;
  }
}

export const productRepository = new ProductRepository();
