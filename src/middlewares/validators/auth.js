const {body} = require("express-validator")

//user registation validation
const userRegistationValidate = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("name is require")
    .isLength({min:3, max:30})
    .withMessage("name shoud be at least 3-30 characters long"),
    // email validation
    body("email")
    .trim()
    .notEmpty()
    .withMessage("email is require")
    .isEmail()
    .withMessage("Invalid Email"),
    // password validation
    body("password")
    .trim()
    .notEmpty()
    .withMessage("password is require")
    .isLength({min:6})
    .withMessage("password shoud be at least 6 characters long"),
    // addres validation
    body("address")
    .trim()
    .notEmpty()
    .withMessage("address is require")
    .isLength({min:3})
    .withMessage("address shoud be at least 3 characters long"),
    // phone validation
    body("phone")
    .trim()
    .notEmpty()
    .withMessage("phone is require")

]

const updatePasswordValidate =[
    // email validation
    body("email")
    .trim()
    .notEmpty()
    .withMessage("email is require")
    .isEmail()
    .withMessage("Invalid Email"),
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
    // new password
    body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("confirm password is require")
    .isLength({min:6})
    .withMessage("confirm password shoud be at least 6 characters long"),
]

// validate user forgate password

const userForgatePassword =[
    // email validation
    body("email")
    .trim()
    .notEmpty()
    .withMessage("email is require")
    .isEmail()
    .withMessage("Invalid Email"),
]

// validate user reset password 
const userResetPassword =[
    // email validation
    body("token")
    .trim()
    .notEmpty()
    .withMessage("token is require"),
    // password validation
    body("newpassword")
    .trim()
    .notEmpty()
    .withMessage("password is require")
    .isLength({min:6})
    .withMessage("password shoud be at least 6 characters long"),
]

// validate user reset password 
const userRefreshToken =[
    // email validation
    body("token")
    .trim()
    .notEmpty()
    .withMessage("token is require"),
]

module.exports ={
    userRegistationValidate,
    updatePasswordValidate,
    userForgatePassword,
    userResetPassword,
    userRefreshToken
}
