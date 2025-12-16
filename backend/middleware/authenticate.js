const jwt = require("jsonwebtoken");
require("dotenv").config();
const UserModel = require("../models/user.model");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded========", decoded);

    const user = await UserModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // ✅ NOW req.user exists
    next();
  } catch (err) {
    log("Authentication error:", err);
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = authenticate;
