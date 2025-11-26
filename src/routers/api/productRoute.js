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
const { isAdmin } = require('../../middlewares/auth');
const { validateProduct } = require('../../middlewares/validators/product');
const runValidation = require('../../middlewares/validators');
const { uploadProductImage } = require('../../middlewares/uplodFile');
const attachUser = require('../../middlewares/validators/attachUser');

const productRoute = express.Router();

// GET all products
productRoute.get("/", handleVewProduct);

// GET single product by slug
productRoute.get("/:slug", handleVewSingleProduct);

// POST create new product
productRoute.post( "/",attachUser,isAdmin,runValidation, 
  uploadProductImage.single("image"),validateProduct,
  handleCreateProduct
);

// PUT update product by slug
productRoute.put(
  "/:slug",attachUser,isAdmin,runValidation,
  handleUpdateProduct
);

// DELETE product by slug
productRoute.delete("/:id",attachUser,isAdmin, handleDeleteProduct);

// POST check stock for multiple products
productRoute.post("/stock",attachUser,isAdmin, handleGetStock);

// // POST buy product (decrease stock & increase sold)
// productRoute.post("/buy", handleBuyProduct); 
// // 👆 protected: only logged-in users can buy

module.exports = productRoute;
