const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: "", index: true },
    brand: String,
    tags: [{ type: String, trim: true, lowercase: true }],
    collections: [{ type: String, trim: true, lowercase: true }],
    publishStatus: {
      type: String,
      enum: ["Draft", "Published", "Hidden", "Archived"],
      default: "Published",
      index: true
    },
    visibleToCustomers: { type: Boolean, default: true, index: true },
    availableForSale: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    soldBy: { type: String, enum: ["unit", "weight", "volume"], default: "unit" },
    weightStepGrams: {
      type: Number,
      min: 1,
      required() {
        return this.soldBy === "weight";
      }
    },
    volumeStepMl: {
      type: Number,
      min: 1,
      required() {
        return this.soldBy === "volume";
      }
    },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    offerPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 95, default: 0 },
    discountStartsAt: Date,
    discountEndsAt: Date,
    ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    imageUrl: String,
    imagePublicId: String,
    media: [
      {
        type: { type: String, enum: ["image", "video"], default: "image" },
        url: String,
        publicId: String,
        alt: String,
        sortOrder: { type: Number, default: 0 }
      }
    ],
    totalQuantity: { type: Number, required: true, min: 0, default: 0 },
    quantitySold: { type: Number, min: 0, default: 0 },
    reservedQuantity: { type: Number, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 10 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.virtual("remainingStock").get(function remainingStock() {
  return Math.max(this.totalQuantity - this.quantitySold - this.reservedQuantity, 0);
});

productSchema.virtual("isLowStock").get(function isLowStock() {
  return this.remainingStock <= this.lowStockThreshold;
});

productSchema.virtual("isPublished").get(function isPublished() {
  const published = !this.publishStatus || this.publishStatus === "Published";
  const visible = this.visibleToCustomers !== false;
  return published && visible && this.isActive;
});

productSchema.virtual("isPurchasable").get(function isPurchasable() {
  return this.isPublished && this.availableForSale !== false && this.remainingStock > 0;
});

productSchema.virtual("effectivePrice").get(function effectivePrice() {
  const now = new Date();
  const discountStarted = !this.discountStartsAt || this.discountStartsAt <= now;
  const discountNotEnded = !this.discountEndsAt || this.discountEndsAt >= now;

  if (this.offerPrice && this.offerPrice > 0 && this.offerPrice < this.price && discountStarted && discountNotEnded) {
    return this.offerPrice;
  }

  if (this.discountPercent > 0 && discountStarted && discountNotEnded) {
    return Math.round(this.price * (1 - this.discountPercent / 100));
  }

  return this.price;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ name: "text", description: "text", category: "text", brand: "text", tags: "text" });
productSchema.index({ publishStatus: 1, visibleToCustomers: 1, isActive: 1, category: 1 });

module.exports = mongoose.model("Product", productSchema);
