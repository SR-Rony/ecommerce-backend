const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    // 🧍‍♂️ Guest info (login না করলেও order দিতে পারবে)
    guest: {
      name: { type: String, required: false },
      phone: { type: String, required: false },
      email: { type: String },
    },

    // 🧳 মূল order data
    orderItems: [orderItemSchema],

    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      upazila: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash on Delivery", "Stripe", "Bkash"],
      default: "Cash on Delivery",
    },

    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },

    // 🔒 Future use: যদি কখনও login system আসে
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
