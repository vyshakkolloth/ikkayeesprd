import { NextResponse } from "next/server";
import { orderRepository } from "@/lib/db/repositories/order.repository";
import { OrderSchema } from "@/lib/db/schemas/order.schema";

export async function GET() {
  try {
    const orders = await orderRepository.getAllOrders();
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generate unique invoice number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomDigits}`;

    const orderPayload = {
      ...body,
      invoiceNumber,
      status: "pending",
    };

    // Validate payload structure
    const validationResult = OrderSchema.safeParse(orderPayload);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: fieldErrors },
        { status: 400 }
      );
    }

    const createdOrder = await orderRepository.createNewOrder(validationResult.data);

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
