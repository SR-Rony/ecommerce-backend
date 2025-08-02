const express = require('express')
const { handleCreateCategory, handleGetSingleCategory, handleGetCategory, handleUpdateCategory, handleDeleteCategory } = require('../../controller/categoryController')
const { validateCategory } = require('../../middlewares/validators/category')
const runValidation = require('../../middlewares/validators')
const { isLoggedIn, isAdmin } = require('../../middlewares/auth')
const categoryRoute = express.Router()

//GET localhost:400/api/v1/category
categoryRoute.get("/",handleGetCategory)

//GET localhost:400/api/v1/category:slug
categoryRoute.get("/:slug",handleGetSingleCategory)

//POST localhost:400/api/v1/category
categoryRoute.post("/",validateCategory,runValidation,isLoggedIn,isAdmin,handleCreateCategory)

//update localhost:400/api/v1/category/:slug
categoryRoute.post("/:slug",validateCategory,runValidation,isLoggedIn,isAdmin,handleUpdateCategory)
//delete localhost:400/api/v1/category/:slug
categoryRoute.delete("/:slug",isLoggedIn,isAdmin,handleDeleteCategory)


module.exports = categoryRoute