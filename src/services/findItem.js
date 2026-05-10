const mongoose = require("mongoose");
const createError = require("http-errors");

const findWithIdService = async (Model, id, option = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(404, `${Model.modelName} not found`);
  }

  const item = await Model.findById(id, option);
  if (!item) {
    throw createError(404, `${Model.modelName} not found`);
  }
  return item;
};

module.exports = { findWithIdService };
