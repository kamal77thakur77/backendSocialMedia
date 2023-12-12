const { body } = require("express-validator");
const postValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Content must be at least 3 characters long"),
];

// Validation middleware for signup
const signupValidation = [
  body("name").trim().isLength({ min: 3 }).withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Validation middleware for login
const loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const validateUserUpdate = [
  body("name").isAlpha().optional(),
  body("password").optional().isLength({ min: 6 }),
];

module.exports = {
  postValidation,
  signupValidation,
  loginValidation,
  validateUserUpdate,
};
