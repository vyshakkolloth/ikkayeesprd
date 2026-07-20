"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Calendar, Download, RefreshCw, Eye,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  DollarSign, ShoppingBag, TrendingUp, Utensils,
  Filter, X, Clock, CheckCircle2, MessageSquare, CheckCheck,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  dishId?: string;
  productId?: string;
  name: string;
  priceINR: number;
  quantity: number;
}

interface ConfirmedOrder {
  _id: string;
  orderId?: string;
  invoiceNumber?: string;
  tableNumber?: string;
  items: OrderItem[];
  specialRequests?: string;
  status: "confirmed" | "served" | "pending" | "cancelled" | string;
  totalAmountINR: number;
  createdAt: string;
  confirmedAt?: string;
  updatedAt?: string;
}

interface ConfirmedOrdersSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalItemsCount: number;
}

export function ConfirmedOrdersList() {
  const [orders, setOrders] = useState<ConfirmedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "yesterday" | "this-week" | "this-month" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"confirmedAt" | "createdAt" | "totalAmountINR" | "invoiceNumber">("confirmedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Metrics Summary State
  const [summary, setSummary] = useState<ConfirmedOrdersSummary>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalItemsCount: 0,
  });

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<ConfirmedOrder | null>(null);

  const fetchConfirmedOrders = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      params.set("datePreset", datePreset);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (datePreset === "custom") {
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
      }

      const res = await fetch(`/api/confirmed-orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch confirmed orders");

      const data = await res.json();
      setOrders(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong fetching confirmed orders.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, limit, datePreset, startDate, endDate, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchConfirmedOrders();
  }, [fetchConfirmedOrders]);

  // Reset to page 1 when filter parameters change
  const handlePresetChange = (preset: typeof datePreset) => {
    setDatePreset(preset);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (st: string) => {
    setStatusFilter(st);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field as any);
    setSortOrder(order as any);
    setPage(1);
  };

  // Export to CSV Functionality
  const exportToCSV = () => {
    if (orders.length === 0) return;

    const headers = ["Invoice Number", "Table Number", "Status", "Items Count", "Items Breakdown", "Total Amount (KWD)", "Confirmed Date"];
    const rows = orders.map((o) => {
      const itemsFormatted = o.items.map(i => `${i.quantity}x ${i.name}`).join("; ");
      const dateStr = o.confirmedAt ? new Date(o.confirmedAt).toLocaleString() : new Date(o.createdAt).toLocaleString();
      return [
        `"${o.invoiceNumber || "N/A"}"`,
        `"${o.tableNumber || "N/A"}"`,
        `"${o.status}"`,
        o.items.reduce((s, i) => s + i.quantity, 0),
        `"${itemsFormatted.replace(/"/g, '""')}"`,
        o.totalAmountINR.toFixed(3),
        `"${dateStr}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `confirmed_orders_${datePreset}_page${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 py-2">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="size-6 text-brand-gold" />
            Confirmed Orders Collection
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse, filter, and review all confirmed restaurant sales records from the database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={orders.length === 0}
            className="flex items-center gap-1.5 text-xs rounded-xl"
          >
            <Download className="size-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchConfirmedOrders(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs rounded-xl"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-brand-gold" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground block">Total Revenue</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {summary.totalRevenue.toFixed(3)} <span className="text-xs font-sans font-normal text-muted-foreground">KWD</span>
            </span>
          </div>
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="size-6" />
          </div>
        </div>

        <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground block">Confirmed Orders</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {summary.totalOrders}
            </span>
          </div>
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShoppingBag className="size-6" />
          </div>
        </div>

        <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground block">Average Order Value</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {summary.avgOrderValue.toFixed(3)} <span className="text-xs font-sans font-normal text-muted-foreground">KWD</span>
            </span>
          </div>
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="size-6" />
          </div>
        </div>

        <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground block">Items Sold</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {summary.totalItemsCount}
            </span>
          </div>
          <div className="size-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Utensils className="size-6" />
          </div>
        </div>
      </div>

      {/* Date Period Presets & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col gap-4 shadow-xs">
        
        {/* Date Preset Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
              <Calendar className="size-3.5" /> Date Period:
            </span>
            {(
              [
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "this-week", label: "This Week" },
                { id: "this-month", label: "This Month" },
                { id: "custom", label: "Custom Range" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => handlePresetChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  datePreset === tab.id
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Items per page Selector */}
          <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-background border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Custom Date Inputs if "custom" is selected */}
        {datePreset === "custom" && (
          <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-xl border border-muted">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="bg-background border rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="bg-background border rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3 mr-1" /> Clear Dates
              </Button>
            )}
          </div>
        )}

        {/* Search & Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Invoice #, Table #, or Item name..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-background border rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full bg-background border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="served">Served & Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sorting Selector */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full bg-background border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="confirmedAt-desc">Confirmed Date: Newest First</option>
              <option value="confirmedAt-asc">Confirmed Date: Oldest First</option>
              <option value="totalAmountINR-desc">Amount: Highest First</option>
              <option value="totalAmountINR-asc">Amount: Lowest First</option>
              <option value="invoiceNumber-asc">Invoice #: A-Z</option>
            </select>
          </div>

        </div>

      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900 rounded-xl p-4 text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Confirmed Orders Data Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Confirmed Date & Time</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total (KWD)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-brand-gold" />
                      <span>Loading confirmed orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Utensils className="size-8 text-muted-foreground/40" />
                      <span className="font-semibold text-foreground">No confirmed orders found</span>
                      <span className="text-xs max-w-sm">
                        Try adjusting your search query, status filter, or date period range.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const dateObj = order.confirmedAt
                    ? new Date(order.confirmedAt)
                    : new Date(order.createdAt);
                  const formattedDate = dateObj.toLocaleDateString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const totalItemsQty = order.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Invoice Number */}
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {order.invoiceNumber || "—"}
                      </td>

                      {/* Table Number */}
                      <td className="py-3 px-4">
                        <span className="bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-md text-xs">
                          {order.tableNumber || "No Table"}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{formattedDate}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">{formattedTime}</span>
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3 px-4 max-w-[240px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground">
                            {totalItemsQty} {totalItemsQty === 1 ? "item" : "items"}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {order.status === "confirmed" ? (
                          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="size-3" /> Confirmed
                          </span>
                        ) : order.status === "served" ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            <CheckCheck className="size-3" /> Served
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize">
                            {order.status}
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {order.totalAmountINR.toFixed(3)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 px-2.5 text-xs text-brand-gold hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg"
                        >
                          <Eye className="size-3.5 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-muted/30 border-t px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {total === 0 ? 0 : (page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{total}</span> confirmed orders
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page <= 1 || loading}
              className="h-8 w-8 p-0 rounded-lg"
              title="First Page"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="h-8 w-8 p-0 rounded-lg"
              title="Previous Page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <span className="px-3 py-1 bg-background border rounded-lg text-xs font-semibold text-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="h-8 w-8 p-0 rounded-lg"
              title="Next Page"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages || loading}
              className="h-8 w-8 p-0 rounded-lg"
              title="Last Page"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ORDER DETAILS DIALOG MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base font-mono flex items-center gap-2">
                  <ShoppingBag className="size-4 text-brand-gold" />
                  Order #{selectedOrder.invoiceNumber || selectedOrder.orderId}
                </h3>
                <span className="text-xs text-muted-foreground">
                  Table: <strong className="text-foreground">{selectedOrder.tableNumber || "N/A"}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-xl border border-muted">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Confirmed At</span>
                  <span className="font-medium font-mono text-foreground">
                    {selectedOrder.confirmedAt
                      ? new Date(selectedOrder.confirmedAt).toLocaleString()
                      : new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Status</span>
                  <span className="font-semibold capitalize text-primary">
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Special Requests */}
              {selectedOrder.specialRequests && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-900 dark:text-amber-300 flex items-start gap-2">
                  <MessageSquare className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="italic font-light">"{selectedOrder.specialRequests}"</p>
                </div>
              )}

              {/* Itemized Table */}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b text-muted-foreground text-[11px] uppercase">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium">{item.name}</td>
                        <td className="p-2.5 text-center font-bold text-primary">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          {item.priceINR.toFixed(3)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold">
                          {(item.priceINR * item.quantity).toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="flex items-center justify-between border-t pt-3 font-mono">
                <span className="text-xs font-semibold text-muted-foreground font-sans">Grand Total:</span>
                <span className="text-lg font-bold text-foreground">
                  {selectedOrder.totalAmountINR.toFixed(3)} KWD
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
