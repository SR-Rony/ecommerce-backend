const createError = require("http-errors");
const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");

const { successRespons } = require("./respones.controller");
const { findWithIdService } = require("../services/findItem");
const { createJsonWebToken } = require("../helper/jsonwebtoken");
const emailNodmailer = require("../helper/email");
const { 
  findUserService,
  forgetPasswordService,
  resetPasswordService,
  UserActionService,
  updatePasswordService 
} = require("../services/userServices");
const { cfg } = require("../config/env"); // ✅ replaced secrit.js
const { cloudinaryHelper, deleteCloudinaryImage } = require("../helper/cloudinaryHelper");

// ============== user register ============ //
const handleRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await Users.exists({ email });
    if (userExists) {
      throw createError(409, "User with this email already exists. Please login.");
    }

    const token = createJsonWebToken(
      { name, email, phone, password },
      cfg.JWT_ACTIVATION_KEY,
      "10m"
    );

    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
        <h1>Hello ${name}</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${cfg.CLIENT_URL}/user/verify/${token}" target="_blank">Activate your account</a>
      `,
    };

    try {
      await emailNodmailer(emailData);
    } catch (emailError) {
      return next(createError(500, "Failed to send verification email"));
    }

    return successRespons(res, {
      statusCode: 200,
      message: `Please check your email (${email}) to complete the registration process.`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

// ============== user verify ============ //
const handleUserVerify = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw createError(400, "Token is missing");

    let decoded;
    try {
      decoded = jwt.verify(token, cfg.JWT_ACTIVATION_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") throw createError(410, "Token has expired");
      if (error.name === "JsonWebTokenError") throw createError(401, "Invalid token");
      throw error;
    }

    const { email } = decoded;
    const userExists = await Users.exists({ email });
    if (userExists) throw createError(409, "User already verified. Please login.");

    await Users.create(decoded);

    return successRespons(res, {
      statusCode: 200,
      message: "User registered and verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ======== get all users ======== //
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

// ======== single get user ======= //
// ✅ Get Single User Controller
const handleGetSingleUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    

    // ✅ Validate ID (if using MongoDB)
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // ✅ Exclude password from result
    const projection = { password: 0 };

    const singleUser = await findWithIdService(Users, id, projection);

    // ✅ If user not found
    if (!singleUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Success response
    return successRespons(res, {
      statusCode: 200,
      message: "Single user returned successfully",
      payload: { user: singleUser },
    });
  } catch (error) {
    console.error("Error fetching single user:", error.message);
    next(error);
  }
};


// ====== update user ======= //
const handleUpdateUser = async (req, res, next) => {
  try {
    const updateId = req.params.id;
    const option = { password: 0 };
    const user = await findWithIdService(Users, updateId, option);
    if (!user) throw createError(404, "User not found");

    const updates = {};
    for (let key in req.body) {
      if (["name", "phone"].includes(key)) {
        updates[key] = req.body[key];
      } else if (key === "email") {
        throw createError(400, "Email cannot be updated");
      }
    }

    const userUpdate = await Users.findByIdAndUpdate(updateId, updates, {
      new: true,
      runValidators: true,
      context: "query",
    }).select("-password");

    if (!userUpdate) throw createError(404, "User was not updated");

    return successRespons(res, {
      statusCode: 200,
      message: "User updated successfully",
      payload: { user: userUpdate },
    });
  } catch (error) {
    next(error);
  }
};

// ====== ban user ======= //
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
    const { email } = req.body;
    if (!email) throw createError(400, "Email is required");

    await forgetPasswordService(email);

    return successRespons(res, {
      statusCode: 200,
      message: `Please check your email (${email}) to reset your password`,
    });
  } catch (error) {
    next(error);
  }
};

// ====== reset password ======= //
const handleResetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const userData = await resetPasswordService(token, newPassword);

    return successRespons(res, {
      statusCode: 200,
      message: "Password reset successfully",
      payload: { user: userData },
    });
  } catch (error) {
    next(error);
  }
};

// ====== delete user ======= //
const handleDeleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const option = { password: 0 };
    const user = await findWithIdService(Users, id, option);

    if (!user) return next(createError(404, "User not found"));

    const deletedUser = await Users.findOneAndDelete({ _id: id, isAdmin: false });
    if (!deletedUser) return next(createError(403, "Admin accounts cannot be deleted"));

    return successRespons(res, {
      statusCode: 200,
      message: "User deleted successfully",
      payload: { user },
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
  handleResetPassword,
  handleDeleteUser,
};
