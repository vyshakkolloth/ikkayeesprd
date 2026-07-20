"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Trash2, Minus, Plus, ArrowLeft, Clock, Users, Check, 
  Loader2, CheckCircle2, AlertCircle, RefreshCw, XCircle 
} from "lucide-react";
import { useCart } from "@/store/cartStore";

export default function MySectionPage() {
  const [mounted, setMounted] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [tableError, setTableError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [timeLeft, setTimeLeft] = useState("");

  const { 
    items, 
    orderId, 
    invoiceNumber, 
    checkoutTime, 
    checkedOut, 
    specialRequests,
    updateQuantity, 
    removeItem, 
    checkout, 
    resetCart, 
    setSpecialRequests 
  } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.priceINR * item.quantity), 0);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle 30-minute auto-expiry countdown
  useEffect(() => {
    if (!mounted || !checkedOut || !checkoutTime) return;

    const updateTimer = () => {
      const elapsed = Date.now() - checkoutTime;
      const remaining = 30 * 60 * 1000 - elapsed; // 30 minutes in milliseconds
      
      if (remaining <= 0) {
        resetCart();
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [mounted, checkedOut, checkoutTime, resetCart]);

  // Handle order status polling
  useEffect(() => {
    if (!mounted || !checkedOut || !orderId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrderStatus(data.status);
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 8000); // Poll every 8 seconds
    return () => clearInterval(interval);
  }, [mounted, checkedOut, orderId]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      setTableError("Please enter your table number to proceed.");
      return;
    }
    setTableError("");
    setIsSubmitting(true);
    setCheckoutError("");

    try {
      const payload = {
        tableNumber: tableNumber.trim(),
        specialRequests,
        items: items.map(item => ({
          dishId: item.productId || item.id,
          productId: item.productId || item.id,
          name: item.name + (item.portionName ? ` (${item.portionName.en})` : ""),
          priceINR: item.priceINR,
          quantity: item.quantity,
        })),
        totalAmountINR: totalAmount,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to place order.");
      }

      const orderData = await res.json();
      // Commit checkout state to Zustand store (persists for 30 minutes)
      checkout(orderData._id, orderData.invoiceNumber);
      setOrderStatus(orderData.status);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setCheckoutError(err.message || "Something went wrong while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hydration safety
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  // Active Order Status screen (within 30 minutes post-checkout)
  if (checkedOut && invoiceNumber) {
    const statusSteps = ["pending", "confirmed", "served"];
    const statusLabels = {
      pending: "Pending Approval",
      confirmed: "Confirmed",
      served: "Served",
      cancelled: "Cancelled",
    };
    const currentStepIndex = statusSteps.indexOf(orderStatus);

    return (
      <div className="relative min-h-screen bg-[#FAF6EE] text-brand-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          
          <div className="bg-white rounded-3xl border border-brand-gold/15 p-6 sm:p-10 shadow-lg flex flex-col gap-8 relative overflow-hidden">
            {/* Top decorative gold line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-gold" />
            
            {/* Header / Countdown */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-gold/10 pb-6">
              <div>
                <span className="text-xs font-semibold text-[#8C6D3E] uppercase tracking-widest bg-[#F5EFE2] px-3 py-1 rounded-full border border-brand-gold/10">
                  Active Order View
                </span>
                <h1 className="font-playfair text-3xl font-bold text-brand-dark mt-2 select-none">
                  {invoiceNumber}
                </h1>
              </div>
              <div className="flex items-center gap-2 bg-[#FDE8E8] text-red-700 px-4 py-2 rounded-2xl border border-red-200">
                <Clock className="size-4 animate-pulse" />
                <span className="text-xs font-semibold tracking-wider font-mono">
                  EXPIRES IN: {timeLeft || "00:00"}
                </span>
              </div>
            </div>

            {/* Order Status Visualization */}
            {orderStatus === "cancelled" ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 text-red-800">
                <XCircle className="size-10 text-red-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Order Cancelled</h3>
                  <p className="text-sm text-red-700/90 font-light mt-0.5">
                    Your order was cancelled. Please speak with the restaurant staff or place a new order.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 bg-[#FAF6EE]/50 border border-brand-gold/5 rounded-2xl p-6">
                <h3 className="font-playfair text-lg font-bold text-brand-dark">
                  Preparation Progress
                </h3>
                
                {/* Visual Steps Timeline */}
                <div className="relative flex justify-between items-center w-full mt-2">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
                  <div 
                    className="absolute top-4 left-0 h-0.5 bg-brand-gold transition-all duration-500 -z-10"
                    style={{ width: `${(Math.max(0, currentStepIndex) / (statusSteps.length - 1)) * 100}%` }}
                  />

                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    const isUpcoming = idx > currentStepIndex;

                    return (
                      <div key={step} className="flex flex-col items-center gap-2 relative">
                        <div 
                          className={`size-9 rounded-full flex items-center justify-center transition-all border duration-300 font-sans text-xs font-bold ${
                            isCompleted 
                              ? "bg-brand-gold border-brand-gold text-white shadow-md" 
                              : isActive 
                              ? "bg-white border-brand-gold text-brand-gold ring-2 ring-brand-gold/30 animate-pulse scale-105 font-extrabold" 
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {isCompleted ? <Check className="size-4 stroke-[3]" /> : idx + 1}
                        </div>
                        <span 
                          className={`text-[10px] sm:text-xs font-sans tracking-wide uppercase ${
                            isActive 
                              ? "text-brand-gold font-bold" 
                              : isCompleted 
                              ? "text-brand-dark-light/80" 
                              : "text-gray-400 font-light"
                          }`}
                        >
                          {statusLabels[step as keyof typeof statusLabels]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-brand-dark-light/70 text-center font-light border-t border-brand-gold/5 pt-4 mt-2 flex items-center justify-center gap-2">
                  <RefreshCw className="size-3 animate-spin text-brand-gold" />
                  <span>Auto-refreshing status...</span>
                </div>
              </div>
            )}

            {/* Order Summary details */}
            <div className="flex flex-col gap-4 border-t border-brand-gold/10 pt-6">
              <h2 className="font-playfair text-xl font-bold text-brand-dark">
                Order Summary
              </h2>
              
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-baseline justify-between gap-4 text-[14px]">
                    <div className="flex items-baseline gap-2 font-sans font-light text-brand-dark-light">
                      <span className="font-semibold text-brand-dark">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-sans text-xs text-brand-dark-light font-medium whitespace-nowrap">
                      {(item.priceINR * item.quantity).toFixed(3)} KWD
                    </span>
                  </div>
                ))}
              </div>

              {specialRequests && (
                <div className="bg-[#F5EFE2]/50 border border-brand-gold/10 rounded-xl p-4 mt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C6D3E] mb-1">
                    Your Special Requests
                  </h4>
                  <p className="text-xs sm:text-sm font-sans font-light italic text-brand-dark-light">
                    "{specialRequests}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-brand-gold/10 pt-4 mt-2">
                <div>
                  <span className="text-xs text-brand-dark-light/70 block">Payment / Order Total</span>
                  <span className="font-playfair text-2xl font-bold text-brand-dark">
                    {totalAmount.toFixed(3)} KWD
                  </span>
                </div>
                
                {/* Reset Early Button */}
                <button
                  onClick={resetCart}
                  className="h-10 px-5 rounded-full bg-[#2C2520] text-[#FAF6EE] hover:bg-[#1E1915] transition-all duration-300 text-xs font-semibold tracking-wider uppercase select-none cursor-pointer"
                >
                  Reset & Order More
                </button>
              </div>
            </div>

          </div>

          <div className="mt-8 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C6D3E] hover:text-brand-dark transition-colors tracking-widest uppercase"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Menu</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Normal Selection / Cart View
  return (
    <div className="relative min-h-screen bg-[#FAF6EE] text-brand-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Page Header */}
        <div className="flex flex-col items-start gap-3 mb-10 border-b border-brand-gold/10 pb-8">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-playfair text-4xl sm:text-5xl font-bold tracking-tight text-brand-dark">
              My Selection
            </h1>
            {totalItems > 0 && (
              <span className="inline-flex items-center bg-[#F5EFE2] text-[#8C6D3E] border border-brand-gold/15 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider select-none">
                {totalItems} {totalItems === 1 ? "Item" : "Items"} Selected
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-brand-dark-light/85 leading-relaxed font-sans font-light max-w-2xl">
            Review and check out your selected dishes. Once you check out, your order status will be visible here.
          </p>
        </div>

        {items.length > 0 ? (
          <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 flex flex-col gap-10">
              
              {/* Selected Dishes Section */}
              <section className="flex flex-col">
                <h2 className="font-playfair text-2xl font-bold text-brand-dark mb-6 select-none">
                  Selected Dishes
                </h2>
                
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-brand-gold/10 p-5 sm:p-6 flex flex-col sm:flex-row gap-5 relative transition-all duration-300 hover:shadow-md hover:border-brand-gold/20"
                    >
                      {/* Dish Image */}
                      {item.image && (
                        <div className="relative w-full sm:w-[130px] h-[130px] shrink-0 rounded-xl overflow-hidden bg-brand-cream/50 shadow-inner">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-w-md) 100vw, 130px"
                            className="object-cover bg-white"
                          />
                        </div>
                      )}

                      {/* Dish Info */}
                      <div className="flex-grow flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-playfair text-xl font-bold text-brand-dark leading-snug">
                              {item.name}
                            </h3>
                            <span className="font-playfair text-lg font-bold text-[#8C6D3E] whitespace-nowrap">
                              {item.priceINR.toFixed(3)} KWD
                            </span>
                          </div>
                          <p className="text-xs sm:text-[13px] text-brand-dark-light/80 leading-relaxed font-sans font-light mt-1.5 max-w-xl">
                            {item.description}
                          </p>
                        </div>

                        {/* Badges and Actions Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-dashed border-brand-gold/5 mt-auto">
                          
                          {/* Badges */}
                          <div className="flex items-center gap-4 text-brand-dark-light/75">
                            {item.prepTime && (
                              <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#A67C52]">
                                <Clock className="size-3.5 stroke-[1.5]" />
                                <span>{item.prepTime}</span>
                              </div>
                            )}
                            {item.serves && (
                              <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#A67C52]">
                                <Users className="size-3.5 stroke-[1.5]" />
                                <span>{item.serves}</span>
                              </div>
                            )}
                          </div>

                          {/* Controls & Delete */}
                          <div className="flex items-center gap-5 sm:gap-6 ml-auto sm:ml-0">
                            
                            {/* Quantity Controls */}
                            <div className="inline-flex items-center justify-between bg-[#F4EFE6] rounded-full h-9 px-2.5 w-28 font-sans text-sm font-semibold select-none border border-brand-gold/5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="size-6 rounded-full hover:bg-white flex items-center justify-center transition-colors text-brand-dark-light/70 hover:text-brand-dark disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3.5 stroke-[2.5]" />
                              </button>
                              <span className="w-6 text-center text-[13px]">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="size-6 rounded-full hover:bg-white flex items-center justify-center transition-colors text-brand-dark-light/70 hover:text-brand-dark cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-3.5 stroke-[2.5]" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1 text-[11px] tracking-wider font-semibold text-brand-dark-light/50 hover:text-red-700 transition-colors uppercase cursor-pointer select-none"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="size-3.5 stroke-[2]" />
                              <span className="hidden xs:inline">Remove</span>
                            </button>

                          </div>

                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </section>

              {/* Special Requests Section */}
              <section className="flex flex-col">
                <h2 className="font-playfair text-2xl font-bold text-brand-dark mb-4">
                  Special Requests
                </h2>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any allergies or dietary preferences? Please let us know how we can make your meal perfect..."
                  className="w-full min-h-[120px] bg-white text-brand-dark placeholder-brand-dark-light/60 border border-brand-gold/25 rounded-2xl p-4 text-[13px] font-sans focus:outline-none focus:ring-1 focus:ring-brand-gold/40 focus:border-brand-gold/40 transition-all shadow-sm leading-relaxed resize-none"
                  maxLength={500}
                />
              </section>

            </div>

            {/* Right Summary Sticky Column */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 w-full">
              <div className="bg-white rounded-2xl border border-brand-gold/10 p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
                
                <h2 className="font-playfair text-xl font-bold text-brand-dark border-b border-brand-gold/10 pb-4">
                  Selection Summary
                </h2>

                {/* Summary List */}
                <div className="flex flex-col gap-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-baseline justify-between gap-4 text-[14px]">
                      <div className="flex items-baseline gap-2 font-sans font-light text-brand-dark-light">
                        <span className="font-semibold text-brand-dark">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-sans text-xs text-brand-dark-light font-light whitespace-nowrap">
                        {(item.priceINR * item.quantity).toFixed(3)} KWD
                      </span>
                    </div>
                  ))}
                </div>

                {/* Table Number Input Block */}
                <div className="flex flex-col gap-2 border-t border-brand-gold/10 pt-4 mt-2">
                  <label htmlFor="tableNumber" className="font-playfair text-sm font-bold text-brand-dark flex items-center justify-between">
                    <span>Table Number *</span>
                    {tableError && <span className="text-[10px] font-sans text-red-500 normal-case font-normal">{tableError}</span>}
                  </label>
                  <input
                    id="tableNumber"
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value);
                      if (e.target.value.trim()) setTableError("");
                    }}
                    placeholder="e.g. Table 5"
                    className={`w-full bg-[#FAF6EE]/50 text-brand-dark placeholder-brand-dark-light/60 border rounded-full px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 transition-all ${
                      tableError 
                        ? "border-red-500 focus:ring-red-400 focus:border-red-400 focus:bg-white" 
                        : "border-brand-gold/25 focus:ring-brand-gold/40 focus:border-brand-gold/40 focus:bg-white"
                    }`}
                  />
                </div>

                {/* Total Counter */}
                <div className="flex items-center justify-between border-t border-brand-gold/10 pt-4 mt-2">
                  <span className="font-playfair text-lg font-bold text-brand-dark">
                    Total
                  </span>
                  <span className="font-playfair text-2xl font-bold text-brand-dark">
                    {totalAmount.toFixed(3)} KWD
                  </span>
                </div>

                {checkoutError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-800">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span className="text-xs font-sans font-light leading-relaxed">{checkoutError}</span>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col gap-4 mt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-full bg-[#2C2520] text-[#FAF6EE] hover:bg-[#1E1915] transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wider hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        <span>Place Order & Check Out</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/menu"
                    className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-brand-gold hover:text-brand-dark transition-colors tracking-wide cursor-pointer uppercase py-1"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Continue Browsing Menu</span>
                  </Link>
                </div>

              </div>
            </aside>

          </form>
        ) : (
          /* Premium Empty State */
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-brand-gold/10 flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto shadow-sm">
            <div className="size-16 rounded-full bg-[#F5EFE2] flex items-center justify-center text-brand-gold">
              <Users className="size-8 stroke-[1.5]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-playfair text-2xl font-bold text-brand-dark">
                Your selection is empty
              </h2>
              <p className="text-sm text-brand-dark-light/80 font-sans font-light max-w-md leading-relaxed">
                Explore our rich menu and add dishes to your selection to get started. We will help you review and place your order here.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand-gold px-8 text-sm font-semibold text-[#FAF6EE] shadow-md hover:bg-brand-gold/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none uppercase tracking-wider"
            >
              Explore Menu
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}