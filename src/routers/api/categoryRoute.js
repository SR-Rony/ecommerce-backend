const express = require("express");
const {
  handleCreateCategory,
  handleGetSingleCategory,
  handleGetCategory,
  handleUpdateCategory,
  handleDeleteCategory,
} = require("../../controller/categoryController");
const { validateCategory } = require("../../middlewares/validators/category");
const runValidation = require("../../middlewares/validators");
const { isAdmin } = require("../../middlewares/auth");
const attachUser = require("../../middlewares/validators/attachUser");

const categoryRoute = express.Router();

const adminCategoryWrite = [attachUser, isAdmin];

categoryRoute.get("/", handleGetCategory);

categoryRoute.post(
  "/",
  ...adminCategoryWrite,
  validateCategory,
  runValidation,
  handleCreateCategory
);

categoryRoute.put(
  "/:slug",
  ...adminCategoryWrite,
  validateCategory,
  runValidation,
  handleUpdateCategory
);

categoryRoute.post(
  "/:slug",
  ...adminCategoryWrite,
  validateCategory,
  runValidation,
  handleUpdateCategory
);

categoryRoute.delete("/:slug", ...adminCategoryWrite, handleDeleteCategory);

categoryRoute.get("/:slug", handleGetSingleCategory);

module.exports = categoryRoute;
