import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MapPin, Search, Sparkles } from "lucide-react-native";
import ProductCard from "../../components/ProductCard";
import { api } from "../../api/client";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const categories = ["Fruits", "Vegetables", "Dairy", "Snacks", "Bakery", "Beverages"];
const logo = require("../../../assets/zestfresh-logo.png");

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const { width } = useWindowDimensions();
  const isSingleColumn = width < 560;
  const { items, addToCart, changeQuantity, getCartKey } = useCart();
  const { socket, user } = useAuth();

  function loadProducts() {
    api("/api/products").then((data) => setProducts(data.products)).catch(() => setProducts([]));
  }

  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [])
  );

  useEffect(() => {
    socket?.on("products:changed", loadProducts);
    return () => socket?.off("products:changed", loadProducts);
  }, [socket]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        {!user ? (
          <View style={styles.authRow}>
            <Text style={styles.authButton} onPress={() => navigation.navigate("Login")}>Login</Text>
            <Text style={styles.signupButton} onPress={() => navigation.navigate("Register")}>Sign up</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.deliveryRow}>
        <MapPin size={15} color={colors.greenDark} />
        <Text style={styles.location}>Delivering fresh groceries</Text>
      </View>
      <View style={styles.searchBox}>
        <Search size={18} color={colors.muted} />
        <TextInput style={styles.searchInput} placeholder="Search in Zest Fresh" editable={false} />
      </View>
      <View style={styles.categoryBand}>
        <View style={styles.headingRow}>
          <Sparkles size={18} color={colors.green} />
          <Text style={styles.heading}>Fresh picks near you</Text>
        </View>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categories}
          renderItem={({ item }) => <Text style={styles.category}>{item}</Text>}
          showsHorizontalScrollIndicator={false}
        />
      </View>
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 6
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8
  },
  location: {
    color: colors.greenDark,
    fontWeight: "800",
    fontSize: 13
  },
  authRow: {
    flexDirection: "row",
    gap: 8
  },
  authButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    color: colors.greenDark,
    backgroundColor: colors.white,
    fontWeight: "900",
    overflow: "hidden"
  },
  signupButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    color: colors.white,
    backgroundColor: colors.green,
    fontWeight: "900",
    overflow: "hidden"
  },
  logo: {
    width: 146,
    height: 42
  },
  searchBox: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    color: colors.muted
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  },
  categories: {
    gap: 8,
    paddingBottom: 10
  },
  categoryBand: {
    marginBottom: 4
  },
  category: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.greenSoft,
    color: colors.greenDark,
    borderRadius: 8,
    fontWeight: "800"
  },
  grid: {
    justifyContent: "space-between",
    gap: 12
  }
});
