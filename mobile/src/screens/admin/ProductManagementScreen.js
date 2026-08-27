import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { ImagePlus, PackagePlus } from "lucide-react-native";
import Button from "../../components/Button";
import { api } from "../../api/client";
import { colors } from "../../theme/colors";

const emptyForm = {
  name: "",
  category: "",
  unit: "",
  price: "",
  totalQuantity: "",
  imageUrl: "",
  soldByWeight: false,
  weightStepGrams: "",
  lowStockThreshold: "10",
  isActive: true
};

export default function ProductManagementScreen() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const scrollRef = useRef(null);

  function loadProducts() {
    api("/api/products/inventory").then((data) => setProducts(data.inventory)).catch(() => setProducts([]));
  }

  useEffect(loadProducts, []);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingProduct(null);
  }

  function startEdit(product) {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      category: product.category || "",
      unit: product.soldBy === "weight" ? "" : product.unit || "",
      price: String(product.price ?? ""),
      totalQuantity: String(product.remainingStock ?? 0),
      imageUrl: product.imageUrl || "",
      soldByWeight: product.soldBy === "weight",
      weightStepGrams: product.soldBy === "weight" ? String(product.weightStepGrams || "") : "",
      lowStockThreshold: String(product.lowStockThreshold ?? 10),
      isActive: product.isActive !== false
    });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  async function saveProduct() {
    if (form.soldByWeight && (!Number(form.weightStepGrams) || Number(form.weightStepGrams) < 1)) {
      Alert.alert("Weight needed", "Enter a valid gram quantity, such as 50.");
      return;
    }

    try {
      const { soldByWeight, weightStepGrams, ...productFields } = form;
      const availableStock = Number(form.totalQuantity);
      const payload = {
        ...productFields,
        soldBy: soldByWeight ? "weight" : "unit",
        weightStepGrams: soldByWeight ? Number(weightStepGrams) : null,
        unit: soldByWeight ? `${Number(weightStepGrams)} g` : form.unit,
        price: Number(form.price),
        totalQuantity: editingProduct ? editingProduct.quantitySold + availableStock : availableStock,
        lowStockThreshold: Number(form.lowStockThreshold || 0),
        isActive: form.isActive
      };
      await api(editingProduct ? `/api/products/${editingProduct._id}` : "/api/products", {
        method: editingProduct ? "PATCH" : "POST",
        body: {
          ...payload
        }
      });
      resetForm();
      loadProducts();
    } catch (error) {
      Alert.alert("Product not saved", error.message);
    }
  }

  async function deleteProduct(id) {
    await api(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <PackagePlus size={26} color={colors.greenDark} />
        </View>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>Add groceries, prices, stock, and customer-facing images.</Text>
        </View>
      </View>
      <View style={styles.form}>
        <View style={styles.formHeading}>
          <View>
            <Text style={styles.sectionTitle}>{editingProduct ? `Edit ${editingProduct.name}` : "New item"}</Text>
            {editingProduct ? <Text style={styles.editHint}>Changes update customer and inventory views immediately.</Text> : null}
          </View>
          {editingProduct ? <Button title="Cancel" variant="ghost" onPress={resetForm} style={styles.cancelButton} /> : null}
        </View>
        <TextInput style={styles.input} value={form.name} onChangeText={(text) => setField("name", text)} placeholder="Product name, e.g. Fresh Apples" />
        <TextInput style={styles.input} value={form.category} onChangeText={(text) => setField("category", text)} placeholder="Category, e.g. Fruits" />
        <View style={styles.weightToggle}>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Sell by weight</Text>
            <Text style={styles.toggleMeta}>Optional for products priced in gram portions</Text>
          </View>
          <Switch
            value={form.soldByWeight}
            onValueChange={(value) => setField("soldByWeight", value)}
            trackColor={{ false: colors.line, true: colors.green }}
          />
        </View>
        {form.soldByWeight ? (
          <>
            <View style={styles.rowInputs}>
              <TextInput style={[styles.input, styles.flexInput]} value={form.weightStepGrams} onChangeText={(text) => setField("weightStepGrams", text)} placeholder="Grams per portion, e.g. 50" keyboardType="number-pad" />
              <TextInput style={[styles.input, styles.flexInput]} value={form.price} onChangeText={(text) => setField("price", text)} placeholder="Price per portion" keyboardType="number-pad" />
            </View>
            {form.weightStepGrams && form.price ? (
              <Text style={styles.pricePreview}>Customer sees: ₹{form.price} per {form.weightStepGrams} g</Text>
            ) : null}
          </>
        ) : (
          <View style={styles.rowInputs}>
            <TextInput style={[styles.input, styles.flexInput]} value={form.unit} onChangeText={(text) => setField("unit", text)} placeholder="Unit, e.g. 1 bottle" />
            <TextInput style={[styles.input, styles.flexInput]} value={form.price} onChangeText={(text) => setField("price", text)} placeholder="Price" keyboardType="number-pad" />
          </View>
        )}
        <TextInput
          style={styles.input}
          value={form.totalQuantity}
          onChangeText={(text) => setField("totalQuantity", text)}
          placeholder={form.soldByWeight ? `Available ${form.weightStepGrams || "weight"} g portions` : "Available stock quantity"}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          value={form.lowStockThreshold}
          onChangeText={(text) => setField("lowStockThreshold", text)}
          placeholder="Low-stock alert threshold"
          keyboardType="number-pad"
        />
        <View style={styles.weightToggle}>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Available to customers</Text>
            <Text style={styles.toggleMeta}>Turn off to hide this product without deleting it</Text>
          </View>
          <Switch
            value={form.isActive}
            onValueChange={(value) => setField("isActive", value)}
            trackColor={{ false: colors.line, true: colors.green }}
          />
        </View>
        <View style={styles.imagePaste}>
          <ImagePlus size={20} color={colors.greenDark} />
          <TextInput style={styles.imageInput} value={form.imageUrl} onChangeText={(text) => setField("imageUrl", text)} placeholder="Paste product image URL" autoCapitalize="none" />
        </View>
        {form.imageUrl ? <Image source={{ uri: form.imageUrl }} style={styles.preview} resizeMode="contain" /> : null}
        <Button title={editingProduct ? "Save changes" : "Add item"} onPress={saveProduct} />
      </View>
      {products.map((item) => (
        <View style={styles.row} key={item._id}>
            <Image source={{ uri: item.imageUrl || "https://placehold.co/120x120/E8F7EE/0B7A3B?text=Zest" }} style={styles.thumb} resizeMode="contain" />
            <View style={styles.productInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.soldBy === "weight" ? `₹${item.price} per ${item.weightStepGrams} g` : `₹${item.price} · ${item.unit}`} · {item.category} · Stock {item.remainingStock}
              </Text>
              <Text style={[styles.availability, item.isActive === false && styles.unavailable]}>
                {item.isActive === false ? "Hidden from customers" : "Available"}
              </Text>
            </View>
            <View style={styles.productActions}>
              <Button title="Edit" style={styles.smallButton} onPress={() => startEdit(item)} />
              <Button title="Delete" variant="ghost" style={styles.smallButton} onPress={() => deleteProduct(item._id)} />
            </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 28 },
  hero: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: colors.greenSoft, borderRadius: 8, marginBottom: 14 },
  heroIcon: { width: 50, height: 50, borderRadius: 8, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "900", color: colors.ink, marginBottom: 14 },
  subtitle: { color: colors.muted, maxWidth: 280 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: colors.ink },
  formHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  editHint: { color: colors.muted, fontSize: 12, marginTop: 3 },
  cancelButton: { height: 36 },
  form: { gap: 10, marginBottom: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 14 },
  input: { height: 46, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 12 },
  rowInputs: { flexDirection: "row", gap: 10 },
  flexInput: { flex: 1 },
  weightToggle: { minHeight: 62, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: colors.ink, fontWeight: "900" },
  toggleMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  pricePreview: { color: colors.greenDark, backgroundColor: colors.greenSoft, padding: 10, borderRadius: 8, fontWeight: "900" },
  imagePaste: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  imageInput: { flex: 1, height: "100%" },
  preview: { width: "100%", height: 150, borderRadius: 8, backgroundColor: colors.greenSoft },
  row: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.greenSoft },
  productInfo: { flex: 1 },
  name: { color: colors.ink, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 4 },
  availability: { color: colors.green, fontWeight: "800", marginTop: 5, fontSize: 12 },
  unavailable: { color: colors.warning },
  productActions: { flexDirection: "row", gap: 8 },
  smallButton: { height: 36 }
});
