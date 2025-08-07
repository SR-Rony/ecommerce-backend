const createError = require("http-errors");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { createJsonWebToken } = require("../helper/jsonwebtoken");
const { clientUrl, resetPasswordKey } = require("../secrit");
const emailNodmailer = require("../helper/email");
const { findWithIdService } = require("./findItem");
const jwt = require("jsonwebtoken")

// find user service
const findUserService = async (search) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },   // Search by name
      { email: { $regex: search, $options: "i" } }  // Search by email
    ];
  }

  const users = await Users.find(query).sort({ createdAt: -1 });
  return users;
};

// handle user action 
const UserActionService =async(userId,action)=>{
    try {
        let successMessages;
        let update
        if(action=="ban"){
            update = {isBanned:true}
            successMessages = "User is banned successfull"
        }else if(action=="unban"){
            update = {isBanned:false}
            successMessages = "User is unbanned successfull"
        }else{
            throw createError(404,"Invalid action")
        }
         let updateOptions = {new:true,runValidation:true,context:"query"}
        // user update
        const userUpdate = await Users.findByIdAndUpdate(userId,update,updateOptions)
        .select("-password")

    if(!userUpdate){
        throw createError(404,"User not banned successfully")
    }
    return successMessages
    } catch (error) {
        throw error
    }
} 

// user password update
const updatePasswordService = async (updateId,email,oldPassword,newPassword,confirmPassword)=>{
    try {
        const user = await findWithIdService(Users,updateId)
        if(!user.email==email){
            throw createError(400,"Invalid Email")
        }
        if(newPassword!==confirmPassword){
            throw createError(400,"new password and confirm password did not match")
        }
        const passwordChack = await bcrypt.compare(oldPassword,user.password);
        if(!passwordChack){
            throw createError(401,"old Password did not match")
        }
        let update = {$set: {password:newPassword}}
        const updateOptions = {new:true}
        const updateUser = await Users.findByIdAndUpdate(updateId,update,updateOptions)

        return updateUser

    } catch (error) {
        throw createError(400,error)
    }
}

// forget password service
const forgetPasswordService =async (email)=>{
    try{
        const userData = await Users.findOne({email:email})
        if(!userData){
            throw  createError(404,"Email is incrrect or you have not varyfied your Email address, Please register")
        }

        // create jsonwebtoken 
       const token = createJsonWebToken({email},resetPasswordKey,"10m")

       // prepare email
       const emailData = {
           email:email,
           subject:"Reset password email",
           html:`
               <h1>Hello ${userData.name}</h1>
               <p>please click hear to <a href="${clientUrl}/user/reset-password/${token}" target="_blank">Reset your password</a></p>
           `
        }
           // send email with nodemailer
           
          await emailNodmailer(emailData)
          return token
    }catch(error){
        throw error
    }
}

// forget password service
const resetPasswordService =async (token,newpassword)=>{
    try{
        //  console.log(token,newpassword);
         const decoded = jwt.verify(token,resetPasswordKey)

         if(!decoded){
            throw createError(400,'Invalid or expire token')
         }
         const filter = {email:decoded.email};
         const update = {password:newpassword}
         const option = {new:true}
        const updateUser = await Users.findOneAndUpdate(filter,update,option).select('-password')
        if(!updateUser){
            throw createError(400,"password reset faild")
        }

        return updateUser

          
    }catch(error){
        throw error
    }
}


module.exports ={
    UserActionService,
    findUserService,
    forgetPasswordService,
    updatePasswordService,
    resetPasswordService
}