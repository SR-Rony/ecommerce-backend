const createError = require("http-errors");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const { successRespons } = require("./respones.controller");
const { findWithIdService } = require("../services/findItem");
const {
  findUserService,
  UserActionService,
  updatePasswordService,
} = require("../services/userServices");

const normalizePhone = (phone) => String(phone ?? "").trim();

/** In-memory OTP for registration — use Redis etc. for multi-instance production */
const otpStore = new Map();

function assertSelfOrAdmin(req, targetUserId, message = "Forbidden") {
  const uid = req.user && (req.user._id || req.user.id);
  if (!uid) throw createError(401, "Authentication required");
  const isSelf = String(uid) === String(targetUserId);
  const isAdminUser = req.user.role === "admin";
  if (!isSelf && !isAdminUser) {
    throw createError(403, message);
  }
}

const handleRegister = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    const phoneKey = normalizePhone(phone);

    if (!name || !phoneKey || !password) {
      throw createError(400, "Name, phone and password are required");
    }

    const existingUser = await User.exists({ phone: phoneKey });
    if (existingUser) {
      throw createError(409, "This phone is already registered. Please login.");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    otpStore.set(phoneKey, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      pendingUser: {
        name: String(name).trim(),
        phone: phoneKey,
        password: hashedPassword,
      },
    });

    const devHint =
      process.env.NODE_ENV !== "production"
        ? { devOtp: otp }
        : {};

    return successRespons(res, {
      statusCode: 200,
      message: `OTP sent to ${phoneKey}. Verify to complete registration.`,
      payload: devHint,
    });
  } catch (error) {
    next(error);
  }
};

const handleUserVerify = async (req, res, next) => {
  try {
    const phoneKey = normalizePhone(req.body.phone);
    const { otp } = req.body;

    const stored = otpStore.get(phoneKey);
    if (!stored) throw createError(400, "No OTP found for this phone number");
    if (stored.expires < Date.now()) {
      otpStore.delete(phoneKey);
      throw createError(400, "OTP expired");
    }
    if (String(stored.otp) !== String(otp)) throw createError(400, "Invalid OTP");

    const pending = stored.pendingUser;
    if (!pending || !pending.name || !pending.password) {
      throw createError(400, "Registration data missing — start registration again");
    }

    const user = await User.create({
      name: pending.name,
      phone: pending.phone,
      password: pending.password,
      isVerified: true,
    });

    otpStore.delete(phoneKey);

    return successRespons(res, {
      statusCode: 201,
      message: "Phone verified and registration completed.",
      payload: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleGetUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const allUser = await findUserService(search);

    return successRespons(res, {
      statusCode: 200,
      message: "All users retrieved successfully",
      payload: { allUser },
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const projection = { password: 0 };
    const singleUser = await findWithIdService(User, id, projection);

    return successRespons(res, {
      statusCode: 200,
      message: "Single user retrieved successfully",
      payload: { user: singleUser },
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdateUser = async (req, res, next) => {
  try {
    const updateId = req.params.id;
    assertSelfOrAdmin(req, updateId, "You may only update your own profile");

    const updates = {};
    for (const key of Object.keys(req.body || {})) {
      if (key === "name" || key === "phone") {
        updates[key] = req.body[key];
      }
    }

    if (updates.name !== undefined) {
      updates.name = String(updates.name).trim();
      if (updates.name.length < 3) throw createError(400, "Name must be at least 3 characters");
    }
    if (updates.phone !== undefined) {
      updates.phone = normalizePhone(updates.phone);
      if (!updates.phone) throw createError(400, "Phone cannot be empty");
    }

    if (Object.keys(updates).length === 0) {
      throw createError(400, "No allowed fields to update (name or phone)");
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(updateId, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      return successRespons(res, {
        statusCode: 200,
        message: "User updated successfully",
        payload: { user: updatedUser },
      });
    } catch (err) {
      if (err.code === 11000) {
        throw createError(409, "This phone number is already in use");
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const handleManageUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const action = req.body.action;
    const successMessage = await UserActionService(userId, action);

    return successRespons(res, {
      statusCode: 200,
      message: successMessage,
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdatePassword = async (req, res, next) => {
  try {
    const updateId = req.params.id;
    assertSelfOrAdmin(req, updateId, "You may only change your own password");

    const {
      phone,
      oldPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const updatedUser = await updatePasswordService(
      updateId,
      phone,
      oldPassword,
      newPassword,
      confirmPassword
    );

    return successRespons(res, {
      statusCode: 200,
      message: "Password updated successfully",
      payload: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

const handleForgotPassword = async (req, res, next) => {
  try {
    const phoneKey = normalizePhone(req.body.phone);

    const userExists = await User.exists({ phone: phoneKey });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expires = Date.now() + 5 * 60 * 1000;

    if (userExists) {
      global.forgotPasswordStore.set(phoneKey, { otp, expires });
    }

    const payload =
      process.env.NODE_ENV !== "production"
        ? userExists
          ? { devOtp: otp }
          : { note: "No account for this phone — OTP not stored" }
        : {};

    return successRespons(res, {
      statusCode: 200,
      message:
        "If an account exists with this phone number, you will receive an OTP.",
      payload,
    });
  } catch (error) {
    next(error);
  }
};

const handleVerifyForgotOtp = async (req, res, next) => {
  try {
    const phoneKey = normalizePhone(req.body.phone);
    const { otp } = req.body;

    const stored = global.forgotPasswordStore.get(phoneKey);
    if (!stored) throw createError(400, "OTP expired or not requested");

    const { otp: storedOtp, expires } = stored;

    if (Date.now() > expires) {
      global.forgotPasswordStore.delete(phoneKey);
      throw createError(400, "OTP expired");
    }

    if (Number(storedOtp) !== Number(otp)) {
      throw createError(400, "Invalid OTP");
    }

    return successRespons(res, {
      statusCode: 200,
      message: "OTP verified. You can now reset your password.",
    });
  } catch (error) {
    next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const phoneKey = normalizePhone(req.body.phone);
    const { otp, newPassword } = req.body;

    const stored = global.forgotPasswordStore.get(phoneKey);

    if (!stored) throw createError(400, "OTP expired or not requested");

    const { otp: storedOtp, expires } = stored;

    if (Date.now() > expires) {
      global.forgotPasswordStore.delete(phoneKey);
      throw createError(400, "OTP expired");
    }

    if (Number(storedOtp) !== Number(otp)) {
      throw createError(400, "Invalid OTP");
    }

    const user = await User.findOne({ phone: phoneKey }).select("+password");
    if (!user) throw createError(404, "User not found");

    user.password = newPassword;
    await user.save();

    global.forgotPasswordStore.delete(phoneKey);

    return successRespons(res, {
      statusCode: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(404, "User not found");
    }

    const user = await User.findById(id).select("role");
    if (!user) throw createError(404, "User not found");
    if (user.role === "admin") {
      throw createError(403, "Admin accounts cannot be deleted");
    }

    await User.deleteOne({ _id: user._id });

    return successRespons(res, {
      statusCode: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleRegister,
  handleUserVerify,
  handleGetUsers,
  handleGetSingleUser,
  handleUpdateUser,
  handleManageUser,
  handleUpdatePassword,
  handleForgotPassword,
  handleVerifyForgotOtp,
  handleResetPassword,
  handleDeleteUser,
};
