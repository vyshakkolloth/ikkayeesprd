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
}

export const orderRepository = new OrderRepository();
