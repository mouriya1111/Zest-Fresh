import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CalendarClock, Mail, MapPin, Navigation, Package, Phone, UserRound } from "lucide-react-native";
import Button from "../../components/Button";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const statuses = ["Accepted", "Packed", "Out for Delivery", "Delivered", "Cancelled"];

function formatAddress(address) {
  if (!address) {
    return "Delivery address unavailable";
  }

  return [address.line1, address.line2, address.landmark, address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ");
}

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function OrderManagementScreen() {
  const { socket } = useAuth();
  const [orders, setOrders] = useState([]);

  function loadOrders() {
    api("/api/orders/all").then((data) => setOrders(data.orders)).catch(() => setOrders([]));
  }

  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [])
  );

  useEffect(() => {
    socket?.on("order:new", loadOrders);
    return () => socket?.off("order:new", loadOrders);
  }, [socket]);

  async function updateStatus(id, status) {
    try {
      await api(`/api/orders/${id}/status`, { method: "PATCH", body: { status } });
      loadOrders();
    } catch (error) {
      Alert.alert("Status not updated", error.message);
    }
  }

  async function updatePayment(id, paymentStatus) {
    try {
      await api(`/api/orders/${id}/payment`, {
        method: "PATCH",
        body: { paymentStatus }
      });
      loadOrders();
    } catch (error) {
      Alert.alert("Payment not updated", error.message);
    }
  }

  function openMaps(address) {
    const query = address?.latitude && address?.longitude
      ? `${address.latitude},${address.longitude}`
      : formatAddress(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  }

  function renderOrder({ item }) {
    return (
      <View style={styles.order}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{item._id.slice(-8).toUpperCase()}</Text>
            <View style={styles.inlineMeta}>
              <CalendarClock size={15} color={colors.muted} />
              <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Order total</Text>
            <Text style={styles.totalValue}>₹{item.total}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <UserRound size={18} color={colors.greenDark} />
            <Text style={styles.sectionTitle}>Customer</Text>
          </View>
          <Text style={styles.customerName}>{item.user?.name || "Customer"}</Text>
          {item.user?.phone ? (
            <Pressable style={styles.contactRow} onPress={() => Linking.openURL(`tel:${item.user.phone}`)}>
              <Phone size={15} color={colors.green} />
              <Text style={styles.contactText}>{item.user.phone}</Text>
            </Pressable>
          ) : null}
          {item.user?.email ? (
            <View style={styles.contactRow}>
              <Mail size={15} color={colors.muted} />
              <Text style={styles.metaText}>{item.user.email}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Package size={18} color={colors.greenDark} />
            <Text style={styles.sectionTitle}>Items to pack</Text>
          </View>
          {item.items.map((orderItem, index) => (
            <View style={styles.itemRow} key={`${orderItem.product}-${index}`}>
              <Image
                source={{ uri: orderItem.imageUrl || "https://placehold.co/100x100/E8F7EE/0B7A3B?text=Zest" }}
                style={styles.itemImage}
                resizeMode="contain"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{orderItem.name}</Text>
                <Text style={styles.itemQuantity}>{orderItem.quantity} × {orderItem.unit}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{orderItem.price * orderItem.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <MapPin size={18} color={colors.greenDark} />
            <Text style={styles.sectionTitle}>Deliver to</Text>
          </View>
          <Text style={styles.address}>{formatAddress(item.deliveryAddress)}</Text>
          <Pressable style={styles.mapButton} onPress={() => openMaps(item.deliveryAddress)}>
            <Navigation size={17} color={colors.white} />
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </Pressable>
        </View>

        <View style={styles.bill}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Items subtotal</Text>
            <Text style={styles.billValue}>₹{item.subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery fee</Text>
            <Text style={styles.billValue}>₹{item.deliveryFee || 0}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billTotal}>Total</Text>
            <Text style={styles.billTotal}>₹{item.total}</Text>
          </View>
        </View>

        <View style={styles.fulfillmentRow}>
          <Text style={styles.orderStatus}>Status: {item.status}</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>{item.paymentMethod || "COD"}</Text>
            <Text style={[styles.paymentStatus, item.paymentStatus === "Paid" && styles.paid]}>
              Payment: {item.paymentStatus || "Pending"}
            </Text>
          </View>
        </View>

        <Text style={styles.actionLabel}>Update fulfillment</Text>
        <View style={styles.actions}>
          {statuses.map((status) => (
            <Button
              key={status}
              title={status}
              variant={status === "Cancelled" || item.status === status ? "ghost" : "primary"}
              style={styles.statusButton}
              onPress={() => updateStatus(item._id, status)}
            />
          ))}
        </View>
        <View style={styles.paymentActions}>
          {item.paymentStatus !== "Paid" ? (
            <Button title="Confirm payment" onPress={() => updatePayment(item._id, "Paid")} style={styles.paymentButton} />
          ) : (
            <Button title="Record refund" variant="ghost" onPress={() => updatePayment(item._id, "Refunded")} style={styles.paymentButton} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Fulfillment</Text>
      <Text style={styles.subtitle}>Pack the listed items and deliver them to the address shown on each order.</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48, paddingHorizontal: 16, backgroundColor: colors.surface },
  title: { fontSize: 26, fontWeight: "900", color: colors.ink },
  subtitle: { color: colors.muted, marginTop: 5, marginBottom: 14 },
  empty: { padding: 18, backgroundColor: colors.white, borderRadius: 8, color: colors.muted },
  order: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, marginBottom: 16 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  orderNumber: { color: colors.ink, fontWeight: "900", fontSize: 18 },
  inlineMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
  metaText: { color: colors.muted },
  totalBlock: { alignItems: "flex-end" },
  totalLabel: { color: colors.muted, fontSize: 12 },
  totalValue: { color: colors.greenDark, fontWeight: "900", fontSize: 22, marginTop: 2 },
  section: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 9 },
  sectionTitle: { color: colors.ink, fontWeight: "900", fontSize: 16 },
  customerName: { color: colors.ink, fontWeight: "900", fontSize: 17 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 6 },
  contactText: { color: colors.green, fontWeight: "800" },
  itemRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 },
  itemImage: { width: 54, height: 54, borderRadius: 8, backgroundColor: colors.surface },
  itemInfo: { flex: 1 },
  itemName: { color: colors.ink, fontWeight: "900" },
  itemQuantity: { color: colors.greenDark, fontWeight: "800", marginTop: 4 },
  itemPrice: { color: colors.ink, fontWeight: "900" },
  address: { color: colors.ink, lineHeight: 21 },
  mapButton: { height: 40, alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 13, borderRadius: 8, backgroundColor: colors.green, flexDirection: "row", alignItems: "center", gap: 7 },
  mapButtonText: { color: colors.white, fontWeight: "900" },
  bill: { paddingVertical: 14, gap: 7, borderBottomWidth: 1, borderBottomColor: colors.line },
  billRow: { flexDirection: "row", justifyContent: "space-between" },
  billLabel: { color: colors.muted },
  billValue: { color: colors.ink, fontWeight: "800" },
  billTotal: { color: colors.ink, fontWeight: "900", fontSize: 16 },
  fulfillmentRow: { paddingTop: 14, gap: 9 },
  orderStatus: { color: colors.greenDark, fontWeight: "900", fontSize: 16 },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  paymentLabel: { color: colors.ink, fontWeight: "900", backgroundColor: colors.greenSoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  paymentStatus: { color: colors.warning, fontWeight: "900" },
  paid: { color: colors.green },
  actionLabel: { color: colors.ink, fontWeight: "900", marginTop: 16 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 9 },
  statusButton: { height: 38 },
  paymentActions: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 },
  paymentButton: { alignSelf: "flex-start", minWidth: 150 },
});
