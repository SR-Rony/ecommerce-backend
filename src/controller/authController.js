const createError = require("http-errors");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");

const handleLogin = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) throw createError(400, "Phone number and password are required");

    const user = await Users.findOne({ phone: String(phone).trim() }).select("+password");
    if (!user) throw createError(404, "User not found");
    if (!user.isVerified) throw createError(401, "User not verified");
    if (user.isBanned) throw createError(403, "This account has been suspended");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw createError(401, "Invalid password");

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.cookie("user", JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Login successful",
      payload: { user: userWithoutPassword },
    });
  } catch (err) {
    next(err);
  }
};

const handleLogout = (req, res, next) => {
  try {
    res.clearCookie("user", { path: "/" });
    return res.status(200).json({
      statusCode: 200,
      message: "User logout successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleLogin, handleLogout };
