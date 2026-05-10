const express = require("express");
const { isAdmin } = require("../../middlewares/auth");
const attachUser = require("../../middlewares/validators/attachUser");
const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require("../../controller/couponController");

const couponRouter = express.Router();

const adminCoupon = [attachUser, isAdmin];

couponRouter.post("/", ...adminCoupon, createCoupon);
couponRouter.get("/", ...adminCoupon, getCoupons);
couponRouter.put("/:id([0-9a-fA-F]{24})", ...adminCoupon, updateCoupon);
couponRouter.delete("/:id([0-9a-fA-F]{24})", ...adminCoupon, deleteCoupon);

couponRouter.post("/apply", applyCoupon);

module.exports = couponRouter;
