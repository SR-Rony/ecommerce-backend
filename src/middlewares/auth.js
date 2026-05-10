const createError = require("http-errors");

//============ authenticated user required (reads cookie via attachUser) ============

const requireAuth = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      throw createError(401, "Authentication required");
    }
    next();
  } catch (error) {
    next(error);
  }
};

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


module.exports = { isAdmin, requireAuth };
