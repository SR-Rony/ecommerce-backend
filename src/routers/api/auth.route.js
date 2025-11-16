const express = require("express");
const { handleLogin, handleLogout } = require("../../controller/authController");
const runValidation = require("../../middlewares/validators");
const authRoute = express.Router()

authRoute.post("/login",handleLogin)
authRoute.post("/logout",handleLogout)

module.exports = authRoute;