const express = require("express");
const orderRouter = express.Router();
const {
  addOrder,
  getUserOrders,
  getAdminOrders,
  getOrderById,
} = require("../../controller/orderController");
const { isAdmin, requireAuth } = require("../../middlewares/auth");
const attachUser = require("../../middlewares/validators/attachUser");

orderRouter.post("/", attachUser, requireAuth, addOrder);

orderRouter.get("/mine", attachUser, requireAuth, getUserOrders);

orderRouter.get("/admin/all", attachUser, isAdmin, getAdminOrders);

/** Backward-compatible: admins used GET /api/orders for all orders */
orderRouter.get("/", attachUser, isAdmin, getAdminOrders);

orderRouter.get(
  "/:id([0-9a-fA-F]{24})",
  attachUser,
  requireAuth,
  getOrderById
);

module.exports = orderRouter;
