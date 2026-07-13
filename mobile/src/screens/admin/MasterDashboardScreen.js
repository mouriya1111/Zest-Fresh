import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { colors } from "../../theme/colors";
import Button from "../../components/Button";

export default function MasterDashboardScreen() {
  const { socket, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  function loadOverview() {
    api("/api/analytics/overview").then(setOverview).catch(() => null);
  }

  useFocusEffect(
    React.useCallback(() => {
      loadOverview();
    }, [])
  );

  useEffect(() => {
    socket?.on("presence:update", (payload) => setOnlineUsers(payload.onlineUsers));
    socket?.on("order:payment", loadOverview);
    return () => {
      socket?.off("presence:update");
      socket?.off("order:payment", loadOverview);
    };
  }, [socket]);

  const cards = [
    ["Registered users", overview?.totalUsers || 0],
    ["App downloads", overview?.downloads || 0],
    ["Online now", onlineUsers || overview?.onlineUsers || 0],
    ["Daily active users", overview?.dailyActiveUsers || 0],
    ["New registrations", overview?.newRegistrations || 0],
    ["Collected revenue", `₹${overview?.totalRevenue || 0}`],
    ["Online revenue", `₹${overview?.onlineRevenue || 0}`],
    ["Payments pending", `${overview?.pendingPaymentCount || 0} · ₹${overview?.pendingPaymentAmount || 0}`],
    ["Payment success", `${overview?.paymentSuccessRate || 0}%`],
    ["Failed transactions", overview?.failedTransactions || 0],
    ["Refunds", `${overview?.refundCount || 0} · ₹${overview?.refundAmount || 0}`]
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Master Dashboard</Text>
          <Text style={styles.subtitle}>Revenue, users, orders, and payment health</Text>
        </View>
        <Button title="Logout" variant="ghost" onPress={logout} style={styles.logoutButton} />
      </View>
      <View style={styles.grid}>
        {cards.map(([label, value]) => (
          <View style={styles.card} key={label}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface
  },
  content: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 28
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.ink
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4
  },
  logoutButton: {
    height: 40,
    minWidth: 92
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  card: {
    width: "48%",
    padding: 14,
    minHeight: 96,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12
  },
  value: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.greenDark
  },
  label: {
    color: colors.muted,
    marginTop: 8
  }
});
