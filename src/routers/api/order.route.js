const express = require("express");
const orderRouter = express.Router();
const { addOrder, getMyOrders, getOrderById } = require("../../controller/orderController");
const { isAdmin } = require("../../middlewares/auth");
const attachUser = require("../../middlewares/validators/attachUser");

// Create new order
orderRouter.post("/",attachUser, addOrder);

// Get logged-in user's orders
orderRouter.get("/",attachUser,isAdmin, getMyOrders);

// Get order by ID
orderRouter.get("/:id",attachUser, getOrderById);

module.exports = orderRouter;
