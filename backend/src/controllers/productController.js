const Product = require("../models/Product");
const configureCloudinary = require("../config/cloudinary");

function normalizeVariants(body) {
  const basePrice = Number(body.offerPrice ?? body.effectivePrice ?? body.price ?? 0);

  if (!Array.isArray(body.variants)) {
    return { ...body, offerPrice: body.offerPrice ?? body.price };
  }

  const variants = body.variants
    .filter((variant) => String(variant?.label || "").trim() && String(variant?.unit || "").trim())
    .map((variant, index) => ({
      label: String(variant.label).trim(),
      unit: String(variant.unit).trim(),
      price: Number(variant.price ?? basePrice),
      compareAtPrice: variant.compareAtPrice === undefined || variant.compareAtPrice === "" ? undefined : Number(variant.compareAtPrice),
      discountText: String(variant.discountText || "").trim(),
      isDefault: index === 0
    }));

  return { ...body, offerPrice: body.offerPrice ?? body.price, variants };
}

function buildProductQuery(query) {
  const filter = { isActive: true };

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
}

async function listProducts(request, response, next) {
  try {
    const products = await Product.find(buildProductQuery(request.query)).sort({ category: 1, name: 1 });
    response.json({ products });
  } catch (error) {
    next(error);
  }
}

async function listInventory(_request, response, next) {
  try {
    const products = await Product.find().sort({ remainingStock: 1, name: 1 });
    response.json({
      inventory: products.map((product) => product.toJSON())
    });
  } catch (error) {
    next(error);
  }
}

async function createProduct(request, response, next) {
  try {
    const product = await Product.create(normalizeVariants(request.body));
    request.app.get("io")?.emit("products:changed", { action: "created", productId: product._id });
    response.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(request, response, next) {
  try {
    const product = await Product.findByIdAndUpdate(request.params.id, normalizeVariants(request.body), {
      new: true,
      runValidators: true
    });

    if (!product) {
      return response.status(404).json({ message: "Product not found" });
    }

    request.app.get("io")?.emit("products:changed", { action: "updated", productId: product._id });
    return response.json({ product });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(request, response, next) {
  try {
    const product = await Product.findByIdAndUpdate(
      request.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return response.status(404).json({ message: "Product not found" });
    }

    request.app.get("io")?.emit("products:changed", { action: "deleted", productId: product._id });
    return response.json({ message: "Product deleted", product });
  } catch (error) {
    return next(error);
  }
}

async function uploadProductImage(request, response, next) {
  try {
    if (!request.file) {
      return response.status(400).json({ message: "Image file is required" });
    }

    const cloudinary = configureCloudinary();
    let imageUrl = request.file.path;
    let imagePublicId = request.file.filename;

    if (cloudinary) {
      const upload = await cloudinary.uploader.upload(request.file.path, {
        folder: "zest-fresh/products"
      });
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    const product = await Product.findByIdAndUpdate(
      request.params.id,
      {
        imageUrl,
        imagePublicId
      },
      { new: true }
    );

    if (!product) {
      return response.status(404).json({ message: "Product not found" });
    }

    request.app.get("io")?.emit("products:changed", { action: "image-updated", productId: product._id });
    return response.json({ product });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listProducts,
  listInventory,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};
