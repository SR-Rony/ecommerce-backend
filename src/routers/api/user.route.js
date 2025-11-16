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
    handleForgotPassword 
} = require("../../controller/user.controller")
const runValidation = require("../../middlewares/validators")
const { userRegistationValidate, updatePasswordValidate, userForgatePassword, userResetPassword } = require("../../middlewares/validators/auth")
const { isAdmin} = require("../../middlewares/auth")
const { uploadUserImage } = require("../../middlewares/uplodFile")
const attachUser = require("../../middlewares/validators/attachUser")

// user register route: localhost:4000/api/user/register
route.post("/register",handleRegister)

// user verify route: localhost:4000/api/user/verify
route.post("/verify",handleUserVerify)

// all get user: localhost:4000/api/user
route.get("/",attachUser,isAdmin,handleGetUsers)
// route.get("/",handleGetUsers)

// single get user: localhost:400/api/v1/users/:id
route.get("/:id",attachUser,isAdmin,handleGetSingleUser)

// delete user: localhost:400/api/v1/users/:id
route.delete("/:id",isAdmin,handleDeleteUser)

// update user:  localhost:400/api/v1/users/update/:id
route.put("/update/:id([0-9a-fA-F]{24})",isAdmin,handleUpdateUser)

// user new password set: localhost:400/api/v1/users/update-password
route.put("/update-password/:id([0-9a-fA-F]{24})",updatePasswordValidate,handleUpdatePassword)

// user forget password set: localhost:400/api/v1/users/forget-password
route.post("/forgot-password",handleForgotPassword)
// route.post("/forgot-password",isLoggedOut,userForgatePassword,runValidation, handleForgatePassword)

// user reset password :localhost:400/api/v1/users/reset-password
route.put("/reset-password", handleResetPassword)
// route.put("/reset-password",isLoggedOut,userResetPassword,runValidation, handleResetPassword)

// handle manage user: localhost:400/api/v1/users/manage-user
route.put("/manage-user/:id([0-9a-fA-F]{24})",isAdmin,handleManageUser)

module.exports = route