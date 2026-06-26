import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { api } from "../../api/client";
import { colors } from "../../theme/colors";

export default function SalesDashboardScreen() {
  const [sales, setSales] = useState({ dailySales: [], monthlySales: [], bestSellers: [], userGrowth: [] });

  useEffect(() => {
    api("/api/analytics/sales").then(setSales).catch(() => null);
  }, []);

  const chartData = sales.dailySales.slice(-7);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sales</Text>
      <LineChart
        data={{
          labels: chartData.map((item) => item._id.slice(5)),
          datasets: [{ data: chartData.length ? chartData.map((item) => item.revenue) : [0] }]
        }}
        width={Dimensions.get("window").width - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: colors.white,
          backgroundGradientTo: colors.white,
          color: () => colors.green,
          labelColor: () => colors.muted,
          decimalPlaces: 0
        }}
        style={styles.chart}
      />
      <Text style={styles.subtitle}>Best-selling products</Text>
      {sales.bestSellers.map((item) => (
        <View style={styles.row} key={item._id}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.quantity} sold · ₹{item.revenue}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56, paddingHorizontal: 16, backgroundColor: colors.surface },
  title: { fontSize: 26, fontWeight: "900", color: colors.ink, marginBottom: 14 },
  chart: { borderRadius: 8, marginBottom: 18 },
  subtitle: { fontSize: 18, fontWeight: "900", color: colors.ink, marginBottom: 10 },
  row: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, marginBottom: 10 },
  name: { color: colors.ink, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 4 }
});
