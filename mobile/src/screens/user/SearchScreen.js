import React, { useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard";
import { api } from "../../api/client";
import { useCart } from "../../context/CartContext";
import { colors } from "../../theme/colors";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const { items, addToCart, changeQuantity } = useCart();

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
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.grid}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            quantity={items.find((cartItem) => cartItem.product._id === item._id)?.quantity || 0}
            onAdd={addToCart}
            onDecrease={(product) => changeQuantity(product._id, -1)}
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
    justifyContent: "space-between"
  }
});
