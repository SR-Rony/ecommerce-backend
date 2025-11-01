const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const { successRespons } = require("./respones.controller");
const bcrypt = require("bcryptjs");
const { createJsonWebToken } = require("../helper/jsonwebtoken");
const { cfg } = require("../config/env");

//============ user login ============
const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email }).select("+password");
    if (!user) throw createError(404, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw createError(401, "Invalid password");

    const accessToken = createJsonWebToken({ id: user._id }, cfg.JWT_ACCESS_KEY, "15m");
    const refreshToken = createJsonWebToken({ id: user._id }, cfg.JWT_REFRESH_KEY, "7d");

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    // Set Cookies
    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({
      statusCode: 200,
      message: "User login successful",
      payload: { user: userWithoutPassword },
    });
  } catch (err) {
    next(err);
  }
};


//============ refresh token ============
const handleRefreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) throw createError(401, "No refresh token provided.");

    const decoded = jwt.verify(oldRefreshToken, cfg.JWT_REFRESH_KEY);
    if (!decoded?.id) throw createError(401, "Invalid refresh token.");

    const newAccessToken = createJsonWebToken({ id: decoded.id }, cfg.JWT_ACCESS_KEY, "15m");

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      statusCode: 200,
      message: "New access token created successfully",
      payload: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
};


//============ protected route ============
const handleProtected = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw createError(401, "No access token found.");

    const decoded = jwt.verify(accessToken, cfg.JWT_ACCESS_KEY);
    if (!decoded?.id) throw createError(401, "Invalid access token.");

    return res.status(200).json({
      statusCode: 200,
      message: "Protected access successful",
      payload: { userId: decoded.id },
    });
  } catch (error) {
    next(error);
  }
};


//============ logout ============
const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    return successRespons(res, {
      statusCode: 200,
      message: "User logout successful",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleProtected,
};
