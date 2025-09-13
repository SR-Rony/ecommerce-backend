const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. SAVE10
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true }, // % or fixed amount
  minPurchase: { type: Number, default: 0 }, // optional
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
