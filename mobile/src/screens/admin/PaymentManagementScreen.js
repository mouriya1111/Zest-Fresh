import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { RefreshCw } from "lucide-react-native";
import Button from "../../components/Button";
import { api } from "../../api/client";
import { colors } from "../../theme/colors";

const statuses = ["All", "Created", "Pending", "Paid", "Failed", "Refunded", "Partially Refunded"];

export default function PaymentManagementScreen() {
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("All");
  const [userFilter, setUserFilter] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (userFilter.trim()) params.set("user", userFilter.trim());
    return params.toString();
  }, [status, userFilter]);

  function loadPayments() {
    api(`/api/payments${query ? `?${query}` : ""}`)
      .then((data) => setPayments(data.payments))
      .catch(() => setPayments([]));
    api("/api/payments/transactions")
      .then((data) => setTransactions(data.transactions))
      .catch(() => setTransactions([]));
  }

  useEffect(loadPayments, [query]);

  async function refundPayment(payment) {
    try {
      const amount = payment.amount;
      await api(`/api/payments/${payment._id}/refund`, {
        method: "POST",
        body: { amount, reason: "Admin refund" }
      });
      Alert.alert("Refund requested", "Refund request sent to Razorpay.");
      loadPayments();
    } catch (error) {
      Alert.alert("Refund failed", error.message);
    }
  }

  const totals = payments.reduce(
    (summary, payment) => {
      summary.count += 1;
      if (payment.status === "Paid") summary.paid += payment.amount;
      if (payment.status === "Failed") summary.failed += 1;
      if (payment.status?.includes("Refunded")) summary.refunded += payment.amount;
      return summary;
    },
    { count: 0, paid: 0, failed: 0, refunded: 0 }
  );

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>Transactions, pending payments, failures, and refunds.</Text>
        </View>
        <Pressable style={styles.refresh} onPress={loadPayments}>
          <RefreshCw size={18} color={colors.greenDark} />
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.card}><Text style={styles.value}>₹{totals.paid}</Text><Text style={styles.label}>Paid</Text></View>
        <View style={styles.card}><Text style={styles.value}>{totals.failed}</Text><Text style={styles.label}>Failed</Text></View>
        <View style={styles.card}><Text style={styles.value}>₹{totals.refunded}</Text><Text style={styles.label}>Refunded</Text></View>
      </View>

      <FlatList
        horizontal
        data={statuses}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <Pressable style={[styles.filter, status === item && styles.activeFilter]} onPress={() => setStatus(item)}>
            <Text style={[styles.filterText, status === item && styles.activeFilterText]}>{item}</Text>
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />
      <TextInput
        style={styles.input}
        value={userFilter}
        onChangeText={setUserFilter}
        placeholder="Filter by user Mongo ID"
        autoCapitalize="none"
      />

      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          transactions.length ? (
            <Text style={styles.transactionHint}>Latest transaction: {transactions[0].type} · {transactions[0].status}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.payment}>
            <View style={styles.paymentHeader}>
              <View>
                <Text style={styles.paymentTitle}>₹{item.amount} · {item.method}</Text>
                <Text style={styles.meta}>{item.user?.name || "Customer"} · {item.gatewayPaymentId || item.gatewayOrderId}</Text>
              </View>
              <Text style={[styles.status, item.status === "Paid" && styles.paid, item.status === "Failed" && styles.failed]}>{item.status}</Text>
            </View>
            <Text style={styles.meta}>Order #{item.order?._id?.slice(-8).toUpperCase() || "-"}</Text>
            {item.failureReason ? <Text style={styles.error}>{item.failureReason}</Text> : null}
            {item.status === "Paid" ? (
              <Button
                title="Refund"
                variant="ghost"
                onPress={() => refundPayment(item)}
                style={styles.refundButton}
              />
            ) : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No payments found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 16, backgroundColor: colors.surface },
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "900", color: colors.ink },
  subtitle: { color: colors.muted, marginTop: 4 },
  refresh: { width: 42, height: 42, borderRadius: 8, backgroundColor: colors.greenSoft, alignItems: "center", justifyContent: "center" },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  card: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  value: { color: colors.greenDark, fontWeight: "900", fontSize: 18 },
  label: { color: colors.muted, marginTop: 4, fontSize: 12 },
  filters: { gap: 8, paddingBottom: 10 },
  filter: { height: 36, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  activeFilter: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  filterText: { color: colors.muted, fontWeight: "800" },
  activeFilterText: { color: colors.greenDark },
  input: { height: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 12, marginBottom: 12 },
  transactionHint: { color: colors.greenDark, fontWeight: "800", marginBottom: 10 },
  payment: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, marginBottom: 10 },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  paymentTitle: { color: colors.ink, fontWeight: "900", fontSize: 16 },
  meta: { color: colors.muted, marginTop: 4 },
  status: { color: colors.warning, fontWeight: "900" },
  paid: { color: colors.green },
  failed: { color: colors.danger },
  error: { color: colors.danger, marginTop: 6, fontWeight: "800" },
  refundButton: { height: 38, alignSelf: "flex-start", marginTop: 10 },
  empty: { color: colors.muted, padding: 16, backgroundColor: colors.white, borderRadius: 8 }
});
