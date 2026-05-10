const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { successRespons } = require("./respones.controller");

const addOrder = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Login required to place order" });
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    for (const item of orderItems) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ success: false, message: "Invalid product id in order items" });
      }
      const qty = Number(item.qty);
      if (!Number.isFinite(qty) || qty < 1) {
        return res.status(400).json({ success: false, message: "Each item must have qty >= 1" });
      }
    }

    let session = null;
    try {
      session = await Product.startSession();
      session.startTransaction();

      for (const item of orderItems) {
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, quantity: { $gte: item.qty } },
          { $inc: { quantity: -item.qty, sold: item.qty } },
          { new: true, session }
        );

        if (!product) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Not enough stock for product ${item.productId}`,
          });
        }
      }

      const order = new Order({
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        user: req.user._id,
      });

      const createdOrder = await order.save({ session });

      await session.commitTransaction();

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: "Order successfully created",
        payload: { order: createdOrder },
      });
    } catch (err) {
      if (session) await session.abortTransaction().catch(() => {});
      throw err;
    } finally {
      if (session) session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return successRespons(res, {
      statusCode: 200,
      message: "Your orders",
      payload: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return successRespons(res, {
      statusCode: 200,
      message: "All orders",
      payload: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isAdmin = req.user.role === "admin";
    const owner = order.user && String(order.user) === String(req.user._id);
    if (!isAdmin && !owner) {
      return res.status(403).json({ success: false, message: "Not allowed to view this order" });
    }

    return res.status(200).json({ success: true, payload: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrder,
  getUserOrders,
  getAdminOrders,
  getOrderById,
};
