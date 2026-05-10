const createError = require("http-errors");
const Category = require("../models/categoryModel");
const { successRespons } = require("./respones.controller");
const {
  createCategoryServices,
  deleteCategoryServices,
  updateCategoryServices,
} = require("../services/categoryServices");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const handleGetCategory = async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const filter =
      search.length > 0
        ? { name: { $regex: escapeRegex(search), $options: "i" } }
        : {};

    const categories = await Category.find(filter).select("name slug").sort({ name: 1 }).lean();

    return successRespons(res, {
      statusCode: 200,
      message: "Categories fetched successfully",
      payload: categories,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const singleCategory = await Category.findOne({ slug }).lean();

    if (!singleCategory) {
      throw createError(404, "Category not found");
    }

    return successRespons(res, {
      statusCode: 200,
      message: "Category fetched successfully",
      payload: singleCategory,
    });
  } catch (error) {
    next(error);
  }
};

const handleCreateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || String(name).trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Category name must be at least 3 characters",
      });
    }

    try {
      const newCategory = await createCategoryServices(name);
      return successRespons(res, {
        statusCode: 201,
        message: "New category created successfully",
        payload: newCategory,
      });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A category with this name or slug already exists",
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const handleUpdateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { slug } = req.params;

    const updateCategory = await updateCategoryServices(slug, name);

    return successRespons(res, {
      statusCode: 200,
      message: "Category updated successfully",
      payload: updateCategory,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug || !slug.trim()) {
      throw createError(400, "Category slug is required");
    }

    const deletedCategory = await deleteCategoryServices(slug.trim());

    if (!deletedCategory) {
      throw createError(404, "Category not found");
    }

    return successRespons(res, {
      statusCode: 200,
      message: "Category deleted successfully",
      payload: deletedCategory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetCategory,
  handleGetSingleCategory,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
};
