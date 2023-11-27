const User = require("../models/userSchema");
const { validationResult } = require("express-validator");
const brcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET || "default-secret-key";

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User already exists with that email" });
    }
    //hasing password with bcrypt
    const hashedPassword = await brcypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ msg: "User created successfully", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).error({ msg: "Error registering user" });
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array();
      return res.status(400).json({ errors: errorMessages });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }
    const isMatch = await brcypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ user_id: user._id }, jwtSecret, {
      expiresIn: "2h",
    });
    console.log(token);

    res.status(200).json({ msg: "User logged in successfully", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

module.exports = { signup, login };
