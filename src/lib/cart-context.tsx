"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { api, type ApiCart } from "./api";

const EMPTY_CART: ApiCart = {
  id: null,
  items: [],
  subtotalCents: 0,
  itemCount: 0,
  currency: "USD",
};

interface CartState {
  cart: ApiCart;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "loading" }
  | { type: "success"; cart: ApiCart }
  | { type: "error"; message: string };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: null };
    case "success":
      return { cart: action.cart, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.message };
  }
}

interface CartContextValue extends CartState {
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    cart: EMPTY_CART,
    loading: false,
    error: null,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const cart = await api.getCart();
      dispatch({ type: "success", cart });
    } catch (err) {
      // Backend unreachable → present an empty cart and surface the reason.
      // This is the most common dev scenario (Postgres not running) and we
      // don't want to crash the whole shop UI just because of it.
      dispatch({ type: "error", message: err instanceof Error ? err.message : "Failed to load cart" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(async (variantId: string, quantity: number) => {
    dispatch({ type: "loading" });
    try {
      const cart = await api.addToCart(variantId, quantity);
      dispatch({ type: "success", cart });
      setDrawerOpen(true);
    } catch (err) {
      dispatch({ type: "error", message: err instanceof Error ? err.message : "Failed to add item" });
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    dispatch({ type: "loading" });
    try {
      const cart = await api.updateCartItem(itemId, quantity);
      dispatch({ type: "success", cart });
    } catch (err) {
      dispatch({ type: "error", message: err instanceof Error ? err.message : "Failed to update item" });
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    dispatch({ type: "loading" });
    try {
      const cart = await api.removeCartItem(itemId);
      dispatch({ type: "success", cart });
    } catch (err) {
      dispatch({ type: "error", message: err instanceof Error ? err.message : "Failed to remove item" });
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ ...state, addItem, updateItem, removeItem, refresh, drawerOpen, setDrawerOpen }),
    [state, addItem, updateItem, removeItem, refresh, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
