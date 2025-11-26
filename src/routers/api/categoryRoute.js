const express = require('express')
const { handleCreateCategory, handleGetSingleCategory, handleGetCategory, handleUpdateCategory, handleDeleteCategory } = require('../../controller/categoryController')
const { validateCategory } = require('../../middlewares/validators/category')
const runValidation = require('../../middlewares/validators')
const { isAdmin } = require('../../middlewares/auth')
const attachUser = require('../../middlewares/validators/attachUser')
const categoryRoute = express.Router()

//GET localhost:400/api/v1/category
categoryRoute.get("/",handleGetCategory)

//GET localhost:400/api/v1/category:slug
categoryRoute.get("/:slug",handleGetSingleCategory)

//POST localhost:400/api/v1/category
categoryRoute.post("/",attachUser,isAdmin,validateCategory,runValidation,handleCreateCategory)

//update localhost:400/api/v1/category/:slug
categoryRoute.post("/:slug",validateCategory,runValidation,attachUser,isAdmin,handleUpdateCategory)

//delete localhost:400/api/v1/category/:slug
categoryRoute.delete("/:slug",attachUser,isAdmin,handleDeleteCategory)


module.exports = categoryRoute