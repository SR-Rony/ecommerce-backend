const createError = require("http-errors")
const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const { successRespons } = require("./respones.controller");
const bcrypt = require("bcryptjs");
const { createJsonWebToken } = require("../helper/jsonwebtoken");
const { jwtAccessKey, jwtRefreshKey } = require("../secrit");

//============ user login ============ 
const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email }).select('+password');

    if (!user) throw createError(404, 'User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw createError(401, 'Invalid password');

    const accessToken = createJsonWebToken({ id: user._id }, jwtAccessKey, '1d');
    const refreshToken = createJsonWebToken({ id: user._id }, jwtRefreshKey, '7d');

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/", // ✅ make cookie available on all routes
      maxAge: 24*60*60*1000
    });


    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'none',
    });

    // Remove password from user object
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // ✅ Return both user data and access token in payload
    return successRespons(res, {
      statusCode: 200,
      message: 'User login successful',
      payload: {
        user: userWithoutPassword,
        accessToken,   // add access token here
        refreshToken,  // optional, if frontend needs it
      },
    });
  } catch (err) {
    next(err);
  }
};



//============ user logout ============ 
const handleLogout = async (req,res,next)=>{
    try{
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        // user successfull response
        return successRespons(res,{
            statusCode:200,
            message:"User logout successfully",
        })
    }catch(error){
        next('i am errorr',error)
    }
}
//============ user refresh token============ 
const handleRefreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      throw createError(401, "No refresh token provided. Please login again.");
    }

    const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);

    if (!decodedToken || !decodedToken.id) {
      throw createError(401, "Invalid refresh token. Please login again.");
    }

    // ✅ create new access token
    const accessToken = createJsonWebToken(
      { id: decodedToken.id },
      jwtAccessKey,
      "5m"
    );

    res.cookie("accessToken", accessToken, {
      maxAge: 5 * 60 * 1000, // 5 minutes
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return successRespons(res, {
      statusCode: 200,
      message: "New access token created successfully",
    });
  } catch (error) {
    next(error);
  }
};
//============ user protected logout ============ 
const handleProtected = async (req,res,next)=>{
    try{
        const accessToken  = req.cookies.accessToken;
        const decoded = jwt.verify(accessToken,jwtAccessKey)

         if(!decoded){
            throw createError(401,'Invalid access token please login again')
         }

        // user successfull response
        return successRespons(res,{
            statusCode:200,
            message:"Protected access successfull",
        })
    }catch(error){
        next(error)
    }
}
module.exports = {handleLogin,handleLogout,handleRefreshToken,handleProtected}