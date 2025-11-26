const createError = require("http-errors");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { findWithIdService } = require("./findItem");


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

module.exports = {
  UserActionService,
  findUserService,
  updatePasswordService,
};
