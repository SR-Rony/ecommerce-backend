const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { successRespons } = require("./respones.controller");

// @desc   Create new order
// @route  POST /api/orders
// @access Private (logged-in users only)
const addOrder = async (req, res, next) => {
  try {
    // 🔒 Login check
    if (!req.user) {
      console.log("req user",req.user);
      return res.status(401).json({ message: "Login required to place order" });
      
    }

    const session = await Product.startSession();
    session.startTransaction();

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // ✅ Stock decrease atomically
    for (const item of orderItems) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: item.qty } },
        { $inc: { quantity: -item.qty, sold: item.qty } },
        { new: true, session }
      );

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Not enough stock for product ${item.productId}`,
        });
      }
    }

    // ✅ Create order with logged-in user only
    const order = new Order({
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      user: req.user._id, // logged-in user
    });

    const createdOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      statusCode: 201,
      message: "Order successfully created",
      payload: { order: createdOrder },
    });
  } catch (error) {
    console.error("Add Order Error:", error);
    next(error);
  }
};

// @desc   Get logged-in user's orders
// @route  GET /api/orders/myorders
// @access Private
const getMyOrders = async (req, res, next) => {
  try {
    // TODO: filter by logged-in user when auth is ready
    const orders = await Order.find();
    return successRespons(res, {
      statusCode: 200,
      message: "All orders",
      payload: orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc   Get order by ID
// @route  GET /api/orders/:id
// @access Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id); // ❌ removed populate("user")

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addOrder, getMyOrders, getOrderById };
