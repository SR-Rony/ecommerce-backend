const express = require("express");
const orderRouter = express.Router();
const { addOrder, getMyOrders, getOrderById } = require("../../controller/orderController");
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

// Create new order
orderRouter.post("/", addOrder);

// Get logged-in user's orders
orderRouter.get("/",isLoggedIn, isAdmin, getMyOrders);

// Get order by ID
orderRouter.get("/:id", getOrderById);

module.exports = orderRouter;
