const {body} = require("express-validator")

// category validator
const validateProduct = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("product name is required")
    .isLength({min:3})
    .withMessage("product name should be at least 3 chracter long"),

    body("description")
    .trim()
    .notEmpty()
    .withMessage("product description is required")
    .isLength({min:3,max:150})
    .withMessage("product name should be at least 3 and 150 chracter"),

    body("price")
    .trim()
    .notEmpty()
    .withMessage("product price is required")
    .isFloat({min:0})
    .withMessage('price must be a positive number'),

    body("quantity")
    .trim()
    .notEmpty()
    .withMessage("product quantity is required")
    .isFloat({min:1})
    .withMessage('product quantity must be a positive number'),

    body("categoryId")
    .trim()
    .notEmpty()
    .withMessage("categoryId is required")
]

module.exports = {
    validateProduct
}