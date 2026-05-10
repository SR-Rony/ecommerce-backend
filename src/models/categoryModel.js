const mongoose = require("mongoose");
const slugify = require("slugify");
const { Schema, model } = mongoose;

const slugOpts = { lower: true, strict: true, trim: true };

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [3, "Category name must be at least 3 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, slugOpts);
  }
  next();
});

const Category = model("Category", categorySchema);
module.exports = Category;
