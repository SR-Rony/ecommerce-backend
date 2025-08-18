const route = require("express").Router()
const authRoute = require("./auth.route")
const categoryRoute = require("./categoryRoute")
const orderRouter = require("./order.route")
const productRoute = require("./productRoute")
const seedRoute = require("./seed.route")
const userRoute = require("./user.route")

// user route
route.use("/user",userRoute) //localhost:400/api/v1/users

// auth route
route.use("/auth",authRoute) //localhost:400/api/v1/auth

// seeduser route
route.use("/seeduser",seedRoute) //localhost:400/api/v1/seeduser

// category router
route.use("/category",categoryRoute) //localhost:400/api/v1/category

// Product router
route.use("/product",productRoute) //localhost:400/api/v1/product

//order router
route.use("/orders",orderRouter) //localhost:400/api/v1/product


module.exports = route