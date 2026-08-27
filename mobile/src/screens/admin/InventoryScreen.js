import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { api } from "../../api/client";
import { colors } from "../../theme/colors";

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    api("/api/products/inventory").then((data) => setInventory(data.inventory)).catch(() => setInventory([]));
  }, []);

  function inventorySummary(item) {
    if (item.soldBy === "weight") {
      return `Total ${item.totalQuantity * item.weightStepGrams} g · Sold ${item.quantitySold * item.weightStepGrams} g · Remaining ${item.remainingStock * item.weightStepGrams} g`;
    }

    return `Total ${item.totalQuantity} · Sold ${item.quantitySold} · Remaining ${item.remainingStock}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.row, item.isLowStock && styles.low]}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{inventorySummary(item)}</Text>
            {item.soldBy === "weight" ? <Text style={styles.portion}>Portion: {item.weightStepGrams} g at ₹{item.price}</Text> : null}
            {item.isLowStock ? <Text style={styles.alert}>Low stock alert</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56, paddingHorizontal: 16, backgroundColor: colors.surface },
  title: { fontSize: 26, fontWeight: "900", color: colors.ink, marginBottom: 14 },
  row: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, marginBottom: 10 },
  low: { borderColor: colors.warning },
  name: { color: colors.ink, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 4 },
  portion: { color: colors.greenDark, marginTop: 5, fontWeight: "800" },
  alert: { color: colors.warning, fontWeight: "900", marginTop: 6 }
});
