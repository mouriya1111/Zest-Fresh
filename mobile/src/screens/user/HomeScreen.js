import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MapPin, Search, Sparkles, Star, Timer, TrendingUp } from "lucide-react-native";
import ProductCard from "../../components/ProductCard";
import { api } from "../../api/client";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const fallbackCategories = ["Fruits", "Vegetables", "Dairy", "Snacks", "Bakery", "Beverages"];

function ProductSection({ title, subtitle, products, icon: Icon, cartItems, onAdd, onDecrease, onFavorite }) {
  if (!products?.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionTitleRow}>
          <Icon size={19} color={colors.green} />
          <Text style={styles.heading}>{title}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.gridWrap}>
        {products.slice(0, 6).map((item) => (
          <ProductCard
            key={item._id}
            product={item}
            quantity={cartItems.find((cartItem) => cartItem.product._id === item._id)?.quantity || 0}
            onAdd={onAdd}
            onDecrease={(product) => onDecrease(product._id, -1)}
            onFavorite={onFavorite}
          />
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [home, setHome] = useState({
    banners: [],
    categories: fallbackCategories,
    featured: [],
    trending: [],
    bestSellers: [],
    newArrivals: [],
    recommended: []
  });
  const { items, addToCart, changeQuantity } = useCart();
  const { socket } = useAuth();

  function loadProducts() {
    api("/api/products/home").then(setHome).catch(() => {
      api("/api/products").then((data) => setHome((current) => ({ ...current, recommended: data.products }))).catch(() => null);
    });
  }

  function toggleFavorite(product) {
    api(`/api/users/favorites/${product._id}`, { method: "POST" }).catch(() => null);
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

  const banners = home.banners?.length ? home.banners : [
    { title: "Daily fresh essentials", subtitle: "Fruits, dairy, snacks and more" }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.locationRow}>
          <MapPin size={18} color={colors.greenDark} />
          <Text style={styles.location}>Delivering fresh groceries</Text>
          <View style={styles.timePill}>
            <Timer size={13} color={colors.greenDark} />
            <Text style={styles.timePillText}>10 min</Text>
          </View>
        </View>
        <Image source={require("../../../assets/zest-fresh-brand.png")} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="Zest Fresh" />
        <Text style={styles.heroText}>Premium groceries, fast delivery, secure payments.</Text>
      </View>

      <Pressable style={styles.searchBox} onPress={() => navigation.navigate("Search")}>
        <Search size={18} color={colors.muted} />
        <TextInput style={styles.searchInput} placeholder="Search milk, atta, apples..." editable={false} />
      </Pressable>

      <FlatList
        data={banners}
        horizontal
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.bannerList}
        renderItem={({ item }) => (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={19} color={colors.green} />
          <Text style={styles.heading}>Shop by category</Text>
        </View>
        <FlatList
          data={home.categories?.length ? home.categories : fallbackCategories}
          horizontal
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categories}
          renderItem={({ item }) => (
            <Pressable style={styles.category} onPress={() => navigation.navigate("Search", { category: item })}>
              <Text style={styles.categoryText}>{item}</Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <ProductSection title="Featured products" subtitle="Curated essentials for today" products={home.featured} icon={Star} cartItems={items} onAdd={addToCart} onDecrease={changeQuantity} onFavorite={toggleFavorite} />
      <ProductSection title="Trending now" subtitle="Fast-moving baskets near you" products={home.trending} icon={TrendingUp} cartItems={items} onAdd={addToCart} onDecrease={changeQuantity} onFavorite={toggleFavorite} />
      <ProductSection title="Best sellers" subtitle="Customer favourites" products={home.bestSellers} icon={Sparkles} cartItems={items} onAdd={addToCart} onDecrease={changeQuantity} onFavorite={toggleFavorite} />
      <ProductSection title="New arrivals" subtitle="Recently added to the store" products={home.newArrivals} icon={Star} cartItems={items} onAdd={addToCart} onDecrease={changeQuantity} onFavorite={toggleFavorite} />
      <ProductSection title="Recommended for you" subtitle="Fresh picks available now" products={home.recommended} icon={Sparkles} cartItems={items} onAdd={addToCart} onDecrease={changeQuantity} onFavorite={toggleFavorite} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface
  },
  content: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 28
  },
  hero: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderColor: colors.line
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  location: {
    color: colors.greenDark,
    fontWeight: "800",
    flex: 1
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8
  },
  timePillText: {
    color: colors.greenDark,
    fontWeight: "900",
    fontSize: 12
  },
  brandLogo: {
    width: 230,
    height: 67,
    marginTop: 8,
    marginLeft: -8
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
  bannerList: {
    gap: 10,
    paddingVertical: 14
  },
  banner: {
    width: 280,
    minHeight: 112,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.ink
  },
  bannerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900"
  },
  bannerSubtitle: {
    color: colors.greenSoft,
    marginTop: 8,
    fontWeight: "700"
  },
  section: {
    marginBottom: 18
  },
  sectionHeading: {
    marginBottom: 10
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  heading: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink
  },
  sectionSubtitle: {
    color: colors.muted,
    marginTop: 4,
    fontWeight: "600"
  },
  categories: {
    gap: 8,
    paddingVertical: 12
  },
  category: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.greenSoft,
    borderRadius: 8
  },
  categoryText: {
    color: colors.greenDark,
    fontWeight: "900"
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  }
});
