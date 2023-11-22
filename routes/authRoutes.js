const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const {
  signupValidation,
  loginValidation,
} = require("../middlewares/validationMiddleware");

router.get("/", (req, res) => res.json({ message: "Welcome" }));

//register a user

router.post("/signup", signupValidation, signup);

//login a user
router.post("/login", loginValidation, login);

module.exports = router;
