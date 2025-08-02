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

    if (!user) throw createError(404, 'User does not exist. Please register.');
    if (!user.password) throw createError(500, 'Password missing in DB.');
    if (user.isBanned) throw createError(403, 'You are banned.');

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) throw createError(401, 'Invalid password.');

    const accessToken = createJsonWebToken(
      { id: user._id, role: user.role },
      jwtAccessKey,
      '5m'
    );
    const refreshToken = createJsonWebToken({ id: user._id }, jwtRefreshKey, '7d');

    res.cookie('accessToken', accessToken, {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return successRespons(res, {
      statusCode: 200,
      message: 'User login successful.',
      payload: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    next(error);
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
const handleRefreshToken = async (req,res,next)=>{
    try{
        const oldRefreshToken = req.cookies.refreshToken;
        const decodedToken = jwt.verify(oldRefreshToken,jwtRefreshKey)

         if(!decodedToken){
            throw createError(401,'Invalid refresh token please login again')
         }

         const accessToken = createJsonWebToken(decodedToken.user,jwtAccessKey,"5m")

            res.cookie("accessToken",accessToken,{
                maxAge : 5 * 60 * 1000, //15 minutes
                httpOnly : true,
                secure : true,
                sameSite : "none"
            })

        // user successfull response
        return successRespons(res,{
            statusCode:200,
            message:"User new access token create successfull",
        })
    }catch(error){
        next(error)
    }
}
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