import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, View } from "react-native";
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
  const { items, addToCart, changeQuantity } = useCart();
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
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <View style={styles.locationRow}>
            <MapPin size={18} color={colors.greenDark} />
            <Text style={styles.location}>Delivering fresh groceries</Text>
          </View>
          {!user ? (
            <View style={styles.authRow}>
              <Text style={styles.authButton} onPress={() => navigation.navigate("Login")}>Login</Text>
              <Text style={styles.signupButton} onPress={() => navigation.navigate("Register")}>Sign up</Text>
            </View>
          ) : null}
        </View>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.heroText}>Daily essentials, fruits, snacks, dairy and more.</Text>
      </View>
      <View style={styles.searchBox}>
        <Search size={18} color={colors.muted} />
        <TextInput style={styles.searchInput} placeholder="Search in Zest Fresh" editable={false} />
      </View>
      <View style={styles.headingRow}>
        <Sparkles size={19} color={colors.green} />
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16,
    backgroundColor: colors.surface
  },
  hero: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderColor: colors.line
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1
  },
  location: {
    color: colors.greenDark,
    fontWeight: "800"
  },
  authRow: {
    flexDirection: "row",
    gap: 8
  },
  authButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    color: colors.greenDark,
    backgroundColor: colors.white,
    fontWeight: "900",
    overflow: "hidden"
  },
  signupButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    color: colors.white,
    backgroundColor: colors.green,
    fontWeight: "900",
    overflow: "hidden"
  },
  logo: {
    width: 210,
    height: 104,
    marginTop: 8,
    alignSelf: "flex-start"
  },
  heroText: {
    color: colors.muted,
    marginTop: 4,
    fontWeight: "600"
  },
  searchBox: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12
  },
  searchInput: {
    flex: 1,
    color: colors.muted
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16
  },
  heading: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink
  },
  categories: {
    gap: 8,
    paddingVertical: 14
  },
  category: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.greenSoft,
    color: colors.greenDark,
    borderRadius: 8,
    fontWeight: "800"
  },
  grid: {
    justifyContent: "space-between"
  }
});
