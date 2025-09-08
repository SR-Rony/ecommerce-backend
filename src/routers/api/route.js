const route = require("express").Router()
const authRoute = require("./auth.route")
const categoryRoute = require("./categoryRoute")
const orderRouter = require("./order.route")
const productRoute = require("./productRoute")
const seedRoute = require("./seed.route")
const userRoute = require("./user.route")

// user route
route.use("/user",userRoute) //localhost:4000/api/user

// auth route
route.use("/auth",authRoute) //localhost:4000/api/auth

// seeduser route
route.use("/seeduser",seedRoute) //localhost:4000/api/seeduser

// category router
route.use("/category",categoryRoute) //localhost:4000/api/category

// Product router
route.use("/product",productRoute) //localhost:4000/api/product

//order router
route.use("/orders",orderRouter) //localhost:4000/api/orders


module.exports = route