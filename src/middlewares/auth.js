const createError = require("http-errors")
const jwt =require("jsonwebtoken");
const { jwtAccessKey } = require("../secrit");
//  user is login middleware
 const isLoggedIn = async (req,res,next)=>{
    try{
        const token = req.cookies.accessToken;
        if(!token){
            throw createError(401,"Access token not found. Please login")
        }
        const decoded = jwt.verify(token,jwtAccessKey)
        if(!decoded){
            throw createError(401,"Invalid access token . please login again")

        }
        // console.log(decoded.user);
        req.user = decoded.user
        next()
        
    }catch(error){
        return next(error)
    }
 }
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