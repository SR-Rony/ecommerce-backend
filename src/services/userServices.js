const createError = require("http-errors");
const mongoose = require("mongoose");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserService = async (search) => {
  const query = {};

  const term = typeof search === "string" ? search.trim() : "";
  if (term.length > 0) {
    const safe = escapeRegex(term);
    query.$or = [
      { name: { $regex: safe, $options: "i" } },
      { phone: { $regex: safe, $options: "i" } },
    ];
  }

  const users = await Users.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  return users;
};

const UserActionService = async (userId, action) => {
  let successMessage;
  let update;

  if (action === "ban") {
    update = { isBanned: true };
    successMessage = "User banned successfully";
  } else if (action === "unban") {
    update = { isBanned: false };
    successMessage = "User unbanned successfully";
  } else {
    throw createError(400, "Invalid action. Use ban or unban.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError(404, "User not found");
  }

  const userUpdate = await Users.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!userUpdate) {
    throw createError(404, "User not found");
  }

  return successMessage;
};

const updatePasswordService = async (
  updateId,
  phone,
  oldPassword,
  newPassword,
  confirmPassword
) => {
  const user = await Users.findById(updateId).select("+password");
  if (!user) throw createError(404, "User not found");

  if (String(user.phone) !== String(phone).trim()) {
    throw createError(400, "Phone does not match this account");
  }

  if (!newPassword || newPassword !== confirmPassword) {
    throw createError(400, "New password and confirm password do not match");
  }

  const passwordCheck = await bcrypt.compare(oldPassword, user.password);
  if (!passwordCheck) {
    throw createError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  const safe = await Users.findById(updateId).select("-password").lean();

  return safe;
};

module.exports = {
  UserActionService,
  findUserService,
  updatePasswordService,
};
