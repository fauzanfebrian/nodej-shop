const { body } = require("express-validator");
exports.validateAddProduct = [
  body("title", "Please enter a title").trim().isLength({ min: 1 }),
  body("price", "Must be a decimal").isFloat(),
  body("description", "Please enter a description, at least 5 characters")
    .trim()
    .isLength({ min: 3, max: 400 }),
];
