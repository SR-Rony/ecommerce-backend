const {body} = require("express-validator")

// category validator
const validateCategory = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("category name is required")
    .isLength({min:3})
    .withMessage("category name should be at least 3 chracter long")
]

module.exports = {
    validateCategory
}