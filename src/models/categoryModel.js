const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [3, "The length of category name must be at least 3 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// Optional: Automatically create slug from name
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

const Category = model("Category", categorySchema);
module.exports = Category;
