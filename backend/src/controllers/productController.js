const Product = require("../models/Product");
const configureCloudinary = require("../config/cloudinary");

function buildProductQuery(query) {
  const filter = {
    isActive: true,
    $and: [
      { $or: [{ publishStatus: "Published" }, { publishStatus: { $exists: false } }] },
      { $or: [{ visibleToCustomers: true }, { visibleToCustomers: { $exists: false } }] }
    ]
  };

  if (query.category) {
    filter.category = query.category;
  }

  if (query.brand) {
    filter.brand = query.brand;
  }

  if (query.tag) {
    filter.tags = query.tag.toLowerCase();
  }

  if (query.available === "true") {
    filter.availableForSale = true;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
}

function buildProductSort(query) {
  if (query.sort === "price_asc") return { offerPrice: 1, price: 1 };
  if (query.sort === "price_desc") return { offerPrice: -1, price: -1 };
  if (query.sort === "rating") return { ratingAverage: -1, ratingCount: -1 };
  if (query.sort === "new") return { createdAt: -1 };
  return { category: 1, name: 1 };
}

function withEffectivePrice(product) {
  const json = product.toJSON();
  json.price = json.effectivePrice ?? json.price;
  return json;
}

async function listProducts(request, response, next) {
  try {
    const page = Math.max(Number(request.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(request.query.limit || 50), 1), 100);
    const skip = (page - 1) * limit;
    const filter = buildProductQuery(request.query);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(buildProductSort(request.query)).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    response.json({ products: products.map(withEffectivePrice), pagination: { page, limit, total } });
  } catch (error) {
    next(error);
  }
}

async function listProductHome(_request, response, next) {
  try {
    const customerFilter = {
      isActive: true,
      $and: [
        { $or: [{ publishStatus: "Published" }, { publishStatus: { $exists: false } }] },
        { $or: [{ visibleToCustomers: true }, { visibleToCustomers: { $exists: false } }] }
      ]
    };
    const [products, featured, trending, newArrivals, bestSellers, categories] = await Promise.all([
      Product.find(customerFilter).sort({ category: 1, name: 1 }).limit(80),
      Product.find({ ...customerFilter, isFeatured: true }).sort({ updatedAt: -1 }).limit(12),
      Product.find({ ...customerFilter, isTrending: true }).sort({ updatedAt: -1 }).limit(12),
      Product.find({ ...customerFilter, isNewArrival: true }).sort({ createdAt: -1 }).limit(12),
      Product.find({ ...customerFilter, isBestSeller: true }).sort({ quantitySold: -1 }).limit(12),
      Product.distinct("category", customerFilter)
    ]);

    response.json({
      banners: [
        { title: "Daily fresh essentials", subtitle: "Fruits, dairy, snacks and more", accent: "green" },
        { title: "10 minute grocery runs", subtitle: "Fast delivery on your regular basket", accent: "lime" },
        { title: "Best deals today", subtitle: "Fresh offers on household favourites", accent: "gold" }
      ],
      categories: categories.filter(Boolean).sort(),
      featured: featured.map(withEffectivePrice),
      trending: (trending.length ? trending : products.slice(0, 12)).map(withEffectivePrice),
      newArrivals: (newArrivals.length ? newArrivals : products.slice(-12)).map(withEffectivePrice),
      bestSellers: (bestSellers.length ? bestSellers : products.slice(0, 12)).map(withEffectivePrice),
      recommended: products.slice(0, 16).map(withEffectivePrice)
    });
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
    const product = await Product.create(request.body);
    request.app.get("io")?.emit("products:changed", { action: "created", productId: product._id });
    response.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(request, response, next) {
  try {
    const product = await Product.findByIdAndUpdate(request.params.id, request.body, {
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

async function duplicateProduct(request, response, next) {
  try {
    const source = await Product.findById(request.params.id);

    if (!source) {
      return response.status(404).json({ message: "Product not found" });
    }

    const copy = source.toObject();
    delete copy._id;
    delete copy.createdAt;
    delete copy.updatedAt;
    delete copy.__v;
    copy.name = `${source.name} Copy`;
    copy.publishStatus = "Draft";
    copy.visibleToCustomers = false;
    copy.quantitySold = 0;
    copy.reservedQuantity = 0;

    const product = await Product.create(copy);
    request.app.get("io")?.emit("products:changed", { action: "duplicated", productId: product._id });
    return response.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
}

async function archiveProduct(request, response, next) {
  try {
    const product = await Product.findByIdAndUpdate(
      request.params.id,
      { publishStatus: "Archived", visibleToCustomers: false, availableForSale: false, isActive: false },
      { new: true, runValidators: true }
    );

    if (!product) {
      return response.status(404).json({ message: "Product not found" });
    }

    request.app.get("io")?.emit("products:changed", { action: "archived", productId: product._id });
    return response.json({ message: "Product archived", product });
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
  listProductHome,
  listInventory,
  createProduct,
  updateProduct,
  duplicateProduct,
  archiveProduct,
  deleteProduct,
  uploadProductImage
};
