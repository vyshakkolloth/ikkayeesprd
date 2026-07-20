import { NextResponse } from "next/server";
import { orderRepository } from "@/lib/db/repositories/order.repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const datePreset = (searchParams.get("datePreset") as any) || "all";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const status = searchParams.get("status") || undefined;
    
    const sortByParam = searchParams.get("sortBy") || "confirmedAt";
    const sortBy = ["confirmedAt", "createdAt", "totalAmountINR", "invoiceNumber"].includes(sortByParam)
      ? (sortByParam as any)
      : "confirmedAt";

    const sortOrderParam = searchParams.get("sortOrder") || "desc";
    const sortOrder = sortOrderParam === "asc" ? "asc" : "desc";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await orderRepository.getConfirmedOrdersWithFilters({
      search,
      datePreset,
      startDate,
      endDate,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/confirmed-orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
