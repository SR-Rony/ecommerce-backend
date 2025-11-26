const route = require("express").Router()
const { 
    handleManageUser,
    handleUpdatePassword,
    handleResetPassword,
    handleRegister,
    handleUserVerify, 
    handleGetUsers, 
    handleGetSingleUser, 
    handleDeleteUser, 
    handleUpdateUser, 
    handleForgotPassword, 
    handleVerifyForgotOtp
} = require("../../controller/user.controller")
const runValidation = require("../../middlewares/validators")
const { userRegistationValidate, updatePasswordValidate, userForgatePassword, userResetPassword } = require("../../middlewares/validators/auth")
const { isAdmin} = require("../../middlewares/auth")
const { uploadUserImage } = require("../../middlewares/uplodFile")
const attachUser = require("../../middlewares/validators/attachUser")

// user register route: localhost:4000/api/user/register
route.post("/register",userRegistationValidate,runValidation,handleRegister)

// user verify route: localhost:4000/api/user/verify
route.post("/verify",handleUserVerify)

// all get user: localhost:4000/api/user
route.get("/",attachUser,isAdmin,runValidation,handleGetUsers)
// route.get("/",handleGetUsers)

// single get user: localhost:4000/api/user/:id
route.get("/:id([0-9a-fA-F]{24})",attachUser,isAdmin,runValidation,handleGetSingleUser)

// delete user: localhost:4000/api/user/:id
route.delete("/:id([0-9a-fA-F]{24})",attachUser,isAdmin,handleDeleteUser)

// update user:  localhost:4000/api/user/update/:id
route.put("/update/:id([0-9a-fA-F]{24})",attachUser,isAdmin,handleUpdateUser)

// user new password set: localhost:4000/api/user/update-password/:id
route.put("/update-password/:id([0-9a-fA-F]{24})",updatePasswordValidate,runValidation,handleUpdatePassword)

// user forget password set: localhost:400/api/v1/users/forget-password
route.post("/forgot-password",userForgatePassword,runValidation,handleForgotPassword)

//user verify forgot otp : localhost:4000/api/user/verify-forgot-otp
route.post("/verify-forgot-otp",runValidation,handleVerifyForgotOtp)

// user reset password :localhost:4000/api/user/reset-password
route.put("/reset-password",runValidation,handleResetPassword)

// handle manage user: localhost:4000/api/user/manage-user
route.put("/manage-user/:id([0-9a-fA-F]{24})",attachUser,isAdmin,runValidation,handleManageUser)

module.exports = route
