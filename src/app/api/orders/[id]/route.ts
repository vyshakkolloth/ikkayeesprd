import { NextResponse } from "next/server";
import { orderRepository } from "@/lib/db/repositories/order.repository";

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const order = await orderRepository.findOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error: any) {
    console.error(`GET /api/orders/${context} error:`, error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updateFields: any = {};
    if (body.status) updateFields.status = body.status;
    if (body.items) updateFields.items = body.items;
    if (typeof body.totalAmountINR === "number") updateFields.totalAmountINR = body.totalAmountINR;
    if (typeof body.specialRequests === "string") updateFields.specialRequests = body.specialRequests;
    if (typeof body.tableNumber === "string") updateFields.tableNumber = body.tableNumber;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    const success = await orderRepository.updateOrder(id, updateFields);
    if (!success) {
      return NextResponse.json(
        { error: "Order not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error: any) {
    console.error(`PATCH /api/orders/${context} error:`, error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
