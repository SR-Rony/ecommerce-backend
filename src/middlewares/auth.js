const createError = require("http-errors");

//============ admin check middleware ============

const isAdmin = async (req, res, next) => {
  try {
    
    if (!req.user || req.user.role !== "admin") {
      throw createError(403, "Forbidden - you must be an admin to access this resource");
    }
    next();
  } catch (error) {
    next(error);
  }
};


module.exports = { isAdmin };
