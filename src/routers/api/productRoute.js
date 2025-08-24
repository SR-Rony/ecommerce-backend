const express = require('express');
const {
  handleVewProduct,
  handleCreateProduct,
  handleVewSingleProduct,
  handleDeleteProduct,
  handleUpdateProduct,
  handleGetStock,
  handleBuyProduct, // <-- import buy handler
} = require('../../controller/productController');
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');
const { validateProduct } = require('../../middlewares/validators/product');
const runValidation = require('../../middlewares/validators');
const { uploadProductImage } = require('../../middlewares/uplodFile');

const productRoute = express.Router();

// GET all products
productRoute.get("/", handleVewProduct);

// GET single product by slug
productRoute.get("/:slug", handleVewSingleProduct);

// POST create new product
productRoute.post(
  "/",
  uploadProductImage.single("image"),
  handleCreateProduct
);

// PUT update product by slug
productRoute.put(
  "/:slug",
  isLoggedIn,
  isAdmin,
  // uploadProductImage.single("image"),
  runValidation,
  handleUpdateProduct
);

// DELETE product by slug
productRoute.delete("/:slug", handleDeleteProduct);

// POST check stock for multiple products
productRoute.post("/stock", handleGetStock);

// POST buy product (decrease stock & increase sold)
productRoute.post("/buy", handleBuyProduct); 
// 👆 protected: only logged-in users can buy

module.exports = productRoute;
