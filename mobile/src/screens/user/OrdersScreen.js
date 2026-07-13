import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { openRazorpayCheckout, retryRazorpayPayment, verifyRazorpayPayment } from "../../api/payments";
import { colors } from "../../theme/colors";

export default function OrdersScreen() {
  const { socket, user } = useAuth();
  const [orders, setOrders] = useState([]);

  function loadOrders() {
    api("/api/orders/mine").then((data) => setOrders(data.orders)).catch(() => setOrders([]));
  }

  useEffect(loadOrders, []);

  useEffect(() => {
    socket?.on("order:status", loadOrders);
    socket?.on("order:payment", loadOrders);
    return () => {
      socket?.off("order:status", loadOrders);
      socket?.off("order:payment", loadOrders);
    };
  }, [socket]);

  async function retryPayment(orderId) {
    try {
      const created = await retryRazorpayPayment(orderId);
      const result = await openRazorpayCheckout({
        gateway: created.gateway,
        order: created.order,
        user
      });
      await verifyRazorpayPayment({
        localOrderId: created.order._id,
        localPaymentId: created.payment._id,
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature
      });
      Alert.alert("Payment successful", "Your order payment is confirmed.");
      loadOrders();
    } catch (error) {
      Alert.alert("Retry failed", error.message || "Payment could not be completed.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order history</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.order}>
            <Text style={styles.orderTitle}>Order #{item._id.slice(-6)}</Text>
            <Text style={styles.status}>{item.status}</Text>
            <Text style={styles.payment}>Payment: {item.paymentStatus || "Pending"} · {item.paymentMethod || "COD"}</Text>
            <Text style={styles.total}>₹{item.total}</Text>
            {item.paymentMethod !== "COD" && item.paymentStatus !== "Paid" ? (
              <Button title="Retry payment" onPress={() => retryPayment(item._id)} style={styles.retryButton} />
            ) : null}
            {item.invoiceNumber ? <Text style={styles.invoice}>Invoice: {item.invoiceNumber}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
    backgroundColor: colors.surface
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 14
  },
  order: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    marginBottom: 10
  },
  orderTitle: {
    fontWeight: "900",
    color: colors.ink
  },
  status: {
    color: colors.green,
    fontWeight: "800",
    marginTop: 4
  },
  total: {
    marginTop: 4,
    color: colors.muted
  },
  payment: {
    color: colors.muted,
    marginTop: 4,
    fontWeight: "700"
  },
  retryButton: {
    height: 38,
    marginTop: 10,
    alignSelf: "flex-start"
  },
  invoice: {
    color: colors.greenDark,
    fontWeight: "800",
    marginTop: 6
  }
});
