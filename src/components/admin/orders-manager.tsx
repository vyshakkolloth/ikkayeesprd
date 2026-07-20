"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, Clock, MessageSquare, RefreshCw, 
  Utensils, AlertTriangle, Check, X, ClipboardList, 
  Columns, ListFilter, CheckCheck, Plus, Edit2, Search, Trash2, Save, Move
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Drag and Drop State
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Edit/Add Product Modal State
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSavingItems, setIsSavingItems] = useState(false);

  const fetchOrders = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders.");
      const data = await res.json();
      setOrders(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(false), 8000); // Poll every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic state update for instant UI feedback
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not update order status.");
      fetchOrders(); // Revert on failure
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData("text/plain", orderId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const orderId = e.dataTransfer.getData("text/plain") || draggedOrderId;
    if (!orderId) return;

    const targetOrder = orders.find(o => o._id === orderId);
    if (targetOrder && targetOrder.status !== targetStatus) {
      await handleUpdateStatus(orderId, targetStatus);
    }
    setDraggedOrderId(null);
  };

  // Open Edit Items Modal
  const openEditItemsModal = async (order: any) => {
    setEditingOrder(order);
    setOrderItems([...order.items]);
    setProductSearch("");

    if (availableProducts.length === 0) {
      setIsLoadingProducts(true);
      try {
        const res = await fetch("/api/products?active=true&limit=200");
        if (res.ok) {
          const data = await res.json();
          setAvailableProducts(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
  };

  const handleAddItemToOrder = (prod: any) => {
    const existingIdx = orderItems.findIndex(i => i.dishId === prod._id || i.productId === prod._id);
    const price = typeof prod.price === "number" ? prod.price : (prod.price?.INR || prod.price?.KWD || 0);
    const name = typeof prod.name === "string" ? prod.name : (prod.name?.en || "Dish");

    if (existingIdx > -1) {
      const updated = [...orderItems];
      updated[existingIdx].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          dishId: prod._id,
          productId: prod._id,
          name,
          priceINR: price,
          quantity: 1,
        }
      ]);
    }
  };

  const handleUpdateItemQuantity = (dishId: string, delta: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.dishId === dishId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItemFromOrder = (dishId: string) => {
    setOrderItems(prev => prev.filter(item => item.dishId !== dishId));
  };

  const handleSaveOrderItems = async () => {
    if (!editingOrder) return;
    if (orderItems.length === 0) {
      alert("Order must have at least 1 item.");
      return;
    }
    setIsSavingItems(true);

    const totalAmountINR = orderItems.reduce((sum, item) => sum + (item.priceINR * item.quantity), 0);

    try {
      const res = await fetch(`/api/orders/${editingOrder._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          totalAmountINR,
        }),
      });

      if (!res.ok) throw new Error("Failed to update order items.");

      setOrders(prev => prev.map(o => o._id === editingOrder._id ? { ...o, items: orderItems, totalAmountINR } : o));
      setEditingOrder(null);
    } catch (err: any) {
      alert(err.message || "Failed to save order items.");
    } finally {
      setIsSavingItems(false);
    }
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const confirmedOrders = orders.filter(o => o.status === "confirmed");
  const servedOrders = orders.filter(o => o.status === "served");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  const filteredProducts = availableProducts.filter(p => {
    if (!productSearch) return true;
    const nameStr = typeof p.name === "string" ? p.name : `${p.name?.en || ""} ${p.name?.ar || ""}`;
    return nameStr.toLowerCase().includes(productSearch.toLowerCase());
  });

  const renderOrderCard = (order: any) => {
    const date = new Date(order.createdAt);
    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const canEdit = ["pending", "confirmed"].includes(order.status);

    return (
      <div 
        key={order._id}
        draggable
        onDragStart={(e) => handleDragStart(e, order._id)}
        className="bg-card text-card-foreground rounded-2xl border border-border/70 shadow-xs flex flex-col justify-between overflow-hidden relative group hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
      >
        {/* Top Status Line */}
        <div className={`h-1.5 w-full ${
          order.status === "pending" ? "bg-amber-500" :
          order.status === "confirmed" ? "bg-blue-500" :
          order.status === "served" ? "bg-emerald-500" : "bg-red-500"
        }`} />

        <div className="p-4 flex flex-col gap-3">
          {/* Invoice & Table */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-bold text-sm tracking-tight font-mono flex items-center gap-1">
                <Move className="size-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                {order.invoiceNumber || "No Invoice"}
              </span>
              <span className="text-[11px] text-muted-foreground font-sans">
                {timeFormatted}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {canEdit && (
                <button
                  onClick={() => openEditItemsModal(order)}
                  title="Add / Edit Items"
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 className="size-3.5" />
                </button>
              )}
              <span className="bg-primary/10 text-primary border border-primary/20 font-bold px-2.5 py-1 rounded-lg text-xs">
                {order.tableNumber || "No Table"}
              </span>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-muted/30 border border-muted/50 rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Items ({order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)})
              </span>
              {canEdit && (
                <button
                  onClick={() => openEditItemsModal(order)}
                  className="text-[10px] font-semibold text-brand-gold hover:underline flex items-center gap-0.5"
                >
                  <Plus className="size-3" />
                  <span>Add Product</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-baseline text-xs gap-2">
                  <span className="font-medium text-foreground">
                    <strong className="text-primary font-semibold mr-1">{item.quantity}x</strong> 
                    {item.name}
                  </span>
                  <span className="text-muted-foreground font-mono text-[11px] shrink-0">
                    {(item.priceINR * item.quantity).toFixed(3)} KWD
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialRequests && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-xs flex gap-1.5 text-amber-900 dark:text-amber-300">
              <MessageSquare className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="font-light italic text-[11px] leading-snug">"{order.specialRequests}"</p>
            </div>
          )}

          {/* Price Total */}
          <div className="flex items-center justify-between border-t pt-2 mt-1">
            <span className="text-xs text-muted-foreground font-medium">Total:</span>
            <span className="text-sm font-bold text-foreground font-mono">
              {order.totalAmountINR.toFixed(3)} KWD
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-3 bg-muted/20 border-t flex items-center gap-2">
          {order.status === "pending" && (
            <>
              <Button 
                onClick={() => handleUpdateStatus(order._id, "confirmed")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1 rounded-xl"
                size="sm"
              >
                <CheckCircle2 className="size-3.5" />
                Confirm Order
              </Button>
              <Button 
                onClick={() => handleUpdateStatus(order._id, "cancelled")}
                variant="destructive"
                className="px-2.5 text-xs h-8 rounded-xl font-semibold"
                size="sm"
              >
                <X className="size-3.5" />
              </Button>
            </>
          )}

          {order.status === "confirmed" && (
            <>
              <Button 
                onClick={() => handleUpdateStatus(order._id, "served")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1 rounded-xl"
                size="sm"
              >
                <Check className="size-3.5" />
                Mark Served
              </Button>
              <Button 
                onClick={() => handleUpdateStatus(order._id, "cancelled")}
                variant="outline"
                className="px-2.5 text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                size="sm"
              >
                <X className="size-3.5" />
              </Button>
            </>
          )}

          {order.status === "served" && (
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl py-1 px-3 text-center flex items-center justify-center gap-1.5 w-full">
              <CheckCheck className="size-4" />
              Served & Completed
            </span>
          )}

          {order.status === "cancelled" && (
            <span className="text-xs text-red-600 font-semibold bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl py-1 px-3 text-center flex items-center justify-center gap-1.5 w-full">
              <X className="size-4" />
              Order Cancelled
            </span>
          )}
        </div>

      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="size-8 animate-spin text-brand-gold" />
        <span className="text-sm text-muted-foreground">Loading orders...</span>
      </div>
    );
  }

  const kanbanColumns = [
    {
      id: "pending",
      title: "Pending Approval",
      badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      dotClass: "bg-amber-500 animate-pulse",
      orders: pendingOrders,
      icon: Clock,
    },
    {
      id: "confirmed",
      title: "Confirmed",
      badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      dotClass: "bg-blue-500",
      orders: confirmedOrders,
      icon: CheckCircle2,
    },
    {
      id: "served",
      title: "Served & Completed",
      badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      dotClass: "bg-emerald-500",
      orders: servedOrders,
      icon: CheckCheck,
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 relative">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="size-5 text-brand-gold" />
            Live Orders Kanban Board
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Drag cards between columns or use quick action buttons to update status. Click "Add Product" to add extra items to an order.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted p-1 rounded-lg text-xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === "kanban" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns className="size-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === "list" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListFilter className="size-3.5" />
              <span>Grid List</span>
            </button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchOrders(true)} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900 rounded-xl p-4 flex items-center gap-3 text-red-800 dark:text-red-400">
          <AlertTriangle className="size-5 shrink-0" />
          <span className="text-sm font-light">{error}</span>
        </div>
      )}

      {/* KANBAN BOARD VIEW WITH DRAG & DROP */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 items-start overflow-x-auto pb-6">
          {kanbanColumns.map((col) => {
            const ColumnIcon = col.icon;
            const isOver = dragOverColumn === col.id;

            return (
              <div 
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-muted/20 border rounded-2xl p-4 flex flex-col gap-4 min-h-[520px] transition-all ${
                  isOver 
                    ? "border-brand-gold ring-2 ring-brand-gold/30 bg-brand-gold/5" 
                    : "border-border/80"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${col.dotClass}`} />
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <ColumnIcon className="size-4 text-muted-foreground" />
                      {col.title}
                    </h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${col.badgeClass}`}>
                    {col.orders.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="flex flex-col gap-4 flex-grow">
                  {col.orders.length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 flex-grow">
                      <Utensils className="size-6 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground font-light">
                        Drag orders here to mark as {col.title.toLowerCase()}
                      </span>
                    </div>
                  ) : (
                    col.orders.map((order) => renderOrderCard(order))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GRID LIST VIEW */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-6">
          <div className="flex gap-2 border-b pb-2 overflow-x-auto">
            {["all", "pending", "confirmed", "served", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${
                  filterStatus === st 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {st} ({
                  st === "all" ? orders.length :
                  orders.filter(o => o.status === st).length
                })
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders
              .filter(o => filterStatus === "all" || o.status === filterStatus)
              .map(order => renderOrderCard(order))}
          </div>
        </div>
      )}

      {/* Cancelled orders section if any exist */}
      {cancelledOrders.length > 0 && viewMode === "kanban" && (
        <div className="mt-4 border-t pt-4">
          <details className="group">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-2 select-none">
              <span>View Cancelled Orders ({cancelledOrders.length})</span>
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {cancelledOrders.map(order => renderOrderCard(order))}
            </div>
          </details>
        </div>
      )}

      {/* EDIT / ADD PRODUCTS TO ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Edit2 className="size-4 text-brand-gold" />
                  Edit Order Items ({editingOrder.invoiceNumber || editingOrder.tableNumber})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add extra products or adjust dish quantities for this table.
                </p>
              </div>
              <button 
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body: Split view (Current Items vs Add Menu Items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[55vh] pr-1">
              
              {/* Left Column: Current Order Items */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Order Items ({orderItems.length})
                </h4>

                {orderItems.length === 0 ? (
                  <div className="py-8 text-center border border-dashed rounded-xl text-xs text-muted-foreground">
                    No items in this order.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="bg-muted/40 border rounded-xl p-3 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground">{item.name}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {item.priceINR.toFixed(3)} KWD each
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-background border rounded-lg px-1 py-0.5 text-xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.dishId, -1)}
                              className="size-5 hover:bg-muted rounded flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.dishId, 1)}
                              className="size-5 hover:bg-muted rounded flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromOrder(item.dishId)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Search & Add Products from Restaurant Menu */}
              <div className="flex flex-col gap-3 border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Add Dishes from Menu
                </h4>

                <div className="relative">
                  <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search dish name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-muted/40 border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {isLoadingProducts ? (
                  <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin text-brand-gold" />
                    <span>Loading menu...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {filteredProducts.map((prod) => {
                      const name = typeof prod.name === "string" ? prod.name : (prod.name?.en || "Dish");
                      const price = typeof prod.price === "number" ? prod.price : (prod.price?.INR || prod.price?.KWD || 0);

                      return (
                        <div 
                          key={prod._id}
                          className="bg-background hover:bg-muted/50 border rounded-xl p-2.5 flex items-center justify-between gap-2 transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-xs block text-foreground">{name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{price.toFixed(3)} KWD</span>
                          </div>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleAddItemToOrder(prod)}
                            className="h-7 text-xs px-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1"
                          >
                            <Plus className="size-3" />
                            <span>Add</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <span className="text-xs text-muted-foreground block">New Total Amount:</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {orderItems.reduce((sum, item) => sum + (item.priceINR * item.quantity), 0).toFixed(3)} KWD
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  disabled={isSavingItems}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveOrderItems}
                  disabled={isSavingItems}
                  className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                >
                  {isSavingItems ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  <span>Save Changes</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
