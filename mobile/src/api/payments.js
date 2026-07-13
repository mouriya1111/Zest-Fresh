import Constants from "expo-constants";
import { Platform } from "react-native";
import { api } from "./client";

export async function createRazorpayOrder({ items, deliveryAddress, paymentMethod }) {
  return api("/api/payments/create-order", {
    method: "POST",
    body: { items, deliveryAddress, paymentMethod }
  });
}

export async function verifyRazorpayPayment(payload) {
  return api("/api/payments/verify", {
    method: "POST",
    body: payload
  });
}

export async function retryRazorpayPayment(orderId) {
  return api(`/api/payments/retry/${orderId}`, {
    method: "POST"
  });
}

function assertConfiguredKey(key) {
  if (!key || key.includes("replace_with")) {
    throw new Error("Razorpay is not configured on the server");
  }

  if (!__DEV__ && key.startsWith("rzp_test_")) {
    throw new Error("Live Razorpay credentials are required in production");
  }
}

function loadRazorpayWebScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay web checkout is available only in a browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-razorpay-checkout]");

    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay checkout")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

async function openRazorpayWeb(options) {
  await loadRazorpayWebScript();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      ...options,
      handler: resolve,
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled"))
      }
    });

    checkout.on("payment.failed", (response) => {
      reject(new Error(response?.error?.description || "Payment failed"));
    });

    checkout.open();
  });
}

export async function openRazorpayCheckout({ gateway, order, user }) {
  if (!gateway?.keyId) {
    throw new Error("Razorpay key is not configured");
  }

  const key = gateway.keyId;
  assertConfiguredKey(key);

  const options = {
    key,
    amount: gateway.amount,
    currency: gateway.currency || "INR",
    name: "Zest Fresh",
    description: `Order #${order._id.slice(-8).toUpperCase()}`,
    order_id: gateway.orderId,
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact: user?.phone || ""
    },
    theme: { color: "#0B7A3B" },
    retry: { enabled: true, max_count: 2 }
  };

  if (Platform.OS === "web") {
    return openRazorpayWeb(options);
  }

  if (Constants.appOwnership === "expo") {
    throw new Error("Razorpay does not run inside Expo Go. Use a development build or release APK to test payments on phone.");
  }

  const RazorpayModule = require("react-native-razorpay");
  const RazorpayCheckout = RazorpayModule.default || RazorpayModule;
  return RazorpayCheckout.open(options);
}
