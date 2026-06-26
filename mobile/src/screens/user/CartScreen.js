import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Banknote, CreditCard, ShoppingBag, Smartphone } from "lucide-react-native";
import Button from "../../components/Button";
import { useCart } from "../../context/CartContext";
import { colors } from "../../theme/colors";

export default function CartScreen({ navigation }) {
  const { items, subtotal, removeFromCart, changeQuantity, placeOrder } = useCart();
  const [placing, setPlacing] = useState(false);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 29;
  const orderTotal = subtotal + deliveryFee;
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    postalCode: ""
  });

  function setField(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function handlePlaceOrder() {
    if (!items.length) {
      Alert.alert("Cart is empty", "Add products before placing an order.");
      return;
    }

    if (!address.line1 || !address.city || !address.state || !address.postalCode) {
      Alert.alert("Address needed", "Fill your delivery address before placing the order.");
      return;
    }

    try {
      setPlacing(true);
      await placeOrder({
        label: "Home",
        ...address
      }, "COD");
      Alert.alert("Order placed", "Your COD payment is pending until delivery.");
      navigation.navigate("Orders");
    } catch (error) {
      Alert.alert("Could not place order", error.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <ShoppingBag size={24} color={colors.greenDark} />
        </View>
        <View>
          <Text style={styles.title}>Your Basket</Text>
          <Text style={styles.subtitle}>{items.length} item type{items.length === 1 ? "" : "s"} ready for checkout</Text>
        </View>
      </View>
      {items.length ? (
        items.map((item) => (
          <View style={styles.item} key={item.product._id}>
            <View>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemMeta}>
                {item.product.soldBy === "weight"
                  ? `${item.quantity * item.product.weightStepGrams} g selected · ₹${item.product.price * item.quantity}`
                  : `${item.quantity} × ₹${item.product.price} · ₹${item.product.price * item.quantity}`}
              </Text>
            </View>
            <View style={styles.qtyBox}>
              <Button title="-" variant="ghost" onPress={() => changeQuantity(item.product._id, -1)} style={styles.qtyButton} />
              <Text style={styles.qty}>{item.quantity}</Text>
              <Button title="+" onPress={() => changeQuantity(item.product._id, 1)} style={styles.qtyButton} />
              <Button title="Remove" variant="ghost" onPress={() => removeFromCart(item.product._id)} style={styles.remove} />
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>Your basket is empty. Add items from Home or Search.</Text>
      )}
      <View style={styles.addressCard}>
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <TextInput style={styles.input} value={address.line1} onChangeText={(text) => setField("line1", text)} placeholder="House / flat / street" />
        <View style={styles.addressRow}>
          <TextInput style={[styles.input, styles.halfInput]} value={address.city} onChangeText={(text) => setField("city", text)} placeholder="City" />
          <TextInput style={[styles.input, styles.halfInput]} value={address.state} onChangeText={(text) => setField("state", text)} placeholder="State" />
        </View>
        <TextInput style={styles.input} value={address.postalCode} onChangeText={(text) => setField("postalCode", text)} placeholder="Pincode" keyboardType="number-pad" />
      </View>
      <View style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.paymentOptionActive}>
          <Banknote size={21} color={colors.greenDark} />
          <View style={styles.paymentCopy}>
            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
            <Text style={styles.paymentMeta}>Pay when your groceries arrive</Text>
          </View>
          <View style={styles.selectedDot} />
        </View>
        <Pressable
          style={styles.paymentOptionDisabled}
          onPress={() => Alert.alert("UPI coming soon", "A payment gateway must be connected before accepting UPI payments.")}
        >
          <Smartphone size={21} color={colors.muted} />
          <View style={styles.paymentCopy}>
            <Text style={styles.paymentTitleDisabled}>UPI</Text>
            <Text style={styles.paymentMeta}>Gateway setup required</Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.paymentOptionDisabled}
          onPress={() => Alert.alert("Card coming soon", "A payment gateway must be connected before accepting card payments.")}
        >
          <CreditCard size={21} color={colors.muted} />
          <View style={styles.paymentCopy}>
            <Text style={styles.paymentTitleDisabled}>Credit / Debit Card</Text>
            <Text style={styles.paymentMeta}>Gateway setup required</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.summary}>
        <View style={styles.summaryRows}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>{deliveryFee ? `₹${deliveryFee}` : "Free"}</Text>
          </View>
        </View>
        <Text style={styles.total}>₹{orderTotal}</Text>
      </View>
      <Button title={placing ? "Placing order..." : "Place COD order"} onPress={handlePlaceOrder} disabled={placing || !items.length} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface
  },
  content: {
    paddingTop: 56,
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 28
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: colors.greenSoft,
    borderRadius: 8
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.ink
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4
  },
  empty: {
    color: colors.muted,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line
  },
  item: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  itemName: {
    color: colors.ink,
    fontWeight: "900"
  },
  itemMeta: {
    color: colors.muted,
    marginTop: 4
  },
  remove: {
    height: 36
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  qtyButton: {
    width: 36,
    height: 36,
    paddingHorizontal: 0
  },
  qty: {
    width: 24,
    textAlign: "center",
    fontWeight: "900",
    color: colors.ink
  },
  addressCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    gap: 10
  },
  paymentCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    gap: 10
  },
  paymentOptionActive: {
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  paymentOptionDisabled: {
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    opacity: 0.75
  },
  paymentCopy: {
    flex: 1
  },
  paymentTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  paymentTitleDisabled: {
    color: colors.muted,
    fontWeight: "800"
  },
  paymentMeta: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 12
  },
  selectedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.green,
    borderWidth: 3,
    borderColor: colors.white
  },
  sectionTitle: {
    fontWeight: "900",
    color: colors.ink,
    fontSize: 16
  },
  input: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 12
  },
  addressRow: {
    flexDirection: "row",
    gap: 10
  },
  halfInput: {
    flex: 1
  },
  summary: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.ink,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  summaryRows: {
    flex: 1,
    gap: 5
  },
  summaryRow: {
    flexDirection: "row",
    gap: 14
  },
  summaryLabel: {
    color: colors.white,
    fontWeight: "800"
  },
  summaryValue: {
    color: colors.white,
    fontWeight: "900"
  },
  total: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900"
  }
});
