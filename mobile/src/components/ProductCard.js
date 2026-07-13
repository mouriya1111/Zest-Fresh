import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Heart, Minus, Plus, Zap } from "lucide-react-native";
import { colors } from "../theme/colors";

function formatVolume(ml) {
  const amount = Number(ml || 0);
  if (amount >= 1000) {
    return `${amount / 1000} L`;
  }
  return `${amount} ml`;
}

function productPortion(product) {
  if (product.soldBy === "weight") {
    return `${product.weightStepGrams} g portion`;
  }

  if (product.soldBy === "volume") {
    return `${formatVolume(product.volumeStepMl)} portion`;
  }

  return product.unit;
}

function productStock(product) {
  const remaining = product.remainingStock ?? product.totalQuantity;

  if (product.soldBy === "weight") {
    return `${remaining * product.weightStepGrams} g available`;
  }

  if (product.soldBy === "volume") {
    return `${formatVolume(remaining * product.volumeStepMl)} available`;
  }

  return `Stock ${remaining}`;
}

function productPrice(product) {
  const displayPrice = product.effectivePrice ?? product.price;

  if (product.soldBy === "weight") {
    return `₹${displayPrice} / ${product.weightStepGrams} g`;
  }

  if (product.soldBy === "volume") {
    return `₹${displayPrice} / ${formatVolume(product.volumeStepMl)}`;
  }

  return `₹${displayPrice}`;
}

export default function ProductCard({ product, quantity = 0, onAdd, onDecrease, onFavorite }) {
  const isPurchasable = product.isPurchasable !== false && product.availableForSale !== false && (product.remainingStock ?? product.totalQuantity) > 0;

  return (
    <View style={[styles.card, quantity > 0 && styles.selectedCard, !isPurchasable && styles.unavailableCard]}>
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
        <Text style={styles.unit}>{productPortion(product)}</Text>
        <Text style={[styles.stock, !isPurchasable && styles.unavailableText]}>
          {isPurchasable ? productStock(product) : (product.remainingStock ?? product.totalQuantity) <= 0 ? "Out of stock" : "Currently unavailable"}
        </Text>
        <View style={styles.row}>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>{productPrice(product)}</Text>
            {product.mrp && product.mrp > (product.effectivePrice ?? product.price) ? <Text style={styles.mrp}>MRP ₹{product.mrp}</Text> : null}
          </View>
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
              <Pressable disabled={!isPurchasable} onPress={() => onAdd?.(product)} style={[styles.addButton, !isPurchasable && styles.disabledButton]}>
                <Plus size={18} color={colors.white} />
                <Text style={styles.addText}>{isPurchasable ? "Add" : "Off"}</Text>
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
  unavailableCard: {
    opacity: 0.72
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
  unavailableText: {
    color: colors.warning
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
  },
  priceBlock: {
    flex: 1
  },
  mrp: {
    color: colors.muted,
    fontSize: 11,
    textDecorationLine: "line-through",
    marginTop: 2
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
  disabledButton: {
    backgroundColor: colors.muted
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
