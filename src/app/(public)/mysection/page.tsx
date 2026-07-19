"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, Send, ArrowLeft, Clock, Users, Check } from "lucide-react";

interface SelectedDish {
  id: string;
  name: string;
  priceINR: number;
  description: string;
  prepTime: string;
  serves: string;
  image: string;
  quantity: number;
}

const INITIAL_DISHES: SelectedDish[] = [
  {
    id: "mandi-4",
    name: "Chicken Royal Mandi",
    priceINR: 1.800,
    description: "Premium Chicken Kuzhi Mandi served in a traditional Arabian platter, slow-cooked to perfection.",
    prepTime: "25-30 Mins",
    serves: "Serves: 2-3 People",
    image: "/images/chicken_mandi.png",
    quantity: 2
  },
  {
    id: "grill-1",
    name: "Mixed Grill Platter",
    priceINR: 3.250,
    description: "Succulent skewers of meat and chicken, grilled tomatoes and onions, served with pita bread and garlic sauce.",
    prepTime: "20-25 Mins",
    serves: "Serves: 1-2 People",
    image: "/images/mixed_grill.png",
    quantity: 1
  },
  {
    id: "shawarma-1",
    name: "Arabian Shawarma",
    priceINR: 0.750,
    description: "Authentic Malabar style preparation with rich spices and perfectly roasted meats.",
    prepTime: "10-15 Mins",
    serves: "Serves: 1 Person",
    image: "/images/chicken_mandi.png",
    quantity: 3
  }
];

export default function MySectionPage() {
  const [items, setItems] = useState<SelectedDish[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isShared, setIsShared] = useState(false);

  // Load selection from localStorage on mount
  React.useEffect(() => {
    try {
      const selection = JSON.parse(localStorage.getItem("menu-selection") || "[]");
      setItems(selection);
    } catch (e) {
      console.error("Failed to load selection:", e);
    }
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      });
      localStorage.setItem("menu-selection", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("menu-selection", JSON.stringify(updated));
      return updated;
    });
  };

  const handleShare = () => {
    setIsShared(true);
  };

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
            Review and manage your selected dishes before sharing them with our team.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
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
                      <div className="relative w-full sm:w-[130px] h-[130px] shrink-0 rounded-xl overflow-hidden bg-brand-cream/50 shadow-inner">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-w-md) 100vw, 130px"
                          className="object-cover bg-white"
                        />
                      </div>

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
                            <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#A67C52]">
                              <Clock className="size-3.5 stroke-[1.5]" />
                              <span>{item.prepTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#A67C52]">
                              <Users className="size-3.5 stroke-[1.5]" />
                              <span>{item.serves}</span>
                            </div>
                          </div>

                          {/* Controls & Delete */}
                          <div className="flex items-center gap-5 sm:gap-6 ml-auto sm:ml-0">
                            
                            {/* Quantity Controls */}
                            <div className="inline-flex items-center justify-between bg-[#F4EFE6] rounded-full h-9 px-2.5 w-28 font-sans text-sm font-semibold select-none border border-brand-gold/5">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="size-6 rounded-full hover:bg-white flex items-center justify-center transition-colors text-brand-dark-light/70 hover:text-brand-dark disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3.5 stroke-[2.5]" />
                              </button>
                              <span className="w-6 text-center text-[13px]">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="size-6 rounded-full hover:bg-white flex items-center justify-center transition-colors text-brand-dark-light/70 hover:text-brand-dark cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-3.5 stroke-[2.5]" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
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
                  className="w-full min-h-[120px] bg-[#FAF6EE] text-brand-dark placeholder-brand-dark-light/60 border border-brand-gold/25 rounded-2xl p-4 text-[13px] font-sans focus:outline-none focus:ring-1 focus:ring-brand-gold/40 focus:border-brand-gold/40 focus:bg-white transition-all shadow-inner leading-relaxed resize-none"
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

                {/* Total Counter */}
                <div className="flex items-center justify-between border-t border-brand-gold/10 pt-5 mt-2">
                  <span className="font-playfair text-lg font-bold text-brand-dark">
                    Total Items
                  </span>
                  <span className="font-playfair text-2xl font-bold text-brand-dark">
                    {totalItems}
                  </span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-4 mt-3">
                  <button
                    onClick={handleShare}
                    className="w-full h-12 rounded-full bg-[#2C2520] text-[#FAF6EE] hover:bg-[#1E1915] transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wider hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none uppercase"
                  >
                    <Send className="size-4 stroke-[2]" />
                    <span>Share with Waiter</span>
                  </button>

                  <Link
                    href="/menu"
                    className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-brand-gold hover:text-brand-dark transition-colors tracking-wide cursor-pointer uppercase py-1"
                  >
                    <ArrowLeft className="size-4 stroke-[2]" />
                    <span>Continue Browsing Menu</span>
                  </Link>
                </div>

              </div>
            </aside>

          </div>
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
                Explore our rich menu and add dishes to your selection to get started. We will help you review them here.
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

      {/* Share Success Modal overlay */}
      {isShared && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in duration-300">
          <div className="bg-white rounded-3xl border border-brand-gold/10 p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-5 relative animate-zoom-in">
            <div className="size-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
              <Check className="size-8 stroke-[2.5]" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-playfair text-2xl font-bold text-brand-dark">
                Selection Shared!
              </h3>
              <p className="text-sm text-brand-dark-light/80 font-sans font-light leading-relaxed">
                Your selection of <span className="font-semibold">{totalItems} {totalItems === 1 ? "item" : "items"}</span> has been shared with the waiter. They will visit your table shortly to confirm your order details.
              </p>
            </div>
            <button
              onClick={() => setIsShared(false)}
              className="mt-2 w-full h-11 rounded-full bg-brand-gold text-[#FAF6EE] hover:bg-brand-gold/90 transition-all font-semibold text-sm cursor-pointer select-none"
            >
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}