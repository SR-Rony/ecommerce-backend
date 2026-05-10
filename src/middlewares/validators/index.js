const { validationResult } = require("express-validator");
const { errorRespons } = require("../../controller/respones.controller");

const runValidation = (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return errorRespons(res, {
        statusCode: 422,
        message: error.array()[0].msg,
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = runValidation;
