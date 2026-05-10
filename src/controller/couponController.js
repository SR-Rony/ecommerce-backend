const Coupon = require("../models/couponModel");

const COUPON_UPDATE_FIELDS = [
  "code",
  "discountType",
  "discountValue",
  "minPurchase",
  "expiryDate",
  "isActive",
];

const pickCouponUpdates = (body) => {
  const updates = {};
  if (!body || typeof body !== "object") return updates;
  for (const key of COUPON_UPDATE_FIELDS) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  return updates;
};

const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;

    const coupon = await Coupon.create({
      code: String(code).trim(),
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }
    next(error);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: "Coupon id is required" });
    }

    const updates = pickCouponUpdates(req.body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    if (updates.code !== undefined) {
      updates.code = String(updates.code).trim();
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    next(error);
  }
};

const applyCoupon = async (req, res, next) => {
  const { code, cartTotal } = req.body;

  try {
    if (code === undefined || code === null || String(code).trim() === "") {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }
    const total = Number(cartTotal);
    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({ success: false, message: "Valid cartTotal is required" });
    }

    const coupon = await Coupon.findOne({ code: String(code).trim(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon" });

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }

    if (total < coupon.minPurchase) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Minimum purchase ${coupon.minPurchase}`,
        });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (total * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, total);
    const finalTotal = Math.max(0, total - discount);

    res.json({
      success: true,
      discount,
      finalTotal,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
