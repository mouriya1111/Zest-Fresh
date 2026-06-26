import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

export default function OrdersScreen() {
  const { socket } = useAuth();
  const [orders, setOrders] = useState([]);

  function loadOrders() {
    api("/api/orders/mine").then((data) => setOrders(data.orders)).catch(() => setOrders([]));
  }

  useEffect(loadOrders, []);

  useEffect(() => {
    socket?.on("order:status", loadOrders);
    return () => socket?.off("order:status", loadOrders);
  }, [socket]);

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
  }
});
