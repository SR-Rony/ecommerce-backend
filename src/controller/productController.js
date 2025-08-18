const createError = require("http-errors")
const  slugify = require("slugify")
const Product = require("../models/productModel")
const { successRespons } = require("./respones.controller")
const { createProductServices, updateProductServices } = require("../services/productServices")
const deleteImg = require("../helper/deleteImages")
const { cloudinaryHelper, deleteCloudinaryImage } = require("../helper/cloudinaryHelper")
const cloudinary = require("../config/cloudinary")

// handle GET product
const handleVewProduct = async (req, res, next) => {
  try {
    const allProducts = await Product.find().populate("categoryId").sort({ createdAt: -1 });

    if (!allProducts) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "All products fetched successfully",
      payload: {
        products: allProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// handle GET product
const handleVewSingleProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;

    console.log("Fetching product with slug:", slug);
    

    const singleProduct = await Product.findOne({ slug }).populate("categoryId");

    if (!singleProduct) {
      throw createError(404, "Product not found");
    }

    // success response
    return successRespons(res, {
      statusCode: 200,
      message: "Product fetched successfully",
      payload: singleProduct,
    });
  } catch (error) {
    next(error);
  }
};

// handle create product
const handleCreateProduct = async (req, res, next) => {
  try {
    const { name, description, price, quantity, shipping, categoryId } = req.body;
    const file = req.file;

    if (!name || !description || !price || !quantity || !categoryId) {
      throw createError(400, "All required fields must be filled.");
    }

    const productExists = await Product.exists({ name });
    if (productExists) {
      throw createError(409, "Product name already exists");
    }

    if (!file) {
      throw createError(400, "Image file is required");
    }

    if (file.size > 1024 * 1024 * 2) {
      // 2MB max
      throw createError(400, "File too large. Max size is 2MB");
    }

    let imageUrl = file.path; // default: local file path

    // OPTIONAL: Upload to Cloudinary if needed
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "mernEcommerce/product",
    });
    imageUrl = result.secure_url;

    const newProduct = await Product.create({
      name,
      slug: slugify(name),
      description,
      price,
      quantity,
      shipping: shipping === "1" || shipping === true, // ensure boolean
      image: imageUrl,
      categoryId,
    });

    return successRespons(res, {
      statusCode: 201,
      message: "Product was created successfully",
      payload: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

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