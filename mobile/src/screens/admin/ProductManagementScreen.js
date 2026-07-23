import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from "react-native";
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
  reservedQuantity: "",
  mrp: "",
  offerPrice: "",
  imageUrl: "",
  publishStatus: "Published",
  visibleToCustomers: true,
  availableForSale: true,
  isFeatured: false,
  isTrending: false,
  isNewArrival: false,
  isBestSeller: false,
  soldByWeight: false,
  soldByVolume: false,
  weightStepGrams: "",
  volumeStepMl: "",
  lowStockThreshold: "10",
  isActive: true
};

function formatVolume(ml) {
  const amount = Number(ml || 0);
  if (amount >= 1000) {
    return `${amount / 1000} L`;
  }
  return `${amount} ml`;
}

export default function ProductManagementScreen() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef(null);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWideNative = !isWeb && width >= 720;
  const nativeImageSize = Math.round(Math.min(Math.max(width * 0.18, 72), 104));
  const nativeActionWidth = isWideNative ? 104 : Math.max(104, Math.floor((width - 72) / 2));

  function loadProducts() {
    api("/api/products/inventory").then((data) => setProducts(data.inventory)).catch(() => setProducts([]));
  }

  useEffect(loadProducts, []);

  function setField(field, value) {
    setSaveStatus(null);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingProduct(null);
    setSaveStatus(null);
  }

  function startEdit(product) {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      category: product.category || "",
      unit: ["weight", "volume"].includes(product.soldBy) ? "" : product.unit || "",
      price: String(product.price ?? ""),
      mrp: String(product.mrp ?? ""),
      offerPrice: String(product.offerPrice ?? ""),
      totalQuantity: String(product.remainingStock ?? 0),
      reservedQuantity: String(product.reservedQuantity ?? 0),
      imageUrl: product.imageUrl || "",
      publishStatus: product.publishStatus || "Published",
      visibleToCustomers: product.visibleToCustomers !== false,
      availableForSale: product.availableForSale !== false,
      isFeatured: product.isFeatured === true,
      isTrending: product.isTrending === true,
      isNewArrival: product.isNewArrival === true,
      isBestSeller: product.isBestSeller === true,
      soldByWeight: product.soldBy === "weight",
      soldByVolume: product.soldBy === "volume",
      weightStepGrams: product.soldBy === "weight" ? String(product.weightStepGrams || "") : "",
      volumeStepMl: product.soldBy === "volume" ? String(product.volumeStepMl || "") : "",
      lowStockThreshold: String(product.lowStockThreshold ?? 10),
      isActive: product.isActive !== false
    });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  async function saveProduct() {
    const name = form.name.trim();
    const category = form.category.trim();
    const unit = form.unit.trim();
    const price = Number(form.price);
    const availableStock = Number(form.totalQuantity);

    if (!name) {
      setSaveStatus({ type: "error", message: "Product name is required." });
      return;
    }

    if (!category) {
      setSaveStatus({ type: "error", message: "Category is required." });
      return;
    }

    if (!form.soldByWeight && !form.soldByVolume && !unit) {
      setSaveStatus({ type: "error", message: "Unit is required, for example 1 kg, 1 bottle, or 1 piece." });
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setSaveStatus({ type: "error", message: "Enter a valid price." });
      return;
    }

    if (!Number.isFinite(availableStock) || availableStock < 0) {
      setSaveStatus({ type: "error", message: "Enter a valid available stock quantity." });
      return;
    }

    if (form.soldByWeight && (!Number(form.weightStepGrams) || Number(form.weightStepGrams) < 1)) {
      setSaveStatus({ type: "error", message: "Enter a valid gram quantity, such as 50." });
      Alert.alert("Weight needed", "Enter a valid gram quantity, such as 50.");
      return;
    }

    if (form.soldByVolume && (!Number(form.volumeStepMl) || Number(form.volumeStepMl) < 1)) {
      setSaveStatus({ type: "error", message: "Enter a valid ml quantity, such as 500." });
      Alert.alert("Volume needed", "Enter a valid ml quantity, such as 500.");
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const { soldByWeight, soldByVolume, weightStepGrams, volumeStepMl, ...productFields } = form;
      const soldBy = soldByWeight ? "weight" : soldByVolume ? "volume" : "unit";
      const payload = {
        ...productFields,
        name,
        category,
        soldBy,
        weightStepGrams: soldByWeight ? Number(weightStepGrams) : null,
        volumeStepMl: soldByVolume ? Number(volumeStepMl) : null,
        unit: soldByWeight ? `${Number(weightStepGrams)} g` : soldByVolume ? formatVolume(volumeStepMl) : unit,
        price,
        mrp: form.mrp ? Number(form.mrp) : null,
        offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
        totalQuantity: editingProduct ? editingProduct.quantitySold + availableStock : availableStock,
        reservedQuantity: Number(form.reservedQuantity || 0),
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
      setSaveStatus({ type: "success", message: editingProduct ? "Product updated." : "Product added." });
    } catch (error) {
      setSaveStatus({ type: "error", message: error.message || "Product was not saved." });
      Alert.alert("Product not saved", error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(id) {
    await api(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function duplicateProduct(id) {
    await api(`/api/products/${id}/duplicate`, { method: "POST" });
    loadProducts();
  }

  async function archiveProduct(id) {
    await api(`/api/products/${id}/archive`, { method: "PATCH" });
    loadProducts();
  }

  function publishNextStatus() {
    const statuses = ["Draft", "Published", "Hidden", "Archived"];
    const index = statuses.indexOf(form.publishStatus);
    setField("publishStatus", statuses[(index + 1) % statuses.length]);
  }

  function productPriceLabel(item) {
    if (item.soldBy === "weight") {
      return `₹${item.price} per ${item.weightStepGrams} g`;
    }

    if (item.soldBy === "volume") {
      return `₹${item.price} per ${formatVolume(item.volumeStepMl)}`;
    }

    return `₹${item.price}`;
  }

  function productQuantityLabel(item) {
    if (item.soldBy === "weight") {
      return `${item.weightStepGrams || "-"} g portion`;
    }

    if (item.soldBy === "volume") {
      return `${formatVolume(item.volumeStepMl)} portion`;
    }

    return item.unit || "-";
  }

  function productStatusLabel(item) {
    return `${item.publishStatus || "Published"} · ${item.visibleToCustomers ? "Visible" : "Hidden"} · ${item.availableForSale ? "Sale ON" : "Sale OFF"}`;
  }

  function renderNativeDetails(item) {
    const details = [
      ["Price", productPriceLabel(item)],
      ["Quantity", productQuantityLabel(item)],
      ["Category", item.category || "-"],
      ["Stock", item.remainingStock ?? "-"],
      ["MRP", item.mrp ? `₹${item.mrp}` : "-"],
      ["Offer", item.offerPrice ? `₹${item.offerPrice}` : "-"],
      ["Reserved", item.reservedQuantity || 0],
      ["Status", productStatusLabel(item)]
    ];

    return (
      <View style={styles.detailStack}>
        {details.map(([label, value]) => (
          <View style={styles.detailRow} key={label}>
            <Text style={styles.detailLabel} numberOfLines={1}>{label}</Text>
            <Text
              style={[styles.detailValue, label === "Status" && styles.detailStatus, (!item.visibleToCustomers || item.publishStatus !== "Published" || item.availableForSale === false) && label === "Status" && styles.unavailable]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {value}
            </Text>
          </View>
        ))}
      </View>
    );
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
        <View style={styles.publishRow}>
          <Button title={`Status: ${form.publishStatus}`} variant="ghost" onPress={publishNextStatus} style={styles.publishButton} />
          <Text style={styles.publishHint}>Only Published + Visible products appear to customers.</Text>
        </View>
        <View style={styles.rowInputs}>
          <TextInput style={[styles.input, styles.flexInput]} value={form.mrp} onChangeText={(text) => setField("mrp", text)} placeholder="MRP" keyboardType="number-pad" />
          <TextInput style={[styles.input, styles.flexInput]} value={form.offerPrice} onChangeText={(text) => setField("offerPrice", text)} placeholder="Offer price" keyboardType="number-pad" />
        </View>
        <View style={styles.weightToggle}>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Sell by weight</Text>
            <Text style={styles.toggleMeta}>Optional for products priced in gram portions</Text>
          </View>
          <Switch
            value={form.soldByWeight}
            onValueChange={(value) => setForm((current) => ({ ...current, soldByWeight: value, soldByVolume: value ? false : current.soldByVolume }))}
            trackColor={{ false: colors.line, true: colors.green }}
          />
        </View>
        <View style={styles.weightToggle}>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Sell by volume</Text>
            <Text style={styles.toggleMeta}>For milk, juice, oil, and other ml/litre products</Text>
          </View>
          <Switch
            value={form.soldByVolume}
            onValueChange={(value) => setForm((current) => ({ ...current, soldByVolume: value, soldByWeight: value ? false : current.soldByWeight }))}
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
        ) : form.soldByVolume ? (
          <>
            <View style={styles.rowInputs}>
              <TextInput style={[styles.input, styles.flexInput]} value={form.volumeStepMl} onChangeText={(text) => setField("volumeStepMl", text)} placeholder="ML per portion, e.g. 500" keyboardType="number-pad" />
              <TextInput style={[styles.input, styles.flexInput]} value={form.price} onChangeText={(text) => setField("price", text)} placeholder="Price per portion" keyboardType="number-pad" />
            </View>
            {form.volumeStepMl && form.price ? (
              <Text style={styles.pricePreview}>Customer sees: ₹{form.price} per {formatVolume(form.volumeStepMl)}</Text>
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
          placeholder={form.soldByWeight ? `Available ${form.weightStepGrams || "weight"} g portions` : form.soldByVolume ? `Available ${form.volumeStepMl || "ml"} portions` : "Available stock quantity"}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          value={form.reservedQuantity}
          onChangeText={(text) => setField("reservedQuantity", text)}
          placeholder="Reserved stock, e.g. 5"
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
            <Text style={styles.toggleTitle}>Visible to customers</Text>
            <Text style={styles.toggleMeta}>OFF hides this product everywhere in the customer app</Text>
          </View>
          <Switch
            value={form.visibleToCustomers}
            onValueChange={(value) => setField("visibleToCustomers", value)}
            trackColor={{ false: colors.line, true: colors.green }}
          />
        </View>
        <View style={styles.weightToggle}>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Available for sale</Text>
            <Text style={styles.toggleMeta}>OFF keeps it visible but disables buying</Text>
          </View>
          <Switch
            value={form.availableForSale}
            onValueChange={(value) => setField("availableForSale", value)}
            trackColor={{ false: colors.line, true: colors.green }}
          />
        </View>
        <View style={styles.flagGrid}>
          {[
            ["Featured", "isFeatured"],
            ["Trending", "isTrending"],
            ["New arrival", "isNewArrival"],
            ["Best seller", "isBestSeller"]
          ].map(([label, key]) => (
            <View style={styles.flagToggle} key={key}>
              <Text style={styles.flagLabel}>{label}</Text>
              <Switch
                value={form[key]}
                onValueChange={(value) => setField(key, value)}
                trackColor={{ false: colors.line, true: colors.green }}
              />
            </View>
          ))}
        </View>
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
        <Button title={isSaving ? "Saving..." : editingProduct ? "Save changes" : "Add item"} onPress={saveProduct} disabled={isSaving} />
        {saveStatus ? (
          <Text style={[styles.saveStatus, saveStatus.type === "error" ? styles.saveError : styles.saveSuccess]}>
            {saveStatus.message}
          </Text>
        ) : null}
      </View>
      {products.map((item) => (
        <View style={[styles.row, !isWeb && styles.nativeRow, isWideNative && styles.nativeWideRow]} key={item._id}>
            <View style={[styles.productMain, isWeb && styles.webProductMain]}>
              <Image
                source={{ uri: item.imageUrl || "https://placehold.co/120x120/E8F7EE/0B7A3B?text=Zest" }}
                style={[styles.thumb, !isWeb && { width: nativeImageSize, height: nativeImageSize }]}
                resizeMode="contain"
              />
              <View style={styles.productInfo}>
                <Text style={[styles.name, !isWeb && styles.nativeName]} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
                {isWeb ? (
                  <>
                    <Text style={styles.meta}>
                      {item.soldBy === "weight"
                        ? `₹${item.price} per ${item.weightStepGrams} g`
                        : item.soldBy === "volume"
                          ? `₹${item.price} per ${formatVolume(item.volumeStepMl)}`
                          : `₹${item.price} · ${item.unit}`} · {item.category} · Stock {item.remainingStock}
                    </Text>
                    <Text style={styles.meta}>
                      MRP {item.mrp ? `₹${item.mrp}` : "-"} · Offer {item.offerPrice ? `₹${item.offerPrice}` : "-"} · Reserved {item.reservedQuantity || 0}
                    </Text>
                    <Text style={[styles.availability, (!item.visibleToCustomers || item.publishStatus !== "Published" || item.availableForSale === false) && styles.unavailable]}>
                      {productStatusLabel(item)}
                    </Text>
                  </>
                ) : renderNativeDetails(item)}
              </View>
            </View>
            <View style={[styles.productActions, !isWeb && styles.nativeProductActions]}>
              <Button title="Edit" style={[styles.smallButton, !isWeb && styles.nativeSmallButton, !isWeb && { flexBasis: nativeActionWidth }]} onPress={() => startEdit(item)} />
              <Button title="Copy" variant="ghost" style={[styles.smallButton, !isWeb && styles.nativeSmallButton, !isWeb && { flexBasis: nativeActionWidth }]} onPress={() => duplicateProduct(item._id)} />
              <Button title="Archive" variant="ghost" style={[styles.smallButton, !isWeb && styles.nativeSmallButton, !isWeb && { flexBasis: nativeActionWidth }]} onPress={() => archiveProduct(item._id)} />
              <Button title="Hide" variant="ghost" style={[styles.smallButton, !isWeb && styles.nativeSmallButton, !isWeb && { flexBasis: nativeActionWidth }]} onPress={() => deleteProduct(item._id)} />
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
  publishRow: { gap: 8, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 10 },
  publishButton: { height: 38 },
  publishHint: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  input: { height: 46, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 12 },
  rowInputs: { flexDirection: "row", gap: 10 },
  flexInput: { flex: 1 },
  weightToggle: { minHeight: 62, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: colors.ink, fontWeight: "900" },
  toggleMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  flagGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  flagToggle: { width: "48%", minHeight: 50, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flagLabel: { color: colors.ink, fontWeight: "800", flex: 1 },
  pricePreview: { color: colors.greenDark, backgroundColor: colors.greenSoft, padding: 10, borderRadius: 8, fontWeight: "900" },
  saveStatus: { borderRadius: 8, padding: 10, fontWeight: "800" },
  saveError: { color: colors.warning, backgroundColor: "#FFF4E8" },
  saveSuccess: { color: colors.greenDark, backgroundColor: colors.greenSoft },
  imagePaste: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  imageInput: { flex: 1, height: "100%" },
  preview: { width: "100%", height: 150, borderRadius: 8, backgroundColor: colors.greenSoft },
  row: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  nativeRow: { alignItems: "stretch", flexDirection: "column", gap: 12 },
  nativeWideRow: { flexDirection: "row", alignItems: "center" },
  productMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  webProductMain: { alignItems: "center" },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.greenSoft },
  productInfo: { flex: 1, flexGrow: 1, flexShrink: 1, minWidth: 0 },
  name: { color: colors.ink, fontWeight: "900", flexShrink: 1 },
  nativeName: { minHeight: 38, lineHeight: 19 },
  meta: { color: colors.muted, marginTop: 4 },
  availability: { color: colors.green, fontWeight: "800", marginTop: 5, fontSize: 12 },
  unavailable: { color: colors.warning },
  productActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 8, maxWidth: 210 },
  nativeProductActions: { alignSelf: "stretch", justifyContent: "flex-end", maxWidth: "100%" },
  smallButton: { height: 36 },
  nativeSmallButton: { flexGrow: 1, flexShrink: 1, minWidth: 0, paddingHorizontal: 10 },
  detailStack: { marginTop: 6, gap: 4 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, minWidth: 0 },
  detailLabel: { width: 68, color: colors.muted, fontSize: 12, fontWeight: "800" },
  detailValue: { flex: 1, flexShrink: 1, minWidth: 0, color: colors.muted, fontSize: 12, fontWeight: "700" },
  detailStatus: { color: colors.green, fontWeight: "900" }
});
