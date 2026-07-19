"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId?: string;
  portionName?: { en: string; ar: string };
  name: string;
  priceINR: number;
  description: string;
  prepTime: string;
  serves: string;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === product.id);
          if (idx > -1) {
            const copy = [...state.items];
            copy[idx].quantity += qty;
            return { items: copy };
          }
          return { items: [...state.items, { ...product, quantity: qty }] };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, delta) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
          ),
        })),

      setQuantity: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, qty) } : i
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "menu-selection" }
  )
);
