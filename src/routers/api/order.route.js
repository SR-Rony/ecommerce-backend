const express = require("express");
const orderRouter = express.Router();
const { protect } = require("../../middlewares/authMeddleware");
const { addOrder, getMyOrders, getOrderById } = require("../../controller/orderController");
const { isLoggedIn } = require("../../middlewares/auth");

// Create new order
orderRouter.post("/",isLoggedIn, addOrder);

// Get logged-in user's orders
orderRouter.get("/myorders",isLoggedIn, getMyOrders);

// Get order by ID
orderRouter.get("/:id", getOrderById);

module.exports = orderRouter;
