const createError = require("http-errors")
const  slugify = require("slugify")
const Product = require("../models/productModel")
const { successRespons } = require("./respones.controller")
const { createProductServices, updateProductServices } = require("../services/productServices")
const deleteImg = require("../helper/deleteImages")
const { cloudinaryHelper, deleteCloudinaryImage } = require("../helper/cloudinaryHelper")
const cloudinary = require("../config/cloudinary")

// handle GET product
const handleVewProduct = async(req,res,next)=>{
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1 ;
        const limit = parseInt(req.query.page) || 4;

        const searchRegexp = new RegExp('.*'+search+'.*',"i")
        // user filter
        const filter = {
            $or : [
                {name: {$regex:searchRegexp}},
            ]
        }

        const allProducts = await Product.find(filter)
        .populate('categoryId')
        .skip((page-1)*limit)
        .limit(limit)
        .sort({createdAt: -1})

        if(!allProducts){
            throw createError(404,'Product not found')
        }


        const count = await Product.find(filter).countDocuments()
         // success response message
         return successRespons(res,{
            statusCode:201,
            message:'All product vew successfull',
            paylod:{
                products:allProducts,
                pagitaion:{
                    totalPages: Math.ceil(count/limit),
                    currentPage:page,
                    prevPage:page-1,
                    nextPage:page+1,
                    totalProduct:count
                }
            }
        })
    } catch (error) {
        next(error)   
    }
}

// handle GET product
const handleVewSingleProduct = async(req,res,next)=>{
    try {
        const {slug} = req.params
        const singleProduct = await Product.findOne({slug:slug}).populate('categoryId')
        if(!singleProduct){
            throw createError(404,'Product not found')
        }
         // success response message
         return successRespons(res,{
            statusCode:201,
            message:'product vew successfull',
            paylod:singleProduct
        })
    } catch (error) {
        next(error)   
    }
}

// handle create product
const handleCreateProduct = async (req,res,next)=>{
    res.send('new product')
    try {
        const {name,description,price,quantity,shipping,categoryId}=req.body
        const image = req.file?.path; //images path
        if(!image){
            throw createError(409,"images file is require")
        }
        if(image > 1024 * 1024 * 2){
            throw createError(409,"file to large. It must be less than  2MB")
        }

        const newProduct = await createProductServices(name,description,price,quantity,shipping,categoryId,image)
        
        // success response message
        return successRespons(res,{
            statusCode:201,
            message:'Product was create successfull',
            paylod:newProduct
        })
    } catch (error) {
        next(error)
    }



}

// handle create product
const handleUpdateProduct = async (req,res,next)=>{
    try {
        const {slug}=req.params
        const updateProduct = await updateProductServices(req,slug)
        console.log('updatedsfd',updateProduct);
        // success response message
        return successRespons(res,{
            statusCode:201,
            message:'Product update successfull',
            paylod:updateProduct
        })
    } catch (error) {
        next(error)
    }
}

// handle delete product
const handleDeleteProduct = async(req,res,next)=>{
    try {
        const {slug} = req.params
        const deleteProduct = await Product.findOneAndDelete({slug:slug});

        if(!deleteProduct){
            throw createError(404,'Product not found')
        }

        if(deleteProduct && deleteProduct.image){

            const cloudImageId = await cloudinaryHelper(deleteProduct.image);
            // cloudinary image delete helper
            await deleteCloudinaryImage("mernEcommerce/product",cloudImageId,"Product")
        }
        
        if(deleteProduct.image){
            await deleteImg(deleteProduct.image)
        }
         // success response message
         return successRespons(res,{
            statusCode:201,
            message:'product delete successfull',
            paylod:deleteProduct
        })
    } catch (error) {
        next(error)   
    }
}


module.exports = {
    handleVewProduct,
    handleVewSingleProduct,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct
}