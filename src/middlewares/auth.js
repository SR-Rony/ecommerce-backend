const createError = require("http-errors")
const jwt =require("jsonwebtoken");
const { jwtAccessKey } = require("../secrit");
const Users = require("../models/userModel");
//  user is login middleware
 const isLoggedIn = async (req,res,next) => {
  try {
    console.log("req.cookies:", req.cookies);
    console.log("req.headers.cookie:", req.headers.cookie);

    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw createError(401,"Access token not found. Please login");

    const decoded = jwt.verify(token, jwtAccessKey);
    if(!decoded?.id) throw createError(401,"Invalid token");

    const user = await Users.findById(decoded.id).select("-password");
    if(!user) throw createError(401,"User not found");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

 //  user is logout middleware
 const isLoggedOut = async (req,res,next)=>{
    try{
        const token = req.cookies.accessToken;
        if(token){
            try {
                const decoded = jwt.verify(token,jwtAccessKey)
                if(decoded){
                    throw createError(400,"User already login")
                }
            } catch (error) {
                throw error
            }
        }
       next()
        
    }catch(error){
        return next(error)
    }
 }
 //  user is logout middleware
 const isAdmin = async (req,res,next)=>{
    try{
        console.log("is admin user",req.user.isAdmin);
        if(!req.user.isAdmin){
            console.log("user not a admin");
            throw createError(403,"Forbidden you muse be admin to access this resource")
        }
        next()
        
    }catch(error){
        return next(error)
    }
 }
 
 module.exports = {isLoggedIn,isLoggedOut,isAdmin}