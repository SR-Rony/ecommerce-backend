const express = require("express");
const { isAdmin } = require("../../middlewares/auth");
const { createCoupon, getCoupons, updateCoupon, deleteCoupon, applyCoupon } = require("../../controller/couponController");

const couponRouter = express.Router();

// Admin routes
couponRouter.post("/",  isAdmin, createCoupon);
couponRouter.get("/", isAdmin, getCoupons);
couponRouter.put("/:id", isAdmin, updateCoupon);
couponRouter.delete("/:id", isAdmin, deleteCoupon);

// User route
couponRouter.post("/apply", applyCoupon);

module.exports = couponRouter;
