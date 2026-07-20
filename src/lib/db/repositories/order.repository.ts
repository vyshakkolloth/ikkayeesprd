import { BaseRepository } from "./base.repository";
import { Order, OrderSchema } from "../schemas/order.schema";
import { ObjectId } from "mongodb";
import { getDb } from "../client";

class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super("orders");
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const results = await this.runWithRetry((col) => 
        col.find({}).sort({ createdAt: -1 }).toArray()
      );
      return results.map(o => OrderSchema.parse(o));
    } catch (err) {
      console.error("Failed to fetch all orders:", err);
      return [];
    }
  }

  async findOrderById(id: string): Promise<Order | null> {
    try {
      const order = await this.findOne({ _id: new ObjectId(id) });
      if (order) {
        return OrderSchema.parse(order);
      }
      return null;
    } catch (err) {
      console.error(`Failed to find order with ID ${id}:`, err);
      return null;
    }
  }

  async createNewOrder(orderData: Omit<Order, "createdAt" | "updatedAt">): Promise<Order> {
    const now = new Date();
    const validated = OrderSchema.parse({
      ...orderData,
      createdAt: now,
      updatedAt: now
    });
    
    const id = await this.insertOne(validated);
    return {
      ...validated,
      _id: new ObjectId(id)
    };
  }

  async saveToConfirmedOrdersCollection(order: Order): Promise<boolean> {
    try {
      const db = await getDb();
      const col = db.collection("confirmed_orders");
      await col.updateOne(
        { orderId: order._id ? order._id.toString() : order.invoiceNumber },
        { 
          $set: {
            orderId: order._id ? order._id.toString() : order.invoiceNumber,
            invoiceNumber: order.invoiceNumber,
            tableNumber: order.tableNumber,
            items: order.items,
            specialRequests: order.specialRequests,
            status: order.status,
            totalAmountINR: order.totalAmountINR,
            createdAt: order.createdAt,
            confirmedAt: new Date(),
            updatedAt: new Date(),
          }
        },
        { upsert: true }
      );
      return true;
    } catch (err) {
      console.error("Failed to save to confirmed_orders collection:", err);
      return false;
    }
  }

  async updateStatus(id: string, status: Order["status"]): Promise<boolean> {
    try {
      const updated = await this.updateOne(
        { _id: new ObjectId(id) },
        { 
          status, 
          updatedAt: new Date() 
        }
      );

      if (updated && status === "confirmed") {
        const fullOrder = await this.findOrderById(id);
        if (fullOrder) {
          await this.saveToConfirmedOrdersCollection(fullOrder);
        }
      }

      return updated;
    } catch (err) {
      console.error(`Failed to update status for order ${id}:`, err);
      return false;
    }
  }

  async updateOrder(id: string, updateData: Partial<Order>): Promise<boolean> {
    try {
      const updated = await this.updateOne(
        { _id: new ObjectId(id) },
        { 
          ...updateData, 
          updatedAt: new Date() 
        }
      );

      if (updated) {
        const fullOrder = await this.findOrderById(id);
        if (fullOrder && fullOrder.status === "confirmed") {
          await this.saveToConfirmedOrdersCollection(fullOrder);
        }
      }

      return updated;
    } catch (err) {
      console.error(`Failed to update order ${id}:`, err);
      return false;
    }
  }

  async getConfirmedOrdersWithFilters(options: {
    search?: string;
    datePreset?: "all" | "today" | "yesterday" | "this-week" | "this-month" | "custom";
    startDate?: string;
    endDate?: string;
    status?: string;
    sortBy?: "confirmedAt" | "createdAt" | "totalAmountINR" | "invoiceNumber";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
      totalItemsCount: number;
    };
  }> {
    try {
      const db = await getDb();
      const col = db.collection("confirmed_orders");

      const matchFilter: Record<string, any> = {};

      // 1. Date Range Filtering
      const now = new Date();
      let start: Date | undefined;
      let end: Date | undefined;

      const preset = options.datePreset || "all";

      if (preset === "today") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      } else if (preset === "yesterday") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      } else if (preset === "this-week") {
        const dayOfWeek = now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      } else if (preset === "this-month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (preset === "custom" || options.startDate || options.endDate) {
        if (options.startDate) {
          const s = new Date(options.startDate);
          if (!isNaN(s.getTime())) {
            s.setHours(0, 0, 0, 0);
            start = s;
          }
        }
        if (options.endDate) {
          const e = new Date(options.endDate);
          if (!isNaN(e.getTime())) {
            e.setHours(23, 59, 59, 999);
            end = e;
          }
        }
      }

      if (start || end) {
        const dateQuery: Record<string, any> = {};
        if (start) dateQuery.$gte = start;
        if (end) dateQuery.$lte = end;

        matchFilter.$or = [
          { confirmedAt: dateQuery },
          { createdAt: dateQuery }
        ];
      }

      // 2. Status Filter
      if (options.status && options.status !== "all") {
        matchFilter.status = options.status;
      }

      // 3. Search Filter
      if (options.search && options.search.trim()) {
        const searchRegex = new RegExp(options.search.trim(), "i");
        const searchConditions = [
          { invoiceNumber: searchRegex },
          { tableNumber: searchRegex },
          { orderId: searchRegex },
          { "items.name": searchRegex }
        ];

        if (matchFilter.$or) {
          matchFilter.$and = [
            { $or: matchFilter.$or },
            { $or: searchConditions }
          ];
          delete matchFilter.$or;
        } else {
          matchFilter.$or = searchConditions;
        }
      }

      // 4. Pagination & Sorting
      const page = Math.max(1, options.page || 1);
      const limit = Math.max(1, Math.min(100, options.limit || 10));
      const skip = (page - 1) * limit;

      const sortBy = options.sortBy || "confirmedAt";
      const sortOrder = options.sortOrder === "asc" ? 1 : -1;

      // Aggregation Pipeline for Faceted Execution (Items + Counts + Metrics)
      const pipeline: any[] = [
        { $match: matchFilter },
        {
          $facet: {
            items: [
              { $sort: { [sortBy]: sortOrder, _id: -1 } },
              { $skip: skip },
              { $limit: limit }
            ],
            totalCount: [
              { $count: "count" }
            ],
            summaryMetrics: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$totalAmountINR" },
                  totalOrders: { $sum: 1 },
                  totalItemsCount: {
                    $sum: {
                      $reduce: {
                        input: { $ifNull: ["$items", []] },
                        initialValue: 0,
                        in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      ];

      const [aggregationResult] = await col.aggregate(pipeline).toArray();

      const items = (aggregationResult?.items || []).map((doc: any) => ({
        ...doc,
        _id: doc._id ? doc._id.toString() : doc.orderId
      }));

      const total = aggregationResult?.totalCount?.[0]?.count || 0;
      const totalPages = Math.ceil(total / limit) || 1;

      const metric = aggregationResult?.summaryMetrics?.[0];
      const totalRevenue = metric?.totalRevenue || 0;
      const totalOrders = metric?.totalOrders || 0;
      const totalItemsCount = metric?.totalItemsCount || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          totalItemsCount
        }
      };
    } catch (err) {
      console.error("Failed to fetch confirmed orders with filters:", err);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: options.limit || 10,
        totalPages: 1,
        summary: {
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          totalItemsCount: 0
        }
      };
    }
  }
}

export const orderRepository = new OrderRepository();

