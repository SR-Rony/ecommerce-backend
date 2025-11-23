const createError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const { successRespons } = require("./respones.controller");
const { findWithIdService } = require("../services/findItem");
const { 
  findUserService,
  forgetPasswordService,
  resetPasswordService,
  UserActionService,
  updatePasswordService 
} = require("../services/userServices");
const otpStore = new Map();

// ============== user register ============ //
const handleRegister = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    

    if (!name || !phone || !password) {
      throw createError(400, "Name, phone and password are required");
    }

    // check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw createError(409, "User with this phone already exists. Please login.");
    }

    // ✅ Step 1: Generate OTP (simulate sending SMS)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min validity

    console.log(`📲 OTP for ${phone}: ${otp}`); // simulate SMS sending

    // ✅ Step 2: Temporarily hold user data (hashed password) until OTP verified
    const hashedPassword = bcrypt.hashSync(password, 10);

    // save user data temporarily in token or cache (for simplicity use Map)
    otpStore.get(phone).pendingUser = { name, phone, password: hashedPassword };

    return successRespons(res, {
      statusCode: 200,
      message: `OTP sent successfully to ${phone}. Please verify to complete registration.`,
    });
  } catch (error) {
    next(error);
  }
};

// ============== user verify ============ //
const handleUserVerify = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const stored = otpStore.get(String(phone));

    if (!stored) throw createError(400, "No OTP found for this phone number");
    if (stored.expires < Date.now()) throw createError(400, "OTP expired");
    if (String(stored.otp) !== String(otp)) throw createError(400, "Invalid OTP");

    const { name, password } = stored.pendingUser;

    const user = await User.create({
      name,
      phone,
      password,
      isVerified: true,
    });

    otpStore.delete(String(phone));

    return successRespons(res, {
      statusCode: 201,
      message: "✅ Phone verified and user registered successfully!",
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
    console.error("Verification Error:", error);
    next(error);
  }
};


// ======== get all user ======== //
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

// ======== get single user ======== //
const handleGetSingleUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw createError(400, "Invalid user ID format");
    }

    const projection = { password: 0 };
    const singleUser = await findWithIdService(User, id, projection);
    if (!singleUser) throw createError(404, "User not found");

    return successRespons(res, {
      statusCode: 200,
      message: "Single user retrieved successfully",
      payload: { user: singleUser },
    });
  } catch (error) {
    next(error);
  }
};

// ====== update user ======= //
const handleUpdateUser = async (req, res, next) => {
  try {
    const updateId = req.params.id;
    const user = await findWithIdService(User, updateId, { password: 0 });
    if (!user) throw createError(404, "User not found");

    const updates = {};
    for (let key in req.body) {
      if (["name", "phone"].includes(key)) {
        updates[key] = req.body[key];
      } else if (key === "email") {
        throw createError(400, "Email cannot be updated");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(updateId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return successRespons(res, {
      statusCode: 200,
      message: "User updated successfully",
      payload: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// ====== manage user (ban/unban etc.) ======= //
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

// ====== update password ======= //
const handleUpdatePassword = async (req, res, next) => {
  try {
    const updateId = req.params.id;
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    const updatedUser = await updatePasswordService(
      updateId,
      email,
      oldPassword,
      newPassword,
      confirmPassword
    );

    return successRespons(res, {
      statusCode: 200,
      message: "Password updated successfully",
      payload: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// ====== forgot password ======= //
const handleForgotPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;
    
    if (!phone) throw createError(400, "Phone number is required");

    // OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Save in Map with 5 min expiry
    global.forgotPasswordStore.set(phone, {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 min
    });

    console.log(`📲 OTP for ${phone}: ${otp}`); // simulate SMS

    return successRespons(res, {
      statusCode: 200,
      message: `OTP sent to ${phone}`,
    });
  } catch (error) {
    next(error);
  }
};

//===========================
const handleVerifyForgotOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) throw createError(400, "Phone and OTP are required");

    const phoneKey = String(phone);
    const stored = global.forgotPasswordStore.get(phoneKey);
    if (!stored) throw createError(400, "OTP expired or not requested");

    const { otp: storedOtp, expires } = stored;

    if (Date.now() > expires) throw createError(400, "OTP expired");

    if (Number(storedOtp) !== Number(otp)) throw createError(400, "Invalid OTP");

    return successRespons(res, {
      statusCode: 200,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    next(error);
  }
};

//=====================

// PUT /user/reset-password
const handleResetPassword = async (req, res, next) => {
  try {
    const { phone, otp, newPassword } = req.body;

    console.log(req.body);
    

    if (!phone || !otp || !newPassword) {
      throw createError(400, "Phone, OTP and new password are required");
    }

    // 🔑 OTP fetch from global Map
    const phoneKey = String(phone);
    const stored = global.forgotPasswordStore.get(phoneKey);

    if (!stored) {
      throw createError(400, "OTP expired or not requested");
    }

    const { otp: storedOtp, expires } = stored;

    // OTP expiry check
    if (Date.now() > expires) {
      global.forgotPasswordStore.delete(phoneKey); // remove expired OTP
      throw createError(400, "OTP expired");
    }

    // OTP match check
    if (Number(storedOtp) !== Number(otp)) {
      throw createError(400, "Invalid OTP");
    }

    // ✅ Find user
    const user = await User.findOne({ phone });
    if (!user) throw createError(404, "User not found");

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // ✅ Delete OTP after successful reset
    global.forgotPasswordStore.delete(phoneKey);

    return successRespons(res, {
      statusCode: 200,
      message: "Password reset successfully",
    });

  } catch (error) {
    next(error);
  }
};


// ====== delete user ======= //
const handleDeleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await findWithIdService(User, id, { password: 0 });
    if (!user) throw createError(404, "User not found");

    if (user.role === "admin") {
      throw createError(403, "Admin accounts cannot be deleted");
    }

    await User.findByIdAndDelete(id);

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
