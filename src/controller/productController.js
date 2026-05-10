const createError = require("http-errors");
const mongoose = require("mongoose");
const streamifier = require("streamifier");
const slugify = require("slugify");
const Product = require("../models/productModel");
const { successRespons } = require("./respones.controller");
const { updateProductServices } = require("../services/productServices");
const { deleteCloudinaryImage } = require("../helper/cloudinaryHelper");
const cloudinary = require("../config/cloudinary");

const slugOpts = { lower: true, strict: true, trim: true };

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * @desc handle search products
 */
const handleSearchProduct = async (req, res) => {
  try {
    let { query } = req.query;
    query = query?.trim();

    if (!query) {
      return res.json({ products: [] });
    }

    const safe = escapeRegex(query);
    const regex = new RegExp(safe, "i");
    const slugPart = slugify(query, slugOpts);

    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
        ...(slugPart ? [{ slug: new RegExp(escapeRegex(slugPart), "i") }] : []),
      ],
    })
      .select("name price slug image quantity")
      .sort({ sold: -1 })
      .limit(30);

    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

/**
 * @desc GET all products
 */
const handleVewProduct = async (req, res, next) => {
  try {
    const allProducts = await Product.find()
      .populate("categoryId")
      .sort({ createdAt: -1 });

    return successRespons(res, {
      statusCode: 200,
      message: allProducts.length
        ? "All products fetched successfully"
        : "No products in catalog",
      payload: { products: allProducts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc GET single product by slug
 */
const handleVewSingleProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const singleProduct = await Product.findOne({ slug }).populate("categoryId");

    if (!singleProduct) {
      throw createError(404, "Product not found");
    }

    return successRespons(res, {
      statusCode: 200,
      message: "Product fetched successfully",
      payload: singleProduct,
    });
  } catch (error) {
    next(error);
  }
};

const parseShippingNumber = (raw) => {
  if (raw === undefined || raw === null || raw === "") return 0;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

/**
 * @desc CREATE product
 */
const handleCreateProduct = async (req, res, next) => {
  try {
    const { name, description, categoryId } = req.body;
    const price = parseFloat(req.body.price);
    const quantity = parseFloat(req.body.quantity);
    const shipping = parseShippingNumber(req.body.shipping);
    const file = req.file;

    if (!file) throw createError(400, "Image file is required");

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "mernEcommerce/product" },
      async (error, result) => {
        if (error) return next(error);

        try {
          const newProduct = await Product.create({
            name,
            slug: slugify(name, slugOpts),
            description,
            price,
            quantity,
            shipping,
            image: result.secure_url,
            categoryId,
          });

          return res.status(201).json({
            success: true,
            message: "Product created successfully",
            payload: newProduct,
          });
        } catch (e) {
          return next(e);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc UPDATE product
 */
const handleUpdateProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const updateProduct = await updateProductServices(req, slug);

    return successRespons(res, {
      statusCode: 200,
      message: "Product update successful",
      payload: updateProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc DELETE product
 */
const handleDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteProduct = await Product.findByIdAndDelete(id);

    if (!deleteProduct) {
      throw createError(404, "Product not found");
    }

    if (deleteProduct.image) {
      try {
        await deleteCloudinaryImage(deleteProduct.image, "Product");
      } catch (_) {
        // Product already removed from DB; log-only in production monitoring
      }
    }

    return successRespons(res, {
      statusCode: 200,
      message: "Product deleted successfully",
      payload: deleteProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get stock for multiple products
 */
const handleGetStock = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "productIds non-empty array is required" });
    }

    const validIds = productIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== productIds.length) {
      return res.status(400).json({ message: "Each productIds entry must be a valid MongoDB id" });
    }

    const products = await Product.find({ _id: { $in: validIds } }).select("_id quantity");

    const stockData = {};
    products.forEach((p) => {
      stockData[p._id] = p.quantity;
    });

    return res.status(200).json(stockData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc BUY product (decrease stock, increase sold) — authenticated users only
 */
const handleBuyProduct = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const qty = typeof quantity === "string" ? parseFloat(quantity) : Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Product ID and valid quantity are required" });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, quantity: { $gte: qty } },
      { $inc: { quantity: -qty, sold: qty } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    return successRespons(res, {
      statusCode: 200,
      message: "Purchase successful",
      payload: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleSearchProduct,
  handleVewProduct,
  handleVewSingleProduct,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetStock,
  handleBuyProduct,
};
