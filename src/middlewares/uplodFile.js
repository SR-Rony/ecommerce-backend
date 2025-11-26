const multer = require("multer");
const { fileSize, fileTypes } = require("../config");

// File filter
const fileFilter = (req, file, cb) => {
  if (!fileTypes.includes(file.mimetype)) {
    return cb(new Error("File type is not allowed"), false);
  }
  cb(null, true);
};

// Memory storage (no local save)
const storage = multer.memoryStorage();

const uploadProductImage = multer({
  storage,
  limits: { fileSize },
  fileFilter,
});

module.exports = { uploadProductImage };

