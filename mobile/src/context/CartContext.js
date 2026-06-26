import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const CartContext = createContext(null);
const CART_KEY = "zestFreshCart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then((savedCart) => {
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      })
      .catch(() => null)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => null);
    }
  }, [items, hydrated]);

  function addToCart(product) {
    setItems((current) => {
      const existing = current.find((item) => item.product._id === product._id);

      if (existing) {
        return current.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return current.concat({ product, quantity: 1 });
    });
  }

  function removeFromCart(productId) {
    setItems((current) => current.filter((item) => item.product._id !== productId));
  }

  function changeQuantity(productId, delta) {
    setItems((current) =>
      current
        .map((item) =>
          item.product._id === productId
            ? { ...item, quantity: Math.max(item.quantity + delta, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  async function placeOrder(deliveryAddress, paymentMethod = "COD") {
    const payload = {
      deliveryAddress,
      paymentMethod,
      items: items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity
      }))
    };
    const data = await api("/api/orders", { method: "POST", body: payload });
    setItems([]);
    await AsyncStorage.removeItem(CART_KEY);
    return data.order;
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const value = useMemo(
    () => ({ items, subtotal, addToCart, removeFromCart, changeQuantity, placeOrder }),
    [items, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
