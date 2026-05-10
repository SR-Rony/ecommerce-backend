const createError = require("http-errors");
const slugify = require("slugify");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const slugOpts = { lower: true, strict: true, trim: true };

const createCategoryServices = async (name) => {
  const trimmed = String(name).trim();
  return Category.create({ name: trimmed });
};

const updateCategoryServices = async (slug, name) => {
  const trimmed = String(name).trim();
  const newSlug = slugify(trimmed, slugOpts);

  const existing = await Category.findOne({ slug });
  if (!existing) {
    throw createError(404, "Category not found");
  }

  try {
    return await Category.findOneAndUpdate(
      { slug },
      { $set: { name: trimmed, slug: newSlug } },
      { new: true, runValidators: true }
    );
  } catch (err) {
    if (err && err.code === 11000) {
      throw createError(409, "A category with this name or slug already exists");
    }
    throw err;
  }
};

const deleteCategoryServices = async (slug) => {
  const category = await Category.findOne({ slug });
  if (!category) {
    return null;
  }

  const inUse = await Product.exists({ categoryId: category._id });
  if (inUse) {
    throw createError(
      409,
      "Cannot delete category: one or more products still use this category"
    );
  }

  await Category.deleteOne({ _id: category._id });
  return category;
};

module.exports = {
  createCategoryServices,
  updateCategoryServices,
  deleteCategoryServices,
};
