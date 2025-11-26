const {body} = require("express-validator")

//user registation validation
const userRegistationValidate = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("name is require")
    .isLength({min:3, max:30})
    .withMessage("name shoud be at least 3-30 characters long"),
    // phone validation
    body("phone")
    .trim()
    .notEmpty()
    .withMessage("phone is require"),
    // password validation
    body("password")
    .trim()
    .notEmpty()
    .withMessage("password is require")
    .isLength({min:6})
    .withMessage("password shoud be at least 6 characters long")

]

const updatePasswordValidate =[
    // phone validation
    body("phone")
    .trim()
    .notEmpty()
    .withMessage("phone is require"),
    // old password validation
    body("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("old password is require")
    .isLength({min:6})
    .withMessage("old password shoud be at least 6 characters long"),
    // new password
    body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("new password is require")
    .isLength({min:6})
    .withMessage("new password shoud be at least 6 characters long"),
]

// validate user forgate password

const userForgatePassword =[
    // phone validation
    body("phone")
    .trim()
    .notEmpty()
    .withMessage("phone is require"),
]

// validate user reset password 
const userResetPassword =[
    // phone validation
    body("phone")
    .trim()
    .notEmpty()
    .withMessage("phone is require"),
    // otp validation
    body("otp")
    .trim()
    .notEmpty()
    .withMessage("otp is require"),
    // password validation
    body("password")
    .trim()
    .notEmpty()
    .withMessage("password is require")
    .isLength({min:6})
    .withMessage("password shoud be at least 6 characters long"),
]

module.exports ={
    userRegistationValidate,
    updatePasswordValidate,
    userForgatePassword,
    userResetPassword,
}
