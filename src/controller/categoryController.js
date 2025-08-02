const createError = require('http-errors')
const Category = require("../models/categoryModel")
const { successRespons } = require("./respones.controller")
const { createCategoryServices, deleteCategoryServices, updateCategoryServices } = require('../services/categoryServices')


// GET vew categroy
const handleGetCategory = async (req,res,next)=>{
    const category = await Category.find({}).select('name slug').lean()
    // success response
    successRespons(res,{
        statusCode:200,
        message:"vew all category",
        paylod:category
    })
}

// GET vew single categroy
const handleGetSingleCategory = async (req,res,next)=>{
    const {slug} = req.params
    const singleCategory = await Category.find({slug:slug})
    if(!singleCategory){
        throw createError(400,'Invalid product')
    }
    // success response
    successRespons(res,{
        statusCode:200,
        message:`vew single category`,
        paylod:singleCategory
    })
}

// POST create category
const handleCreateCategory = async(req,res,next)=>{
   try {
    const {name} = req.body
    const newCategory = await createCategoryServices(name)
    // success Respons
   return successRespons(res,{
        statusCode:200,
        message:'new category create successfull',
        paylod:newCategory
    })

   } catch (error) {
       next(error)
   }
}

// POST update category
const handleUpdateCategory = async(req,res,next)=>{
    try {
     const {name} = req.body
     const {slug} = req.params

     const updateCategory = await updateCategoryServices(slug,name)
     if(!updateCategory){
        throw createError(400,'not category update')
     }
     // success Respons
    return successRespons(res,{
         statusCode:201,
         message:'category update successfull',
         paylod:updateCategory
     })
 
    } catch (error) {
        next(error)
    }
 }

 // POST update category
const handleDeleteCategory = async(req,res,next)=>{
    try {
     const {slug} = req.params
     const deleteCategory = await deleteCategoryServices(slug)
     console.log('item',deleteCategory);
     if(!deleteCategory){
        throw createError(400,'category not delete')
     }
     // success Respons
    return successRespons(res,{
         statusCode:201,
         message:'category delete successfull',
         paylod:deleteCategory
     })
 
    } catch (error) {
        next(error)
    }
 }


module.exports = {
    handleGetCategory,
    handleGetSingleCategory,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory
}