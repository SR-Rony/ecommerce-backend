const createError = require("http-errors")
const Users = require("../models/userModel");
const jwt = require("jsonwebtoken")

const { successRespons } = require("./respones.controller");
const {findWithIdService } = require("../services/findItem");
const deleteImg = require("../helper/deleteImages");
const { createJsonWebToken } = require("../helper/jsonwebtoken");
const { jwtActivationKey, clientUrl, } = require("../secrit");
const emailNodmailer = require("../helper/email");
const { findUserService, forgetPasswordService, resetPasswordService, UserActionService, updatePasswordService } = require("../services/userServices");
const cloudinary  = require("../config/cloudinary");
const {cloudinaryHelper, deleteCloudinaryImage} = require("../helper/cloudinaryHelper");


//============== user register ============//
const handleRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await Users.exists({ email });
    if (userExists) {
      throw createError(409, 'User with this email already exists. Please login.');
    }

    const token = createJsonWebToken(
      { name, email, phone, password},
      jwtActivationKey,
      '10m'
    );

    const emailData = {
      email,
      subject: 'Account Activation Email',
      html: `
        <h1>Hello ${name}</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${clientUrl}/verify/${token}" target="_blank">Activate your account</a>
      `,
    };

    try {
      await emailNodmailer(emailData);
    } catch (emailError) {
      return next(createError(500, 'Failed to send verification email'));
    }

    return successRespons(res, {
      statusCode: 200,
      message: `Please check your email (${email}) to complete the registration process.`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

//============== user verify ============//
const handleUserVerify = async (req, res, next) => {
  try {
    const { token } = req.body;

    // 1. Check token presence
    if (!token) {
      throw createError(400, 'Token is missing');
    }

    let decoded;
    try {
      // 2. Verify token
      decoded = jwt.verify(token, jwtActivationKey);
    } catch (error) {
      // 3. Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        throw createError(410, 'Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw createError(401, 'Invalid token');
      } else {
        throw error;
      }
    }

    const { email } = decoded;

    // 4. Check if user already exists
    const userExists = await Users.exists({ email });
    if (userExists) {
      throw createError(409, 'User already verified. Please login.');
    }

    // 5. Create new user
    await Users.create(decoded);

    // 6. Send success response
    return successRespons(res, {
      statusCode: 200,
      message: 'User registered and verified successfully',
    });

  } catch (error) {
    next(error);
  }
};

//======== get all users ========//
const handleGetUsers = async (req,res,next)=>{
    try{
        // user request
        const search = req.query.search || "";
        const limit = Number(req.query.limit) || 5;
        const page = Number(req.query.page) || 1;
       const {allUser,pasination}= await findUserService(search,limit,page)
        // return success respons users
        return successRespons(res,{
            statusCode :200,
            message : "all user return",
            paylod :{
                allUser:allUser,
                pasination : pasination
            }
        })
    }catch(error){
        next(error)
    }
}

//======== single get user=======//
const handleGetSingleUser = async (req,res,next)=>{
    try{
        const id = req.params.id;
        const option = {password:0}
        
        // single user search by id
        let singleUser = await findWithIdService(User,id,option)

        // user success respons 
        return successRespons(res,{
            statusCode :200,
            message : "single user is return",
            paylod :{
                singleUser
            }
        })
    }catch(error){
        next(error)
    }
}

//====== update user =======//
const handleUpdateUser = async(req,res,next)=>{
    try{
    const updateId = req.params.id;
    
    const option = {password:0};
    const user = await findWithIdService(Users,updateId,option)
    if(!user){
        throw createError(404,"User not found")
    }

    let updateOptions = {new:true,runValidation:true,context:"query"}

    let updates ={} //update object

    // input req.body all key
    for(let key in req.body){
        if(["name","phone",].includes(key)){
            updates[key]=req.body[key]
        }
       else if(["email"].includes(key)){
        throw createError(400,"Email can not be updatead")
        }
    }
    // user update
    const userUpdate = await Users.findByIdAndUpdate(updateId,updates,updateOptions)
    .select("-password")

    if(!userUpdate){
        throw createError(404,"User was not update")
    }

    //======= user delete and success respons fun () =======//
    return successRespons(res,{
        statusCode :200,
        message : " update",
        payload :{user:userUpdate}
    })
    }catch(error){
        next(error)
    }
}
//====== ban user =======//
const handleManageUser = async(req,res,next)=>{
    try{
    const userId = req.params.id;
    const action = req.body.action
   let successMessages = await UserActionService(userId,action)

    //======= user delete and success respons fun () =======//
    return successRespons(res,{
        statusCode :200,
        message : successMessages
    })


    }catch(error){
        next(error)
    }
}
// ======user new password set=========//
const handleUpdatePassword =async(req,res,next)=>{
    try {
        const updateId = req.params.id
        const {email,oldPassword,newPassword,confirmPassword} = req.body
        const updateUser =  updatePasswordService (updateId,email,oldPassword,newPassword,confirmPassword)

        //======= user delete and success respons fun () =======//
        return successRespons(res,{
            statusCode :200,
            message : "password update successfull",
            paylod:updateUser
        })
    } catch (error) {
        next(error)
    }
}

// ======user forgate password set=========//
const handleForgatePassword =async(req,res,next)=>{
    try {
        const {email} = req.body
        const token = await forgetPasswordService(email)
        //======= user delete and success respons fun () =======//
        return successRespons(res,{
            statusCode :200,
            message : `Plase got to your ${email} resetion the password`,
            paylod:{token:token}
        })
    } catch (error) {
        next(error)
    }
}

// ======user reset password set=========//
const handleResetPassword =async(req,res,next)=>{
    try {
        const {token,newpassword} = req.body
        
        const userData = await resetPasswordService(token,newpassword)
        //======= user delete and success respons fun () =======//
        return successRespons(res,{
            statusCode :200,
            message : `Reset password successfull`,
            paylod:userData
        })
    } catch (error) {
        next(error)
    }
}

//====== delete user =======//
const handleDeleteUser = async(req,res,next)=>{
    try{
    const id = req.params.id;
    const option = {password:0}
    const user = await findWithIdService(User,id,option)

    if(user && user.image){
        const cloudImageId = await cloudinaryHelper(user.image);
        // cloudinary image delete helper
        await deleteCloudinaryImage("mernEcommerce/users",cloudImageId,"User")
    }
    //delete user
       await User.findByIdAndDelete({_id:id,isAdmin:false})

    //======= user delete and success respons fun () =======//
    return successRespons(res,{
        statusCode :200,
        message : " delete",
        paylod :{
            user:user
        }
    })


    }catch(error){
        next(error)
    }
}

module.exports = {
    handleRegister,
    handleGetUsers,
    handleGetSingleUser,
    handleDeleteUser,
    handleUserVerify,
    handleUpdateUser,
    handleManageUser,
    handleUpdatePassword,
    handleForgatePassword,
    handleResetPassword
}