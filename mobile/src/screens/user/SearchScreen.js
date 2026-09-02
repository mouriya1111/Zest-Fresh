import React, { useState } from "react";
import { FlatList, StyleSheet, TextInput, useWindowDimensions, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard";
import { api } from "../../api/client";
import { useCart } from "../../context/CartContext";
import { colors } from "../../theme/colors";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const { width } = useWindowDimensions();
  const isSingleColumn = width < 560;
  const { items, addToCart, changeQuantity, getCartKey } = useCart();

  useFocusEffect(
    React.useCallback(() => {
      if (!query) {
        api("/api/products").then((data) => setProducts(data.products)).catch(() => setProducts([]));
      }
    }, [query])
  );

  async function search(text) {
    setQuery(text);

    if (text.length < 2) {
      setProducts([]);
      return;
    }

    const data = await api(`/api/products?search=${encodeURIComponent(text)}`);
    setProducts(data.products);
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={query} onChangeText={search} placeholder="Search atta, milk, apples..." />
      <FlatList
        key={isSingleColumn ? "single" : "double"}
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={isSingleColumn ? 1 : 2}
        columnWrapperStyle={isSingleColumn ? undefined : styles.grid}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            fullWidth={isSingleColumn}
            getQuantity={(product, variant) => items.find((cartItem) => cartItem.cartKey === getCartKey(product._id, variant))?.quantity || 0}
            onAdd={addToCart}
            onDecrease={(product, variant) => changeQuantity(getCartKey(product._id, variant), -1)}
          />
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
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    marginBottom: 14
  },
  grid: {
    justifyContent: "space-between",
    gap: 12
  }
});
