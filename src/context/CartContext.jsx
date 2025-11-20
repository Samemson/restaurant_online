import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "api/http";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsSyncing(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const ensureCart = useCallback(() => {
    if (!cart) {
      return { items: [], id: null };
    }
    return cart;
  }, [cart]);

  const addItem = useCallback(
    async (menuItemId, quantity = 1, notes) => {
      if (!isAuthenticated) return;
      await api.post("/cart/items", { menuItemId, quantity, notes });
      await fetchCart();
    },
    [fetchCart, isAuthenticated]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      if (!isAuthenticated) return;
      await api.patch(`/cart/items/${itemId}`, { quantity });
      await fetchCart();
    },
    [fetchCart, isAuthenticated]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!isAuthenticated) return;
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
    },
    [fetchCart, isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !cart?.id) return;
    await api.post("/cart/clear");
    await fetchCart();
  }, [cart, fetchCart, isAuthenticated]);

  const totals = useMemo(() => {
    const safeCart = ensureCart();
    const subtotal = safeCart.items?.reduce(
      (sum, cartItem) => sum + Number(cartItem.item.price) * cartItem.quantity,
      0
    ) || 0;
    const fees = subtotal * 0.08;
    return {
      subtotal,
      fees,
      total: subtotal + fees,
    };
  }, [ensureCart]);

  return (
    <CartContext.Provider
      value={{
        cart: ensureCart(),
        isSyncing,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refresh: fetchCart,
        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
};

