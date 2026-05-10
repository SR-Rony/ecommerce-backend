const createError = require("http-errors");
const mongoose = require("mongoose");
const slugify = require("slugify");
const Product = require("../models/productModel");

const slugOpts = { lower: true, strict: true, trim: true };

const ALLOWED_UPDATE_KEYS = [
  "name",
  "description",
  "price",
  "quantity",
  "shipping",
  "categoryId",
];

const parseShippingUpdate = (val) => {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "boolean") return val ? 1 : 0;
  const n = parseFloat(val);
  if (!Number.isFinite(n) || n < 0) {
    throw createError(422, "Invalid shipping value");
  }
  return n;
};

const coerceUpdateValue = (key, raw) => {
  switch (key) {
    case "price": {
      const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
      if (!Number.isFinite(n) || n <= 0) {
        throw createError(422, "Price must be greater than zero");
      }
      return n;
    }
    case "quantity": {
      const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        throw createError(422, "Quantity must be zero or greater");
      }
      return n;
    }
    case "shipping":
      return parseShippingUpdate(raw);
    case "categoryId": {
      if (!mongoose.Types.ObjectId.isValid(raw)) {
        throw createError(422, "Invalid category id");
      }
      return raw;
    }
    case "description": {
      const s = String(raw).trim();
      if (!s.length) throw createError(422, "Description cannot be empty");
      return s;
    }
    case "name": {
      const s = String(raw).trim();
      if (s.length < 3) {
        throw createError(422, "Product name must be at least 3 characters");
      }
      return s;
    }
    default:
      return raw;
  }
};

const createProductServices = async (
  name,
  description,
  price,
  quantity,
  shipping,
  categoryId,
  image
) => {
  return Product.create({
    name,
    slug: slugify(name, slugOpts),
    description,
    price,
    quantity,
    shipping,
    image,
    categoryId,
  });
};

const updateProductServices = async (req, slug) => {
  const product = await Product.findOne({ slug });
  if (!product) {
    throw createError(404, "Product does not exist");
  }

  const updates = {};

  for (const key of ALLOWED_UPDATE_KEYS) {
    if (!(key in req.body) || req.body[key] === undefined) continue;

    updates[key] = coerceUpdateValue(key, req.body[key]);
  }

  if (updates.name) {
    updates.slug = slugify(updates.name, slugOpts);
  }

  const productUpdate = await Product.findOneAndUpdate({ slug }, updates, {
    new: true,
    runValidators: true,
  }).populate("categoryId");

  if (!productUpdate) {
    throw createError(404, "Product does not exist");
  }

  return productUpdate;
};

module.exports = {
  createProductServices,
  updateProductServices,
};
