const express = require("express");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");
const { createCoupon, getCoupons, updateCoupon, deleteCoupon, applyCoupon } = require("../../controller/couponController");

const couponRouter = express.Router();

// Admin routes
couponRouter.post("/", isLoggedIn, isAdmin, createCoupon);
couponRouter.get("/", isLoggedIn, isAdmin, getCoupons);
couponRouter.put("/:id", isLoggedIn, isAdmin, updateCoupon);
couponRouter.delete("/:id", isLoggedIn, isAdmin, deleteCoupon);

// User route
couponRouter.post("/apply", isLoggedIn, applyCoupon);

module.exports = couponRouter;
