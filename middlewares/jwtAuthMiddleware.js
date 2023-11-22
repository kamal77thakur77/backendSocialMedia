const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
require("dotenv").config();

async function jwtAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ msg: "No header attached" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "no token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if the token is expired
    if (decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({ msg: "Token has expired" });
    }
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Unauthorized" });
  }
}

module.exports = { jwtAuthMiddleware };
