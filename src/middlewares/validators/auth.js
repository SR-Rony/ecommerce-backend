const { body } = require("express-validator");

const userRegistationValidate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 80 })
    .withMessage("Name must be between 3 and 80 characters"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const updatePasswordValidate = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required")
    .isLength({ min: 6 })
    .withMessage("Old password must be at least 6 characters"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Confirm password must match new password"),
];

const userForgatePassword = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
];

const userVerifyOtpValidate = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 10 })
    .withMessage("Invalid OTP"),
];

const verifyForgotOtpValidate = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required"),
];

const userResetPassword = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

const manageUserValidate = [
  body("action")
    .trim()
    .notEmpty()
    .withMessage("action is required")
    .isIn(["ban", "unban"])
    .withMessage("action must be ban or unban"),
];

module.exports = {
  userRegistationValidate,
  updatePasswordValidate,
  userForgatePassword,
  userResetPassword,
  userVerifyOtpValidate,
  verifyForgotOtpValidate,
  manageUserValidate,
};
