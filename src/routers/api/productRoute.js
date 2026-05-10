const express = require("express");
const {
  handleVewProduct,
  handleCreateProduct,
  handleVewSingleProduct,
  handleDeleteProduct,
  handleUpdateProduct,
  handleGetStock,
  handleBuyProduct,
  handleSearchProduct,
} = require("../../controller/productController");
const { isAdmin, requireAuth } = require("../../middlewares/auth");
const { validateProduct } = require("../../middlewares/validators/product");
const runValidation = require("../../middlewares/validators");
const { uploadProductImage } = require("../../middlewares/uplodFile");
const attachUser = require("../../middlewares/validators/attachUser");

const productRoute = express.Router();

// Search & list — before `/:slug`
productRoute.get("/search", handleSearchProduct);
productRoute.get("/", handleVewProduct);

// Fixed paths — before `/:slug` (GET "stock"/"buy" would otherwise match slug)
productRoute.post("/stock", attachUser, isAdmin, handleGetStock);
productRoute.post("/buy", attachUser, requireAuth, handleBuyProduct);

productRoute.post(
  "/",
  attachUser,
  isAdmin,
  uploadProductImage.single("image"),
  validateProduct,
  runValidation,
  handleCreateProduct
);

productRoute.put("/:slug", attachUser, isAdmin, runValidation, handleUpdateProduct);

productRoute.delete("/:id([0-9a-fA-F]{24})", attachUser, isAdmin, handleDeleteProduct);

// Single product by slug — must be last among path templates
productRoute.get("/:slug", handleVewSingleProduct);

module.exports = productRoute;
