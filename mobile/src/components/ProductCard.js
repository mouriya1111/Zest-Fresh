import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Heart, Minus, Plus, Zap } from "lucide-react-native";
import { colors } from "../theme/colors";

export default function ProductCard({ product, quantity = 0, onAdd, onDecrease, onFavorite }) {
  return (
    <View style={[styles.card, quantity > 0 && styles.selectedCard]}>
      <View style={styles.badge}>
        <Zap size={12} color={colors.greenDark} />
        <Text style={styles.badgeText}>10 min</Text>
      </View>
      <Image
        source={{ uri: product.imageUrl || "https://placehold.co/240x180/E8F7EE/0B7A3B?text=Zest" }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.unit}>
          {product.soldBy === "weight" ? `${product.weightStepGrams} g portion` : product.unit}
        </Text>
        <Text style={styles.stock}>
          {product.soldBy === "weight"
            ? `${(product.remainingStock ?? product.totalQuantity) * product.weightStepGrams} g available`
            : `Stock ${product.remainingStock ?? product.totalQuantity}`}
        </Text>
        <View style={styles.row}>
          <Text style={styles.price}>
            ₹{product.price}{product.soldBy === "weight" ? ` / ${product.weightStepGrams} g` : ""}
          </Text>
          <View style={styles.actions}>
            {onFavorite ? (
              <Pressable onPress={() => onFavorite(product)} style={styles.iconButton}>
                <Heart size={17} color={colors.green} />
              </Pressable>
            ) : null}
            {quantity > 0 ? (
              <View style={styles.quantityControl}>
                <Pressable onPress={() => onDecrease?.(product)} style={styles.quantityButton}>
                  <Minus size={15} color={colors.white} />
                </Pressable>
                <Text style={styles.quantityText}>{quantity}</Text>
                <Pressable onPress={() => onAdd?.(product)} style={styles.quantityButton}>
                  <Plus size={15} color={colors.white} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => onAdd?.(product)} style={styles.addButton}>
                <Plus size={18} color={colors.white} />
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative"
  },
  selectedCard: {
    borderColor: colors.green,
    borderWidth: 2
  },
  badge: {
    position: "absolute",
    zIndex: 2,
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.lime,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgeText: {
    color: colors.greenDark,
    fontSize: 11,
    fontWeight: "900"
  },
  image: {
    width: "100%",
    height: 132,
    backgroundColor: colors.white,
    marginTop: 8
  },
  body: {
    padding: 10,
    gap: 6
  },
  name: {
    minHeight: 38,
    color: colors.ink,
    fontWeight: "800"
  },
  unit: {
    color: colors.muted,
    fontSize: 12
  },
  stock: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6
  },
  price: {
    fontWeight: "900",
    color: colors.ink,
    fontSize: 13,
    flex: 1
  },
  actions: {
    flexDirection: "row",
    gap: 8
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.greenSoft
  },
  addButton: {
    minWidth: 62,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8
  },
  addText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 12
  },
  quantityControl: {
    height: 32,
    minWidth: 88,
    borderRadius: 8,
    backgroundColor: colors.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  quantityButton: {
    width: 30,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  quantityText: {
    color: colors.white,
    fontWeight: "900"
  }
});
