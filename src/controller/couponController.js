const Coupon = require("../models/couponModel");

// ✅ Create new coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Get all coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update coupon
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Apply coupon
const applyCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;

  try {
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ message: `Minimum purchase ${coupon.minPurchase}` });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    const finalTotal = cartTotal - discount;

    res.json({
      success: true,
      discount,
      finalTotal
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon
};
