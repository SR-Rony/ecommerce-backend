const { body } = require("express-validator");

const validateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3 })
    .withMessage("Product name must be at least 3 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 3, max: 5000 })
    .withMessage("Product description must be between 3 and 5000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than zero"),

  body("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isFloat({ min: 0 })
    .withMessage("Quantity must be zero or greater"),

  body("categoryId")
    .trim()
    .notEmpty()
    .withMessage("categoryId is required")
    .isMongoId()
    .withMessage("categoryId must be a valid MongoDB id"),

  body("shipping")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value === undefined || value === null || value === "") return true;
      const n = typeof value === "string" ? parseFloat(value) : Number(value);
      return Number.isFinite(n) && n >= 0;
    })
    .withMessage("Shipping must be a non-negative number"),
];

module.exports = {
  validateProduct,
};
