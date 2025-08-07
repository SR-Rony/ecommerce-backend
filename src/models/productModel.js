const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true,
      minlength: [3, "Product name must be at least 3 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      validate: {
        validator: (v) => v > 0,
        message: (props) => `${props.value} is not a valid price!`,
      },
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      validate: {
        validator: (v) => v >= 0,
        message: (props) => `${props.value} is not a valid quantity!`,
      },
    },
    sold: {
      type: Number,
      default: 0,
      validate: {
        validator: (v) => v >= 0,
        message: (props) => `${props.value} is not a valid sold quantity!`,
      },
    },
    shipping: {
      type: Number,
      default: 0,
      validate: {
        validator: (v) => v >= 0,
        message: (props) => `${props.value} is not a valid shipping cost!`,
      },
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  { timestamps: true }
);

const Product = model("Product", productSchema);
module.exports = Product;
