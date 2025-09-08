const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const { cfg } = require("../config/env"); // ✅ use env.js

//============ user is login middleware ============
const isLoggedIn = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    // Also support Bearer token from Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw createError(401, "Access token not found. Please login.");
    }

    const decoded = jwt.verify(token, cfg.JWT_ACCESS_KEY);
    if (!decoded?.id) {
      throw createError(401, "Invalid token");
    }

    const user = await Users.findById(decoded.id).select("-password");
    if (!user) {
      throw createError(401, "User not found");
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    next(err);
  }
};

//============ user is logout middleware ============
const isLoggedOut = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, cfg.JWT_ACCESS_KEY);
        if (decoded) {
          throw createError(400, "User already logged in");
        }
      } catch (error) {
        // token invalid/expired, so continue logout
      }
    }
    next();
  } catch (error) {
    return next(error);
  }
};

//============ admin check middleware ============
const isAdmin = async (req, res, next) => {
  try {
    
    if (!req.user?.isAdmin) {
      throw createError(
        403,
        "Forbidden - you must be an admin to access this resource"
      );
    }
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { isLoggedIn, isLoggedOut, isAdmin };
