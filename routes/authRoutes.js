const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const {
  signupValidation,
  loginValidation,
  validateUserUpdate,
} = require("../middlewares/validationMiddleware");
const {
  jwtAuthMiddleware: isLoggedIn,
} = require("../middlewares/jwtAuthMiddleware");

router.get("/", (req, res) =>
  res.json({
    message: "Welcome to auth route here we handle login and sign up",
  })
);

//register a user

router.post("/signup", signupValidation, signup);

//login a user
router.post("/login", loginValidation, login);

//get the profile
router.get("/profile", isLoggedIn, getProfile);

//update a user profile
router.patch("/profile", isLoggedIn, validateUserUpdate, updateProfile);

module.exports = router;
