const express = require("express");
const fileRouter = express.Router();
const uploads = require("../middleware/multerConfig");
const authenticate = require("../middleware/authenticate");
const FileModel = require("../models/file.model");

fileRouter.post(
  "/upload",
//   authenticate,
  uploads.array("files", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      // console.log("========",req);
      
      const uploadedFiles = req.files.map((file) => ({
        owner: req.user._id,
        filename: file.filename,
        originalName: file.originalname, // ✅ FIXED
        size: file.size,
        mimeType: file.mimetype,
        storagePath: file.path,
      }));

      const savedFiles = await FileModel.insertMany(uploadedFiles);

      return res.status(201).json({
        message: "Files uploaded successfully",
        count: req.files.length,
        files: req.files,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = fileRouter;
