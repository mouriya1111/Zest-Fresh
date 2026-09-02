import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const CartContext = createContext(null);
const CART_KEY = "zestFreshCart";

function getVariantKey(variant) {
  return variant?.label || "default";
}

function getCartKey(productId, variant) {
  return `${productId}::${getVariantKey(variant)}`;
}

function getItemPrice(item) {
  return item.variant?.price ?? item.product.price;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then((savedCart) => {
        if (savedCart) {
          const parsedItems = JSON.parse(savedCart);
          setItems(parsedItems.map((item) => ({
            ...item,
            cartKey: item.cartKey || getCartKey(item.product._id, item.variant)
          })));
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

  function addToCart(product, variant = null) {
    const cartKey = getCartKey(product._id, variant);

    setItems((current) => {
      const existing = current.find((item) => item.cartKey === cartKey);

      if (existing) {
        return current.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return current.concat({ cartKey, product, variant, quantity: 1 });
    });
  }

  function removeFromCart(cartKey) {
    setItems((current) => current.filter((item) => item.cartKey !== cartKey));
  }

  function changeQuantity(cartKey, delta) {
    setItems((current) =>
      current
        .map((item) =>
          item.cartKey === cartKey
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
        variantLabel: item.variant?.label,
        quantity: item.quantity
      }))
    };
    const data = await api("/api/orders", { method: "POST", body: payload });
    setItems([]);
    await AsyncStorage.removeItem(CART_KEY);
    return data.order;
  }

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  const value = useMemo(
    () => ({ items, subtotal, addToCart, removeFromCart, changeQuantity, placeOrder, getCartKey }),
    [items, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
