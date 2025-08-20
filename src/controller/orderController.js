const Order = require("../models/orderModel");
const { successRespons } = require("./respones.controller");

// @desc   Create new order
// @route  POST /api/orders
// @access Private (logged-in users only)
const addOrder = async (req, res, next) => {
  
  try {
    const {
      userId,
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

    console.log(req.body);
    

    const order = new Order({
      user: userId, // comes from auth middleware
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    // res.status(201).json(createdOrder);
    return successRespons(res, {
      statusCode: 201,
      message: "Order successfull  created",
      payload: {order:createdOrder},
    });
  } catch (error) {
    console.error("Add Order Error:", error);
    next(error)
  }
};

// @desc   Get logged-in user's orders
// @route  GET /api/orders/myorders
// @access Private
const getMyOrders = async (req, res, next) => {
  try {
    // const orders = await Order.find({ user: req.user._id });
    const orders = await Order.find();
    return successRespons (res,{
      statusCode:201,
      message : 'All order',
      payload :orders
    })
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
    const order = await Order.findById(req.params.id).populate(
      "user", // <-- match schema field
      "name email"
    );

    console.log("backend order", order);

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
