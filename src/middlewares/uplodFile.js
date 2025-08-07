const multer = require("multer");
const path = require("path");
const { userUplodDir, productUplodDir, fileSize, fileTypes } = require("../config");

// ========= File Filter ========= //
const fileFilter = (req, file, cb) => {
  if (!fileTypes.includes(file.mimetype)) {
    return cb(new Error("File type is not allowed"), false);
  }
  cb(null, true);
};

// ========= User Storage ========= //
const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, userUplodDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// ========= Product Storage ========= //
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productUplodDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// ========= Upload Middlewares ========= //
const uploadUserImage = multer({
  storage: userStorage,
  limits: { fileSize },
  fileFilter,
});

const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize },
  fileFilter,
});

module.exports = { uploadUserImage, uploadProductImage };
