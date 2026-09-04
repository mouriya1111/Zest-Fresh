import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Heart, Minus, Plus } from "lucide-react-native";
import { colors } from "../theme/colors";

export default function ProductCard({ product, fullWidth = false, getQuantity, onAdd, onDecrease, onFavorite }) {
  const variants = useMemo(() => {
    if (Array.isArray(product.variants) && product.variants.length) {
      return product.variants;
    }

    return [{
      label: product.unit,
      unit: product.unit,
      price: product.price,
      discountText: ""
    }];
  }, [product]);
  const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const quantity = getQuantity?.(product, selectedVariant) || 0;
  const selectedPrice = selectedVariant?.price ?? product.price;

  return (
    <View style={[styles.card, fullWidth && styles.fullCard, quantity > 0 && styles.selectedCard]}>
      {quantity > 0 ? <Text style={styles.selectedBadge}>Selected {quantity}</Text> : null}
      <Image
        source={{ uri: product.imageUrl || "https://placehold.co/240x180/E8F7EE/0B7A3B?text=Zest" }}
        style={[styles.image, fullWidth && styles.fullImage]}
        resizeMode="contain"
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.unit}>{selectedVariant?.unit || product.unit}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantList}>
          {variants.map((variant) => {
            const active = variant.label === selectedVariant?.label;

            return (
              <Pressable
                key={variant.label}
                onPress={() => setSelectedVariant(variant)}
                style={[styles.variantChip, active && styles.variantChipActive]}
              >
                <Text style={[styles.variantLabel, active && styles.variantLabelActive]}>{variant.label}</Text>
                {variant.discountText ? <Text style={[styles.discountText, active && styles.discountTextActive]}>{variant.discountText}</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.row}>
          <Text style={styles.price}>₹{selectedPrice}</Text>
          <View style={styles.actions}>
            {onFavorite ? (
              <Pressable onPress={() => onFavorite(product)} style={styles.iconButton}>
                <Heart size={17} color={colors.green} />
              </Pressable>
            ) : null}
            {quantity > 0 ? (
              <View style={styles.quantityControl}>
                <Pressable onPress={() => onDecrease?.(product, selectedVariant)} style={styles.quantityButton}>
                  <Minus size={15} color={colors.white} />
                </Pressable>
                <Text style={styles.quantityText}>{quantity}</Text>
                <Pressable onPress={() => onAdd?.(product, selectedVariant)} style={styles.quantityButton}>
                  <Plus size={15} color={colors.white} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => onAdd?.(product, selectedVariant)} style={styles.addButton}>
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
    minHeight: 330,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative"
  },
  fullCard: {
    width: "100%"
  },
  selectedCard: {
    borderColor: colors.green,
    borderWidth: 2,
    shadowColor: colors.greenDark,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  selectedBadge: {
    position: "absolute",
    zIndex: 3,
    top: 8,
    right: 8,
    backgroundColor: colors.green,
    color: colors.white,
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "900"
  },
  image: {
    width: "100%",
    height: 190,
    backgroundColor: colors.white,
    marginTop: 0
  },
  fullImage: {
    height: 260
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
  variantList: {
    gap: 7,
    paddingVertical: 2
  },
  variantChip: {
    minWidth: 70,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    justifyContent: "center",
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  variantChipActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft
  },
  variantLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  variantLabelActive: {
    color: colors.greenDark
  },
  discountText: {
    marginTop: 2,
    color: colors.warning,
    fontSize: 10,
    fontWeight: "900"
  },
  discountTextActive: {
    color: colors.green
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
