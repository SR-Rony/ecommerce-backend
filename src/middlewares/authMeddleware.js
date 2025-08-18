// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const { jwtAccessKey } = require("../secrit");

const protect = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken; // check cookie first

    console.log(token);
    

    // fallback: Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, jwtAccessKey);
    req.user = await Users.findById(decoded.id).select("-password");

    if (!req.user) return res.status(401).json({ message: "User not found" });

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
