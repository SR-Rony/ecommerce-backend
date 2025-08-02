const multer = require("multer")
const path = require("path")
const createError = require("http-errors")
const { userUplodDir, productUplodDir, fileSize, fileTypes } = require("../config")


// userr images upload storage
const userStorage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //   cb(null, userUplodDir)
    // },
    filename: function (req, file, cb) {
        // const extname=path.extname(file.originalname)
      // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, Date.now() + '-' + file.originalname)
    }
  })

  // product images upload storage
  const productStorage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //   cb(null, productUplodDir)
    // },
    filename: function (req, file, cb) {
        // const extname=path.extname(file.originalname)
      // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, Date.now() + '-' + file.originalname)
    }
  })



  const fileFileter =(req,file,cb)=>{
    const extname =  path.extname(file.originalname);
    if(!fileTypes.includes(file.mimetype)){
      return cb(new Error("file typr is not allowed"),false)
    }
    cb(null,true)
  }
  
  // upload user image
  const uploadUserImage = multer({ 
    
    storage: userStorage ,
    // limits:{fileSize:fileSize},
    fileFileter:fileFileter,
  })

  // upload product image
  const uploadProductImage = multer({ 
    storage: productStorage ,
    // limits:{fileSize:fileSize},
    fileFileter:fileFileter,
  })
  module.exports = {uploadUserImage,uploadProductImage}