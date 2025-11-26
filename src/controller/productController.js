const createError = require("http-errors");
const streamifier = require("streamifier");
const path = require("path");
const slugify = require("slugify");
const Product = require("../models/productModel");
const { successRespons } = require("./respones.controller");
const { updateProductServices } = require("../services/productServices");
const deleteImg = require("../helper/deleteImages");
const { cloudinaryHelper, deleteCloudinaryImage } = require("../helper/cloudinaryHelper");
const cloudinary = require("../config/cloudinary");

/**
 * @desc GET all products
 */
const handleVewProduct = async (req, res, next) => {
  try {
    const allProducts = await Product.find()
      .populate("categoryId")
      .sort({ createdAt: -1 });

    if (!allProducts) {
      return res.status(404).json({ message: "No products found" });
    }

    return successRespons(res, {
      statusCode: 200,
      message: "All products fetched successfully",
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

/**
 * @desc CREATE product
 */
const handleCreateProduct = async (req, res, next) => {
  try {
    const { name, description, price, quantity, shipping, categoryId } = req.body;
    const file = req.file;

    if (!file) throw createError(400, "Image file is required");

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "mernEcommerce/product" },
      async (error, result) => {
        if (error) return next(error);

        const newProduct = await Product.create({
          name,
          slug: slugify(name),
          description,
          price,
          quantity,
          shipping: shipping === "1" || shipping === true,
          image: result.secure_url,
          categoryId,
        });

        return res.status(201).json({
          status: "success",
          message: "Product created successfully",
          payload: newProduct,
        });
      }
    );

    // pipe buffer directly to cloudinary
    streamifier.createReadStream(file.buffer).pipe(uploadStream);

  } catch (error) {
    console.error("❌ Error in handleCreateProduct:", error);
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

    console.log("dfkjsdag",updateProduct);
    

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

    // Delete image from Cloudinary
    if (deleteProduct.image) {
      const cloudImageId = await cloudinaryHelper(deleteProduct.image);
      await deleteCloudinaryImage("mernEcommerce/product", cloudImageId, "Product");
      // No need to delete local file since memoryStorage
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
    const { productIds } = req.body; // Array of product IDs

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: "productIds array is required" });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    const stockData = {};
    products.forEach((p) => {
      stockData[p._id] = p.quantity;
    });

    return res.status(200).json(stockData);
  } catch (error) {
    console.error("Get Stock Error:", error);
    next(error);
  }
};

/**
 * @desc BUY product (decrease stock, increase sold)
 */
const handleBuyProduct = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Product ID and valid quantity are required" });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, quantity: { $gte: quantity } }, // condition: enough stock
      { $inc: { quantity: -quantity, sold: quantity } }, // decrease stock, increase sold
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
    console.error("Buy Product Error:", error);
    next(error);
  }
};

module.exports = {
  handleVewProduct,
  handleVewSingleProduct,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetStock,
  handleBuyProduct, // NEW
};
