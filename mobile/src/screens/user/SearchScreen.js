import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard";
import { api } from "../../api/client";
import { useCart } from "../../context/CartContext";
import { colors } from "../../theme/colors";

const sortOptions = [
  { label: "Relevant", value: "" },
  { label: "Price low", value: "price_asc" },
  { label: "Price high", value: "price_desc" },
  { label: "Rating", value: "rating" },
  { label: "New", value: "new" }
];

export default function SearchScreen({ route }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(route?.params?.category || "");
  const [sort, setSort] = useState("");
  const { items, addToCart, changeQuantity } = useCart();

  const suggestions = useMemo(() => {
    const names = products.map((product) => product.name).filter(Boolean);
    return Array.from(new Set(names)).slice(0, 6);
  }, [products]);

  async function loadProducts(next = {}) {
    const nextQuery = next.query ?? query;
    const nextCategory = next.category ?? category;
    const nextSort = next.sort ?? sort;
    const params = new URLSearchParams();

    if (nextQuery?.length >= 2) params.set("search", nextQuery);
    if (nextCategory) params.set("category", nextCategory);
    if (nextSort) params.set("sort", nextSort);

    const data = await api(`/api/products${params.toString() ? `?${params.toString()}` : ""}`);
    setProducts(data.products);
  }

  useFocusEffect(
    React.useCallback(() => {
      loadProducts().catch(() => setProducts([]));
    }, [category, sort])
  );

  useEffect(() => {
    if (route?.params?.category) {
      setCategory(route.params.category);
    }
  }, [route?.params?.category]);

  async function search(text) {
    setQuery(text);
    if (text.length === 0 || text.length >= 2) {
      loadProducts({ query: text }).catch(() => setProducts([]));
    }
  }

  function chooseSort(value) {
    setSort(value);
    loadProducts({ sort: value }).catch(() => setProducts([]));
  }

  function toggleFavorite(product) {
    api(`/api/users/favorites/${product._id}`, { method: "POST" }).catch(() => null);
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={query} onChangeText={search} placeholder="Search atta, milk, apples..." />
      <View style={styles.filterRow}>
        {category ? (
          <Pressable style={styles.activeFilter} onPress={() => {
            setCategory("");
            loadProducts({ category: "" }).catch(() => setProducts([]));
          }}>
            <Text style={styles.activeFilterText}>{category} ×</Text>
          </Pressable>
        ) : null}
        {sortOptions.map((option) => (
          <Pressable key={option.label} style={sort === option.value ? styles.activeFilter : styles.filter} onPress={() => chooseSort(option.value)}>
            <Text style={sort === option.value ? styles.activeFilterText : styles.filterText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      {suggestions.length > 0 && query.length >= 2 ? (
        <View style={styles.suggestions}>
          {suggestions.map((item) => (
            <Pressable key={item} style={styles.suggestionPill} onPress={() => search(item)}>
              <Text style={styles.suggestionText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.grid}
        ListEmptyComponent={<Text style={styles.empty}>Search for products or choose a category from Home.</Text>}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            quantity={items.find((cartItem) => cartItem.product._id === item._id)?.quantity || 0}
            onAdd={addToCart}
            onDecrease={(product) => changeQuantity(product._id, -1)}
            onFavorite={toggleFavorite}
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
    marginBottom: 10
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  activeFilter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.green
  },
  filterText: {
    color: colors.muted,
    fontWeight: "800"
  },
  activeFilterText: {
    color: colors.white,
    fontWeight: "900"
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  suggestionPill: {
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8
  },
  suggestionText: {
    color: colors.greenDark,
    fontWeight: "800"
  },
  empty: {
    color: colors.muted,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line
  },
  grid: {
    justifyContent: "space-between"
  }
});
