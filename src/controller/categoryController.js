const createError = require('http-errors')
const Category = require("../models/categoryModel")
const { successRespons } = require("./respones.controller")
const { createCategoryServices, deleteCategoryServices, updateCategoryServices } = require('../services/categoryServices')


// GET vew categroy
const handleGetCategory = async (req, res, next) => {
  try {
    const search = req.query.search || "";

    const categories = await Category.find({
      name: { $regex: search, $options: "i" } // case-insensitive search
    })
      .select("name slug")
      .lean();

    return successRespons(res, {
      statusCode: 200,
      message: "View all categories",
      payload: categories,
    });

  } catch (error) {
    next(error);
  }
};

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
const handleCreateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        statusCode: 400,
        message: "Category name must be at least 3 characters",
      });
    }

    const newCategory = await createCategoryServices(name);

    return successRespons(res, {
      statusCode: 201,
      message: "New category created successfully",
      payload: newCategory,
    });

  } catch (error) {
    next(error);
  }
};


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
const handleDeleteCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError(400, 'Category slug is required');
    }

    const deletedCategory = await deleteCategoryServices(slug);

    console.log('Deleted category:', deletedCategory);

    if (!deletedCategory) {
      throw createError(404, 'Category not found or already deleted');
    }

    // Success Response
    return successRespons(res, {
      statusCode: 200,
      message: 'Category deleted successfully',
      payload: deletedCategory,
    });

  } catch (error) {
    next(error);
  }
};



module.exports = {
    handleGetCategory,
    handleGetSingleCategory,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory
}