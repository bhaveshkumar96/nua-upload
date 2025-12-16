const express = require("express");
const fileRouter = express.Router();
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + uniqSuffix + extension);
  },
});


const uploads = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
})

module.exports = uploads;