import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { api } from "../../api/client";
import { colors } from "../../theme/colors";

function formatVolume(ml) {
  const amount = Number(ml || 0);
  if (amount >= 1000) {
    return `${amount / 1000} L`;
  }
  return `${amount} ml`;
}

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    api("/api/products/inventory").then((data) => setInventory(data.inventory)).catch(() => setInventory([]));
  }, []);

  function inventorySummary(item) {
    if (item.soldBy === "weight") {
      return `Total ${item.totalQuantity * item.weightStepGrams} g · Sold ${item.quantitySold * item.weightStepGrams} g · Reserved ${(item.reservedQuantity || 0) * item.weightStepGrams} g · Available ${item.remainingStock * item.weightStepGrams} g`;
    }

    if (item.soldBy === "volume") {
      return `Total ${formatVolume(item.totalQuantity * item.volumeStepMl)} · Sold ${formatVolume(item.quantitySold * item.volumeStepMl)} · Reserved ${formatVolume((item.reservedQuantity || 0) * item.volumeStepMl)} · Available ${formatVolume(item.remainingStock * item.volumeStepMl)}`;
    }

    return `Total ${item.totalQuantity} · Sold ${item.quantitySold} · Reserved ${item.reservedQuantity || 0} · Available ${item.remainingStock}`;
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
            {item.soldBy === "volume" ? <Text style={styles.portion}>Portion: {formatVolume(item.volumeStepMl)} at ₹{item.price}</Text> : null}
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
