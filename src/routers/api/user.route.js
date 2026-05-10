const route = require("express").Router();
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
  handleVerifyForgotOtp,
} = require("../../controller/user.controller");
const runValidation = require("../../middlewares/validators");
const {
  userRegistationValidate,
  updatePasswordValidate,
  userForgatePassword,
  userResetPassword,
  userVerifyOtpValidate,
  verifyForgotOtpValidate,
  manageUserValidate,
} = require("../../middlewares/validators/auth");
const { isAdmin, requireAuth } = require("../../middlewares/auth");
const attachUser = require("../../middlewares/validators/attachUser");

route.post("/register", userRegistationValidate, runValidation, handleRegister);

route.post("/verify", userVerifyOtpValidate, runValidation, handleUserVerify);

route.get("/", attachUser, isAdmin, handleGetUsers);

route.get(
  "/:id([0-9a-fA-F]{24})",
  attachUser,
  isAdmin,
  handleGetSingleUser
);

route.delete(
  "/:id([0-9a-fA-F]{24})",
  attachUser,
  isAdmin,
  handleDeleteUser
);

route.put("/update/:id([0-9a-fA-F]{24})", attachUser, requireAuth, handleUpdateUser);

route.put(
  "/update-password/:id([0-9a-fA-F]{24})",
  attachUser,
  requireAuth,
  updatePasswordValidate,
  runValidation,
  handleUpdatePassword
);

route.post("/forgot-password", userForgatePassword, runValidation, handleForgotPassword);

route.post(
  "/verify-forgot-otp",
  verifyForgotOtpValidate,
  runValidation,
  handleVerifyForgotOtp
);

route.put("/reset-password", userResetPassword, runValidation, handleResetPassword);

route.put(
  "/manage-user/:id([0-9a-fA-F]{24})",
  attachUser,
  isAdmin,
  manageUserValidate,
  runValidation,
  handleManageUser
);

module.exports = route;
