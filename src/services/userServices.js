const createError = require("http-errors");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { createJsonWebToken } = require("../helper/jsonwebtoken");
const emailNodmailer = require("../helper/email");
const { findWithIdService } = require("./findItem");
const jwt = require("jsonwebtoken");
const { cfg } = require("../config/env");


// ================== Find Users (Search Service) ==================
const findUserService = async (search) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } }, // Search by name
      { email: { $regex: search, $options: "i" } } // Search by email
    ];
  }

  const users = await Users.find(query).sort({ createdAt: -1 });
  return users;
};

// ================== Ban / Unban User ==================
const UserActionService = async (userId, action) => {
  try {
    let successMessage;
    let update;

    if (action === "ban") {
      update = { isBanned: true };
      successMessage = "User banned successfully";
    } else if (action === "unban") {
      update = { isBanned: false };
      successMessage = "User unbanned successfully";
    } else {
      throw createError(400, "Invalid action");
    }

    const updateOptions = { new: true, runValidators: true, context: "query" };
    const userUpdate = await Users.findByIdAndUpdate(userId, update, updateOptions).select("-password");

    if (!userUpdate) {
      throw createError(404, "User not found or update failed");
    }

    return successMessage;
  } catch (error) {
    throw error;
  }
};

// ================== Update Password ==================
const updatePasswordService = async (updateId, email, oldPassword, newPassword, confirmPassword) => {
  try {
    const user = await findWithIdService(Users, updateId);
    if (!user) throw createError(404, "User not found");

    if (user.email !== email) {
      throw createError(400, "Invalid Email");
    }

    if (newPassword !== confirmPassword) {
      throw createError(400, "New password and confirm password do not match");
    }

    const passwordCheck = await bcrypt.compare(oldPassword, user.password);
    if (!passwordCheck) {
      throw createError(401, "Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const update = { $set: { password: hashedPassword } };
    const updateOptions = { new: true };

    const updateUser = await Users.findByIdAndUpdate(updateId, update, updateOptions).select("-password");

    if (!updateUser) {
      throw createError(400, "Password update failed");
    }

    return updateUser;
  } catch (error) {
    throw error;
  }
};

// ================== Forget Password (Send Email) ==================
const forgetPasswordService = async (email) => {
  try {
    const userData = await Users.findOne({ email });
    if (!userData) {
      throw createError(404, "Email is incorrect or user not registered");
    }

    // create reset token
    const token = createJsonWebToken({ email }, cfg. JWT_RESET_PASSWORD_KEY, "10m");

    // prepare email
    const emailData = {
      email,
      subject: "Reset Password Email",
      html: `
        <h1>Hello ${userData.name}</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${cfg.CLIENT_URL}/user/reset-password/${token}" target="_blank">Reset Password</a>
      `
    };

    // send email
    await emailNodmailer(emailData);

    return token;
  } catch (error) {
    throw error;
  }
};

// ================== Reset Password ==================
const resetPasswordService = async (token, newPassword) => {
  try {
    let decoded;

    try {
      decoded = jwt.verify(token, resetPasswordKey);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw createError(410, "Reset password link has expired");
      } else {
        throw createError(401, "Invalid reset password token");
      }
    }

    const filter = { email: decoded.email };
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const update = { password: hashedPassword };
    const option = { new: true };

    const updateUser = await Users.findOneAndUpdate(filter, update, option).select("-password");

    if (!updateUser) {
      throw createError(400, "Password reset failed");
    }

    return updateUser;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  UserActionService,
  findUserService,
  forgetPasswordService,
  updatePasswordService,
  resetPasswordService
};
