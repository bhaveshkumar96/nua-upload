const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const userRouter = express.Router();

//user registration

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }
      const hashedPassword = hash;
      const newUser = new UserModel({ name, email, password: hashedPassword });
      await newUser.save();

      return res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = existingUser.password;
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "password not matched", error: err.message });
      }
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      let token = jwt.sign({ _id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res
        .status(200)
        .json({ message: "Login successful", token: token });
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
});

userRouter.get("/", async (req, res) => {

  try {
    const allUsers = await UserModel.find();
    const withoutPasswords = allUsers.map(user => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });
    res.status(200).json({ message: "All users fetched", users: withoutPasswords });
    
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
})

module.exports = userRouter;
