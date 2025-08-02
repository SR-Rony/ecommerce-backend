const express = require("express");
const { handleRefreshToken, handleProtected, handleLogin, handleLogout } = require("../../controller/authController");
const { isLoggedIn, isLoggedOut } = require("../../middlewares/auth");
const runValidation = require("../../middlewares/validators");
const authRoute = express.Router()

authRoute.post("/login",isLoggedOut,handleLogin)
authRoute.get("/refresh-token",handleRefreshToken)
authRoute.get("/protected",handleProtected)
authRoute.post("/logout",isLoggedIn,handleLogout)

module.exports = authRoute;