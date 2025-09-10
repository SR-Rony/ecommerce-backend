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

    const accessToken = createJsonWebToken(
      { id: user._id },
      cfg.JWT_ACCESS_KEY,
      "1d"
    );
    const refreshToken = createJsonWebToken(
      { id: user._id },
      cfg.JWT_REFRESH_KEY,
      "7d"
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/", // ✅ cookie available everywhere
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password before sending user data
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return successRespons(res, {
      statusCode: 200,
      message: "User login successful",
      payload: {
        user: userWithoutPassword,
        accessToken, // send if frontend needs
        refreshToken, // optional
      },
    });
  } catch (err) {
    next(err);
  }
};

//============ user logout ============ 
const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return successRespons(res, {
      statusCode: 200,
      message: "User logout successfully",
    });
  } catch (error) {
    next(error);
  }
};

//============ user refresh token ============ 
const handleRefreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      throw createError(401, "No refresh token provided. Please login again.");
    }

    const decodedToken = jwt.verify(oldRefreshToken, cfg.JWT_REFRESH_KEY);

    if (!decodedToken || !decodedToken.id) {
      throw createError(401, "Invalid refresh token. Please login again.");
    }

    // ✅ create new access token
    const accessToken = createJsonWebToken(
      { id: decodedToken.id },
      cfg.JWT_ACCESS_KEY,
      "15m"
    );

    res.cookie("accessToken", accessToken, {
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    return successRespons(res, {
      statusCode: 200,
      message: "New access token created successfully",
      payload: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

//============ user protected route ============ 
const handleProtected = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw createError(401, "No access token. Please login.");
    }

    const decoded = jwt.verify(accessToken, cfg.JWT_ACCESS_KEY);

    if (!decoded) {
      throw createError(401, "Invalid access token. Please login again.");
    }

    return successRespons(res, {
      statusCode: 200,
      message: "Protected access successful",
      payload: { userId: decoded.id },
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
