const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    brand: String,
    soldBy: { type: String, enum: ["unit", "weight"], default: "unit" },
    weightStepGrams: {
      type: Number,
      min: 1,
      required() {
        return this.soldBy === "weight";
      }
    },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    imageUrl: String,
    imagePublicId: String,
    totalQuantity: { type: Number, required: true, min: 0, default: 0 },
    quantitySold: { type: Number, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 10 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.virtual("remainingStock").get(function remainingStock() {
  return Math.max(this.totalQuantity - this.quantitySold, 0);
});

productSchema.virtual("isLowStock").get(function isLowStock() {
  return this.remainingStock <= this.lowStockThreshold;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
