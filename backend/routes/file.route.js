const express = require("express");
const fileRouter = express.Router();
const uploads = require("../middleware/multerConfig");
const authenticate = require("../middleware/authenticate");
const FileModel = require("../models/file.model");
const crypto = require("crypto");
fileRouter.post(
  "/upload",
  authenticate,
  uploads.array("files", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

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
fileRouter.get("/", authenticate, async (req, res) => {
  const user = req.user;

  try {
 
    const ownedFiles = await FileModel.find({ owner: user._id });


    const sharedFiles = await FileModel.find({
      "sharedWith.userId": user._id,
    });

 
    const files = [...ownedFiles, ...sharedFiles];

    res.status(200).json({ message: "success", files });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
});

fileRouter.get("/download/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;
  const userId = req.user._id.toString();
  console.log("token", token);
  try {
    const file = await FileModel.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const isOwner = file.owner.toString() === userId;

    const isSharedUser = file.sharedWith.some(
      (entry) =>
        entry.user.toString() === userId &&
        (!entry.expiresAt || new Date(entry.expiresAt) > new Date())
    );
    if (token) {
      const validToken = file.shareLink.some(
        (link) =>
          link.token === token &&
          (!link.expiresAt || new Date(link.expiresAt) > new Date())
      );

      if (validToken) {
        return res.download(file.storagePath, file.originalName);
      }
    }
    const hasValidToken = file.shareLink?.some(
      (link) =>
        link.token === token &&
        (!link.expiresAt || new Date(link.expiresAt) > new Date())
    );
    console.log("hasValidToken", hasValidToken);

    if (!isOwner && !isSharedUser && !hasValidToken) {
      return res.status(403).json({ message: "Access denied" });
    }

    file.activityLog.push({
      action: "download",
      userId: req.user._id,
    });

    await file.save();

    return res.download(file.storagePath, file.originalName);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
});
fileRouter.post("/:id/share/user", authenticate, async (req, res) => {
  const { id } = req.params;
  const { userId, role, expiresAt } = req.body;
  try {
    const file = await FileModel.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // owner check
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can share file" });
    }

    file.sharedWith.push({
      user: userId, // ✅ correct key
      role: role || "viewer",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await file.save();

    return res.status(200).json({ message: "success", file });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
});

fileRouter.post("/:id/share/link", authenticate, async (req, res) => {
  const { id } = req.params;
  const { expiresAt } = req.body;

  try {
    const file = await FileModel.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // owner check
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can create link" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    file.shareLink.push({
      token,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    file.activityLog.push({
      action: "share",
      userId: req.user._id,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    await file.save();

    const shareUrl = `${process.env.BASE_URL}/files/download/${file._id}?token=${token}`;

    return res.status(200).json({
      message: "Share link created",
      shareUrl,
      expiresAt,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
});
fileRouter.get("/view/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }

    const file = await FileModel.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const validToken = file.shareLink.some(
      (link) =>
        link.token === token &&
        (!link.expiresAt || new Date(link.expiresAt) > new Date())
    );

    if (!validToken) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // OPTIONAL: log view
    file.activityLog.push({
      action: "view",
    });

    await file.save();

    // For viewing (inline, not forced download)
    return res.sendFile(path.resolve(file.storagePath), {
      headers: {
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
});

fileRouter.post;

module.exports = fileRouter;
