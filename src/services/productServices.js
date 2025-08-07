const createError = require("http-errors")
const  slugify = require("slugify")
const Product = require("../models/productModel")
const deleteImg = require("../helper/deleteImages")
const cloudinary = require("../config/cloudinary")
const { cloudinaryHelper, deleteCloudinaryImage } = require("../helper/cloudinaryHelper")

// create category service


const createProductServices = async (
  name,
  description,
  price,
  quantity,
  shipping,
  categoryId,
  image // assume this is already an image URL or handled elsewhere
) => {
    
    // Check if product with the same name already exists to avoid duplicates
    // const productExists = await Product.exists({ name: name });
    // if (productExists) {
    //     throw createError(409, "Product name already exists");
    // }
    
    console.log("message", name, description, price, quantity, shipping, categoryId, image);
  let imageUrl = image;

  // Skip uploading to Cloudinary; just save the image as provided

  console.log("ami3");

  // Create the new product document in MongoDB
  const newProduct = await Product.create({
    name: name,
    slug: slugify(name),
    description: description,
    price: price,
    quantity: quantity,
    shipping: shipping,
    image: imageUrl,
    categoryId: categoryId,
  });

  console.log("ami4");

  return newProduct;
};











// const createProductServices = async (
//   name,
//   description,
//   price,
//   quantity,
//   shipping,
//   categoryId,
//   image // expected to be a local file path or base64 data?
// ) => {
//     console.log("ami2");
    
//   // Check if product with the same name already exists to avoid duplicates
//   const productExists = await Product.exists({ name: name });
//   if (productExists) {
//     throw createError(409, "Product name already exists");
//   }

//   let imageUrl = image;
//   log("Image URL before upload:", imageUrl);
//   // If there is an image file (probably a local file path or base64 string),
//   // upload it to Cloudinary and get the secure URL
//   if (image) {
//     const response = await cloudinary.uploader.upload(image, {
//       folder: "mernEcommerce/product",
//     });
//     imageUrl = response.secure_url; // get the URL from Cloudinary response
//   }
// console.log('ami3');

//   // Create the new product document in MongoDB
//   const newProduct = await Product.create({
//     name: name,
//     slug: slugify(name), // generate a URL-friendly slug from product name
//     description: description,
//     price: price,
//     quantity: quantity,
//     shipping: shipping, // expected boolean or number (1/0)
//     image: imageUrl,
//     categoryId: categoryId,
//   });

//   console.log('ami4');
  

//   return newProduct;
// };


// create category service
const updateProductServices = async (req,slug)=>{
    try {
    let updateOptions = {new:true,runValidation:true,context:"query"}
    const product = await Product.findOne({slug:slug})
    let updates ={} //update object

    // input req.body all key
    for(let key in req.body){
        console.log(key);
        if(["name","description","price","quantity","shipping","quantity"].includes(key)){
            updates[key]= req.body[key]
        }
    }

    if(updates.name){
        updates.slug = slugify(updates.name)
    }

    const updateImage = req.file?.path;// images path
    if(updateImage){
        if(updateImage.size > 1024 * 1024 * 2){
            throw createError(409,"file to large. It must be less than  2MB")
        }
            const respons = await cloudinary.uploader.upload(updateImage,{
                folder:"mernEcommerce/product"
            })
            updates.image = respons.secure_url
        
        // updates.image=updateImage //images update
    }
    // user update
    const productUpdate = await Product.findOneAndUpdate({slug},updates,updateOptions)

    if(!productUpdate){
        throw createError(404,"Product not exsist")
    }

    if(product && product.image){

        const cloudImageId = await cloudinaryHelper(product.image);
        // cloudinary image delete helper
        await deleteCloudinaryImage("mernEcommerce/product",cloudImageId,"Product")
    }
    // product.image!=="default.png" && deleteImg(product.image) //images delete



    return productUpdate
        
    } catch (error) {
        throw error
    }
}


module.exports = {
    createProductServices,
    updateProductServices
}